-- ============================================================================
--  PRECIOS DE LA LANDING DE NIACINAMIDA
--  Ejecutar UNA sola vez en: Supabase > SQL Editor > New query > Run
--  Es idempotente: puedes ejecutarlo de nuevo sin romper nada.
--
--  Se reutiliza la MISMA tabla `ofertas` de la landing anterior (el protector
--  solar), porque esa landing ya no se usa. Aquí solo se actualizan los precios
--  y nombres del Sérum Niacinamida Pura 10%.
-- ============================================================================

insert into public.ofertas (id, nombre, cantidad, precio, mercadopago_url) values
  ('offer-1', '1 UNIDAD', 1, 109900, ''),
  ('offer-2', 'LLEVA 2 UNIDADES (Mejor Oferta)', 2, 159900, ''),
  ('offer-3', 'LLEVA 3 UNIDADES', 3, 200000, '')
on conflict (id) do update
  set nombre = excluded.nombre,
      cantidad = excluded.cantidad,
      precio = excluded.precio,
      mercadopago_url = excluded.mercadopago_url;
