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

- [x] Criar projeto Next.js 14 com App Router e TypeScript strict:
  ```bash
  npx create-next-app@latest crm-nc --typescript --tailwind --app --src-dir=false --import-alias="@/*"
  ```
- [x] Confirmar `tsconfig.json` com `"strict": true`
- [x] Instalar dependências:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  npm install recharts
  npm install resend
  npm install stripe @stripe/stripe-js
  ```
- [x] Instalar e inicializar shadcn/ui:
  ```bash
  npx shadcn@latest init
  npx shadcn@latest add button input card dialog dropdown-menu badge avatar separator label textarea select sonner
  ```
- [x] Criar estrutura de pastas:
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
- [x] Criar `lib/supabase/client.ts` (browser client com padrão singleton)
- [x] Criar `lib/supabase/server.ts` (server client com cookies SSR, `await cookies()`)
- [x] Criar `types/index.ts` com tipos globais:
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
    id: string; workspace_id: string; lead_id: string; type: ActivityType
    description: string; author_id: string; created_at: string
  }
  ```
- [x] Criar `.env.local.example`:
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
- [x] Verificar `npm run dev` sem erros

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

- [x] Criar `app/(app)/layout.tsx` — layout com sidebar fixa + área de conteúdo scrollável
- [x] Criar `components/shared/Sidebar.tsx` — links: Dashboard, Leads, Pipeline, Configurações; ativo destacado com `usePathname()`
- [x] Criar `components/shared/WorkspaceSwitcher.tsx` — dropdown com workspaces mockados + "Criar workspace"
- [x] Criar `components/shared/UserMenu.tsx` — avatar + nome + dropdown: Perfil, Plano, Sair
- [x] Criar páginas placeholder:
  - `app/(app)/dashboard/page.tsx`
  - `app/(app)/leads/page.tsx`
  - `app/(app)/pipeline/page.tsx`
  - `app/(app)/settings/page.tsx`
- [x] Sidebar responsiva: gaveta em mobile com botão hambúrguer (`Sheet` do shadcn)
- [x] Cor ativa na sidebar: `bg-indigo-50 text-indigo-700`

### Extras entregues na Aula 2.1 — Design System
- [x] Dark mode como padrão (`dark` no `<html>`, tema indigo/slate em `globals.css`)
- [x] `postcss.config.mjs` criado — Tailwind v4 gerando utilities corretamente
- [x] `components/shared/TopBar.tsx` — barra superior com título da página e notificações
- [x] `components/shared/AuthCard.tsx` — card base reutilizável para telas de auth
- [x] Sidebar usa tokens CSS semânticos (`sidebar-*`) sem hardcode de cores
- [x] WorkspaceSwitcher com badge Pro e 3 workspaces fake
- [x] UserMenu com role, e-mail e dropdown lateral
- [x] MobileSidebar: Sheet com `bg-sidebar`, botão X, fecha ao clicar em link
- [x] `app/page.tsx` redireciona `/` → `/dashboard`
- [x] Corrigido bug `MenuGroupRootContext`: `DropdownMenuLabel` agora sempre dentro de `DropdownMenuGroup`

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

- [x] Criar `app/(auth)/layout.tsx` — layout centrado com logo e card branco
- [x] Criar `components/shared/AuthCard.tsx` — card com logo, título e slot de children
- [x] Criar `app/(auth)/login/page.tsx` — form: e-mail + senha + link signup + "Esqueci senha"
- [x] Criar `app/(auth)/signup/page.tsx` — form: nome + e-mail + senha + confirmação + link login
- [x] Criar `app/(auth)/onboarding/page.tsx` — wizard 2 passos:
  - Passo 1: "Criar workspace" — nome da empresa
  - Passo 2: "Convidar equipe" — input e-mail + botão "Pular por agora"
- [x] Validação client-side: campos obrigatórios, e-mail válido, senha mínimo 8 chars, senhas iguais
- [x] Estado de loading no botão de submit (spinner + disabled)
- [x] Página `app/(auth)/forgot-password/page.tsx` — form de e-mail

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

