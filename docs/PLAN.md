# CRM-NC — Plano de Execução

> **Para agentes:** Use `superpowers:executing-plans` ou `superpowers:subagent-driven-development` para executar milestone a milestone.

**Goal:** Construir o CRM-NC do zero até produção — interface primeiro com dados mockados, backend depois com dados reais.

**Architecture:** Next.js 14 App Router + Supabase + Stripe + Resend. UI completamente funcional com mocks antes de tocar no banco.

**Tech Stack:** Next.js 14, TypeScript strict, Tailwind CSS, shadcn/ui, Supabase, @dnd-kit, Recharts, Stripe, Resend, Vercel.

---

## Fase 1 — Interface (7 milestones, dados mockados)

| # | Branch | O que entrega |
|---|--------|---------------|
| M0 | `main` | Setup Next.js, shadcn, deps, estrutura de pastas |
| M1 | `feat/app-shell` | Sidebar, workspace switcher, user menu, rotas protegidas |
| M2 | `feat/auth-ui` | Login, registro, onboarding com wizard de workspace |
| M3 | `feat/leads-ui` | Tabela de leads, filtros, detalhe, formulários, timeline |
| M4 | `feat/pipeline-ui` | Kanban com @dnd-kit drag-and-drop real |
| M5 | `feat/dashboard-ui` | Metric cards + funil Recharts + negócios próximos |
| M6 | `feat/landing` | Landing page pública: hero, features, pricing, footer |

## Fase 2 — Backend (5 milestones, dados reais)

| # | Branch | O que entrega |
|---|--------|---------------|
| M7 | `feat/supabase-core` | Migrations, RLS, auth real, middleware de rotas |
| M8 | `feat/leads-data` | CRUD real leads, negócios, atividades, dashboard ao vivo |
| M9 | `feat/collaboration` | Convites Resend, membros, roles, workspace switcher real |
| M10 | `feat/billing` | Stripe checkout, webhook, customer portal, limites Free/Pro |
| M11 | `feat/deploy` | Vercel + Supabase prod, env vars, domínio, smoke test |

Cada milestone tem branch própria, objetivo, lista de entregas com checkbox e commit final.

---

## M0 — Setup do Projeto

**Branch:** `main`
**Objetivo:** Repositório configurado com Next.js 14, TypeScript strict, Tailwind, shadcn/ui e Supabase client instalados. Estrutura de pastas conforme CLAUDE.md.

### Entregas

- [ ] Criar projeto Next.js 14 com App Router e TypeScript strict:
  ```bash
  npx create-next-app@latest crm-nc --typescript --tailwind --app --src-dir=false --import-alias="@/*"
  ```
- [ ] Confirmar `tsconfig.json` com `"strict": true`
- [ ] Instalar dependências:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  npm install recharts
  npm install resend
  npm install stripe @stripe/stripe-js
  ```
- [ ] Instalar e inicializar shadcn/ui:
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button input card dialog dropdown-menu badge avatar separator label textarea select sonner
  ```
- [ ] Criar estrutura de pastas:
  ```
  app/(auth)/             ← login, signup, onboarding
  app/(app)/              ← dashboard, leads, pipeline, settings
  app/api/stripe/webhook/
  app/api/invite/
  components/ui/          ← shadcn (não editar)
  components/leads/
  components/pipeline/
  components/dashboard/
  components/landing/
  components/shared/
  lib/supabase/           ← client.ts, server.ts
  lib/stripe/             ← client.ts, plans.ts
  lib/resend/             ← client.ts, templates/
  lib/mocks/              ← removido após M8
  types/
  supabase/migrations/
  supabase/functions/
  ```
- [ ] Criar `lib/supabase/client.ts` (browser client)
- [ ] Criar `lib/supabase/server.ts` (server client com cookies SSR)
- [ ] Criar `types/index.ts` com tipos globais:
  ```ts
  export type LeadStatus = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
  export type DealStage = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
  export type ActivityType = 'call' | 'email' | 'meeting' | 'note'
  export type WorkspacePlan = 'free' | 'pro'
  export type MemberRole = 'admin' | 'member'

  export type Workspace = { id: string; name: string; slug: string; plan: WorkspacePlan }
  export type Lead = {
    id: string; workspace_id: string; name: string; email: string
    phone: string; company: string; role: string; status: LeadStatus
    assignee_id: string; created_at: string
  }
  export type Deal = {
    id: string; workspace_id: string; lead_id: string; title: string
    value: number; stage: DealStage; assignee_id: string; due_date: string
  }
  export type Activity = {
    id: string; lead_id: string; type: ActivityType
    description: string; author_id: string; created_at: string
  }
  ```
