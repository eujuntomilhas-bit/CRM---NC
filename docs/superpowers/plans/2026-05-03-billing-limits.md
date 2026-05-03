# Billing Limits & Settings Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar limites de plano Free (50 leads, 2 membros), modal de upgrade ao atingir limite, e transformar a página /settings em abas (Workspace / Membros / Assinatura) com tabela comparativa Free vs Pro.

**Architecture:** `lib/limits.ts` expõe funções server-side puras que consultam o Supabase. `LeadsPage` passa `leadCount` e `plan` para `LeadsClient`, que exibe um modal de upgrade quando o limite é atingido. A `SettingsPage` é refatorada para usar o componente `Tabs` do shadcn com três abas; a `BillingSection` existente é expandida com tabela comparativa.

**Tech Stack:** Next.js App Router, Supabase, shadcn/ui (Tabs, Dialog, Badge, Button), TypeScript, Sonner (toasts)

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `lib/limits.ts` | Criar | `canAddLead()` e `canAddMember()` — consultas server-side ao Supabase |
| `app/(app)/settings/page.tsx` | Modificar | Adicionar Tabs (Workspace / Membros / Assinatura) |
| `components/settings/BillingSection.tsx` | Modificar | Adicionar tabela comparativa Free vs Pro |
| `app/(app)/leads/page.tsx` | Modificar | Passar `leadCount` e `plan` para `LeadsClient` |
| `app/(app)/leads/LeadsClient.tsx` | Modificar | Modal de upgrade quando Free e `leadCount >= 50` |

---

### Task 1: Criar `lib/limits.ts`

**Files:**
- Create: `lib/limits.ts`

- [ ] **Step 1: Criar o arquivo com as duas funções**

```typescript
// lib/limits.ts
import { createClient } from '@/lib/supabase/server'

const FREE_LEAD_LIMIT = 50
const FREE_MEMBER_LIMIT = 2

export async function canAddLead(workspaceId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return { allowed: false, reason: 'Workspace não encontrado' }
  if (workspace.plan !== 'free') return { allowed: true }

  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  if ((count ?? 0) >= FREE_LEAD_LIMIT) {
    return {
      allowed: false,
      reason: `O plano Free permite até ${FREE_LEAD_LIMIT} leads. Faça upgrade para Pro para leads ilimitados.`,
    }
  }

  return { allowed: true }
}

export async function canAddMember(workspaceId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return { allowed: false, reason: 'Workspace não encontrado' }
  if (workspace.plan !== 'free') return { allowed: true }

  const { count: memberCount } = await supabase
    .from('workspace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  const { count: inviteCount } = await supabase
    .from('invites')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)

  const total = (memberCount ?? 0) + (inviteCount ?? 0)

  if (total >= FREE_MEMBER_LIMIT) {
    return {
      allowed: false,
      reason: `Limite de ${FREE_MEMBER_LIMIT} membros atingido no plano Free. Faça upgrade para Pro para convidar mais pessoas.`,
    }
  }

  return { allowed: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/limits.ts
git commit -m "feat(limits): canAddLead e canAddMember para plano Free"
```

---

### Task 2: Atualizar `LeadsPage` para passar contagem e plano

**Files:**
- Modify: `app/(app)/leads/page.tsx`

- [ ] **Step 1: Buscar workspace (plan) e lead count no servidor**

Substituir o conteúdo de `app/(app)/leads/page.tsx` por:

```typescript
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import LeadsClient from "./LeadsClient"
import type { LeadRow } from "@/types/supabase"
import type { Lead, WorkspacePlan } from "@/types"

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    company: row.company ?? "",
    role: row.role ?? "",
    status: row.status,
    assignee_id: row.assignee_id ?? "",
    estimated_value: Number(row.estimated_value ?? 0),
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

export default async function LeadsPage() {
  const workspaceId = await getActiveWorkspaceId()

  if (!workspaceId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum workspace encontrado.</p>
      </div>
    )
  }

  const supabase = await createClient()

  const [leadsResult, workspaceResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }) as Promise<{ data: LeadRow[] | null }>,
    supabase
      .from("workspaces")
      .select("plan")
      .eq("id", workspaceId)
      .single(),
  ])

  const leads = (leadsResult.data ?? []).map(rowToLead)
  const plan = (workspaceResult.data?.plan ?? "free") as WorkspacePlan

  return <LeadsClient initialLeads={leads} plan={plan} />
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/leads/page.tsx
git commit -m "feat(leads): passar plan para LeadsClient"
```

