-- View segura que expõe email dos membros sem acesso direto a auth.users
-- Executar no SQL Editor do Supabase Dashboard

create or replace function get_workspace_members_with_email(p_workspace_id uuid)
returns table (
  id         uuid,
  workspace_id uuid,
  user_id    uuid,
  role       text,
  email      text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Verificar que o caller é membro do workspace
  if not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = (select auth.uid())
  ) then
    raise exception 'Acesso negado';
  end if;

  return query
    select
      wm.id,
      wm.workspace_id,
      wm.user_id,
      wm.role,
      au.email,
      wm.created_at
    from public.workspace_members wm
    join auth.users au on au.id = wm.user_id
    where wm.workspace_id = p_workspace_id
    order by wm.created_at asc;
end;
$$;

grant execute on function get_workspace_members_with_email(uuid) to authenticated;
