-- ============================================================
-- M7 Migration 3: Indexes
-- ============================================================

-- workspace_members
create index if not exists idx_workspace_members_workspace on workspace_members(workspace_id);
create index if not exists idx_workspace_members_user     on workspace_members(user_id);

-- leads
create index if not exists idx_leads_workspace   on leads(workspace_id);
create index if not exists idx_leads_assignee    on leads(assignee_id);
create index if not exists idx_leads_status      on leads(workspace_id, status);
create index if not exists idx_leads_created_at  on leads(workspace_id, created_at desc);

-- deals
create index if not exists idx_deals_workspace   on deals(workspace_id);
create index if not exists idx_deals_lead        on deals(lead_id);
create index if not exists idx_deals_assignee    on deals(assignee_id);
create index if not exists idx_deals_stage       on deals(workspace_id, stage);
create index if not exists idx_deals_due_date    on deals(workspace_id, due_date);

-- activities
create index if not exists idx_activities_workspace on activities(workspace_id);
create index if not exists idx_activities_lead      on activities(lead_id);
create index if not exists idx_activities_author    on activities(author_id);
create index if not exists idx_activities_created   on activities(lead_id, created_at desc);

-- invites
create index if not exists idx_invites_workspace on invites(workspace_id);
create index if not exists idx_invites_token     on invites(token);
create index if not exists idx_invites_email     on invites(workspace_id, email);
