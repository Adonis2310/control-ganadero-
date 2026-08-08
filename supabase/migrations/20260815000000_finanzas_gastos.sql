-- ============================================================================
-- Fase 9: Finanzas y Gastos
-- Agrega el registro de gastos operativos (categorias_gastos + gastos) y deja
-- la base para el módulo /finanzas, cuyos indicadores (ingresos, compras,
-- gastos, resultado operativo) se calculan en la aplicación a partir de datos
-- ya existentes:
--   - Ingresos      -> ventas.total   donde ventas.estado = 'completada'
--   - Compras       -> compras.total  donde compras.estado = 'recibida'
--   - Gastos        -> gastos.monto
-- No se crea ninguna tabla de "ingresos" ni se duplica información de Ventas
-- o Compras: esta migración solo agrega lo necesario para registrar gastos.
-- ============================================================================

create table if not exists categorias_gastos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table categorias_gastos drop constraint if exists categorias_gastos_nombre_key;
alter table categorias_gastos add constraint categorias_gastos_nombre_key unique (nombre);

create index if not exists categorias_gastos_activo_idx on categorias_gastos(activo);

alter table categorias_gastos enable row level security;
drop policy if exists "Usuarios autenticados administran categorias_gastos" on categorias_gastos;
create policy "Usuarios autenticados administran categorias_gastos"
  on categorias_gastos for all
  to authenticated
  using (true)
  with check (true);

insert into categorias_gastos (nombre)
values
  ('Alimentación'),
  ('Salud animal'),
  ('Combustible'),
  ('Transporte'),
  ('Mantenimiento'),
  ('Mano de obra'),
  ('Servicios'),
  ('Infraestructura'),
  ('Herramientas'),
  ('Otros')
on conflict (nombre) do nothing;

-- ----------------------------------------------------------------------------

create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias_gastos(id),
  descripcion text not null,
  monto numeric(12, 2) not null,
  fecha date not null,
  metodo_pago text,
  proveedor_id uuid references proveedores(id) on delete set null,
  animal_id uuid references animales(id) on delete set null,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table gastos drop constraint if exists gastos_monto_check;
alter table gastos add constraint gastos_monto_check check (monto > 0);

alter table gastos drop constraint if exists gastos_fecha_check;
alter table gastos add constraint gastos_fecha_check check (fecha <= current_date);

alter table gastos drop constraint if exists gastos_descripcion_check;
alter table gastos add constraint gastos_descripcion_check check (length(trim(descripcion)) > 0);

create index if not exists gastos_categoria_id_idx on gastos(categoria_id);
create index if not exists gastos_proveedor_id_idx on gastos(proveedor_id);
create index if not exists gastos_animal_id_idx on gastos(animal_id);
create index if not exists gastos_fecha_idx on gastos(fecha desc);

drop trigger if exists gastos_set_updated_at on gastos;
create trigger gastos_set_updated_at
  before update on gastos
  for each row
  execute function set_updated_at();

alter table gastos enable row level security;
drop policy if exists "Usuarios autenticados administran gastos" on gastos;
create policy "Usuarios autenticados administran gastos"
  on gastos for all
  to authenticated
  using (true)
  with check (true);

NOTIFY pgrst, 'reload schema';