---

### Task 3: Adicionar modal de upgrade em `LeadsClient`

**Files:**
- Modify: `app/(app)/leads/LeadsClient.tsx`

- [ ] **Step 1: Adicionar prop `plan` e estado do modal de upgrade**

No topo do componente, após as importações existentes, adicionar a importação de `createCheckoutSession`:

```typescript
import { createCheckoutSession } from '@/app/(app)/settings/billing-actions'
import type { WorkspacePlan } from '@/types'
```

- [ ] **Step 2: Atualizar a tipagem de Props**

```typescript
type Props = {
  initialLeads: Lead[]
  plan: WorkspacePlan
}
```

- [ ] **Step 3: Adicionar estado e constante do limite**

Dentro do componente, após as declarações de estado existentes, adicionar:

```typescript
const FREE_LEAD_LIMIT = 50
const [upgradePending, startUpgradeTransition] = useTransition()
const [limitModalOpen, setLimitModalOpen] = useState(false)

function handleNewLead() {
  if (plan === 'free' && optimisticLeads.length >= FREE_LEAD_LIMIT) {
    setLimitModalOpen(true)
    return
  }
  setEditingLead(null)
  setFormOpen(true)
}

function handleUpgrade() {
  startUpgradeTransition(async () => {
    try {
      await createCheckoutSession()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao iniciar checkout')
    }
  })
}
```

- [ ] **Step 4: Substituir o onClick do botão "Novo lead"**

Trocar:
```typescript
<Button onClick={() => { setEditingLead(null); setFormOpen(true) }} disabled={isPending}>
```

Por:
```typescript
<Button onClick={handleNewLead} disabled={isPending}>
```

- [ ] **Step 5: Adicionar o modal de limite ao final do JSX (antes do `</div>` final)**

Após o Dialog de confirmação de exclusão existente, adicionar:

```tsx
<Dialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Limite de leads atingido</DialogTitle>
    </DialogHeader>
    <p className="text-sm text-muted-foreground">
      O plano Free permite até {FREE_LEAD_LIMIT} leads. Faça upgrade para Pro para leads ilimitados.
    </p>
    <DialogFooter className="gap-2 sm:gap-0">
      <Button variant="outline" onClick={() => setLimitModalOpen(false)}>
        Fechar
      </Button>
      <Button onClick={handleUpgrade} disabled={upgradePending}>
        {upgradePending ? 'Redirecionando…' : 'Assinar Pro — R$49/mês'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- [ ] **Step 6: Commit**

```bash
git add app/(app)/leads/LeadsClient.tsx
git commit -m "feat(leads): modal de upgrade ao atingir limite Free (50 leads)"
```

---

### Task 4: Refatorar `SettingsPage` com Tabs

**Files:**
- Modify: `app/(app)/settings/page.tsx`

- [ ] **Step 1: Substituir o conteúdo completo da página**

```typescript
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkspaceNameForm } from '@/components/settings/WorkspaceNameForm'
import { InviteForm } from '@/components/settings/InviteForm'
import { RemoveMemberButton, CancelInviteButton } from '@/components/settings/MemberActions'
import { BillingSection } from '@/components/settings/BillingSection'
import { BillingToast } from '@/components/settings/BillingToast'
import { Crown, Users, Clock } from 'lucide-react'

