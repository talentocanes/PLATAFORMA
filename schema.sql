-- =========================================================
-- TALENTO CANES · SGITC — Esquema de autenticación y roles
-- Ejecutar completo en: Supabase Dashboard > SQL Editor > New query
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. Tipos enumerados
-- ---------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'trabajador', 'cliente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_status as enum ('pending', 'approved', 'denied');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------
-- 2. Tabla profiles (perfil + rol + estado de cada usuario)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  full_name   text,
  role        user_role not null,
  status      user_status not null default 'pending',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own"   on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

-- Cada usuario puede leer su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- El administrador (aprobado) puede leer todos los perfiles
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'approved'
    )
  );

-- El administrador (aprobado) puede actualizar cualquier perfil (aprobar/denegar)
create policy "profiles_update_admin"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'approved'
    )
  );

-- ---------------------------------------------------------
-- 3. Tabla invitations (enlaces de invitación de un solo uso)
-- ---------------------------------------------------------
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  token       uuid not null unique default gen_random_uuid(),
  role        user_role not null check (role in ('trabajador','cliente')),
  created_by  uuid references auth.users(id),
  used        boolean not null default false,
  used_by     uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '7 days')
);

alter table public.invitations enable row level security;

drop policy if exists "invitations_select_admin" on public.invitations;
drop policy if exists "invitations_insert_admin" on public.invitations;

-- Solo el administrador puede ver la lista de invitaciones generadas
create policy "invitations_select_admin"
  on public.invitations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'approved'
    )
  );

-- Solo el administrador puede generar invitaciones
create policy "invitations_insert_admin"
  on public.invitations for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin' and p.status = 'approved'
    )
  );

-- ---------------------------------------------------------
-- 4. Función: consultar una invitación por token (uso público,
--    para que la persona invitada vea el formulario sin sesión)
-- ---------------------------------------------------------
create or replace function public.get_invitation_info(p_token uuid)
returns table(role user_role, used boolean, expires_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select role, used, expires_at
  from public.invitations
  where token = p_token;
$$;

grant execute on function public.get_invitation_info(uuid) to anon, authenticated;

-- ---------------------------------------------------------
-- 5. Función: completar registro tras el signUp usando el token
--    (crea el perfil en estado 'pending' y marca la invitación usada)
-- ---------------------------------------------------------
create or replace function public.complete_registration(
  p_token     uuid,
  p_username  text,
  p_full_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.invitations%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'No hay una sesión activa.';
  end if;

  select * into v_invitation
  from public.invitations
  where token = p_token
  for update;

  if not found then
    raise exception 'La invitación no es válida.';
  end if;

  if v_invitation.used then
    raise exception 'Esta invitación ya fue utilizada.';
  end if;

  if v_invitation.expires_at < now() then
    raise exception 'Esta invitación ha expirado.';
  end if;

  insert into public.profiles (id, username, full_name, role, status)
  values (v_uid, p_username, p_full_name, v_invitation.role, 'pending');

  update public.invitations
  set used = true, used_by = v_uid
  where token = p_token;
end;
$$;

grant execute on function public.complete_registration(uuid, text, text) to authenticated;

-- =========================================================
-- 6. CUENTA DE ADMINISTRADOR (Fredy)
-- =========================================================
-- Este paso NO se hace por SQL. Sigue las instrucciones del chat:
-- 1) Crea el usuario "Fredy" desde Authentication > Users en el
--    Dashboard de Supabase.
-- 2) Copia el UUID que te asigne Supabase a ese usuario.
-- 3) Reemplaza 'PEGA-AQUI-EL-UUID' abajo y ejecuta solo esta parte:
--
-- insert into public.profiles (id, username, full_name, role, status)
-- values ('PEGA-AQUI-EL-UUID', 'Fredy', 'Fredy Díaz', 'admin', 'approved');