- [ ] Criar `.env.local.example`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
  RESEND_API_KEY=
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
- [ ] Verificar `npm run dev` sem erros

### Commit Final
```bash
git add .
git commit -m "chore(M0): project setup — Next.js 14, shadcn/ui, Supabase client, types, folder structure"
```

---

## M1 — App Shell

**Branch:** `feat/app-shell`
**Objetivo:** Layout autenticado com sidebar, workspace switcher e user menu. Navegação funcional cliente-side, rotas criadas com conteúdo placeholder.

### Entregas

- [ ] Criar `app/(app)/layout.tsx` — layout com sidebar fixa + área de conteúdo scrollável
- [ ] Criar `components/shared/Sidebar.tsx` — links: Dashboard, Leads, Pipeline, Configurações; ativo destacado com `usePathname()`
- [ ] Criar `components/shared/WorkspaceSwitcher.tsx` — dropdown com workspaces mockados + "Criar workspace"
- [ ] Criar `components/shared/UserMenu.tsx` — avatar + nome + dropdown: Perfil, Plano, Sair
- [ ] Criar páginas placeholder:
  - `app/(app)/dashboard/page.tsx`
  - `app/(app)/leads/page.tsx`
  - `app/(app)/pipeline/page.tsx`
  - `app/(app)/settings/page.tsx`
- [ ] Sidebar responsiva: gaveta em mobile com botão hambúrguer (`Sheet` do shadcn)
- [ ] Cor ativa na sidebar: `bg-indigo-50 text-indigo-700`

### Commit Final
```bash
git add .
git commit -m "feat(M1): app shell — sidebar, workspace switcher, user menu, protected routes"
```

---

## M2 — Auth UI

**Branch:** `feat/auth-ui`
**Objetivo:** Telas de login, signup e onboarding com visual completo. Formulários com validação client-side — sem integração real ainda.

### Entregas

- [ ] Criar `app/(auth)/layout.tsx` — layout centrado com logo e card branco
- [ ] Criar `components/shared/AuthCard.tsx` — card com logo, título e slot de children
- [ ] Criar `app/(auth)/login/page.tsx` — form: e-mail + senha + link signup + "Esqueci senha"
- [ ] Criar `app/(auth)/signup/page.tsx` — form: nome + e-mail + senha + confirmação + link login
- [ ] Criar `app/(auth)/onboarding/page.tsx` — wizard 2 passos:
  - Passo 1: "Criar workspace" — nome da empresa
  - Passo 2: "Convidar equipe" — input e-mail + botão "Pular por agora"
- [ ] Validação client-side: campos obrigatórios, e-mail válido, senha mínimo 8 chars, senhas iguais
- [ ] Estado de loading no botão de submit (spinner + disabled)
- [ ] Página `app/(auth)/forgot-password/page.tsx` — form de e-mail

### Commit Final
```bash
git add .
git commit -m "feat(M2): auth UI — login, signup, onboarding wizard, forgot password"
```

---

## M3 — Leads UI

**Branch:** `feat/leads-ui`
**Objetivo:** Gestão de leads completa com UI mockada. CRUD visual com estado React local.

### Entregas

- [ ] Criar `lib/mocks/leads.ts` — 10 leads + 5 atividades mockados com variação de status/tipo
- [ ] Criar `components/leads/LeadCard.tsx` — card: nome, empresa, status badge colorido, responsável
- [ ] Criar `components/leads/LeadFilters.tsx` — search input + select status + select responsável
- [ ] Criar `components/leads/LeadForm.tsx` — dialog/sheet com form completo (todos campos do tipo Lead)
- [ ] Criar `components/leads/ActivityTimeline.tsx` — lista cronológica com ícone por tipo (📞 ligação, 📧 e-mail, 📅 reunião, 📝 nota)
- [ ] Criar `components/leads/ActivityForm.tsx` — form inline: select tipo + textarea descrição + botão salvar
- [ ] Atualizar `app/(app)/leads/page.tsx` — tabela/grid + botão "Novo Lead" + filtros + CRUD mockado
- [ ] Criar `app/(app)/leads/[id]/page.tsx` — perfil completo do lead + `ActivityTimeline` + `ActivityForm`
- [ ] Badge de status: `ganho`=verde, `perdido`=vermelho, outros=azul/cinza

