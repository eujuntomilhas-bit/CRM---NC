-- RPC pública para buscar convite por token sem autenticação (RLS bypassed)
-- Necessário para a página /invite/[token] funcionar antes do login

create or replace function get_invite_by_token(p_token text)
returns table (
  id             uuid,
  workspace_id   uuid,
  email          text,
  role           text,
  accepted_at    timestamptz,
  workspace_name text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    select
      i.id,
      i.workspace_id,
      i.email,
      i.role,
      i.accepted_at,
      w.name as workspace_name
    from public.invites i
    join public.workspaces w on w.id = i.workspace_id
    where i.token = p_token
    limit 1;
end;
$$;

grant execute on function get_invite_by_token(text) to anon, authenticated;
