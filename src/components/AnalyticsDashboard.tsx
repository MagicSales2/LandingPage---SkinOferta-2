import React, { useState, useEffect, useMemo } from 'react';
import { Order } from '../types';
import { getAnaliticaVisitas, VisitaAnalitica } from '../lib/supabaseClient';

interface Props {
  orders: Order[];
}

function minutosBonitos(seg: number | null | undefined): string {
  if (seg == null || seg < 0) return '–';
  const m = Math.floor(seg / 60);
  const s = Math.round(seg % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function contarPor(lista: (string | null | undefined)[], defecto = 'Desconocido'): [string, number][] {
  const mapa = new Map<string, number>();
  for (const v of lista) {
    const k = (v ?? '').toString().trim() || defecto;
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

// Hora 0-23 en Colombia (los timestamps vienen en UTC).
function horaBogota(iso: string): number {
  return (new Date(iso).getUTCHours() - 5 + 24) % 24;
}

function dominioReferrer(ref: string | null | undefined): string {
  if (!ref) return '';
  try {
    return new URL(ref).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function Kpi({ titulo, valor, detalle }: { titulo: string; valor: string; detalle: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{titulo}</p>
      <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{valor}</p>
      <p className="text-[10px] text-slate-500 font-bold mt-1">{detalle}</p>
    </div>
  );
}

function Barra({ etiqueta, valor, max }: { etiqueta: string; valor: number; max: number }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-32 shrink-0 truncate font-bold text-slate-700" title={etiqueta}>
        {etiqueta}
      </span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right font-black text-slate-900">{valor}</span>
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4">
      <p className="text-xs font-black text-slate-900 uppercase tracking-wide mb-3">{titulo}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

type Preset = '7' | '30' | '90' | '365' | 'todo' | 'custom';

export default function AnalyticsDashboard({ orders }: Props) {
  const [preset, setPreset] = useState<Preset>('30');
  const [customDesde, setCustomDesde] = useState('');
  const [customHasta, setCustomHasta] = useState('');
  const [visitas, setVisitas] = useState<VisitaAnalitica[] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sinMigracion, setSinMigracion] = useState(false);

  // Rango a consultar: presets o fechas a medida (cualquier rango, sin tope:
  // 1 año, todo el historial o dos fechas cualquiera).
  const rangoFetch = useMemo(() => {
    const ahora = new Date();
    if (preset === 'todo') {
      return {
        desde: '2020-01-01T00:00:00.000Z',
        hasta: ahora.toISOString(),
        etiqueta: 'todo el historial',
      };
    }
    if (preset === 'custom' && customDesde && customHasta) {
      const desdeMs = new Date(customDesde + 'T00:00:00-05:00').getTime();
      const hastaMs = new Date(customHasta + 'T00:00:00-05:00').getTime() + 86400000;
      if (Number.isFinite(desdeMs) && Number.isFinite(hastaMs) && hastaMs > desdeMs) {
        return {
          desde: new Date(desdeMs).toISOString(),
          hasta: new Date(hastaMs).toISOString(),
          etiqueta: `${customDesde} → ${customHasta}`,
        };
      }
    }
    const dias = preset === 'custom' ? 30 : Number(preset);
    return {
      desde: new Date(Date.now() - dias * 86400000).toISOString(),
      hasta: ahora.toISOString(),
      etiqueta: `últimos ${dias} días`,
    };
  }, [preset, customDesde, customHasta]);

  useEffect(() => {
    setCargando(true);
    setSinMigracion(false);
    getAnaliticaVisitas(rangoFetch.desde, rangoFetch.hasta).then((rows) => {
      if (rows === null) setSinMigracion(true);
      setVisitas(rows ?? []);
      setCargando(false);
    });
  }, [rangoFetch]);

  const datos = useMemo(() => {
    const rows = visitas ?? [];
    const desdeMs = new Date(rangoFetch.desde).getTime();
    const hastaMs = new Date(rangoFetch.hasta).getTime();
    const unicos = new Set(rows.map((v) => v.visitante_id)).size;
    const medidas = rows.map((v) => v.duracion_seg).filter((d): d is number => typeof d === 'number' && d >= 0);
    const prom = medidas.length ? Math.round(medidas.reduce((a, b) => a + b, 0) / medidas.length) : null;
    const ordenadas = [...medidas].sort((a, b) => a - b);
    const mediana = ordenadas.length ? ordenadas[Math.floor(ordenadas.length / 2)] : null;
    const cortas = medidas.filter((d) => d < 10).length;

    const pedidos = orders.filter((o) => {
      const t = new Date(o.date).getTime();
      return t >= desdeMs && t < hastaMs && o.status !== 'cancelled';
    });
    const ventas = pedidos.filter(
      (o) => (o.paymentMethod?.includes('Contra') && o.status !== 'cancelled') || o.status === 'pagado',
    );
    const conv = rows.length > 0 ? (ventas.length / rows.length) * 100 : 0;

    const porDispositivo = contarPor(rows.map((v) => v.dispositivo));
    const porNavegador = contarPor(rows.map((v) => v.navegador));
    const porCiudad = contarPor(rows.map((v) => (v.ciudad ? `${v.ciudad}${v.region ? `, ${v.region}` : ''}` : null)));
    const porPais = contarPor(rows.map((v) => v.pais));
    const porFuente = contarPor(
      rows.map((v) => (v.utm_source ?? '').trim() || dominioReferrer(v.referrer) || null),
      'directo',
    );
    const porCampana = contarPor(rows.map((v) => v.utm_campaign)).filter(([k]) => k !== 'Desconocido');

    const porHora = new Array<number>(24).fill(0);
    for (const v of rows) porHora[horaBogota(v.inicio)] += 1;

    // Serie temporal: si el rango es largo, se agrupa en bloques para que el
    // gráfico no tenga más de ~90 barras (ej. 1 año → bloques semanales).
    const diasDiff = Math.max(1, Math.round((hastaMs - desdeMs) / 86400000));
    const porBloque = Math.max(1, Math.ceil(diasDiff / 90));
    const serie: { etiqueta: string; cantidad: number }[] = [];
    for (let t = desdeMs; t < hastaMs; t += porBloque * 86400000) {
      const iso = new Date(t).toISOString();
      serie.push({ etiqueta: iso.slice(8, 10) + '/' + iso.slice(5, 7), cantidad: 0 });
    }
    for (const v of rows) {
      const ms = new Date(v.inicio).getTime();
      if (!Number.isFinite(ms) || ms < desdeMs || ms >= hastaMs || serie.length === 0) continue;
      const idx = Math.min(serie.length - 1, Math.floor((ms - desdeMs) / (porBloque * 86400000)));
      serie[idx].cantidad += 1;
    }
    const maxDia = Math.max(1, ...serie.map((d) => d.cantidad));

    return {
      rows, unicos, prom, mediana, cortas, medidas: medidas.length,
      pedidos: pedidos.length, ventas: ventas.length, conv,
      porDispositivo, porNavegador, porCiudad, porPais, porFuente, porCampana,
      porHora, serie, maxDia, etiqueta: rangoFetch.etiqueta,
    };
  }, [visitas, orders, rangoFetch]);

  if (cargando) {
    return <p className="text-xs text-slate-400 font-bold py-10 text-center">Cargando analítica…</p>;
  }

  if (sinMigracion) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4 text-xs text-amber-800 font-bold">
        Falta correr la migración <span className="font-mono">016_analitica_visitas.sql</span> en Supabase
        → SQL Editor. Después recarga esta pestaña.
      </div>
    );
  }

  const maxFuente = Math.max(1, ...datos.porFuente.map(([, n]) => n));
  const maxCiudad = Math.max(1, ...datos.porCiudad.map(([, n]) => n));
  const maxHora = Math.max(1, ...datos.porHora);

  return (
    <div className="py-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['7', '7 días'],
            ['30', '30 días'],
            ['90', '90 días'],
            ['365', '1 año'],
            ['todo', 'Todo'],
          ] as const
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            onClick={() => setPreset(valor)}
            className={`px-4 py-2 rounded-lg text-xs font-black border transition-colors cursor-pointer ${
              preset === valor
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {etiqueta}
          </button>
        ))}
        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">o a medida:</span>
        <input
          type="date"
          value={customDesde}
          max={customHasta || undefined}
          onChange={(e) => {
            setCustomDesde(e.target.value);
            setPreset('custom');
          }}
          className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 font-bold focus:ring-1 focus:ring-orange-500"
          title="Desde"
        />
        <span className="text-slate-400 font-black">→</span>
        <input
          type="date"
          value={customHasta}
          min={customDesde || undefined}
          onChange={(e) => {
            setCustomHasta(e.target.value);
            setPreset('custom');
          }}
          className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 font-bold focus:ring-1 focus:ring-orange-500"
          title="Hasta"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi titulo="Visitas" valor={String(datos.rows.length)} detalle={`${datos.unicos} visitantes únicos`} />
        <Kpi titulo="Duración promedio" valor={minutosBonitos(datos.prom)} detalle={`Mediana: ${minutosBonitos(datos.mediana)} · medidas: ${datos.medidas}`} />
        <Kpi titulo="Visitas cortas" valor={datos.medidas > 0 ? `${Math.round((datos.cortas / datos.medidas) * 100)}%` : '–'} detalle={`${datos.cortas} de menos de 10 segundos`} />
        <Kpi titulo="Conversión" valor={`${datos.conv.toFixed(1)}%`} detalle={`${datos.ventas} ventas / ${datos.rows.length} visitas`} />
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-xs font-black text-slate-900 uppercase tracking-wide mb-3">
          Embudo · {datos.etiqueta}
        </p>
        <div className="flex flex-col md:flex-row items-stretch gap-2 text-center">
          {[
            { t: 'Visitas', v: datos.rows.length },
            { t: 'Pedidos', v: datos.pedidos },
            { t: 'Ventas efectivas', v: datos.ventas },
          ].map((p, i) => (
            <React.Fragment key={p.t}>
              {i > 0 && <span className="self-center text-slate-300 font-black">→</span>}
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-lg font-black text-slate-900">{p.v}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{p.t}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-bold mt-2">
          Ventas efectivas = Contra Entrega no cancelados + Wompi pagados.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-xs font-black text-slate-900 uppercase tracking-wide mb-3">Visitas por día</p>
        <div className="flex items-end gap-1 overflow-x-auto" style={{ minHeight: 90 }}>
          {datos.serie.map((d) => (
            <div key={d.etiqueta} className="flex-1 min-w-[8px] flex flex-col items-center gap-1" title={`${d.etiqueta}: ${d.cantidad}`}>
              <span className="text-[9px] font-black text-slate-700">{d.cantidad > 0 ? d.cantidad : ''}</span>
              <div
                className="w-full bg-orange-500/80 rounded-t"
                style={{ height: `${Math.max(d.cantidad > 0 ? 6 : 2, (d.cantidad / datos.maxDia) * 70)}px` }}
              />
              <span className="text-[8px] text-slate-400 font-bold">{d.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Bloque titulo="Dispositivo">
          {datos.porDispositivo.slice(0, 5).map(([k, n]) => (
            <Barra key={k} etiqueta={k} valor={n} max={datos.porDispositivo[0]?.[1] ?? 1} />
          ))}
        </Bloque>
        <Bloque titulo="Navegador">
          {datos.porNavegador.slice(0, 5).map(([k, n]) => (
            <Barra key={k} etiqueta={k} valor={n} max={datos.porNavegador[0]?.[1] ?? 1} />
          ))}
        </Bloque>
        <Bloque titulo="Ciudad">
          {datos.porCiudad.slice(0, 8).map(([k, n]) => (
            <Barra key={k} etiqueta={k} valor={n} max={maxCiudad} />
          ))}
        </Bloque>
        <Bloque titulo="Fuente (utm / referido)">
          {datos.porFuente.slice(0, 8).map(([k, n]) => (
            <Barra key={k} etiqueta={k} valor={n} max={maxFuente} />
          ))}
        </Bloque>
      </div>

      {datos.porCampana.length > 0 && (
        <Bloque titulo="Campañas (utm_campaign)">
          {datos.porCampana.slice(0, 8).map(([k, n]) => (
            <Barra key={k} etiqueta={k} valor={n} max={datos.porCampana[0]?.[1] ?? 1} />
          ))}
        </Bloque>
      )}

      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-xs font-black text-slate-900 uppercase tracking-wide mb-3">Hora de visita (Colombia)</p>
        <div className="flex items-end gap-[3px]" style={{ minHeight: 80 }}>
          {datos.porHora.map((n, h) => (
            <div key={h} className="flex-1 flex flex-col items-center gap-1" title={`${h}:00 — ${n} visitas`}>
              <div
                className="w-full bg-slate-800/80 rounded-t"
                style={{ height: `${Math.max(n > 0 ? 5 : 2, (n / maxHora) * 60)}px` }}
              />
              <span className="text-[8px] text-slate-400 font-bold">{h % 3 === 0 ? h : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-bold">
        Ubicación, dispositivo, navegador y pantalla se registran desde esta actualización;
        las visitas anteriores salen como “Desconocido”.
      </p>
    </div>
  );
}