### Commit Final
```bash
git add .
git commit -m "feat(M3): leads UI — list, filters, detail, form, activity timeline (mocked)"
```

---

## M4 — Pipeline UI

**Branch:** `feat/pipeline-ui`
**Objetivo:** Board Kanban com 6 colunas, cards de negócios e drag-and-drop funcional com @dnd-kit — dados mockados.

### Entregas

- [ ] Criar `lib/mocks/deals.ts` — 12 deals distribuídos entre as 6 colunas
- [ ] Criar `components/pipeline/DealCard.tsx` — card: título, valor em R$, nome do lead, responsável, prazo; drag handle
- [ ] Criar `components/pipeline/KanbanColumn.tsx` — header com nome + soma em R$ + `useDroppable`; lista de `DealCard` com `SortableContext`
- [ ] Criar `components/pipeline/KanbanBoard.tsx`:
  ```tsx
  // DndContext + DragOverlay + 6 KanbanColumns
  // onDragEnd: atualiza stage do deal no state local
  // sensors: PointerSensor com activationConstraint distance: 8
  ```
- [ ] Atualizar `app/(app)/pipeline/page.tsx` — renderiza `KanbanBoard` com state de deals
- [ ] Dialog "Novo Negócio": título, valor, lead (select), responsável, prazo
- [ ] Cores de coluna: Novo=slate, Contato=blue, Proposta=yellow, Negociação=orange, Ganho=green, Perdido=red

### Commit Final
```bash
git add .
git commit -m "feat(M4): pipeline UI — kanban board, @dnd-kit drag-and-drop, deal cards (mocked)"
```

---

## M5 — Dashboard UI

**Branch:** `feat/dashboard-ui`
**Objetivo:** Dashboard com 4 metric cards, gráfico de funil Recharts e lista de negócios com prazo próximo — dados mockados.

### Entregas

- [ ] Criar `lib/mocks/metrics.ts`:
  ```ts
  export const mockMetrics = {
    total_leads: 47, open_deals: 12,
    pipeline_value: 84500, conversion_rate: 18
  }
  export const mockFunnel = [
    { stage: 'Novo Lead', count: 20, value: 30000 },
    { stage: 'Contato', count: 12, value: 22000 },
    { stage: 'Proposta', count: 8, value: 18000 },
    { stage: 'Negociação', count: 5, value: 12000 },
    { stage: 'Ganho', count: 2, value: 2500 },
  ]
  ```
- [ ] Criar `components/dashboard/MetricCard.tsx` — ícone + label + valor grande + variação (verde/vermelho)
- [ ] Criar `components/dashboard/FunnelChart.tsx` — `BarChart` Recharts horizontal com tooltip de valor em R$
- [ ] Criar `components/dashboard/UpcomingDeals.tsx` — tabela compacta: título + valor + prazo + badge estágio
- [ ] Atualizar `app/(app)/dashboard/page.tsx`:
  - Linha 1: grid 4 colunas — `MetricCard` ×4 (total leads, negócios abertos, valor pipeline, conversão)
  - Linha 2: `FunnelChart` (col-span-2) + `UpcomingDeals` (col-span-1)

### Commit Final
```bash
git add .
git commit -m "feat(M5): dashboard UI — metric cards, funnel chart, upcoming deals (mocked)"
```

---

## M6 — Landing Page

**Branch:** `feat/landing`
**Objetivo:** Página pública `/` com hero, funcionalidades, planos e CTA. Estática, sem backend.

### Entregas

- [ ] Criar `components/landing/Navbar.tsx` — logo + links "Entrar" e "Começar grátis"
- [ ] Criar `components/landing/Hero.tsx` — headline forte, subheadline, CTA primário (signup) + secundário (ver demo)
- [ ] Criar `components/landing/Features.tsx` — grid 3×2 com ícones: Pipeline Kanban, Gestão de Leads, Dashboard, Multi-empresa, Histórico, Plano Gratuito
- [ ] Criar `components/landing/Pricing.tsx` — 2 cards: Free (R$0) e Pro (R$49/mês) com lista de benefícios e CTA
- [ ] Criar `components/landing/Footer.tsx` — copyright + links básicos
- [ ] Atualizar `app/page.tsx` — montar seções em ordem: Navbar → Hero → Features → Pricing → Footer
- [ ] Responsivo mobile-first: tudo funciona em 375px

### Commit Final
```bash
git add .
git commit -m "feat(M6): landing page — hero, features, pricing, footer (public, static)"
```

