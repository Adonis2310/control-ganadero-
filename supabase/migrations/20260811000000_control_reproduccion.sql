-- ============================================================================
-- Fase 5: Control Reproductivo
-- `animales.padre_id`/`madre_id` ya existen desde la Fase 2 (migración
-- 20260808000000_ganado_module.sql), así que esta migración solo agrega las
-- dos tablas nuevas del ciclo reproductivo:
--   - eventos_reproductivos: bitácora cronológica de todo lo que le pasa a
--     una hembra (celo, monta, inseminación, diagnóstico, parto, aborto).
--     Se usa una sola tabla (en vez de una por tipo, como en Salud) porque
--     el historial reproductivo necesita mostrarse como una única línea de
--     tiempo ordenada, y separar por tipo obligaría a unir 6 tablas para
--     reconstruirla. Las columnas específicas de cada tipo quedan nulas
--     para el resto.
--   - gestaciones: el "estado actual" de un ciclo de preñez, derivado de
--     esos eventos pero mantenido aparte porque tiene su propio ciclo de
--     vida (en_seguimiento -> confirmada -> finalizada/abortada) y necesita
--     poder actualizarse (fecha_diagnostico, fecha_parto) sin reescribir el
--     evento histórico que lo originó.
-- ============================================================================

create table if not exists eventos_reproductivos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  tipo text not null,
  fecha date not null,
  macho_id uuid references animales(id) on delete set null,
  tipo_monta text,
  metodo_inseminacion text,
  identificacion_semen text,
  resultado_diagnostico text,
  metodo_diagnostico text,
  numero_crias integer,
  estado_parto text,
  motivo_aborto text,
  veterinario text,
  gestacion_id uuid,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_tipo_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_tipo_check
  check (tipo in ('celo', 'monta', 'inseminacion', 'diagnostico', 'parto', 'aborto'));

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_fecha_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_fecha_check
  check (fecha <= current_date);

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_tipo_monta_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_tipo_monta_check
  check (tipo_monta is null or tipo_monta in ('natural', 'controlada'));

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_resultado_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_resultado_check
  check (resultado_diagnostico is null or resultado_diagnostico in ('positivo', 'negativo'));

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_estado_parto_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_estado_parto_check
  check (estado_parto is null or estado_parto in ('normal', 'complicaciones'));

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_numero_crias_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_numero_crias_check
  check (numero_crias is null or numero_crias > 0);

alter table eventos_reproductivos drop constraint if exists eventos_reproductivos_macho_check;
alter table eventos_reproductivos add constraint eventos_reproductivos_macho_check
  check (macho_id is null or macho_id <> animal_id);

create index if not exists eventos_reproductivos_animal_id_idx on eventos_reproductivos(animal_id);
create index if not exists eventos_reproductivos_macho_id_idx on eventos_reproductivos(macho_id);
create index if not exists eventos_reproductivos_gestacion_id_idx on eventos_reproductivos(gestacion_id);

alter table eventos_reproductivos enable row level security;
drop policy if exists "Usuarios autenticados administran eventos reproductivos" on eventos_reproductivos;
create policy "Usuarios autenticados administran eventos reproductivos"
  on eventos_reproductivos for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------

create table if not exists gestaciones (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  fecha_inicio date not null,
  fecha_diagnostico date,
  fecha_estimada_parto date,
  fecha_parto date,
  estado text not null default 'en_seguimiento',
  metodo_concepcion text,
  macho_id uuid references animales(id) on delete set null,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table gestaciones drop constraint if exists gestaciones_estado_check;
alter table gestaciones add constraint gestaciones_estado_check
  check (estado in ('en_seguimiento', 'confirmada', 'finalizada', 'abortada'));

alter table gestaciones drop constraint if exists gestaciones_metodo_concepcion_check;
alter table gestaciones add constraint gestaciones_metodo_concepcion_check
  check (metodo_concepcion is null or metodo_concepcion in ('monta_natural', 'monta_controlada', 'inseminacion_artificial', 'desconocido'));

alter table gestaciones drop constraint if exists gestaciones_fecha_diagnostico_check;
alter table gestaciones add constraint gestaciones_fecha_diagnostico_check
  check (fecha_diagnostico is null or fecha_diagnostico >= fecha_inicio);

alter table gestaciones drop constraint if exists gestaciones_fecha_parto_check;
alter table gestaciones add constraint gestaciones_fecha_parto_check
  check (fecha_parto is null or fecha_parto >= fecha_inicio);

alter table gestaciones drop constraint if exists gestaciones_macho_check;
alter table gestaciones add constraint gestaciones_macho_check
  check (macho_id is null or macho_id <> animal_id);

create index if not exists gestaciones_animal_id_idx on gestaciones(animal_id);
create index if not exists gestaciones_macho_id_idx on gestaciones(macho_id);
create index if not exists gestaciones_estado_idx on gestaciones(estado);

alter table gestaciones enable row level security;
drop policy if exists "Usuarios autenticados administran gestaciones" on gestaciones;
create policy "Usuarios autenticados administran gestaciones"
  on gestaciones for all
  to authenticated
  using (true)
  with check (true);

-- eventos_reproductivos.gestacion_id se agrega como FK aparte porque
-- gestaciones se crea después en este mismo archivo.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'eventos_reproductivos'::regclass and conname = 'eventos_reproductivos_gestacion_id_fkey'
  ) then
    alter table eventos_reproductivos
      add constraint eventos_reproductivos_gestacion_id_fkey
      foreign key (gestacion_id) references gestaciones(id) on delete set null;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Validación de sexo: el animal principal (animal_id) de cualquier evento o
-- gestación reproductiva siempre debe ser hembra; si se referencia un macho
-- (macho_id), ese animal debe ser efectivamente macho. Esto es la garantía
-- a nivel de base de datos que complementa los selects filtrados por sexo
-- en el frontend.
-- ----------------------------------------------------------------------------
create or replace function validar_sexo_reproductivo()
returns trigger
language plpgsql
as $$
declare
  animal_sexo text;
  macho_sexo text;
begin
  select sexo into animal_sexo from animales where id = new.animal_id;
  if animal_sexo is null then
    raise exception 'El animal indicado no existe.';
  end if;
  if animal_sexo <> 'hembra' then
    raise exception 'Este registro reproductivo solo puede asociarse a un animal hembra.';
  end if;

  if new.macho_id is not null then
    select sexo into macho_sexo from animales where id = new.macho_id;
    if macho_sexo is null then
      raise exception 'El macho seleccionado no existe.';
    end if;
    if macho_sexo <> 'macho' then
      raise exception 'El animal seleccionado como macho debe ser de sexo macho.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists eventos_reproductivos_validar_sexo on eventos_reproductivos;
create trigger eventos_reproductivos_validar_sexo
  before insert or update on eventos_reproductivos
  for each row
  execute function validar_sexo_reproductivo();

drop trigger if exists gestaciones_validar_sexo on gestaciones;
create trigger gestaciones_validar_sexo
  before insert or update on gestaciones
  for each row
  execute function validar_sexo_reproductivo();

NOTIFY pgrst, 'reload schema';
