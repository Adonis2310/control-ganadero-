-- ============================================================================
-- Fase 4: Salud Animal
-- Historial sanitario normalizado en 4 tablas independientes: vacunas,
-- desparasitaciones, enfermedades y tratamientos. Los "estados" que dependen
-- del tiempo (aplicada/próxima/vencida, activo/finalizado) se calculan en el
-- frontend a partir de las fechas, para no tener que mantenerlos sincronizados
-- con un job. El estado de una enfermedad (activa/recuperado) sí se guarda,
-- porque depende de una acción explícita del usuario ("marcar como
-- recuperada"), no del paso del tiempo.
-- ============================================================================

create table if not exists vacunas (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  nombre text not null,
  fecha_aplicacion date not null,
  proxima_aplicacion date,
  dosis text,
  veterinario text,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table vacunas drop constraint if exists vacunas_fecha_aplicacion_check;
alter table vacunas add constraint vacunas_fecha_aplicacion_check check (fecha_aplicacion <= current_date);

create index if not exists vacunas_animal_id_idx on vacunas(animal_id);

alter table vacunas enable row level security;
drop policy if exists "Usuarios autenticados administran vacunas" on vacunas;
create policy "Usuarios autenticados administran vacunas"
  on vacunas for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------

create table if not exists desparasitaciones (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  producto text not null,
  fecha_aplicacion date not null,
  proxima_aplicacion date,
  dosis text,
  veterinario text,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table desparasitaciones drop constraint if exists desparasitaciones_fecha_aplicacion_check;
alter table desparasitaciones add constraint desparasitaciones_fecha_aplicacion_check check (fecha_aplicacion <= current_date);

create index if not exists desparasitaciones_animal_id_idx on desparasitaciones(animal_id);

alter table desparasitaciones enable row level security;
drop policy if exists "Usuarios autenticados administran desparasitaciones" on desparasitaciones;
create policy "Usuarios autenticados administran desparasitaciones"
  on desparasitaciones for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------

create table if not exists enfermedades (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  enfermedad text not null,
  fecha_diagnostico date not null,
  fecha_recuperacion date,
  estado text not null default 'activa',
  descripcion text,
  veterinario text,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table enfermedades drop constraint if exists enfermedades_estado_check;
alter table enfermedades add constraint enfermedades_estado_check check (estado in ('activa', 'recuperado'));

alter table enfermedades drop constraint if exists enfermedades_fecha_diagnostico_check;
alter table enfermedades add constraint enfermedades_fecha_diagnostico_check check (fecha_diagnostico <= current_date);

alter table enfermedades drop constraint if exists enfermedades_fecha_recuperacion_check;
alter table enfermedades add constraint enfermedades_fecha_recuperacion_check
  check (fecha_recuperacion is null or fecha_recuperacion >= fecha_diagnostico);

create index if not exists enfermedades_animal_id_idx on enfermedades(animal_id);

alter table enfermedades enable row level security;
drop policy if exists "Usuarios autenticados administran enfermedades" on enfermedades;
create policy "Usuarios autenticados administran enfermedades"
  on enfermedades for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------

create table if not exists tratamientos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  enfermedad_id uuid references enfermedades(id) on delete set null,
  tratamiento text not null,
  medicamento text,
  fecha_inicio date not null,
  fecha_fin date,
  dosis text,
  frecuencia text,
  veterinario text,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table tratamientos drop constraint if exists tratamientos_fecha_fin_check;
alter table tratamientos add constraint tratamientos_fecha_fin_check
  check (fecha_fin is null or fecha_fin >= fecha_inicio);

create index if not exists tratamientos_animal_id_idx on tratamientos(animal_id);
create index if not exists tratamientos_enfermedad_id_idx on tratamientos(enfermedad_id);

alter table tratamientos enable row level security;
drop policy if exists "Usuarios autenticados administran tratamientos" on tratamientos;
create policy "Usuarios autenticados administran tratamientos"
  on tratamientos for all
  to authenticated
  using (true)
  with check (true);

NOTIFY pgrst, 'reload schema';