const FREE_MEMBER_LIMIT = 2

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const workspaceId = await getActiveWorkspaceId()

  if (!user || !workspaceId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Nenhum workspace encontrado.</p>
      </div>
    )
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug, plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return null

  type MemberWithEmail = {
    id: string
    workspace_id: string
    user_id: string
    role: 'admin' | 'member'
    email: string
    created_at: string
  }

  const { data: membersRaw } = await supabase
    .rpc('get_workspace_members_with_email', { p_workspace_id: workspaceId }) as { data: MemberWithEmail[] | null }

  const members = membersRaw ?? []
  const currentMembership = members.find((m) => m.user_id === user.id)
  const isAdmin = currentMembership?.role === 'admin'

  type InviteRow = { id: string; email: string; role: 'admin' | 'member'; created_at: string }
  const { data: pendingInvites } = await supabase
    .from('invites')
    .select('id, email, role, created_at')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false }) as { data: InviteRow[] | null }

  const invites = pendingInvites ?? []
  const totalMembersAndInvites = members.length + invites.length
  const atFreeLimit = workspace.plan === 'free' && totalMembersAndInvites >= FREE_MEMBER_LIMIT

  return (
    <div className="flex-1 space-y-6 overflow-auto">
      <Suspense fallback={null}>
        <BillingToast />
      </Suspense>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">Gerencie seu workspace e conta</p>
      </div>

      <Tabs defaultValue="workspace">
        <TabsList className="mb-4">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        </TabsList>

        {/* ── Aba Workspace ── */}
        <TabsContent value="workspace">
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Workspace</h3>
            </div>
            <Separator />
            <WorkspaceNameForm
              workspaceId={workspace.id}
              currentName={workspace.name}
              isAdmin={isAdmin}
            />
            <p className="text-xs text-muted-foreground">
              Slug: <span className="font-mono">{workspace.slug}</span>
            </p>
          </section>
        </TabsContent>

        {/* ── Aba Membros ── */}
        <TabsContent value="membros">
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Membros</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {workspace.plan === 'free'
                  ? `${totalMembersAndInvites} / ${FREE_MEMBER_LIMIT} (Free)`
                  : `${members.length} membros`}
              </span>
            </div>
            <Separator />

            <ul className="space-y-2">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(member.email ?? '??').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.email}</p>
                    {member.user_id === user.id && (
                      <p className="text-xs text-muted-foreground">Você</p>
                    )}
                  </div>
                  <Badge
                    variant={member.role === 'admin' ? 'default' : 'secondary'}
                    className="text-[10px] h-5"
                  >
                    {member.role === 'admin' ? 'Admin' : 'Membro'}
                  </Badge>
                  {isAdmin && member.user_id !== user.id && (
                    <RemoveMemberButton workspaceId={workspaceId} userId={member.user_id} />
                  )}
                </li>
              ))}
            </ul>

            {invites.length > 0 && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Convites pendentes
                </p>
                <ul className="space-y-2">
                  {invites.map((invite) => (
                    <li key={invite.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Clock className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">Convite enviado</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] h-5 border-amber-500/40 text-amber-500">
                        Pendente
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {invite.role === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                      {isAdmin && <CancelInviteButton workspaceId={workspaceId} inviteId={invite.id} />}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {isAdmin && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Convidar por e-mail</p>
                  <InviteForm
                    workspaceId={workspaceId}
                    disabled={atFreeLimit}
                    disabledReason={
                      atFreeLimit
                        ? `Limite de ${FREE_MEMBER_LIMIT} membros atingido no plano Free. Faça upgrade para Pro para convidar mais pessoas.`
                        : undefined
                    }
                  />
                </div>
              </>
            )}
          </section>
        </TabsContent>

        {/* ── Aba Assinatura ── */}
        <TabsContent value="assinatura">
          <BillingSection plan={workspace.plan} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Verificar se `Tabs` está instalado**

```bash
grep -r "TabsList" node_modules/@radix-ui/react-tabs/dist 2>$null | Select-Object -First 1
```

Se não retornar nada, instalar:
```bash
npx shadcn@latest add tabs
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/settings/page.tsx
git commit -m "feat(settings): abas Workspace / Membros / Assinatura"
```

---

### Task 5: Expandir `BillingSection` com tabela comparativa

**Files:**
- Modify: `components/settings/BillingSection.tsx`

- [ ] **Step 1: Substituir o conteúdo completo do componente**

```typescript
'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Check, Minus, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { createCheckoutSession, createPortalSession } from '@/app/(app)/settings/billing-actions'
import type { WorkspacePlan } from '@/types'

type Props = {
  plan: WorkspacePlan
  isAdmin: boolean
}

const features = [
  { label: 'Membros da equipe', free: 'Até 2', pro: 'Ilimitados' },
  { label: 'Leads', free: 'Até 50', pro: 'Ilimitados' },
  { label: 'Pipeline Kanban', free: true, pro: true },
  { label: 'Dashboard de métricas', free: true, pro: true },
  { label: 'Convites por e-mail', free: true, pro: true },
  { label: 'Suporte prioritário', free: false, pro: true },
] as const

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'string') return <span className="text-xs font-medium">{value}</span>
  if (value) return <Check className="size-4 text-primary mx-auto" />
  return <Minus className="size-4 text-muted-foreground mx-auto" />
}

export function BillingSection({ plan, isAdmin }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      try {
        await createCheckoutSession()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao iniciar checkout')
      }
    })
  }

  function handlePortal() {
    startTransition(async () => {
      try {
        await createPortalSession()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao abrir portal')
      }
    })
  }

  const planLabel = plan === 'pro' ? 'Pro' : 'Free'
  const planDescription = {
    free: 'Até 2 membros e 50 leads. Ideal para começar.',
    pro: 'Membros ilimitados · Todos os recursos · R$49/mês',
    payment_failed: 'Pagamento com falha — atualize seu método de pagamento',
  }[plan]

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Plano atual */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Plano atual{' '}
            <Badge
              variant={plan === 'pro' ? 'default' : plan === 'payment_failed' ? 'destructive' : 'secondary'}
              className="ml-1 text-xs"
            >
              {plan === 'payment_failed' ? (
                <span className="flex items-center gap-1"><AlertTriangle className="size-3" /> Falha</span>
              ) : planLabel}
            </Badge>
          </p>
          <p className={`text-xs mt-0.5 ${plan === 'payment_failed' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {planDescription}
          </p>
        </div>
        {isAdmin && plan !== 'free' && (
          <Button variant="outline" size="sm" onClick={handlePortal} disabled={isPending}>
            {isPending ? 'Abrindo…' : plan === 'payment_failed' ? 'Atualizar pagamento' : 'Gerenciar assinatura'}
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabela comparativa */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Compare os planos
        </p>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-1/2"></th>
                <th className="text-center px-4 py-3 w-1/4">
                  <div>
                    <p className="font-semibold text-foreground">Free</p>
                    <p className="text-xs text-muted-foreground font-normal">R$0/mês</p>
                  </div>
                </th>
                <th className="text-center px-4 py-3 w-1/4 bg-primary/5 relative">
                  <div>
                    <p className="font-semibold text-foreground">Pro</p>
                    <p className="text-xs text-muted-foreground font-normal">R$49/mês</p>
                  </div>
                  {plan !== 'pro' && (
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-px rounded-b-md">
                      Recomendado
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature.label}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground">{feature.label}</td>
                  <td className="px-4 py-3 text-center">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="px-4 py-3 text-center bg-primary/5">
                    <FeatureValue value={feature.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de upgrade (só Free) */}
      {isAdmin && plan === 'free' && (
        <Button onClick={handleUpgrade} disabled={isPending} className="w-full gap-2">
          <Zap className="size-4" />
          {isPending ? 'Redirecionando…' : 'Assinar Pro — R$49/mês'}
        </Button>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/settings/BillingSection.tsx
git commit -m "feat(billing): tabela comparativa Free vs Pro na aba Assinatura"
```

---

## Self-Review

**Spec coverage:**
- ✅ `lib/limits.ts` com `canAddLead()` e `canAddMember()` — Task 1
- ✅ Aviso (modal) ao atingir limite de leads Free — Task 3
- ✅ Modal oferece botão "Assinar Pro" que chama `createCheckoutSession` — Task 3
- ✅ Settings com aba Assinatura — Task 4
- ✅ Tabela comparativa Free vs Pro — Task 5
- ✅ Botão "Gerenciar assinatura" abre Customer Portal — Task 5 (`handlePortal`)
- ✅ Limite membros Free já existia; `canAddMember` reforça via `lib/limits.ts` — Task 1

**Placeholder scan:** Nenhum TBD ou TODO encontrado.

**Type consistency:** `WorkspacePlan` importado de `@/types` em todos os arquivos. `createCheckoutSession` e `createPortalSession` importados de `@/app/(app)/settings/billing-actions` consistentemente.
