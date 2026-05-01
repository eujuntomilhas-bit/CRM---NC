-- M9: índice para filtrar convites pendentes (accepted_at IS NULL) por workspace
create index if not exists invites_workspace_pending_idx
  on invites(workspace_id)
  where accepted_at is null;

-- índice para lookup por token (aceite de convite)
create index if not exists invites_token_idx
  on invites(token);
