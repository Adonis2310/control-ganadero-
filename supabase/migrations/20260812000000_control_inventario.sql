-- ============================================================================
-- Fase 6: Gestión de Inventario
-- Tres tablas nuevas, independientes del resto del modelo: categorias
-- (catálogo simple), productos (existencias) y movimientos (entradas,
-- salidas y ajustes). `productos_inventario.stock_actual` nunca se escribe
-- directamente desde la app: un trigger lo recalcula sumando el historial de
-- `movimientos_inventario` cada vez que cambia, igual que en la Fase 3 con
-- `animales.peso_actual_kg`. Esto garantiza trazabilidad total y evita que el
-- stock pueda quedar negativo (el UPDATE del trigger fallaría contra el
-- CHECK de la tabla, revirtiendo el movimiento completo).
-- ============================================================================

create table if not exists categorias_inventario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  created_at timestamptz not null default now()
);

alter table categorias_inventario enable row level security;
drop policy if exists "Usuarios autenticados administran categorias de inventario" on categorias_inventario;
create policy "Usuarios autenticados administran categorias de inventario"
  on categorias_inventario for all
  to authenticated
  using (true)
  with check (true);

insert into categorias_inventario (nombre, descripcion) values
  ('Medicamentos', 'Fármacos de uso general para el ganado'),
  ('Vacunas', 'Biológicos para prevención de enfermedades'),
  ('Desparasitantes', 'Productos antiparasitarios internos y externos'),
  ('Alimentos', 'Concentrados, forrajes y suplementos alimenticios'),
  ('Suplementos', 'Suplementos nutricionales y minerales'),
  ('Vitaminas', 'Vitaminas y complejos vitamínicos'),
  ('Insumos veterinarios', 'Jeringas, agujas y material veterinario'),
  ('Herramientas', 'Herramientas y equipo de manejo de finca'),
  ('Otros', 'Productos que no encajan en otra categoría')
on conflict (nombre) do nothing;

-- ----------------------------------------------------------------------------

create table if not exists productos_inventario (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias_inventario(id),
  nombre text not null,
  descripcion text,
  unidad_medida text not null,
  stock_actual numeric(10, 2) not null default 0,
  stock_minimo numeric(10, 2) not null default 0,
  costo_unitario numeric(10, 2),
  -- Sin FK todavía: la tabla `proveedores` se construirá en una fase futura.
  -- La columna queda preparada; la fase de Proveedores solo necesitará
  -- agregar `references proveedores(id) on delete set null`.
  proveedor_id uuid,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table productos_inventario drop constraint if exists productos_inventario_stock_actual_check;
alter table productos_inventario add constraint productos_inventario_stock_actual_check check (stock_actual >= 0);

alter table productos_inventario drop constraint if exists productos_inventario_stock_minimo_check;
alter table productos_inventario add constraint productos_inventario_stock_minimo_check check (stock_minimo >= 0);

alter table productos_inventario drop constraint if exists productos_inventario_costo_unitario_check;
alter table productos_inventario add constraint productos_inventario_costo_unitario_check check (costo_unitario is null or costo_unitario >= 0);

create index if not exists productos_inventario_categoria_id_idx on productos_inventario(categoria_id);
create index if not exists productos_inventario_activo_idx on productos_inventario(activo);

alter table productos_inventario enable row level security;
drop policy if exists "Usuarios autenticados administran productos de inventario" on productos_inventario;
create policy "Usuarios autenticados administran productos de inventario"
  on productos_inventario for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------

create table if not exists movimientos_inventario (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos_inventario(id) on delete cascade,
  tipo text not null,
  cantidad numeric(10, 2) not null,
  costo_unitario numeric(10, 2),
  fecha date not null,
  motivo text not null,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table movimientos_inventario drop constraint if exists movimientos_inventario_tipo_check;
alter table movimientos_inventario add constraint movimientos_inventario_tipo_check
  check (tipo in ('entrada', 'salida', 'ajuste'));

-- Entrada/salida guardan una cantidad positiva (el signo lo da `tipo`).
-- Ajuste guarda directamente la diferencia (delta), que puede ser negativa.
alter table movimientos_inventario drop constraint if exists movimientos_inventario_cantidad_check;
alter table movimientos_inventario add constraint movimientos_inventario_cantidad_check
  check (
    (tipo in ('entrada', 'salida') and cantidad > 0) or
    (tipo = 'ajuste' and cantidad <> 0)
  );

alter table movimientos_inventario drop constraint if exists movimientos_inventario_costo_unitario_check;
alter table movimientos_inventario add constraint movimientos_inventario_costo_unitario_check check (costo_unitario is null or costo_unitario >= 0);

alter table movimientos_inventario drop constraint if exists movimientos_inventario_fecha_check;
alter table movimientos_inventario add constraint movimientos_inventario_fecha_check check (fecha <= current_date);

create index if not exists movimientos_inventario_producto_id_idx on movimientos_inventario(producto_id);
create index if not exists movimientos_inventario_fecha_idx on movimientos_inventario(fecha desc);
create index if not exists movimientos_inventario_tipo_idx on movimientos_inventario(tipo);

alter table movimientos_inventario enable row level security;
drop policy if exists "Usuarios autenticados administran movimientos de inventario" on movimientos_inventario;
create policy "Usuarios autenticados administran movimientos de inventario"
  on movimientos_inventario for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Mantiene productos_inventario.stock_actual = suma de todos sus movimientos.
-- ----------------------------------------------------------------------------
create or replace function sync_stock_actual_producto()
returns trigger
language plpgsql
as $$
declare
  target_producto_id uuid := coalesce(new.producto_id, old.producto_id);
  nuevo_stock numeric(10, 2);
begin
  select coalesce(sum(
    case
      when tipo = 'entrada' then cantidad
      when tipo = 'salida' then -cantidad
      when tipo = 'ajuste' then cantidad
      else 0
    end
  ), 0)
  into nuevo_stock
  from movimientos_inventario
  where producto_id = target_producto_id;

  update productos_inventario
  set stock_actual = nuevo_stock, updated_at = now()
  where id = target_producto_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists movimientos_inventario_sync_stock on movimientos_inventario;
create trigger movimientos_inventario_sync_stock
  after insert or update or delete on movimientos_inventario
  for each row
  execute function sync_stock_actual_producto();

NOTIFY pgrst, 'reload schema';
