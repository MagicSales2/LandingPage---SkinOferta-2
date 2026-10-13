-- ============================================================================
--  CAMPO "MENSAJE" DE KOMMO (ciudad + departamento del pedido)
--  Ejecutar UNA sola vez en: Supabase > SQL Editor > New query > Run
--  Es idempotente: puedes ejecutarlo de nuevo sin romper nada.
--
--  Registra el ID del campo "mensaje" (543660) en kommo_config para que el
--  código lo llene con "Ciudad, Departamento" en cada venta nueva.
-- ============================================================================

insert into public.kommo_config (clave, valor, descripcion) values
  ('cf_mensaje', '543660', 'Mensaje (ciudad, departamento del pedido)')
on conflict (clave) do update
  set valor = excluded.valor,
      descripcion = excluded.descripcion;