---

## M7 — Supabase Core

**Branch:** `feat/supabase-core`
**Objetivo:** Schema completo no Supabase, RLS em todas as tabelas, auth real conectado, middleware protegendo rotas.

### Entregas

- [ ] Criar `supabase/migrations/20240001_schema.sql`:
  ```sql
  create table workspaces (
    id uuid primary key default gen_random_uuid(),
    name text not null, slug text unique not null,
    plan text not null default 'free',
    stripe_customer_id text, stripe_subscription_id text,
    created_at timestamptz default now()
  );
  create table workspace_members (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null default 'member',
    created_at timestamptz default now(),
    unique(workspace_id, user_id)
  );
  create table leads (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    name text not null, email text, phone text,
    company text, role text, status text not null default 'novo',
    assignee_id uuid references auth.users(id),
    created_at timestamptz default now(), updated_at timestamptz default now()
  );
  create table deals (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    lead_id uuid references leads(id) on delete set null,
    title text not null, value numeric default 0,
    stage text not null default 'novo',
    assignee_id uuid references auth.users(id),
    due_date date, created_at timestamptz default now()
  );
  create table activities (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    lead_id uuid references leads(id) on delete cascade,
    type text not null, description text not null,
    author_id uuid references auth.users(id),
    created_at timestamptz default now()
  );
  create table invites (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid references workspaces(id) on delete cascade,
    email text not null, token text unique not null default gen_random_uuid()::text,
    role text not null default 'member', accepted_at timestamptz,
    created_at timestamptz default now()
  );
  ```
- [ ] Criar `supabase/migrations/20240002_rls.sql` — habilitar RLS + policy "só membros do workspace" para cada tabela:
  ```sql
  alter table leads enable row level security;
  create policy "workspace_members_only" on leads
    using (workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    ));
  -- repetir para deals, activities, invites
  ```
- [ ] Criar `supabase/migrations/20240003_indexes.sql` — índices em `workspace_id`, `lead_id`, `assignee_id`
- [ ] Criar `supabase/seed.sql` — workspace teste + admin + 5 leads + 4 deals + 3 activities
- [ ] Criar `middleware.ts` na raiz — proteger `/(app)/*`, redirecionar `/login` se sem sessão
- [ ] Conectar `app/(auth)/login/page.tsx` a `supabase.auth.signInWithPassword()` → redirect `/dashboard`
- [ ] Conectar `app/(auth)/signup/page.tsx` a `supabase.auth.signUp()`
- [ ] Criar Server Action `createWorkspace` em `app/(auth)/onboarding/actions.ts` — insere workspace + membro admin
- [ ] Conectar botão "Sair" do `UserMenu` a `supabase.auth.signOut()`

### Commit Final
```bash
git add .
git commit -m "feat(M7): supabase core — schema, RLS policies, auth real, middleware"
```

---

## M8 — Leads Data

**Branch:** `feat/leads-data`
**Objetivo:** Remover todos os mocks. Leads, deals, atividades e dashboard usando dados reais do Supabase.

### Entregas

- [ ] Criar `app/(app)/leads/actions.ts`:
  - `getLeads(workspaceId, filters?)` — select com filtros opcionais
  - `createLead(data)` — insert
  - `updateLead(id, data)` — update
  - `deleteLead(id)` — delete
- [ ] Criar `app/(app)/leads/[id]/actions.ts`:
  - `getLead(id)` — select com join de activities
  - `createActivity(data)` — insert
- [ ] Criar `app/(app)/pipeline/actions.ts`:
  - `getDeals(workspaceId)` — select com lead join
  - `createDeal(data)`, `updateDealStage(id, stage)`, `deleteDeal(id)`
- [ ] Criar `app/(app)/dashboard/actions.ts`:
  - `getMetrics(workspaceId)` — Promise.all com 4 queries paralelas
  - `getDealsByStage(workspaceId)` — group by stage
  - `getUpcomingDeals(workspaceId)` — due_date nos próximos 7 dias
- [ ] Atualizar todas as pages para Server Components com dados reais
- [ ] `KanbanBoard.tsx` — `updateDealStage` via `startTransition` (optimistic update)
- [ ] Deletar `lib/mocks/` inteiro

### Commit Final
```bash
git add .
git commit -m "feat(M8): leads data — all mocks replaced with real Supabase queries"
```

---

## M9 — Collaboration

**Branch:** `feat/collaboration`
**Objetivo:** Criar/alternar workspaces, convidar colaboradores por e-mail (Resend), roles Admin/Membro funcionando.

