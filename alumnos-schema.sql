-- =========================================================
-- TALENTO CANES · Módulo Alumnos (mascotas)
-- =========================================================

-- ---------------------------------------------------------
-- 1. Función reutilizable: ¿el trabajador actual tiene habilitado
--    un módulo específico? (o es admin, que siempre puede todo)
-- ---------------------------------------------------------
create or replace function public.tiene_modulo(p_clave text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.trabajador_detalle td
      join public.profiles p on p.id = td.id
      where td.id = auth.uid()
        and p.role = 'trabajador'
        and p.status = 'approved'
        and td.modulos_habilitados @> array[p_clave]::text[]
    );
$$;

grant execute on function public.tiene_modulo(text) to authenticated;

-- ---------------------------------------------------------
-- 2. Tabla de alumnos (mascotas)
-- ---------------------------------------------------------
create table if not exists public.alumnos (
  id                   uuid primary key default gen_random_uuid(),
  acudiente_id         uuid not null references public.profiles(id) on delete cascade,
  nombre               text not null,
  foto_url             text,
  fecha_nacimiento     date,
  sexo                 text check (sexo in ('macho','hembra')),
  raza                 text,
  es_mestizo           boolean not null default false,
  color_pelaje         text,
  carne_vacunacion_url text,
  activo               boolean not null default true,
  creado_por           uuid references auth.users(id) on delete set null,
  created_at           timestamptz not null default now()
);

alter table public.alumnos enable row level security;

drop policy if exists "alumnos_select" on public.alumnos;
drop policy if exists "alumnos_insert" on public.alumnos;
drop policy if exists "alumnos_update" on public.alumnos;
drop policy if exists "alumnos_delete" on public.alumnos;

-- Ve sus propios alumnos el Acudiente dueño; ve todos el admin y
-- cualquier trabajador con el módulo "alumnos" habilitado
create policy "alumnos_select"
  on public.alumnos for select
  using (acudiente_id = auth.uid() or public.tiene_modulo('alumnos'));

create policy "alumnos_insert"
  on public.alumnos for insert
  with check (acudiente_id = auth.uid() or public.tiene_modulo('alumnos'));

create policy "alumnos_update"
  on public.alumnos for update
  using (acudiente_id = auth.uid() or public.tiene_modulo('alumnos'));

create policy "alumnos_delete"
  on public.alumnos for delete
  using (acudiente_id = auth.uid() or public.tiene_modulo('alumnos'));

-- ---------------------------------------------------------
-- 3. Bucket de almacenamiento para fotos y carné de vacunación
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('alumnos', 'alumnos', true)
on conflict (id) do nothing;

drop policy if exists "alumnos_bucket_read" on storage.objects;
drop policy if exists "alumnos_bucket_insert" on storage.objects;
drop policy if exists "alumnos_bucket_update" on storage.objects;
drop policy if exists "alumnos_bucket_delete" on storage.objects;

create policy "alumnos_bucket_read"
  on storage.objects for select
  using (bucket_id = 'alumnos');

-- Cada archivo debe subirse dentro de una carpeta con el id del
-- Acudiente dueño (ej: "ACUDIENTE_ID/foto.jpg"), así el propio
-- Acudiente solo puede subir dentro de su propia carpeta; el admin
-- y los trabajadores con el módulo habilitado pueden subir en
-- cualquier carpeta (para crear/editar alumnos desde el colegio).
create policy "alumnos_bucket_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'alumnos'
    and (public.tiene_modulo('alumnos') or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "alumnos_bucket_update"
  on storage.objects for update
  using (
    bucket_id = 'alumnos'
    and (public.tiene_modulo('alumnos') or (storage.foldername(name))[1] = auth.uid()::text)
  );

create policy "alumnos_bucket_delete"
  on storage.objects for delete
  using (
    bucket_id = 'alumnos'
    and (public.tiene_modulo('alumnos') or (storage.foldername(name))[1] = auth.uid()::text)
  );

-- ---------------------------------------------------------
-- 4. Tiempo real
-- ---------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.alumnos;
exception when duplicate_object then
  raise notice 'alumnos ya estaba en supabase_realtime.';
end $$;

notify pgrst, 'reload schema';
