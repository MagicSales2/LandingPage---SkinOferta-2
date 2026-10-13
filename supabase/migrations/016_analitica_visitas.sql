-- ============================================================================
--  016: analítica de visitas (ubicación, dispositivo y embudo de conversión)
--  Ejecutar UNA sola vez en: Supabase > SQL Editor > New query > Run
--  Es idempotente: puedes ejecutarlo de nuevo sin romper nada.
--
--  - visitas: guarda ciudad/región/país (por IP, sin guardar la IP),
--    dispositivo, sistema operativo, navegador y tamaño de pantalla.
--    Las filas viejas quedan con esos campos vacíos ("Desconocido").
--  - pedidos.visitante_id: une cada pedido con su visitante para medir la
--    conversión visita → pedido. Solo aplica a pedidos nuevos.
--  - visitas_select_admin: el panel de administración (login con es_admin())
--    puede leer las visitas, igual que ya lee los pedidos.
-- ============================================================================

alter table public.visitas
  add column if not exists ciudad text,
  add column if not exists region text,
  add column if not exists pais text,
  add column if not exists dispositivo text,
  add column if not exists so text,
  add column if not exists navegador text,
  add column if not exists pantalla text;

create index if not exists visitas_ciudad_idx on public.visitas (ciudad);
create index if not exists visitas_dispositivo_idx on public.visitas (dispositivo);
create index if not exists visitas_pais_idx on public.visitas (pais);

alter table public.pedidos
  add column if not exists visitante_id text;

create index if not exists pedidos_visitante_idx on public.pedidos (visitante_id);

drop policy if exists "visitas_select_admin" on public.visitas;
create policy "visitas_select_admin" on public.visitas
  for select to authenticated using (public.es_admin());
