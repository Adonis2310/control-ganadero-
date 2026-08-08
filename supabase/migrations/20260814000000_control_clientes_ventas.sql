-- ============================================================================
-- Fase 8: Clientes y Ventas
-- Espejo del patrón de la Fase 7 (proveedores/compras), con dos diferencias
-- importantes:
--   1. `detalle_ventas` puede referenciar un animal O un producto O ninguno
--      ("otro"), nunca los dos a la vez (CHECK de exclusividad).
--   2. Además de `completar_venta` (equivalente a `recibir_compra`), existe
--      `revertir_venta`: una venta completada puede revertirse de forma
--      controlada (devuelve stock, reactiva animales), sin borrar el
--      historial — a diferencia de una compra, que una vez recibida es
--      inmutable sin mecanismo de reversión.
-- `animales.estado` ya admite 'vendido' desde la Fase 2; no hace falta
-- migrar esa tabla para el estado en sí.
-- ============================================================================

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  identificacion text,
  telefono text,
  correo text,
  direccion text,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_activo_idx on clientes(activo);

alter table clientes enable row level security;
drop policy if exists "Usuarios autenticados administran clientes" on clientes;
create policy "Usuarios autenticados administran clientes"
  on clientes for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------

create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  numero serial,
  cliente_id uuid not null references clientes(id),
  fecha date not null,
  estado text not null default 'borrador',
  subtotal numeric(12, 2) not null default 0,
  descuento numeric(12, 2) not null default 0,
  impuestos numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  metodo_pago text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ventas drop constraint if exists ventas_numero_key;
alter table ventas add constraint ventas_numero_key unique (numero);

alter table ventas drop constraint if exists ventas_estado_check;
alter table ventas add constraint ventas_estado_check
  check (estado in ('borrador', 'pendiente', 'completada', 'cancelada'));

alter table ventas drop constraint if exists ventas_fecha_check;
alter table ventas add constraint ventas_fecha_check check (fecha <= current_date);

alter table ventas drop constraint if exists ventas_montos_check;
alter table ventas add constraint ventas_montos_check
  check (subtotal >= 0 and descuento >= 0 and impuestos >= 0);

create index if not exists ventas_cliente_id_idx on ventas(cliente_id);
create index if not exists ventas_estado_idx on ventas(estado);
create index if not exists ventas_fecha_idx on ventas(fecha desc);

alter table ventas enable row level security;
drop policy if exists "Usuarios autenticados administran ventas" on ventas;
create policy "Usuarios autenticados administran ventas"
  on ventas for all
  to authenticated
  using (true)
  with check (true);

create or replace function recalcular_total_venta()
returns trigger
language plpgsql
as $$
begin
  new.total := round(new.subtotal - new.descuento + new.impuestos, 2);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ventas_recalcular_total on ventas;
create trigger ventas_recalcular_total
  before insert or update on ventas
  for each row
  execute function recalcular_total_venta();

-- Una vez cancelada, la venta es inmutable. Una vez completada, la única
-- transición permitida es a "cancelada" (reversión controlada, ver
-- `revertir_venta`), sin tocar ningún otro dato de la venta en esa misma
-- operación.
create or replace function bloquear_edicion_venta_finalizada()
returns trigger
language plpgsql
as $$
begin
  if old.estado = 'cancelada' then
    raise exception 'No se puede modificar una venta cancelada.';
  end if;

  if old.estado = 'completada' then
    if new.estado <> 'cancelada'
       or new.cliente_id is distinct from old.cliente_id
       or new.fecha is distinct from old.fecha
       or new.metodo_pago is distinct from old.metodo_pago
       or new.descuento is distinct from old.descuento
       or new.impuestos is distinct from old.impuestos
       or new.subtotal is distinct from old.subtotal then
      raise exception 'No se puede modificar una venta completada.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists ventas_bloquear_edicion on ventas;
create trigger ventas_bloquear_edicion
  before update on ventas
  for each row
  execute function bloquear_edicion_venta_finalizada();

-- ----------------------------------------------------------------------------

