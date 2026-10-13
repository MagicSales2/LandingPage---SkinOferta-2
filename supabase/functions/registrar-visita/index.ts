// ============================================================================
//  FUNCIÓN: registrar-visita
//  Lleva el registro de tráfico de la página para el reporte diario.
//
//  Llamadas (las hace el navegador):
//    { "tipo": "inicio", "visitanteId", "ruta", "referrer", "utm": {...}, "userAgent" }
//        → registra una visita nueva (si el mismo visitante ya tiene una
//          "abierta" en los últimos 40 minutos, reutiliza esa misma visita).
//    { "tipo": "fin", "visitaId", "duracion" }
//        → guarda cuánto tiempo estuvo en la página (en segundos).
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { enviarEventoTiktok } from '../_shared/tiktok.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(cuerpo: unknown, estado = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

// Ubicación aproximada por IP (ciudad/región/país). La IP NO se guarda:
// solo se usa para resolver y se descarta, por privacidad.
// Servicio gratuito sin clave (límite generoso para este tráfico). Si falla
// o tarda, se devuelve vacío: el registro de la visita nunca se frena.
async function geolocalizar(ip: string): Promise<{ ciudad?: string; region?: string; pais?: string }> {
  try {
    if (!ip || /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1|0\.0\.0\.0)/.test(ip)) return {}
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 2500)
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city`, {
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return {}
    const j = await res.json().catch(() => null)
    if (!j || j.status !== 'success') return {}
    const out: { ciudad?: string; region?: string; pais?: string } = {}
    if (j.city) out.ciudad = String(j.city).slice(0, 100)
    if (j.regionName) out.region = String(j.regionName).slice(0, 100)
    if (j.country) out.pais = String(j.country).slice(0, 100)
    return out
  } catch {
    return {}
  }
}

// Clasifica el dispositivo, sistema y navegador desde el user agent.
// Compacto a propósito: solo lo necesario para decidir (móvil vs PC, etc).
function parsearDispositivo(ua: string): { dispositivo: string; so: string; navegador: string } {
  const u = ua || ''
  const esTablet = /ipad|tablet|playbook|silk(?!.*mobile)|sm-t\b|kindle/i.test(u)
  const esMovil = /mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/i.test(u)
  const dispositivo = esTablet ? 'tablet' : esMovil ? 'celular' : 'computador'
  let so = 'Otro'
  if (/windows nt 10/i.test(u)) so = 'Windows 10/11'
  else if (/windows/i.test(u)) so = 'Windows'
  else if (/android/i.test(u)) so = 'Android'
  else if (/iphone|ipad|ipod/i.test(u)) so = 'iOS'
  else if (/mac os/i.test(u)) so = 'macOS'
  else if (/linux/i.test(u)) so = 'Linux'
  let navegador = 'Otro'
  if (/edg\//i.test(u)) navegador = 'Edge'
  else if (/opr\/|opera mini|opera mobi/i.test(u)) navegador = 'Opera'
  else if (/chrome\/|crios\//i.test(u)) navegador = 'Chrome'
  else if (/firefox\/|fxios\//i.test(u)) navegador = 'Firefox'
  else if (/safari\//i.test(u)) navegador = 'Safari'
  return { dispositivo, so, navegador }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })

  let cuerpo: any
  try {
    cuerpo = await req.json()
  } catch {
    return json({ error: 'No se pudo leer la solicitud' }, 400)
  }

  const texto = (v: unknown, max: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

  // ── Fin de una visita: se guarda la duración ───────────────────────────
  const visitaId = Number(cuerpo?.visitaId ?? NaN)
  if (cuerpo?.tipo === 'fin' && Number.isFinite(visitaId) && visitaId > 0) {
    const duracion = Math.max(0, Math.round(Number(cuerpo?.duracion ?? 0)))
    await sb.from('visitas').update({ duracion_seg: duracion }).eq('id', visitaId).is('duracion_seg', null)
    return json({ ok: true })
  }

  // ── Inicio de una visita ───────────────────────────────────────────────
  if (cuerpo?.tipo === 'inicio') {
    const visitanteId = texto(cuerpo.visitanteId, 100)
    if (!visitanteId) return json({ ok: false, error: 'sin visitante' }, 400)

    // ¿Ya hay una visita abierta de este visitante en los últimos 40 minutos?
    const hace = new Date(Date.now() - 40 * 60 * 1000).toISOString()
    const { data: abierta } = await sb
      .from('visitas')
      .select('id')
      .eq('visitante_id', visitanteId)
      .is('duracion_seg', null)
      .gte('inicio', hace)
      .order('inicio', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (abierta) return json({ ok: true, visitaId: abierta.id })

    // IP del visitante (la pone Supabase/Cloudflare en el encabezado). Solo
    // se usa para geolocalizar y para TikTok: no se guarda en la base.
    const ip =
      (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
      req.headers.get('cf-connecting-ip') ||
      ''
    const userAgent = texto(cuerpo.userAgent, 300)
    const [geo, disp] = await Promise.all([
      geolocalizar(ip),
      Promise.resolve(parsearDispositivo(userAgent)),
    ])

    const { data: insertada, error } = await sb
      .from('visitas')
      .insert({
        visitante_id: visitanteId,
        ruta: texto(cuerpo.ruta, 200) || null,
        referrer: texto(cuerpo.referrer, 300) || null,
        utm_source: texto(cuerpo.utm?.utm_source, 100) || null,
        utm_medium: texto(cuerpo.utm?.utm_medium, 100) || null,
        utm_campaign: texto(cuerpo.utm?.utm_campaign, 100) || null,
        user_agent: userAgent || null,
        ciudad: geo.ciudad || null,
        region: geo.region || null,
        pais: geo.pais || null,
        dispositivo: disp.dispositivo,
        so: disp.so,
        navegador: disp.navegador,
        pantalla: texto(cuerpo.pantalla, 20) || null,
        inicio: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error || !insertada) {
      console.error('No se pudo registrar la visita:', error)
      return json({ ok: false }, 500)
    }

    // ViewContent desde el servidor. El píxel del navegador ya manda este
    // evento, pero se lo comen los ad-blockers y el modo incógnito, y entonces
    // TikTok no ve nada de ese tráfico. Mandándolo desde acá se registra
    // igual, y es lo que le dice a TikTok qué contenido se está viendo.
    //
    // El event_id lleva el id de la visita: si el píxel también lo mandó con el
    // mismo, TikTok cuenta una sola vista y no dos.
    try {
      await enviarEventoTiktok({
        event: 'ViewContent',
        event_id: `visita-${insertada.id}`,
        order_id: `visita-${insertada.id}`,
        content_name: 'Sérum Niacinamida Pura 10%',
        content_type: 'product',
        quantity: 1,
        value: 0,
        currency: 'COP',
        content_ids: ['niacinamida-serum-10'],
        page_url: texto(cuerpo.pageUrl, 500) || undefined,
        referrer: texto(cuerpo.referrer, 300) || undefined,
        user_agent: texto(cuerpo.userAgent, 300) || undefined,
        client_ip: ip || undefined,
        ttclid: texto(cuerpo.ttclid, 200) || undefined,
        ttp: texto(cuerpo.ttp, 200) || undefined,
      })
    } catch (err) {
      // Nunca debe romper el registro de la visita: el evento es un extra.
      console.error('Fallo al enviar ViewContent a TikTok:', err)
    }

    return json({ ok: true, visitaId: insertada.id })
  }

  return json({ error: 'Tipo de evento desconocido' }, 400)
})