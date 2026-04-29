-- ============================================================
-- M7 Migration 4: RLS Performance Fix
-- ============================================================
-- Reescreve as funções helper para usar (select auth.uid())
-- em vez de auth.uid() direto, evitando chamada por linha.
-- Impacto: 5-100x mais rápido em tabelas grandes.
-- Ref: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations

create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = ws_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function is_workspace_admin(ws_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = ws_id
      and user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- RPC atômica: cria workspace + insere membro admin em uma transação
-- Chamada pelo onboarding via supabase.rpc('create_workspace_with_admin', ...)
create or replace function create_workspace_with_admin(
  p_name text,
  p_slug text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
  v_user_id uuid;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.workspaces (name, slug, plan)
  values (p_name, p_slug, 'free')
  returning id into v_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, v_user_id, 'admin');

  return v_workspace_id;
end;
$$;

-- Garante que a função é invocável pelo role authenticated
grant execute on function create_workspace_with_admin(text, text) to authenticated;
