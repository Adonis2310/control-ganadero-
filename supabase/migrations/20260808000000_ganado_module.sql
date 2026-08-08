-- ============================================================================
-- Fase 2: Módulo Ganado
-- Extiende `animales` con los campos que necesita el formulario completo,
-- ajusta los estados controlados, agrega pedigrí (padre/madre) y prepara el
-- bucket de Storage para las fotografías.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- animales: nuevas columnas
-- ----------------------------------------------------------------------------
alter table animales
  add column if not exists color text,
  add column if not exists peso_inicial_kg numeric(8, 2),
  add column if not exists observaciones text,
  add column if not exists padre_id uuid,
  add column if not exists madre_id uuid;

-- Se agregan como pasos separados (en vez de inline en el ADD COLUMN) y
-- guardados con pg_constraint: si una corrida previa dejó las columnas sin
-- la relación (por ejemplo porque `add column if not exists` saltó la
-- cláusula completa al ya existir la columna), esto la completa sin fallar.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'animales'::regclass and conname = 'animales_padre_id_fkey'
  ) then
    alter table animales
      add constraint animales_padre_id_fkey
      foreign key (padre_id) references animales(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'animales'::regclass and conname = 'animales_madre_id_fkey'
  ) then
    alter table animales
      add constraint animales_madre_id_fkey
      foreign key (madre_id) references animales(id) on delete set null;
  end if;
end $$;

create index if not exists animales_padre_id_idx on animales(padre_id);
create index if not exists animales_madre_id_idx on animales(madre_id);

-- Estados controlados: la Fase 1 dejó 'baja' como placeholder; la Fase 2
-- define exactamente activo/vendido/fallecido/transferido.
alter table animales drop constraint if exists animales_estado_check;
update animales set estado = 'transferido' where estado = 'baja';
alter table animales
  add constraint animales_estado_check
  check (estado in ('activo', 'vendido', 'fallecido', 'transferido'));

-- Validaciones a nivel de base de datos (no confiar solo en el frontend).
alter table animales drop constraint if exists animales_peso_actual_check;
alter table animales
  add constraint animales_peso_actual_check
  check (peso_actual_kg is null or peso_actual_kg >= 0);

alter table animales drop constraint if exists animales_peso_inicial_check;
alter table animales
  add constraint animales_peso_inicial_check
  check (peso_inicial_kg is null or peso_inicial_kg >= 0);

alter table animales drop constraint if exists animales_fecha_nacimiento_check;
alter table animales
  add constraint animales_fecha_nacimiento_check
  check (fecha_nacimiento is null or fecha_nacimiento <= current_date);

-- ----------------------------------------------------------------------------
-- Storage: bucket de fotografías de animales
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('animales', 'animales', true)
on conflict (id) do nothing;

drop policy if exists "Lectura pública de fotos de animales" on storage.objects;
create policy "Lectura pública de fotos de animales"
  on storage.objects for select
  to public
  using (bucket_id = 'animales');

drop policy if exists "Usuarios autenticados suben fotos de animales" on storage.objects;
create policy "Usuarios autenticados suben fotos de animales"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'animales');

drop policy if exists "Usuarios autenticados actualizan fotos de animales" on storage.objects;
create policy "Usuarios autenticados actualizan fotos de animales"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'animales')
  with check (bucket_id = 'animales');

drop policy if exists "Usuarios autenticados eliminan fotos de animales" on storage.objects;
create policy "Usuarios autenticados eliminan fotos de animales"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'animales');

-- Fuerza a PostgREST a refrescar su caché de esquema de inmediato en vez de
-- esperar a que lo detecte solo.
NOTIFY pgrst, 'reload schema';
