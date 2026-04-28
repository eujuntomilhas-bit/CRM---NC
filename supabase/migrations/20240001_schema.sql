-- ============================================================
-- M7 Migration 1: Schema
-- ============================================================

-- Workspaces
create table if not exists workspaces (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  slug                   text unique not null,
  plan                   text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now()
);

-- Workspace members
create table if not exists workspace_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('admin', 'member')),
  created_at   timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- Leads
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

-- Deals
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

-- Activities
create table if not exists activities (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id      uuid not null references leads(id) on delete cascade,
  type         text not null check (type in ('call','email','meeting','note')),
  description  text not null,
  author_id    uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Invites
create table if not exists invites (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  email        text not null,
  token        text unique not null default gen_random_uuid()::text,
  role         text not null default 'member' check (role in ('admin', 'member')),
  accepted_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- Auto-update updated_at on leads
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
