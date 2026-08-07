-- ============================================================================
-- Fase 1: Esquema inicial (infraestructura)
-- Tablas base: finca, razas, animales.
-- No incluye lógica de negocio; solo estructura, relaciones, índices y RLS.
-- ============================================================================

create extension if not exists pgcrypto;

-- Reutilizable: mantiene updated_at al día en cada UPDATE.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- finca
-- ----------------------------------------------------------------------------
create table if not exists finca (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ubicacion text,
  propietario text,
  area_hectareas numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger finca_set_updated_at
  before update on finca
  for each row
  execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- razas
-- ----------------------------------------------------------------------------
create table if not exists razas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  proposito text,
  descripcion text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- animales
-- ----------------------------------------------------------------------------
create table if not exists animales (
  id uuid primary key default gen_random_uuid(),
  finca_id uuid not null references finca(id) on delete cascade,
  raza_id uuid references razas(id) on delete set null,
  identificador text not null,
  nombre text,
  sexo text not null check (sexo in ('macho', 'hembra')),
  fecha_nacimiento date,
  estado text not null default 'activo'
    check (estado in ('activo', 'vendido', 'fallecido', 'baja')),
  peso_actual_kg numeric(8, 2),
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (finca_id, identificador)
);

create index if not exists animales_finca_id_idx on animales(finca_id);
create index if not exists animales_raza_id_idx on animales(raza_id);
create index if not exists animales_estado_idx on animales(estado);

create trigger animales_set_updated_at
  before update on animales
  for each row
  execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- Fase 1: acceso completo para cualquier usuario autenticado (administrador
-- único). Las políticas se refinarán cuando se introduzca gestión de roles.
-- ----------------------------------------------------------------------------
alter table finca enable row level security;
alter table razas enable row level security;
alter table animales enable row level security;

create policy "Usuarios autenticados administran finca"
  on finca for all
  to authenticated
  using (true)
  with check (true);

create policy "Usuarios autenticados administran razas"
  on razas for all
  to authenticated
  using (true)
  with check (true);

create policy "Usuarios autenticados administran animales"
  on animales for all
  to authenticated
  using (true)
  with check (true);
