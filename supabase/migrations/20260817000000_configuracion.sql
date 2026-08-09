-- ============================================================================
-- Fase 12: Configuración y Personalización del Sistema
-- No se crea una tabla `configuracion_finca` separada: la finca ya existe
-- desde la Fase 1 (`finca`, referenciada por `animales.finca_id`) y esta
-- migración solo la EXTIENDE con los datos de contacto/identidad que pide
-- esta fase, evitando dos fuentes de verdad para el mismo concepto.
-- `configuracion_sistema` sí es nueva: son preferencias globales (moneda,
-- decimales, unidad de peso, alertas de inventario, calendario) que no
-- existían en ninguna tabla anterior.
-- ============================================================================

alter table finca add column if not exists telefono text;
alter table finca add column if not exists correo text;
alter table finca add column if not exists direccion text;
alter table finca add column if not exists provincia text;
alter table finca add column if not exists canton text;
alter table finca add column if not exists distrito text;
alter table finca add column if not exists descripcion text;
alter table finca add column if not exists logo_url text;

alter table finca drop constraint if exists finca_correo_check;
alter table finca add constraint finca_correo_check
  check (correo is null or correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table finca drop constraint if exists finca_nombre_check;
alter table finca add constraint finca_nombre_check check (length(trim(nombre)) > 0);

-- ----------------------------------------------------------------------------

create table if not exists configuracion_sistema (
  id uuid primary key default gen_random_uuid(),
  moneda text not null default 'CRC',
  decimales smallint not null default 0,
  unidad_peso text not null default 'kg',
  alerta_stock_bajo numeric(10, 2) not null default 10,
  primer_dia_semana text not null default 'lunes',
  horario_inicio time not null default '07:00',
  horario_fin time not null default '17:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table configuracion_sistema drop constraint if exists configuracion_sistema_moneda_check;
alter table configuracion_sistema add constraint configuracion_sistema_moneda_check
  check (moneda in ('CRC', 'USD'));

alter table configuracion_sistema drop constraint if exists configuracion_sistema_decimales_check;
alter table configuracion_sistema add constraint configuracion_sistema_decimales_check
  check (decimales between 0 and 4);

alter table configuracion_sistema drop constraint if exists configuracion_sistema_unidad_peso_check;
alter table configuracion_sistema add constraint configuracion_sistema_unidad_peso_check
  check (unidad_peso in ('kg', 'lb'));

alter table configuracion_sistema drop constraint if exists configuracion_sistema_alerta_stock_check;
alter table configuracion_sistema add constraint configuracion_sistema_alerta_stock_check
  check (alerta_stock_bajo >= 0);

alter table configuracion_sistema drop constraint if exists configuracion_sistema_primer_dia_check;
alter table configuracion_sistema add constraint configuracion_sistema_primer_dia_check
  check (primer_dia_semana in ('domingo', 'lunes'));

alter table configuracion_sistema drop constraint if exists configuracion_sistema_horario_check;
alter table configuracion_sistema add constraint configuracion_sistema_horario_check
  check (horario_inicio < horario_fin);

drop trigger if exists configuracion_sistema_set_updated_at on configuracion_sistema;
create trigger configuracion_sistema_set_updated_at
  before update on configuracion_sistema
  for each row
  execute function set_updated_at();

alter table configuracion_sistema enable row level security;
drop policy if exists "Usuarios autenticados administran configuracion_sistema" on configuracion_sistema;
create policy "Usuarios autenticados administran configuracion_sistema"
  on configuracion_sistema for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Storage: bucket del logo de la finca (mismo patrón que el bucket "animales"
-- de la Fase 2: público para lectura, autenticado para administrar).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('finca-logos', 'finca-logos', true)
on conflict (id) do nothing;

drop policy if exists "Lectura pública del logo de la finca" on storage.objects;
create policy "Lectura pública del logo de la finca"
  on storage.objects for select
  to public
  using (bucket_id = 'finca-logos');

drop policy if exists "Usuarios autenticados suben el logo de la finca" on storage.objects;
create policy "Usuarios autenticados suben el logo de la finca"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'finca-logos');

drop policy if exists "Usuarios autenticados actualizan el logo de la finca" on storage.objects;
create policy "Usuarios autenticados actualizan el logo de la finca"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'finca-logos')
  with check (bucket_id = 'finca-logos');

drop policy if exists "Usuarios autenticados eliminan el logo de la finca" on storage.objects;
create policy "Usuarios autenticados eliminan el logo de la finca"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'finca-logos');

NOTIFY pgrst, 'reload schema';
