-- ============================================================================
--  ETIQUETAS DEL PRODUCTO EN KOMMO (solo documentación en la base)
--  Ejecutar UNA sola vez en: Supabase > SQL Editor > New query > Run
--  Es idempotente: puedes ejecutarlo de nuevo sin romper nada.
--
--  OJO: esto solo actualiza la columna `descripcion` (texto de referencia).
--  El nombre que se VE en cada venta de Kommo vive en Kommo mismo:
--  Settings > Custom Fields > Ventas > campo "Producto" > editar las 3
--  opciones a "Sérum Niacinamida Pura 10% x1 / x2 / x3". Los IDs NO cambian,
--  así que el código sigue funcionando igual.
-- ============================================================================

update public.kommo_config
  set descripcion = 'Opción "Sérum Niacinamida Pura 10% x1"'
where clave = 'enum_producto_1';

update public.kommo_config
  set descripcion = 'Opción "Sérum Niacinamida Pura 10% x2"'
where clave = 'enum_producto_2';

update public.kommo_config
  set descripcion = 'Opción "Sérum Niacinamida Pura 10% x3"'
where clave = 'enum_producto_3';
