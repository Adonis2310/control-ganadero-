-- ============================================================================
-- Fase 3: Control de Peso
-- Historial de pesajes por animal. `animales.peso_actual_kg` deja de
-- escribirse manualmente desde el formulario de edición y pasa a
-- sincronizarse automáticamente (vía trigger) con el pesaje más reciente
-- registrado en `pesos`, evitando que las dos fuentes se desincronicen.
-- `animales.peso_inicial_kg` se conserva como dato histórico de registro,
-- inmutable después de creado el animal.
-- ============================================================================

create table if not exists pesos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references animales(id) on delete cascade,
  fecha date not null,
  peso numeric(8, 2) not null,
  observaciones text,
  created_at timestamptz not null default now()
);

alter table pesos drop constraint if exists pesos_peso_check;
alter table pesos add constraint pesos_peso_check check (peso > 0);

alter table pesos drop constraint if exists pesos_fecha_check;
alter table pesos add constraint pesos_fecha_check check (fecha <= current_date);

create index if not exists pesos_animal_id_idx on pesos(animal_id);
create index if not exists pesos_animal_id_fecha_idx on pesos(animal_id, fecha desc);

alter table pesos enable row level security;

drop policy if exists "Usuarios autenticados administran pesos" on pesos;
create policy "Usuarios autenticados administran pesos"
  on pesos for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Mantiene animales.peso_actual_kg = el pesaje cronológicamente más
-- reciente en `pesos` para ese animal (o null si no tiene ninguno).
-- ----------------------------------------------------------------------------
create or replace function sync_peso_actual_animal()
returns trigger
language plpgsql
as $$
declare
  target_animal_id uuid := coalesce(new.animal_id, old.animal_id);
  ultimo_peso numeric(8, 2);
begin
  select p.peso into ultimo_peso
  from pesos p
  where p.animal_id = target_animal_id
  order by p.fecha desc, p.created_at desc
  limit 1;

  update animales set peso_actual_kg = ultimo_peso where id = target_animal_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists pesos_sync_peso_actual on pesos;
create trigger pesos_sync_peso_actual
  after insert or update or delete on pesos
  for each row
  execute function sync_peso_actual_animal();

NOTIFY pgrst, 'reload schema';
