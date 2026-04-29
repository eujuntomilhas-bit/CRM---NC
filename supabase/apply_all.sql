-- ============================================================
-- CRM-NC — Migrations completas (M7)
-- Cole este arquivo inteiro no SQL Editor do Supabase Studio
-- e clique em Run. Execute seed.sql separadamente depois.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- MIGRATION 1: Schema
-- ════════════════════════════════════════════════════════════

create table if not exists workspaces (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  slug                   text unique not null,
  plan                   text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now()
);

create table if not exists workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('admin', 'member')),
  created_at   timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists leads (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references workspaces(id) on delete cascade,
  name            text not null,
  email           text,
  phone           text,
  company         text,
  role            text,
  status          text not null default 'novo'
                    check (status in ('novo','contato','proposta','negociacao','ganho','perdido')),
  assignee_id     uuid references auth.users(id) on delete set null,
  estimated_value numeric(12,2) default 0,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists deals (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id      uuid references leads(id) on delete set null,
  title        text not null,
  value        numeric(12,2) not null default 0,
  stage        text not null default 'novo'
                 check (stage in ('novo','contato','proposta','negociacao','ganho','perdido')),
  assignee_id  uuid references auth.users(id) on delete set null,
  due_date     date,
  created_at   timestamptz not null default now()
);

create table if not exists activities (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id      uuid not null references leads(id) on delete cascade,
  type         text not null check (type in ('call','email','meeting','note')),
  description  text not null,
  author_id    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email        text not null,
  token        text unique not null default gen_random_uuid()::text,
  role         text not null default 'member' check (role in ('admin', 'member')),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();


-- ════════════════════════════════════════════════════════════
-- MIGRATION 2: Indexes
-- ════════════════════════════════════════════════════════════

create index if not exists idx_workspace_members_workspace on workspace_members(workspace_id);
create index if not exists idx_workspace_members_user     on workspace_members(user_id);

create index if not exists idx_leads_workspace   on leads(workspace_id);
create index if not exists idx_leads_assignee    on leads(assignee_id);
create index if not exists idx_leads_status      on leads(workspace_id, status);
create index if not exists idx_leads_created_at  on leads(workspace_id, created_at desc);

create index if not exists idx_deals_workspace   on deals(workspace_id);
create index if not exists idx_deals_lead        on deals(lead_id);
create index if not exists idx_deals_assignee    on deals(assignee_id);
create index if not exists idx_deals_stage       on deals(workspace_id, stage);
create index if not exists idx_deals_due_date    on deals(workspace_id, due_date);

create index if not exists idx_activities_workspace on activities(workspace_id);
create index if not exists idx_activities_lead      on activities(lead_id);
create index if not exists idx_activities_author    on activities(author_id);
create index if not exists idx_activities_created   on activities(lead_id, created_at desc);

create index if not exists idx_invites_workspace on invites(workspace_id);
create index if not exists idx_invites_token     on invites(token);
create index if not exists idx_invites_email     on invites(workspace_id, email);


-- ════════════════════════════════════════════════════════════
-- MIGRATION 3: Row Level Security
-- ════════════════════════════════════════════════════════════

create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
  );
$$;

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

-- workspaces
alter table workspaces enable row level security;

drop policy if exists "workspaces_select" on workspaces;
drop policy if exists "workspaces_insert" on workspaces;
drop policy if exists "workspaces_update" on workspaces;
drop policy if exists "workspaces_delete" on workspaces;

create policy "workspaces_select" on workspaces for select using (is_workspace_member(id));
create policy "workspaces_insert" on workspaces for insert with check (true);
create policy "workspaces_update" on workspaces for update using (is_workspace_admin(id));
create policy "workspaces_delete" on workspaces for delete using (is_workspace_admin(id));

-- workspace_members
alter table workspace_members enable row level security;

drop policy if exists "members_select" on workspace_members;
drop policy if exists "members_insert" on workspace_members;
drop policy if exists "members_update" on workspace_members;
drop policy if exists "members_delete" on workspace_members;

create policy "members_select" on workspace_members for select using (is_workspace_member(workspace_id));
create policy "members_insert" on workspace_members for insert with check (is_workspace_admin(workspace_id) or user_id = auth.uid());
create policy "members_update" on workspace_members for update using (is_workspace_admin(workspace_id));
create policy "members_delete" on workspace_members for delete using (is_workspace_admin(workspace_id));

-- leads
alter table leads enable row level security;

drop policy if exists "leads_select" on leads;
drop policy if exists "leads_insert" on leads;
drop policy if exists "leads_update" on leads;
drop policy if exists "leads_delete" on leads;

create policy "leads_select" on leads for select using (is_workspace_member(workspace_id));
create policy "leads_insert" on leads for insert with check (is_workspace_member(workspace_id));
create policy "leads_update" on leads for update using (is_workspace_member(workspace_id));
create policy "leads_delete" on leads for delete using (is_workspace_member(workspace_id));

-- deals
alter table deals enable row level security;

drop policy if exists "deals_select" on deals;
drop policy if exists "deals_insert" on deals;
drop policy if exists "deals_update" on deals;
drop policy if exists "deals_delete" on deals;

create policy "deals_select" on deals for select using (is_workspace_member(workspace_id));
create policy "deals_insert" on deals for insert with check (is_workspace_member(workspace_id));
create policy "deals_update" on deals for update using (is_workspace_member(workspace_id));
create policy "deals_delete" on deals for delete using (is_workspace_member(workspace_id));

-- activities
alter table activities enable row level security;

drop policy if exists "activities_select" on activities;
drop policy if exists "activities_insert" on activities;
drop policy if exists "activities_update" on activities;
drop policy if exists "activities_delete" on activities;

create policy "activities_select" on activities for select using (is_workspace_member(workspace_id));
create policy "activities_insert" on activities for insert with check (is_workspace_member(workspace_id));
create policy "activities_update" on activities for update using (is_workspace_member(workspace_id));
create policy "activities_delete" on activities for delete using (is_workspace_member(workspace_id));

-- invites
alter table invites enable row level security;

drop policy if exists "invites_select" on invites;
drop policy if exists "invites_insert" on invites;
drop policy if exists "invites_update" on invites;
drop policy if exists "invites_delete" on invites;

create policy "invites_select" on invites for select using (is_workspace_member(workspace_id));
create policy "invites_insert" on invites for insert with check (is_workspace_admin(workspace_id));
create policy "invites_update" on invites for update using (is_workspace_admin(workspace_id));
create policy "invites_delete" on invites for delete using (is_workspace_admin(workspace_id));


-- ════════════════════════════════════════════════════════════
-- MIGRATION 4: RLS Performance Fix + RPC Atômica
-- ════════════════════════════════════════════════════════════
-- Usa (select auth.uid()) para cachear a chamada por query,
-- não por linha. Cria RPC atômica para onboarding.

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

grant execute on function create_workspace_with_admin(text, text) to authenticated;