### Entregas

- [ ] Criar `lib/resend/client.ts` — instância Resend
- [ ] Criar `lib/resend/templates/invite.tsx` — e-mail HTML com link de aceite
- [ ] Criar `app/api/invite/route.ts` — POST: insere em `invites` + envia e-mail Resend
- [ ] Criar `app/(auth)/invite/[token]/page.tsx` — valida token, aceita convite, insere em `workspace_members`
- [ ] Atualizar `app/(app)/settings/page.tsx`:
  - Seção "Workspace": editar nome
  - Seção "Membros": listar + form de convite por e-mail
  - Seção "Plano": info do plano atual
- [ ] Conectar `WorkspaceSwitcher.tsx` a query real de `workspace_members`
- [ ] Persistir workspace ativo em cookie `active_workspace_id`

### Commit Final
```bash
git add .
git commit -m "feat(M9): collaboration — workspace CRUD, email invites with Resend, roles"
```

---

## M10 — Billing

**Branch:** `feat/billing`
**Objetivo:** Checkout Stripe para upgrade Free→Pro, webhook que atualiza plano no banco, Customer Portal, enforcement de limites.

### Entregas

- [ ] Criar `lib/stripe/client.ts` — instância Stripe
- [ ] Criar `lib/stripe/plans.ts`:
  ```ts
  export const PLANS = {
    free: { name: 'Free', limits: { members: 2, leads: 50 } },
    pro:  { name: 'Pro',  priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!, limits: { members: Infinity, leads: Infinity } }
  } as const
  ```
- [ ] Criar `app/api/stripe/checkout/route.ts` — cria `checkout.session` com `metadata: { workspace_id }`
- [ ] Criar `app/api/stripe/portal/route.ts` — cria Customer Portal session
- [ ] Criar `app/api/stripe/webhook/route.ts`:
  - Verificar assinatura com `stripe.webhooks.constructEvent`
  - `checkout.session.completed` → update workspace `plan='pro'` + salvar IDs Stripe
  - `customer.subscription.deleted` → update workspace `plan='free'`
- [ ] Atualizar settings — botão "Fazer Upgrade" (Free) e "Gerenciar Assinatura" (Pro)
- [ ] Criar `lib/plans.ts` — helper `checkLimit(workspaceId, resource)`:
  ```ts
  // retorna { allowed: boolean, current: number, limit: number }
  ```
- [ ] Chamar `checkLimit` em `createLead` e convidar membro — retornar erro se excedido
- [ ] Criar `components/shared/UpgradeBanner.tsx` — banner com CTA de upgrade
- [ ] Exibir `UpgradeBanner` em leads (≥50) e members (≥2) no plano Free

### Commit Final
```bash
git add .
git commit -m "feat(M10): billing — Stripe checkout, webhook, customer portal, plan limits enforced"
```

---

## M11 — Deploy

**Branch:** `feat/deploy`
**Objetivo:** Aplicação em produção no Vercel + Supabase cloud. CI/CD via GitHub. Smoke test de todos os fluxos.

### Entregas

- [ ] Criar projeto no Supabase Cloud:
  - `supabase db push --project-ref <ref>` — rodar migrations
  - Habilitar Auth → Email/Password no Dashboard
  - Configurar redirect URL: `https://<dominio>.vercel.app/**`
- [ ] Criar produto no Stripe Dashboard: "CRM-NC Pro", R$49/mês (BRL), copiar `price_id`
- [ ] Registrar webhook Stripe: `https://<dominio>.vercel.app/api/stripe/webhook`; eventos: `checkout.session.completed`, `customer.subscription.deleted`
- [ ] Conectar repositório GitHub ao Vercel
- [ ] Configurar todas as env vars no Vercel (do `.env.local.example`)
- [ ] Merge em `main` → verificar deploy automático no Vercel
- [ ] Smoke test produção:
  - [ ] Signup → onboarding → workspace criado
  - [ ] Criar lead → mover no pipeline → registrar atividade
  - [ ] Dashboard com métricas reais
  - [ ] Upgrade Free→Pro via Stripe Checkout
  - [ ] Webhook ativa plano Pro no banco
  - [ ] Customer Portal cancela → volta para Free
  - [ ] Convite por e-mail aceito → membro adicionado

### Commit Final
```bash
git add .
git commit -m "deploy(M11): production — Vercel + Supabase cloud, Stripe configured, smoke test passed"
```