- [x] Criar `lib/mocks/leads.ts` — 10 leads + 5 atividades mockados com variação de status/tipo
- [x] Criar `components/leads/LeadCard.tsx` — card: nome, empresa, status badge colorido, responsável
- [x] Criar `components/leads/LeadFilters.tsx` — search input + select status + select responsável
- [x] Criar `components/leads/LeadForm.tsx` — dialog/sheet com form completo (todos campos do tipo Lead) + campo `estimated_value` (valor estimado em R$) + campo `notes`
- [x] Criar `components/leads/ActivityTimeline.tsx` — lista cronológica com ícone por tipo (📞 ligação, 📧 e-mail, 📅 reunião, 📝 nota)
- [x] Criar `components/leads/ActivityForm.tsx` — form inline: select tipo + textarea descrição + botão salvar
- [x] Atualizar `app/(app)/leads/page.tsx` — tabela/grid + botão "Novo Lead" + filtros + CRUD mockado
- [x] Criar `app/(app)/leads/[id]/page.tsx` — perfil completo do lead + `ActivityTimeline` + `ActivityForm`
- [x] Badge de status: `ganho`=verde, `perdido`=vermelho, outros=azul/cinza

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

- [x] Criar `lib/mocks/deals.ts` — 12 deals distribuídos entre as 6 colunas
- [x] Criar `components/pipeline/DealCard.tsx` — card: título, valor em R$, nome do lead, responsável, prazo; drag handle
- [x] Criar `components/pipeline/KanbanColumn.tsx` — header com nome + soma em R$ + `useDroppable`; lista de `DealCard` com `SortableContext`
- [x] Criar `components/pipeline/KanbanBoard.tsx`:
  ```tsx
  // DndContext + DragOverlay + 6 KanbanColumns
  // onDragEnd: atualiza stage do deal no state local
  // sensors: PointerSensor com activationConstraint distance: 8
  ```
- [x] Atualizar `app/(app)/pipeline/page.tsx` — renderiza `KanbanBoard` com state de deals
- [x] Dialog "Novo Negócio": título, valor, lead (select), responsável, prazo
- [x] Cores de coluna: Novo=slate, Contato=blue, Proposta=yellow, Negociação=orange, Ganho=green, Perdido=red

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

- [x] Criar `lib/mocks/metrics.ts`:
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
- [x] Criar `components/dashboard/MetricCard.tsx` — ícone + label + valor grande + variação (verde/vermelho)
- [x] Criar `components/dashboard/FunnelChart.tsx` — `BarChart` Recharts vertical com tooltip de valor em R$
- [x] Criar `components/dashboard/UpcomingDeals.tsx` — tabela compacta: título + valor + prazo + badge estágio
- [x] Atualizar `app/(app)/dashboard/page.tsx`:
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

- [x] Criar `components/landing/Navbar.tsx` — logo + links "Entrar" e "Começar grátis"
- [x] Criar `components/landing/Hero.tsx` — headline forte, subheadline, CTA primário (signup) + secundário (ver demo)
- [x] Criar `components/landing/Features.tsx` — grid 3×2 com ícones: Pipeline Kanban, Gestão de Leads, Dashboard, Multi-empresa, Histórico, Plano Gratuito
- [x] Criar `components/landing/Pricing.tsx` — 2 cards: Free (R$0) e Pro (R$49/mês) com lista de benefícios e CTA
- [x] Criar `components/landing/Footer.tsx` — copyright + links básicos
- [x] Atualizar `app/page.tsx` — montar seções em ordem: Navbar → Hero → Features → Pricing → Footer
- [x] Responsivo mobile-first: tudo funciona em 375px

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

