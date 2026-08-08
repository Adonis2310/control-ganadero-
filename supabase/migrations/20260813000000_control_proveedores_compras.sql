-- ============================================================================
-- Fase 7: Proveedores y Compras
-- Agrega proveedores, compras (con líneas en detalle_compras) y conecta las
-- compras recibidas con el inventario de la Fase 6 a través de
-- `movimientos_inventario.compra_id` / `detalle_compra_id`.
--
-- Todos los totales (subtotal de línea, subtotal de compra, total de compra)
-- se recalculan con triggers en el servidor: nunca se confía en el valor que
-- mande el cliente. La recepción de una compra (que genera los movimientos de
-- entrada y actualiza el stock) se hace con la función `recibir_compra`, que
-- corre en una sola transacción implícita de Postgres y bloquea la fila de la
-- compra (`for update`) para que un doble clic o un reintento no puedan
-- generar movimientos duplicados; además, la restricción unique sobre
-- `detalle_compra_id` en movimientos_inventario lo impide a nivel de datos
-- incluso si algo más disparara la inserción dos veces.
-- ============================================================================

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text,
  telefono text,
  correo text,
  direccion text,
  tipo text,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proveedores_activo_idx on proveedores(activo);
create index if not exists proveedores_tipo_idx on proveedores(tipo);

alter table proveedores enable row level security;
drop policy if exists "Usuarios autenticados administran proveedores" on proveedores;
create policy "Usuarios autenticados administran proveedores"
  on proveedores for all
  to authenticated
  using (true)
  with check (true);

-- La Fase 6 dejó `productos_inventario.proveedor_id` preparado sin FK porque
-- todavía no existía esta tabla. Ahora que existe, se completa la relación.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'productos_inventario'::regclass and conname = 'productos_inventario_proveedor_id_fkey'
  ) then
    alter table productos_inventario
      add constraint productos_inventario_proveedor_id_fkey
      foreign key (proveedor_id) references proveedores(id) on delete set null;
  end if;
end $$;

-- ----------------------------------------------------------------------------

