-- ============================================================================
-- Fase 10: Calendario y Gestión de Actividades
-- Agrega una única tabla `actividades` para las tareas ganaderas que el
-- propietario programa manualmente (vacunaciones, pesajes, mantenimiento...).
-- Los eventos que ya tienen una fecha futura en otros módulos (próxima
-- aplicación de vacunas/desparasitaciones en Salud, fecha estimada de parto
-- en Reproducción) NO se duplican aquí: el calendario los calcula en la
-- aplicación a partir de esas tablas, igual que los indicadores financieros
-- se calculan a partir de ventas/compras/gastos en la Fase 9.
-- ============================================================================

create table if not exists actividades (
  id uuid primary key default gen_random_uuid(),
  finca_id uuid not null references finca(id) on delete cascade,
  titulo text not null,
  descripcion text,
  tipo text not null,
  fecha date not null,
  hora_inicio time,
  hora_fin time,
  estado text not null default 'pendiente',
  prioridad text not null default 'media',
  animal_id uuid references animales(id) on delete set null,
  recurrencia text not null default 'ninguna',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table actividades drop constraint if exists actividades_titulo_check;
alter table actividades add constraint actividades_titulo_check check (length(trim(titulo)) > 0);

alter table actividades drop constraint if exists actividades_tipo_check;
alter table actividades add constraint actividades_tipo_check
  check (tipo in (
    'vacunacion', 'desparasitacion', 'tratamiento', 'consulta_veterinaria',
    'pesaje', 'inseminacion', 'revision_reproductiva', 'diagnostico_prenez',
    'parto', 'alimentacion', 'mantenimiento', 'compra', 'otro'
  ));

alter table actividades drop constraint if exists actividades_estado_check;
alter table actividades add constraint actividades_estado_check
  check (estado in ('pendiente', 'en_progreso', 'completada', 'cancelada'));

alter table actividades drop constraint if exists actividades_prioridad_check;
alter table actividades add constraint actividades_prioridad_check
  check (prioridad in ('baja', 'media', 'alta'));

alter table actividades drop constraint if exists actividades_recurrencia_check;
alter table actividades add constraint actividades_recurrencia_check
  check (recurrencia in ('ninguna', 'diaria', 'semanal', 'mensual'));

alter table actividades drop constraint if exists actividades_horas_check;
alter table actividades add constraint actividades_horas_check
  check (hora_fin is null or hora_inicio is null or hora_fin > hora_inicio);

create index if not exists actividades_finca_id_idx on actividades(finca_id);
create index if not exists actividades_animal_id_idx on actividades(animal_id);
create index if not exists actividades_fecha_idx on actividades(fecha);
create index if not exists actividades_estado_idx on actividades(estado);

drop trigger if exists actividades_set_updated_at on actividades;
create trigger actividades_set_updated_at
  before update on actividades
  for each row
  execute function set_updated_at();

alter table actividades enable row level security;
drop policy if exists "Usuarios autenticados administran actividades" on actividades;
create policy "Usuarios autenticados administran actividades"
  on actividades for all
  to authenticated
  using (true)
  with check (true);

NOTIFY pgrst, 'reload schema';