- [x] Criar `supabase/migrations/20240001_schema.sql` — 6 tabelas com constraints, checks e trigger `updated_at`
- [x] Criar `supabase/migrations/20240002_rls.sql` — RLS em todas as tabelas com funções helper `is_workspace_member` / `is_workspace_admin`; policies SELECT/INSERT/UPDATE/DELETE separadas por tabela
- [x] Criar `supabase/migrations/20240003_indexes.sql` — 14 índices em `workspace_id`, `lead_id`, `assignee_id`, `status`, `stage`, `due_date`, `token`
- [x] Criar `supabase/seed.sql` — workspace teste + admin + 5 leads + 4 deals + 3 activities
- [x] Criar `supabase/apply_all.sql` — script consolidado para aplicar no SQL Editor do Supabase Studio
- [x] Criar `types/supabase.ts` — tipos TypeScript completos (Row/Insert/Update) para todas as tabelas
- [x] Atualizar `lib/supabase/client.ts` e `server.ts` com generic `Database` para type-safety
- [x] Aplicar migrations no Supabase Studio — `apply_all.sql` executado com sucesso (schema + RLS + indexes)
- [x] Seed aplicado — 1 workspace, 5 leads, 4 deals, 3 activities inseridos
- [x] RLS verificado — acesso anon retorna 0 rows em todas as tabelas
- [x] Build verificado — TypeScript sem erros, 14 páginas geradas
- [x] Criar `proxy.ts` na raiz — proteger `/(app)/*`, redirecionar `/login` se sem sessão
- [x] Conectar `app/(auth)/login/page.tsx` a `supabase.auth.signInWithPassword()` → redirect `/dashboard`; trata `email_not_confirmed` → `/confirm-email`
- [x] Conectar `app/(auth)/signup/page.tsx` a `supabase.auth.signUp()` com `emailRedirectTo` → redirect `/confirm-email`
- [x] Criar `app/(auth)/confirm-email/page.tsx` — aguarda confirmação + reenvio via `supabase.auth.resend()`
- [x] Criar `app/auth/callback/route.ts` — troca PKCE code por sessão (email confirm flow)
- [x] Criar Server Action `createWorkspace` em `app/(auth)/onboarding/actions.ts` — RPC atômica `create_workspace_with_admin` (workspace + membro admin em uma transação)
- [x] Conectar botão "Sair" do `UserMenu` a `supabase.auth.signOut()`
- [x] Conectar `WorkspaceSwitcher` a dados reais (query join via `AppLayout` server component)
- [x] Criar `supabase/migrations/20240004_rls_fix.sql` — funções helper com `(select auth.uid())` cacheado; RPC atômica `create_workspace_with_admin`
- [x] Fluxo completo testado via API: signup → login → workspace criado → RLS verificada → logout

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

**Branch:** `main` (commits diretos)
**Objetivo:** Criar/alternar workspaces, convidar colaboradores por e-mail (Resend), roles Admin/Membro funcionando.

### Entregas

- [x] Criar `lib/resend/client.ts` — instância Resend
- [x] Criar `lib/resend/templates/invite.tsx` — e-mail HTML com link de aceite
- [x] Criar `app/api/invite/route.ts` — POST: insere em `invites` + envia e-mail Resend; bloqueia re-convite de membro existente; reutiliza token pendente no reenvio
- [x] Criar `app/api/invite/accept/route.ts` — aceita convite pós-autenticação, insere em `workspace_members`
- [x] Criar `app/(auth)/invite/[token]/page.tsx` — valida token via RPC pública, aceita se já logado, redireciona para signup/login
- [x] Criar `app/(auth)/invite/[token]/InviteAcceptClient.tsx` — tela de boas-vindas com opção signup ou login
- [x] Criar `supabase/migrations/20240007_invite_public_rpc.sql` — RPC `get_invite_by_token` (security definer, sem auth)
- [x] Criar `supabase/migrations/20240006_members_view.sql` — RPC `get_workspace_members_with_email` (security definer)
- [x] Atualizar `app/(app)/settings/page.tsx`:
  - Seção "Workspace": editar nome
  - Seção "Membros": listar membros com email + convites pendentes + form de convite
  - Seção "Plano": info do plano atual
  - Filtro: convites pendentes não mostram emails já membros
- [x] Criar `components/settings/InviteForm.tsx` — form de convite por e-mail com role
- [x] Criar `components/settings/MemberActions.tsx` — botões remover membro e cancelar convite
- [x] Criar `components/settings/WorkspaceNameForm.tsx` — form inline para editar nome do workspace
- [x] Criar `app/(app)/settings/actions.ts` — `updateWorkspaceName`, `removeMember`, `cancelInvite`
- [x] Conectar `WorkspaceSwitcher.tsx` a query real de `workspace_members`
- [x] Persistir workspace ativo em cookie `active_workspace_id`
- [x] Exibir avatars dos membros do workspace na `TopBar` (canto superior direito)

### Commits
- `fix(M9): 5 bugs — middleware /invite, cancelInvite sem auth, email de membro, redirect morto, revalidação`
- `fix(M9): corrigir layout settings, tipo varchar na RPC, remover logs de debug`
- `fix(M9): fluxo de convite — tela de boas-vindas, signup/login integrado, aceite após auth`
- `fix(M9): convite — bloquear email já membro, reutilizar token pendente no reenvio`
- `fix(M9): buscar convite via RPC pública — resolve "convite inválido" sem login`
- `feat: exibir avatars dos membros do workspace na TopBar`

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