create table if not exists compras (
  id uuid primary key default gen_random_uuid(),
  numero serial,
  proveedor_id uuid not null references proveedores(id),
  fecha date not null,
  estado text not null default 'borrador',
  subtotal numeric(12, 2) not null default 0,
  descuento numeric(12, 2) not null default 0,
  impuestos numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table compras add column if not exists numero serial;
alter table compras drop constraint if exists compras_numero_key;
alter table compras add constraint compras_numero_key unique (numero);

alter table compras drop constraint if exists compras_estado_check;
alter table compras add constraint compras_estado_check
  check (estado in ('borrador', 'pendiente', 'recibida', 'cancelada'));

alter table compras drop constraint if exists compras_fecha_check;
alter table compras add constraint compras_fecha_check check (fecha <= current_date);

alter table compras drop constraint if exists compras_montos_check;
alter table compras add constraint compras_montos_check
  check (subtotal >= 0 and descuento >= 0 and impuestos >= 0);

create index if not exists compras_proveedor_id_idx on compras(proveedor_id);
create index if not exists compras_estado_idx on compras(estado);
create index if not exists compras_fecha_idx on compras(fecha desc);

alter table compras enable row level security;
drop policy if exists "Usuarios autenticados administran compras" on compras;
create policy "Usuarios autenticados administran compras"
  on compras for all
  to authenticated
  using (true)
  with check (true);

-- Mantiene compras.total = subtotal - descuento + impuestos, sin importar
-- cuál de los tres haya cambiado (edición manual o recálculo por líneas).
create or replace function recalcular_total_compra()
returns trigger
language plpgsql
as $$
begin
  new.total := round(new.subtotal - new.descuento + new.impuestos, 2);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists compras_recalcular_total on compras;
create trigger compras_recalcular_total
  before insert or update on compras
  for each row
  execute function recalcular_total_compra();

-- ----------------------------------------------------------------------------

create table if not exists detalle_compras (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid not null references compras(id) on delete cascade,
  producto_id uuid not null references productos_inventario(id),
  cantidad numeric(10, 2) not null,
  costo_unitario numeric(10, 2) not null,
  descuento numeric(10, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0
);

alter table detalle_compras drop constraint if exists detalle_compras_cantidad_check;
alter table detalle_compras add constraint detalle_compras_cantidad_check check (cantidad > 0);

alter table detalle_compras drop constraint if exists detalle_compras_costo_check;
alter table detalle_compras add constraint detalle_compras_costo_check check (costo_unitario >= 0);

alter table detalle_compras drop constraint if exists detalle_compras_descuento_check;
alter table detalle_compras add constraint detalle_compras_descuento_check check (descuento >= 0);

create index if not exists detalle_compras_compra_id_idx on detalle_compras(compra_id);
create index if not exists detalle_compras_producto_id_idx on detalle_compras(producto_id);

alter table detalle_compras enable row level security;
drop policy if exists "Usuarios autenticados administran detalle de compras" on detalle_compras;
create policy "Usuarios autenticados administran detalle de compras"
  on detalle_compras for all
  to authenticated
  using (true)
  with check (true);

-- El subtotal de cada línea nunca se confía del cliente: se recalcula aquí.
create or replace function recalcular_subtotal_linea_compra()
returns trigger
language plpgsql
as $$
begin
  new.subtotal := round(new.cantidad * new.costo_unitario - new.descuento, 2);
  return new;
end;
$$;

drop trigger if exists detalle_compras_recalcular_subtotal on detalle_compras;
create trigger detalle_compras_recalcular_subtotal
  before insert or update on detalle_compras
  for each row
  execute function recalcular_subtotal_linea_compra();

-- Cuando cambian las líneas, vuelve a sumar compras.subtotal (lo que dispara,
-- a su vez, el trigger de arriba que recalcula compras.total).
create or replace function actualizar_subtotal_compra()
returns trigger
language plpgsql
as $$
declare
  target_compra_id uuid := coalesce(new.compra_id, old.compra_id);
  nuevo_subtotal numeric(12, 2);
begin
  select coalesce(sum(subtotal), 0) into nuevo_subtotal
  from detalle_compras
  where compra_id = target_compra_id;

  update compras set subtotal = nuevo_subtotal where id = target_compra_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists detalle_compras_actualizar_compra on detalle_compras;
create trigger detalle_compras_actualizar_compra
  after insert or update or delete on detalle_compras
  for each row
  execute function actualizar_subtotal_compra();

-- Una compra recibida o cancelada queda inmutable: ni sus datos generales ni
-- sus líneas pueden volver a tocarse (evita "editar" una compra ya recibida).
create or replace function bloquear_edicion_compra_finalizada()
returns trigger
language plpgsql
as $$
begin
  if old.estado in ('recibida', 'cancelada') then
    raise exception 'No se puede modificar una compra en estado "%".', old.estado;
  end if;
  return new;
end;
$$;

drop trigger if exists compras_bloquear_edicion on compras;
create trigger compras_bloquear_edicion
  before update on compras
  for each row
  execute function bloquear_edicion_compra_finalizada();

create or replace function bloquear_edicion_detalle_compra_finalizada()
returns trigger
language plpgsql
as $$
declare
  v_estado text;
begin
  select estado into v_estado from compras where id = coalesce(new.compra_id, old.compra_id);
  if v_estado in ('recibida', 'cancelada') then
    raise exception 'No se pueden modificar los productos de una compra en estado "%".', v_estado;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists detalle_compras_bloquear_edicion on detalle_compras;
create trigger detalle_compras_bloquear_edicion
  before insert or update or delete on detalle_compras
  for each row
  execute function bloquear_edicion_detalle_compra_finalizada();

-- ----------------------------------------------------------------------------
-- Vincula movimientos_inventario con la compra/línea que los originó.
-- ----------------------------------------------------------------------------
alter table movimientos_inventario add column if not exists compra_id uuid references compras(id) on delete set null;
alter table movimientos_inventario add column if not exists detalle_compra_id uuid references detalle_compras(id) on delete set null;

-- Garantiza a nivel de base de datos que una línea de compra nunca genere
-- más de un movimiento de inventario, sin importar cuántas veces se intente.
create unique index if not exists movimientos_inventario_detalle_compra_id_key
  on movimientos_inventario(detalle_compra_id)
  where detalle_compra_id is not null;

create index if not exists movimientos_inventario_compra_id_idx on movimientos_inventario(compra_id);

-- ----------------------------------------------------------------------------
-- RPCs: crear/actualizar una compra con todas sus líneas de forma atómica, y
-- recibirla (generar movimientos de entrada + actualizar stock) también de
-- forma atómica y protegida contra doble ejecución.
-- ----------------------------------------------------------------------------
create or replace function crear_compra(
  p_proveedor_id uuid,
  p_fecha date,
  p_estado text,
  p_descuento numeric,
  p_impuestos numeric,
  p_observaciones text,
  p_lineas jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_compra_id uuid;
  v_linea jsonb;
begin
  if p_lineas is null or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La compra debe tener al menos un producto.';
  end if;

  insert into compras (proveedor_id, fecha, estado, descuento, impuestos, observaciones)
  values (p_proveedor_id, p_fecha, coalesce(p_estado, 'borrador'), coalesce(p_descuento, 0), coalesce(p_impuestos, 0), p_observaciones)
  returning id into v_compra_id;

  for v_linea in select * from jsonb_array_elements(p_lineas)
  loop
    insert into detalle_compras (compra_id, producto_id, cantidad, costo_unitario, descuento)
    values (
      v_compra_id,
      (v_linea ->> 'producto_id')::uuid,
      (v_linea ->> 'cantidad')::numeric,
      (v_linea ->> 'costo_unitario')::numeric,
      coalesce((v_linea ->> 'descuento')::numeric, 0)
    );
  end loop;

  return v_compra_id;
end;
$$;

create or replace function actualizar_compra(
  p_compra_id uuid,
  p_proveedor_id uuid,
  p_fecha date,
  p_estado text,
  p_descuento numeric,
  p_impuestos numeric,
  p_observaciones text,
  p_lineas jsonb
)
returns void
language plpgsql
as $$
declare
  v_linea jsonb;
begin
  if p_lineas is null or jsonb_array_length(p_lineas) = 0 then
    raise exception 'La compra debe tener al menos un producto.';
  end if;

  update compras
  set proveedor_id = p_proveedor_id,
      fecha = p_fecha,
      estado = coalesce(p_estado, estado),
      descuento = coalesce(p_descuento, 0),
      impuestos = coalesce(p_impuestos, 0),
      observaciones = p_observaciones
  where id = p_compra_id;

  delete from detalle_compras where compra_id = p_compra_id;

  for v_linea in select * from jsonb_array_elements(p_lineas)
  loop
    insert into detalle_compras (compra_id, producto_id, cantidad, costo_unitario, descuento)
    values (
      p_compra_id,
      (v_linea ->> 'producto_id')::uuid,
      (v_linea ->> 'cantidad')::numeric,
      (v_linea ->> 'costo_unitario')::numeric,
      coalesce((v_linea ->> 'descuento')::numeric, 0)
    );
  end loop;
end;
$$;

create or replace function recibir_compra(p_compra_id uuid)
returns void
language plpgsql
as $$
declare
  v_estado text;
  v_linea record;
begin
  select estado into v_estado from compras where id = p_compra_id for update;

  if v_estado is null then
    raise exception 'La compra no existe.';
  end if;
  if v_estado = 'recibida' then
    raise exception 'Esta compra ya fue recibida.';
  end if;
  if v_estado = 'cancelada' then
    raise exception 'No se puede recibir una compra cancelada.';
  end if;

  for v_linea in
    select id, producto_id, cantidad, costo_unitario
    from detalle_compras
    where compra_id = p_compra_id
  loop
    insert into movimientos_inventario (
      producto_id, tipo, cantidad, costo_unitario, fecha, motivo, compra_id, detalle_compra_id
    ) values (
      v_linea.producto_id, 'entrada', v_linea.cantidad, v_linea.costo_unitario,
      current_date, 'Compra recibida', p_compra_id, v_linea.id
    )
    on conflict (detalle_compra_id) where detalle_compra_id is not null do nothing;
  end loop;

  update compras set estado = 'recibida' where id = p_compra_id;
end;
$$;

NOTIFY pgrst, 'reload schema';
