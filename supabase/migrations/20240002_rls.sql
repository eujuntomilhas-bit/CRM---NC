-- ============================================================
-- M7 Migration 2: Row Level Security
-- ============================================================

-- Helper: retorna true se o usuário autenticado for membro do workspace
create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
  );
$$;

-- Helper: retorna true se o usuário autenticado for admin do workspace
create or replace function is_workspace_admin(ws_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- ── workspaces ──────────────────────────────────────────────
alter table workspaces enable row level security;

create policy "workspaces_select" on workspaces
  for select using (is_workspace_member(id));

create policy "workspaces_insert" on workspaces
  for insert with check (true); -- qualquer auth cria; o trigger/action insere o membro admin

create policy "workspaces_update" on workspaces
  for update using (is_workspace_admin(id));

create policy "workspaces_delete" on workspaces
  for delete using (is_workspace_admin(id));

-- ── workspace_members ────────────────────────────────────────
alter table workspace_members enable row level security;

create policy "members_select" on workspace_members
  for select using (is_workspace_member(workspace_id));

create policy "members_insert" on workspace_members
  for insert with check (is_workspace_admin(workspace_id) or user_id = auth.uid());

create policy "members_update" on workspace_members
  for update using (is_workspace_admin(workspace_id));

create policy "members_delete" on workspace_members
  for delete using (is_workspace_admin(workspace_id));

-- ── leads ────────────────────────────────────────────────────
alter table leads enable row level security;

create policy "leads_select" on leads
  for select using (is_workspace_member(workspace_id));

create policy "leads_insert" on leads
  for insert with check (is_workspace_member(workspace_id));

create policy "leads_update" on leads
  for update using (is_workspace_member(workspace_id));

create policy "leads_delete" on leads
  for delete using (is_workspace_member(workspace_id));

-- ── deals ────────────────────────────────────────────────────
alter table deals enable row level security;

create policy "deals_select" on deals
  for select using (is_workspace_member(workspace_id));

create policy "deals_insert" on deals
  for insert with check (is_workspace_member(workspace_id));

create policy "deals_update" on deals
  for update using (is_workspace_member(workspace_id));

create policy "deals_delete" on deals
  for delete using (is_workspace_member(workspace_id));

-- ── activities ───────────────────────────────────────────────
alter table activities enable row level security;

create policy "activities_select" on activities
  for select using (is_workspace_member(workspace_id));

create policy "activities_insert" on activities
  for insert with check (is_workspace_member(workspace_id));

create policy "activities_update" on activities
  for update using (is_workspace_member(workspace_id));

create policy "activities_delete" on activities
  for delete using (is_workspace_member(workspace_id));

-- ── invites ──────────────────────────────────────────────────
alter table invites enable row level security;

create policy "invites_select" on invites
  for select using (is_workspace_member(workspace_id));

create policy "invites_insert" on invites
  for insert with check (is_workspace_admin(workspace_id));

create policy "invites_update" on invites
  for update using (is_workspace_admin(workspace_id));

create policy "invites_delete" on invites
  for delete using (is_workspace_admin(workspace_id));