create table if not exists detalle_ventas (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid not null references ventas(id) on delete cascade,
  tipo text not null,
  producto_id uuid references productos_inventario(id),
  animal_id uuid references animales(id),
  descripcion text,
  cantidad numeric(10, 2) not null,
  precio_unitario numeric(12, 2) not null,
  descuento numeric(10, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0
);

alter table detalle_ventas drop constraint if exists detalle_ventas_tipo_check;
alter table detalle_ventas add constraint detalle_ventas_tipo_check
  check (tipo in ('animal', 'producto', 'otro'));

-- Exclusividad: una línea de tipo "animal" solo lleva animal_id, una de
-- "producto" solo lleva producto_id, y una de "otro" no lleva ninguno.
alter table detalle_ventas drop constraint if exists detalle_ventas_referencia_check;
alter table detalle_ventas add constraint detalle_ventas_referencia_check
  check (
    (tipo = 'animal' and animal_id is not null and producto_id is null) or
    (tipo = 'producto' and producto_id is not null and animal_id is null) or
    (tipo = 'otro' and animal_id is null and producto_id is null)
  );

alter table detalle_ventas drop constraint if exists detalle_ventas_cantidad_check;
alter table detalle_ventas add constraint detalle_ventas_cantidad_check
  check (cantidad > 0 and (tipo <> 'animal' or cantidad = 1));

alter table detalle_ventas drop constraint if exists detalle_ventas_precio_check;
alter table detalle_ventas add constraint detalle_ventas_precio_check check (precio_unitario >= 0);

alter table detalle_ventas drop constraint if exists detalle_ventas_descuento_check;
alter table detalle_ventas add constraint detalle_ventas_descuento_check check (descuento >= 0);

create index if not exists detalle_ventas_venta_id_idx on detalle_ventas(venta_id);
create index if not exists detalle_ventas_producto_id_idx on detalle_ventas(producto_id);
create index if not exists detalle_ventas_animal_id_idx on detalle_ventas(animal_id);

alter table detalle_ventas enable row level security;
drop policy if exists "Usuarios autenticados administran detalle de ventas" on detalle_ventas;
create policy "Usuarios autenticados administran detalle de ventas"
  on detalle_ventas for all
  to authenticated
  using (true)
  with check (true);

create or replace function recalcular_subtotal_linea_venta()
returns trigger
language plpgsql
as $$
begin
  new.subtotal := round(new.cantidad * new.precio_unitario - new.descuento, 2);
  return new;
end;
$$;

drop trigger if exists detalle_ventas_recalcular_subtotal on detalle_ventas;
create trigger detalle_ventas_recalcular_subtotal
  before insert or update on detalle_ventas
  for each row
  execute function recalcular_subtotal_linea_venta();

create or replace function actualizar_subtotal_venta()
returns trigger
language plpgsql
as $$
declare
  target_venta_id uuid := coalesce(new.venta_id, old.venta_id);
  nuevo_subtotal numeric(12, 2);
begin
  select coalesce(sum(subtotal), 0) into nuevo_subtotal
  from detalle_ventas
  where venta_id = target_venta_id;

  update ventas set subtotal = nuevo_subtotal where id = target_venta_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists detalle_ventas_actualizar_venta on detalle_ventas;
create trigger detalle_ventas_actualizar_venta
  after insert or update or delete on detalle_ventas
  for each row
  execute function actualizar_subtotal_venta();

create or replace function bloquear_edicion_detalle_venta_finalizada()
returns trigger
language plpgsql
as $$
declare
  v_estado text;
begin
  select estado into v_estado from ventas where id = coalesce(new.venta_id, old.venta_id);
  if v_estado in ('completada', 'cancelada') then
    raise exception 'No se pueden modificar los elementos de una venta en estado "%".', v_estado;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists detalle_ventas_bloquear_edicion on detalle_ventas;
create trigger detalle_ventas_bloquear_edicion
  before insert or update or delete on detalle_ventas
  for each row
  execute function bloquear_edicion_detalle_venta_finalizada();

-- ----------------------------------------------------------------------------
-- Vincula movimientos_inventario con la venta/línea que los originó, igual
-- que se hizo con compra_id/detalle_compra_id en la Fase 7.
-- ----------------------------------------------------------------------------
alter table movimientos_inventario add column if not exists venta_id uuid references ventas(id) on delete set null;
alter table movimientos_inventario add column if not exists detalle_venta_id uuid references detalle_ventas(id) on delete set null;

create unique index if not exists movimientos_inventario_detalle_venta_id_key
  on movimientos_inventario(detalle_venta_id)
  where detalle_venta_id is not null;

create index if not exists movimientos_inventario_venta_id_idx on movimientos_inventario(venta_id);

-- ----------------------------------------------------------------------------
-- RPCs
-- ----------------------------------------------------------------------------
create or replace function crear_venta(
  p_cliente_id uuid,
  p_fecha date,
  p_estado text,
  p_descuento numeric,
  p_impuestos numeric,
  p_metodo_pago text,
  p_observaciones text,
  p_lineas jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_venta_id uuid;
  v_linea jsonb;
  v_animal_id uuid;
  v_animal_estado text;
begin
  if p_lineas is null or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La venta debe tener al menos un elemento.';
  end if;

  for v_linea in select * from jsonb_array_elements(p_lineas)
  loop
    if (v_linea ->> 'tipo') = 'animal' then
      v_animal_id := (v_linea ->> 'animal_id')::uuid;
      select estado into v_animal_estado from animales where id = v_animal_id;
      if v_animal_estado is null then
        raise exception 'El animal seleccionado no existe.';
      end if;
      if v_animal_estado <> 'activo' then
        raise exception 'El animal seleccionado ya no está disponible para la venta.';
      end if;
    end if;
  end loop;

  insert into ventas (cliente_id, fecha, estado, descuento, impuestos, metodo_pago, observaciones)
  values (p_cliente_id, p_fecha, coalesce(p_estado, 'borrador'), coalesce(p_descuento, 0), coalesce(p_impuestos, 0), p_metodo_pago, p_observaciones)
  returning id into v_venta_id;

  for v_linea in select * from jsonb_array_elements(p_lineas)
  loop
    insert into detalle_ventas (venta_id, tipo, producto_id, animal_id, descripcion, cantidad, precio_unitario, descuento)
    values (
      v_venta_id,
      v_linea ->> 'tipo',
      nullif(v_linea ->> 'producto_id', '')::uuid,
      nullif(v_linea ->> 'animal_id', '')::uuid,
      v_linea ->> 'descripcion',
      (v_linea ->> 'cantidad')::numeric,
      (v_linea ->> 'precio_unitario')::numeric,
      coalesce((v_linea ->> 'descuento')::numeric, 0)
    );
  end loop;

  return v_venta_id;
end;
$$;

create or replace function actualizar_venta(
  p_venta_id uuid,
  p_cliente_id uuid,
  p_fecha date,
  p_estado text,
  p_descuento numeric,
  p_impuestos numeric,
  p_metodo_pago text,
  p_observaciones text,
  p_lineas jsonb
)
returns void
language plpgsql
as $$
declare
  v_linea jsonb;
  v_animal_id uuid;
  v_animal_estado text;
begin
  if p_lineas is null or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La venta debe tener al menos un elemento.';
  end if;

  for v_linea in select * from jsonb_array_elements(p_lineas)
  loop
    if (v_linea ->> 'tipo') = 'animal' then
      v_animal_id := (v_linea ->> 'animal_id')::uuid;
      select estado into v_animal_estado from animales where id = v_animal_id;
      if v_animal_estado is null then
        raise exception 'El animal seleccionado no existe.';
      end if;
      if v_animal_estado <> 'activo' then
        raise exception 'El animal seleccionado ya no está disponible para la venta.';
      end if;
    end if;
  end loop;

  update ventas
  set cliente_id = p_cliente_id,
      fecha = p_fecha,
      estado = coalesce(p_estado, estado),
      descuento = coalesce(p_descuento, 0),
      impuestos = coalesce(p_impuestos, 0),
      metodo_pago = p_metodo_pago,
      observaciones = p_observaciones
  where id = p_venta_id;

  delete from detalle_ventas where venta_id = p_venta_id;

  for v_linea in select * from jsonb_array_elements(p_lineas)
  loop
    insert into detalle_ventas (venta_id, tipo, producto_id, animal_id, descripcion, cantidad, precio_unitario, descuento)
    values (
      p_venta_id,
      v_linea ->> 'tipo',
      nullif(v_linea ->> 'producto_id', '')::uuid,
      nullif(v_linea ->> 'animal_id', '')::uuid,
      v_linea ->> 'descripcion',
      (v_linea ->> 'cantidad')::numeric,
      (v_linea ->> 'precio_unitario')::numeric,
      coalesce((v_linea ->> 'descuento')::numeric, 0)
    );
  end loop;
end;
$$;

create or replace function completar_venta(p_venta_id uuid)
returns void
language plpgsql
as $$
declare
  v_estado text;
  v_linea record;
begin
  select estado into v_estado from ventas where id = p_venta_id for update;

  if v_estado is null then
    raise exception 'La venta no existe.';
  end if;
  if v_estado = 'completada' then
    raise exception 'Esta venta ya fue completada.';
  end if;
  if v_estado = 'cancelada' then
    raise exception 'No se puede completar una venta cancelada.';
  end if;

  -- Validar stock disponible de todas las líneas de producto antes de tocar nada.
  for v_linea in
    select dv.id, dv.cantidad, pi.stock_actual, pi.nombre
    from detalle_ventas dv
    join productos_inventario pi on pi.id = dv.producto_id
    where dv.venta_id = p_venta_id and dv.tipo = 'producto'
  loop
    if v_linea.cantidad > v_linea.stock_actual then
      raise exception 'No hay suficiente stock de "%" (disponible: %).', v_linea.nombre, v_linea.stock_actual;
    end if;
  end loop;

  -- Validar que los animales incluidos sigan disponibles.
  for v_linea in
    select dv.id, a.estado, a.identificador
    from detalle_ventas dv
    join animales a on a.id = dv.animal_id
    where dv.venta_id = p_venta_id and dv.tipo = 'animal'
  loop
    if v_linea.estado <> 'activo' then
      raise exception 'El animal % ya no está disponible para la venta.', v_linea.identificador;
    end if;
  end loop;

  -- Generar las salidas de inventario (protegidas contra duplicados por el
  -- índice único sobre detalle_venta_id).
  for v_linea in
    select id, producto_id, cantidad
    from detalle_ventas
    where venta_id = p_venta_id and tipo = 'producto'
  loop
    insert into movimientos_inventario (producto_id, tipo, cantidad, fecha, motivo, venta_id, detalle_venta_id)
    values (v_linea.producto_id, 'salida', v_linea.cantidad, current_date, 'Venta completada', p_venta_id, v_linea.id)
    on conflict (detalle_venta_id) where detalle_venta_id is not null do nothing;
  end loop;

  update animales
  set estado = 'vendido'
  where id in (select animal_id from detalle_ventas where venta_id = p_venta_id and tipo = 'animal');

  update ventas set estado = 'completada' where id = p_venta_id;
end;
$$;

create or replace function revertir_venta(p_venta_id uuid)
returns void
language plpgsql
as $$
declare
  v_estado text;
  v_linea record;
begin
  select estado into v_estado from ventas where id = p_venta_id for update;

  if v_estado is null then
    raise exception 'La venta no existe.';
  end if;
  if v_estado <> 'completada' then
    raise exception 'Solo se pueden revertir ventas completadas.';
  end if;

  -- Devuelve al inventario lo vendido, con una entrada compensatoria (no se
  -- borra el movimiento original: queda como historial permanente).
  for v_linea in
    select producto_id, cantidad
    from detalle_ventas
    where venta_id = p_venta_id and tipo = 'producto'
  loop
    insert into movimientos_inventario (producto_id, tipo, cantidad, fecha, motivo, venta_id, observaciones)
    values (v_linea.producto_id, 'entrada', v_linea.cantidad, current_date, 'Reversión de venta', p_venta_id, 'Compensación automática al revertir la venta.');
  end loop;

  update animales
  set estado = 'activo'
  where id in (select animal_id from detalle_ventas where venta_id = p_venta_id and tipo = 'animal');

  update ventas set estado = 'cancelada' where id = p_venta_id;
end;
$$;

NOTIFY pgrst, 'reload schema';
