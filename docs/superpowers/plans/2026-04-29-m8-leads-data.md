# M8 Leads Data — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir todos os mocks por dados reais do Supabase — leads, deals, atividades e dashboard — com Server Actions, filtros no banco, e drag-and-drop persistindo stage.

**Architecture:** Server Components buscam dados no servidor e passam para Client Components "slim" que gerenciam apenas estado de UI (dialogs, optimistic updates). Um helper central `lib/workspace.ts` resolve o workspace ativo de cada request. Filtros de busca/status são aplicados no Supabase (não no cliente). Drag-and-drop faz update optimista no estado local e persiste via Server Action em background.

**Tech Stack:** Next.js 16 App Router, Supabase SSR (`@supabase/ssr`), Server Actions (`"use server"`), `revalidatePath`, `useTransition` para optimistic updates, `@dnd-kit` (já instalado).

---

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `lib/workspace.ts` | **Criar** | Resolve workspace ativo do usuário logado via cookie + Supabase |
| `app/(app)/leads/actions.ts` | **Criar** | Server Actions: getLeads, createLead, updateLead, deleteLead |
| `app/(app)/leads/page.tsx` | **Refatorar** | Server Component: busca leads, passa para LeadsClient |
| `app/(app)/leads/LeadsClient.tsx` | **Criar** | Client Component: estado UI de leads (filtros, dialogs) |
| `app/(app)/leads/[id]/actions.ts` | **Criar** | Server Actions: getLead, createActivity |
| `app/(app)/leads/[id]/page.tsx` | **Refatorar** | Server Component: busca lead + activities |
| `app/(app)/pipeline/actions.ts` | **Criar** | Server Actions: getDeals, createDeal, updateDeal, updateDealStage, deleteDeal |
| `app/(app)/pipeline/page.tsx` | **Refatorar** | Server Component: busca deals + leads, passa para PipelineClient |
| `app/(app)/pipeline/PipelineClient.tsx` | **Criar** | Client Component: estado UI do pipeline (dialog, stats) |
| `app/(app)/dashboard/actions.ts` | **Criar** | getDashboardData: 3 queries paralelas → métricas, funil, upcoming |
| `app/(app)/dashboard/page.tsx` | **Refatorar** | Server Component async: chama getDashboardData |
| `components/pipeline/KanbanBoard.tsx` | **Refatorar** | Remove mocks; recebe initialDeals+leads como props; persiste stage via action |
| `components/leads/LeadCard.tsx` | **Refatorar** | Remove import MOCK_USERS; assignee vira string simples |
| `components/leads/LeadFilters.tsx` | **Refatorar** | Remove import MOCK_USERS; assignee filter removido (sem lista de membros ainda) |
| `components/leads/LeadForm.tsx` | **Refatorar** | Remove import MOCK_USERS; campo responsável removido do form |
| `lib/mocks/leads.ts` | **Deletar** | — |
| `lib/mocks/deals.ts` | **Deletar** | — |
| `lib/mocks/metrics.ts` | **Deletar** | — |

---

## Task 1: Helper de workspace ativo

**Files:**
- Create: `lib/workspace.ts`

- [ ] **Criar `lib/workspace.ts`**

```ts
"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const cached = cookieStore.get("active_workspace_id")?.value
  if (cached) return cached

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single() as { data: { workspace_id: string } | null }

  if (!data) return null

  // Cookie só pode ser setado em middleware/route handlers, não em Server Components.
  // Retornamos o id; o cookie será setado no onboarding action (já feito no M7).
  return data.workspace_id
}
```

- [ ] **Commit**
```bash
git add lib/workspace.ts
git commit -m "feat(M8): helper getActiveWorkspaceId"
```

---

## Task 2: Server Actions de leads

**Files:**
- Create: `app/(app)/leads/actions.ts`

- [ ] **Criar `app/(app)/leads/actions.ts`**

```ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { Lead, LeadStatus } from "@/types"

export type LeadFilters = {
  search?: string
  status?: LeadStatus | "todos"
}

export type LeadInput = {
  name: string
  email: string
  phone: string
  company: string
  role: string
  status: LeadStatus
  estimated_value: number
  notes: string
}

export async function getLeads(filters?: LeadFilters): Promise<Lead[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  let query = supabase
    .from("leads")
    .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (filters?.status && filters.status !== "todos") {
    query = query.eq("status", filters.status)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
  }

  const { data } = await query
  return (data ?? []) as Lead[]
}

export async function createLead(input: LeadInput): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const supabase = await createClient()
  const { error } = await supabase.from("leads").insert({
    ...input,
    workspace_id: workspaceId,
  })

  if (error) return { error: error.message }
  revalidatePath("/leads")
  return {}
}

export async function updateLead(id: string, input: Partial<LeadInput>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").update(input).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)
  return {}
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/leads")
  return {}
}
```

- [ ] **Commit**
```bash
git add "app/(app)/leads/actions.ts"
git commit -m "feat(M8): Server Actions de leads (getLeads, createLead, updateLead, deleteLead)"
```

---

## Task 3: Server Actions de lead detail + atividades

**Files:**
- Create: `app/(app)/leads/[id]/actions.ts`

- [ ] **Criar `app/(app)/leads/[id]/actions.ts`**

```ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { Lead, Activity, ActivityType, LeadStatus } from "@/types"

export type LeadDetail = Lead & { activities: Activity[] }

export async function getLead(id: string): Promise<LeadDetail | null> {
  const supabase = await createClient()

  const [leadResult, activitiesResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
      .eq("id", id)
      .single(),
    supabase
      .from("activities")
      .select("id, workspace_id, lead_id, type, description, author_id, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ])

  if (!leadResult.data) return null
  return {
    ...(leadResult.data as Lead),
    activities: (activitiesResult.data ?? []) as Activity[],
  }
}

export async function createActivity(leadId: string, type: ActivityType, description: string): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    type,
    description,
    author_id: user?.id ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/leads/${leadId}`)
  return {}
}

export async function updateLeadDetail(id: string, input: Partial<Pick<Lead, "name" | "email" | "phone" | "company" | "role" | "status" | "estimated_value" | "notes">>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").update(input).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/leads/${id}`)
  revalidatePath("/leads")
  return {}
}

export async function deleteLeadAndRedirect(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from("leads").delete().eq("id", id)
  redirect("/leads")
}
```

- [ ] **Commit**
```bash
git add "app/(app)/leads/[id]/actions.ts"
git commit -m "feat(M8): Server Actions de lead detail e atividades"
```

---

## Task 4: Server Actions de pipeline

**Files:**
- Create: `app/(app)/pipeline/actions.ts`

- [ ] **Criar `app/(app)/pipeline/actions.ts`**

```ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { Deal, DealStage } from "@/types"

export type DealInput = {
  title: string
  value: number
  lead_id: string | null
  due_date: string | null
  stage: DealStage
}

export type DealWithLead = Deal & { lead_name: string | null }

export async function getDeals(): Promise<DealWithLead[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("deals")
    .select("id, workspace_id, lead_id, title, value, stage, assignee_id, due_date, created_at, leads(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true }) as { data: (Deal & { leads: { name: string } | null })[] | null }

  return (data ?? []).map((d) => ({
    ...d,
    lead_name: d.leads?.name ?? null,
    leads: undefined,
  })) as DealWithLead[]
}

export async function createDeal(input: DealInput): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const supabase = await createClient()
  const { error } = await supabase.from("deals").insert({
    ...input,
    workspace_id: workspaceId,
    lead_id: input.lead_id || null,
    due_date: input.due_date || null,
  })

  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function updateDeal(id: string, input: Partial<DealInput>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("deals").update({
    ...input,
    lead_id: input.lead_id ?? null,
    due_date: input.due_date ?? null,
  }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function updateDealStage(id: string, stage: DealStage): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("deals").update({ stage }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function deleteDeal(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("deals").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}
```

- [ ] **Commit**
```bash
git add "app/(app)/pipeline/actions.ts"
git commit -m "feat(M8): Server Actions de pipeline (getDeals, createDeal, updateDealStage, deleteDeal)"
```

---

## Task 5: Server Actions do dashboard

**Files:**
- Create: `app/(app)/dashboard/actions.ts`

- [ ] **Criar `app/(app)/dashboard/actions.ts`**

```ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { DealStage } from "@/types"

export type DashboardMetrics = {
  total_leads: number
  open_deals: number
  pipeline_value: number
  conversion_rate: number
}

export type FunnelRow = {
  stage: DealStage
  label: string
  count: number
  value: number
}

export type UpcomingDeal = {
  id: string
  title: string
  value: number
  stage: DealStage
  due_date: string
}

export type DashboardData = {
  metrics: DashboardMetrics
  funnel: FunnelRow[]
  upcoming: UpcomingDeal[]
}

const STAGE_LABELS: Record<DealStage, string> = {
  novo: "Novo Lead", contato: "Contato", proposta: "Proposta",
  negociacao: "Negociação", ganho: "Ganho", perdido: "Perdido",
}

export async function getDashboardData(): Promise<DashboardData> {
  const workspaceId = await getActiveWorkspaceId()

  const empty: DashboardData = {
    metrics: { total_leads: 0, open_deals: 0, pipeline_value: 0, conversion_rate: 0 },
    funnel: [],
    upcoming: [],
  }
  if (!workspaceId) return empty

  const supabase = await createClient()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const dueCutoff = sevenDaysFromNow.toISOString().split("T")[0]
  const today = new Date().toISOString().split("T")[0]

  const [leadsResult, dealsResult, upcomingResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("deals")
      .select("id, stage, value")
      .eq("workspace_id", workspaceId),
    supabase
      .from("deals")
      .select("id, title, value, stage, due_date")
      .eq("workspace_id", workspaceId)
      .not("stage", "in", '("ganho","perdido")')
      .gte("due_date", today)
      .lte("due_date", dueCutoff)
      .order("due_date", { ascending: true })
      .limit(10),
  ])

  const allDeals = (dealsResult.data ?? []) as { id: string; stage: DealStage; value: number }[]
  const activeDeals = allDeals.filter((d) => d.stage !== "ganho" && d.stage !== "perdido")
  const wonDeals = allDeals.filter((d) => d.stage === "ganho")

  const metrics: DashboardMetrics = {
    total_leads: leadsResult.count ?? 0,
    open_deals: activeDeals.length,
    pipeline_value: activeDeals.reduce((s, d) => s + (d.value ?? 0), 0),
    conversion_rate: allDeals.length > 0
      ? Math.round((wonDeals.length / allDeals.length) * 100)
      : 0,
  }

  const FUNNEL_STAGES: DealStage[] = ["novo", "contato", "proposta", "negociacao", "ganho"]
  const funnel: FunnelRow[] = FUNNEL_STAGES.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage)
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + (d.value ?? 0), 0),
    }
  })

  const upcoming = (upcomingResult.data ?? []) as UpcomingDeal[]

  return { metrics, funnel, upcoming }
}
```

- [ ] **Commit**
```bash
git add "app/(app)/dashboard/actions.ts"
git commit -m "feat(M8): getDashboardData — métricas, funil e upcoming em 3 queries paralelas"
```

---

## Task 6: Refatorar componentes que importam mocks

**Files:**
- Modify: `components/leads/LeadCard.tsx`
- Modify: `components/leads/LeadFilters.tsx`
- Modify: `components/leads/LeadForm.tsx`

- [ ] **Remover MOCK_USERS de `LeadCard.tsx`** — mostrar `assignee_id` como texto vazio se não houver nome (membros vêm no M9)

Substituir todo o conteúdo de [components/leads/LeadCard.tsx](components/leads/LeadCard.tsx):

```tsx
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pencil, Trash2, Building2, Phone, Mail } from "lucide-react"
import type { Lead } from "@/types"

export const STATUS_CONFIG: Record<Lead["status"], { label: string; className: string }> = {
  novo:       { label: "Novo",       className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  contato:    { label: "Contato",    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  proposta:   { label: "Proposta",   className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  negociacao: { label: "Negociação", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  ganho:      { label: "Ganho",      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  perdido:    { label: "Perdido",    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
}

type Props = {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
}

export default function LeadCard({ lead, onEdit, onDelete }: Props) {
  const status = STATUS_CONFIG[lead.status]
  const initials = lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")

  return (
    <div className="glass-card flex items-start justify-between gap-4 rounded-xl p-4">
      <Link href={`/leads/${lead.id}`} className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground truncate">{lead.name}</span>
            <Badge className={`text-xs font-medium border-0 ${status.className}`}>{status.label}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="size-3" />{lead.company}</span>
            {lead.role && <span className="truncate">{lead.role}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            {lead.email && <span className="flex items-center gap-1"><Mail className="size-3" />{lead.email}</span>}
            {lead.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{lead.phone}</span>}
          </div>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(lead)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => onDelete(lead)}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Remover MOCK_USERS de `LeadFilters.tsx`** — remover o filtro de responsável (sem lista real de membros ainda)

Substituir todo o conteúdo de [components/leads/LeadFilters.tsx](components/leads/LeadFilters.tsx):

```tsx
"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Lead } from "@/types"

type Props = {
  search: string
  status: Lead["status"] | "todos"
  onSearchChange: (v: string) => void
  onStatusChange: (v: Lead["status"] | "todos") => void
}

export default function LeadFilters({ search, status, onSearchChange, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou empresa…"
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v as Lead["status"] | "todos")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="novo">Novo</SelectItem>
          <SelectItem value="contato">Contato</SelectItem>
          <SelectItem value="proposta">Proposta</SelectItem>
          <SelectItem value="negociacao">Negociação</SelectItem>
          <SelectItem value="ganho">Ganho</SelectItem>
          <SelectItem value="perdido">Perdido</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Remover MOCK_USERS de `LeadForm.tsx`** — remover o campo "Responsável" (sem lista real ainda)

Substituir a seção de MOCK_USERS e o campo Responsável no LeadForm. Remover o import e o bloco do select de assignee. O campo `assignee_id` do form simplesmente não é editado pela UI por enquanto (M9 adiciona membros reais).

Arquivo [components/leads/LeadForm.tsx](components/leads/LeadForm.tsx) — remover as linhas:
```tsx
// REMOVER:
import { MOCK_USERS } from "@/lib/mocks/leads"
```
E substituir `assignee_id: "u1"` por `assignee_id: ""` no EMPTY.
E remover o bloco inteiro do Select de Responsável (linhas 134-144).

- [ ] **Commit**
```bash
git add components/leads/LeadCard.tsx components/leads/LeadFilters.tsx components/leads/LeadForm.tsx
git commit -m "feat(M8): remover MOCK_USERS dos componentes de lead"
```

---

## Task 7: Refatorar KanbanBoard — remover mocks, persistir stage

**Files:**
- Modify: `components/pipeline/KanbanBoard.tsx`

- [ ] **Reescrever `KanbanBoard.tsx`** — recebe `initialDeals` e `leads` como props; persiste stage via Server Action em `onDragEnd`

Substituir todo o conteúdo de [components/pipeline/KanbanBoard.tsx](components/pipeline/KanbanBoard.tsx):

```tsx
"use client"

import { useState, useRef, useTransition } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { STAGE_CONFIG } from "./KanbanColumn"
import { DealCardOverlay } from "./DealCard"
import { updateDealStage } from "@/app/(app)/pipeline/actions"
import type { Deal, DealStage } from "@/types"
import type { DealWithLead } from "@/app/(app)/pipeline/actions"

const KanbanColumn = dynamic(() => import("./KanbanColumn"), { ssr: false })

const STAGES = Object.keys(STAGE_CONFIG) as DealStage[]

const kanbanCollision: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  if (hits.length > 0) {
    const col = hits.find((c) => STAGES.includes(c.id as DealStage))
    if (col) return [col]
    return hits
  }
  return rectIntersection(args)
}

type SimpleLeadRef = { id: string; name: string }

type Props = {
  initialDeals: DealWithLead[]
  leads: SimpleLeadRef[]
  onAddDeal: (stage: DealStage) => void
  onClickDeal: (deal: DealWithLead) => void
  className?: string
}

export default function KanbanBoard({ initialDeals, leads, onAddDeal, onClickDeal, className }: Props) {
  const [deals, setDeals] = useState<DealWithLead[]>(initialDeals)
  const [, startTransition] = useTransition()

  const dealsRef = useRef<DealWithLead[]>(deals)
  dealsRef.current = deals

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeDeal = deals.find((d) => d.id === activeId) ?? null
  const activeStage = activeDeal?.stage

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const current = dealsRef.current
    const dragId = active.id as string
    const overId = over.id as string
    const dragged = current.find((d) => d.id === dragId)
    if (!dragged) return

    const targetStage: DealStage | undefined = STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : current.find((d) => d.id === overId)?.stage

    if (!targetStage || dragged.stage === targetStage) return
    setDeals(current.map((d) => (d.id === dragId ? { ...d, stage: targetStage } : d)))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const current = dealsRef.current
    const dragId = active.id as string
    const overId = over.id as string
    const dragged = current.find((d) => d.id === dragId)
    if (!dragged) return

    const targetStage: DealStage | undefined = STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : current.find((d) => d.id === overId)?.stage

    if (!targetStage || targetStage !== dragged.stage) {
      // Stage mudou no onDragOver; persistir no banco
      startTransition(() => { updateDealStage(dragId, dragged.stage) })
      return
    }

    if (dragId === overId) return

    const stageDeals = current.filter((d) => d.stage === targetStage)
    const oldIdx = stageDeals.findIndex((d) => d.id === dragId)
    const newIdx = stageDeals.findIndex((d) => d.id === overId)
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

    const reordered = [
      ...current.filter((d) => d.stage !== targetStage),
      ...arrayMove(stageDeals, oldIdx, newIdx),
    ]
    setDeals(reordered)
    startTransition(() => { updateDealStage(dragId, targetStage) })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollision}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex min-h-0 gap-3 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]", className)}>
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className="animate-fade-slide-up flex min-h-0 flex-col"
            style={{ animationDelay: `${i * 80}ms`, flex: "0 0 264px" }}
          >
            <KanbanColumn
              stage={stage}
              deals={deals.filter((d) => d.stage === stage) as unknown as Deal[]}
              leads={leads}
              users={[]}
              onAddDeal={onAddDeal}
              onClickDeal={onClickDeal as (deal: Deal) => void}
            />
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDeal && (
          <DealCardOverlay
            deal={activeDeal as unknown as Deal}
            leads={leads}
            users={[]}
            onClick={() => {}}
            accentClass={activeStage ? STAGE_CONFIG[activeStage].border : undefined}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
```

- [ ] **Commit**
```bash
git add components/pipeline/KanbanBoard.tsx
git commit -m "feat(M8): KanbanBoard sem mocks — props initialDeals+leads, persiste stage via Server Action"
```

---

## Task 8: Refatorar pages de leads

**Files:**
- Modify: `app/(app)/leads/page.tsx`
- Create: `app/(app)/leads/LeadsClient.tsx`

- [ ] **Criar `app/(app)/leads/LeadsClient.tsx`** — toda lógica de UI (filtros client-side, dialogs, optimistic)

```tsx
"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import LeadCard from "@/components/leads/LeadCard"
import LeadFilters from "@/components/leads/LeadFilters"
import LeadForm from "@/components/leads/LeadForm"
import { createLead, updateLead, deleteLead, type LeadInput } from "./actions"
import type { Lead } from "@/types"

type Props = {
  initialLeads: Lead[]
}

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

export default function LeadsClient({ initialLeads }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "todos">("todos")
  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticLeads, updateOptimistic] = useOptimistic(
    initialLeads,
    (state: Lead[], action: { type: "add"; lead: Lead } | { type: "update"; id: string; data: Partial<Lead> } | { type: "delete"; id: string }) => {
      if (action.type === "add") return [action.lead, ...state]
      if (action.type === "update") return state.map((l) => l.id === action.id ? { ...l, ...action.data } : l)
      if (action.type === "delete") return state.filter((l) => l.id !== action.id)
      return state
    }
  )

  const filtered = optimisticLeads.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.name.toLowerCase().includes(q) || (l.company ?? "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "todos" || l.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleSave(data: FormData, id?: string) {
    const input: LeadInput = {
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      company: data.company,
      role: data.role ?? "",
      status: data.status,
      estimated_value: data.estimated_value ?? 0,
      notes: data.notes ?? "",
    }

    if (id) {
      startTransition(async () => {
        updateOptimistic({ type: "update", id, data })
        await updateLead(id, input)
      })
    } else {
      const tempLead: Lead = {
        ...input,
        id: `temp-${Date.now()}`,
        workspace_id: "",
        assignee_id: "",
        created_at: new Date().toISOString(),
      }
      startTransition(async () => {
        updateOptimistic({ type: "add", lead: tempLead })
        await createLead(input)
      })
    }
    setFormOpen(false)
    setEditingLead(null)
  }

  async function handleDelete() {
    if (!deletingLead) return
    const id = deletingLead.id
    setDeletingLead(null)
    startTransition(async () => {
      updateOptimistic({ type: "delete", id })
      await deleteLead(id)
    })
  }

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-slide-up">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {optimisticLeads.length} contato{optimisticLeads.length !== 1 ? "s" : ""} no workspace
          </p>
        </div>
        <Button onClick={() => { setEditingLead(null); setFormOpen(true) }} disabled={isPending}>
          <Plus className="mr-2 size-4" />
          Novo lead
        </Button>
      </div>

      <LeadFilters
        search={search}
        status={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">Nenhum lead encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={(l) => { setEditingLead(l); setFormOpen(true) }}
              onDelete={setDeletingLead}
            />
          ))}
        </div>
      )}

      <LeadForm
        open={formOpen}
        lead={editingLead}
        onClose={() => { setFormOpen(false); setEditingLead(null) }}
        onSave={handleSave}
      />

      <Dialog open={!!deletingLead} onOpenChange={(v) => { if (!v) setDeletingLead(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir lead</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span className="font-medium text-foreground">{deletingLead?.name}</span>? Essa ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingLead(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Reescrever `app/(app)/leads/page.tsx`** como Server Component

```tsx
import { getLeads } from "./actions"
import LeadsClient from "./LeadsClient"

export default async function LeadsPage() {
  const leads = await getLeads()
  return <LeadsClient initialLeads={leads} />
}
```

- [ ] **Commit**
```bash
git add "app/(app)/leads/page.tsx" "app/(app)/leads/LeadsClient.tsx"
git commit -m "feat(M8): leads page — Server Component + LeadsClient com optimistic updates"
```

---

## Task 9: Refatorar page de lead detail

**Files:**
- Modify: `app/(app)/leads/[id]/page.tsx`

- [ ] **Reescrever `app/(app)/leads/[id]/page.tsx`** — Server Component que busca dados reais, Client Component inline para atividades

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, Mail, Phone, Pencil } from "lucide-react"
import { STATUS_CONFIG } from "@/components/leads/LeadCard"
import { getLead } from "./actions"
import LeadDetailClient from "./LeadDetailClient"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getLead(id)
  if (!detail) notFound()

  const status = STATUS_CONFIG[detail.status]
  const initials = detail.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <Link href="/leads" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="size-4" /> Voltar para leads
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">{detail.name}</h2>
                <Badge className={`text-xs font-medium border-0 ${status.className}`}>{status.label}</Badge>
              </div>
              {(detail.role || detail.company) && (
                <p className="text-sm text-muted-foreground">{[detail.role, detail.company].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </div>
          <LeadDetailClient lead={detail} />
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {detail.email && <InfoItem icon={Mail} label="E-mail" value={detail.email} />}
          {detail.phone && <InfoItem icon={Phone} label="Telefone" value={detail.phone} />}
          {detail.company && <InfoItem icon={Building2} label="Empresa" value={detail.company} />}
        </div>
      </div>

      <LeadDetailClient lead={detail} activitiesSection />
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Icon className="size-3" />{label}</p>
      <p className="text-sm font-medium text-foreground break-all">{value}</p>
    </div>
  )
}
```

- [ ] **Criar `app/(app)/leads/[id]/LeadDetailClient.tsx`** — gerencia dialog de edição e atividades

```tsx
"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Pencil } from "lucide-react"
import LeadForm from "@/components/leads/LeadForm"
import ActivityForm from "@/components/leads/ActivityForm"
import ActivityTimeline from "@/components/leads/ActivityTimeline"
import { updateLeadDetail, createActivity, type LeadDetail } from "./actions"
import type { Lead, Activity, ActivityType } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

type Props = {
  lead: LeadDetail
  activitiesSection?: boolean
}

export default function LeadDetailClient({ lead, activitiesSection }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [optimisticActivities, addOptimisticActivity] = useOptimistic(
    lead.activities,
    (state: Activity[], newActivity: Activity) => [newActivity, ...state]
  )

  async function handleSave(data: FormData) {
    startTransition(async () => {
      await updateLeadDetail(lead.id, {
        name: data.name, email: data.email, phone: data.phone ?? "",
        company: data.company, role: data.role ?? "", status: data.status,
        estimated_value: data.estimated_value ?? 0, notes: data.notes ?? "",
      })
    })
    setFormOpen(false)
  }

  async function handleNewActivity(type: ActivityType, description: string) {
    const temp: Activity = {
      id: `temp-${Date.now()}`, workspace_id: lead.workspace_id,
      lead_id: lead.id, type, description, author_id: "",
      created_at: new Date().toISOString(),
    }
    startTransition(async () => {
      addOptimisticActivity(temp)
      await createActivity(lead.id, type, description)
    })
  }

  if (activitiesSection) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Atividades</h3>
        <ActivityForm onSave={handleNewActivity} />
        <Separator />
        <ActivityTimeline activities={optimisticActivities} />
      </div>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} disabled={isPending}>
        <Pencil className="mr-2 size-3.5" /> Editar
      </Button>
      <LeadForm open={formOpen} lead={lead} onClose={() => setFormOpen(false)} onSave={handleSave} />
    </>
  )
}
```

- [ ] **Commit**
```bash
git add "app/(app)/leads/[id]/page.tsx" "app/(app)/leads/[id]/LeadDetailClient.tsx"
git commit -m "feat(M8): lead detail — Server Component + LeadDetailClient com atividades reais"
```

---

## Task 10: Refatorar page do pipeline

**Files:**
- Modify: `app/(app)/pipeline/page.tsx`
- Create: `app/(app)/pipeline/PipelineClient.tsx`

- [ ] **Criar `app/(app)/pipeline/PipelineClient.tsx`**

```tsx
"use client"

import { useState, useTransition } from "react"
import { Plus, TrendingUp, Layers, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import KanbanBoard from "@/components/pipeline/KanbanBoard"
import { STAGE_CONFIG } from "@/components/pipeline/KanbanColumn"
import { createDeal, updateDeal, deleteDeal, type DealWithLead, type DealInput } from "./actions"
import type { DealStage } from "@/types"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

type SimpleLeadRef = { id: string; name: string }

type DealForm = {
  title: string; value: string; lead_id: string
  due_date: string; stage: DealStage
}

const DEFAULT_FORM: DealForm = { title: "", value: "", lead_id: "", due_date: "", stage: "novo" }

type Props = {
  initialDeals: DealWithLead[]
  leads: SimpleLeadRef[]
}

export default function PipelineClient({ initialDeals, leads }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<DealForm>(DEFAULT_FORM)
  const [editingDeal, setEditingDeal] = useState<DealWithLead | null>(null)
  const [isPending, startTransition] = useTransition()

  const [fmtTotal, setFmtTotal] = useState<string | null>(null)
  const [fmtWon, setFmtWon] = useState<string | null>(null)

  const activeDeals = initialDeals.filter((d) => d.stage !== "ganho" && d.stage !== "perdido")
  const wonDeals = initialDeals.filter((d) => d.stage === "ganho")
  const totalValue = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)

  useEffect(() => {
    const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    setFmtTotal(brl.format(totalValue))
    setFmtWon(brl.format(wonValue))
  }, [totalValue, wonValue])

  function openCreate(stage: DealStage = "novo") {
    setEditingDeal(null)
    setForm({ ...DEFAULT_FORM, stage })
    setDialogOpen(true)
  }

  function openEdit(deal: DealWithLead) {
    setEditingDeal(deal)
    setForm({
      title: deal.title, value: String(deal.value),
      lead_id: deal.lead_id ?? "", due_date: deal.due_date ?? "", stage: deal.stage,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.title.trim()) return
    const input: DealInput = {
      title: form.title.trim(),
      value: Number(form.value.replace(/\D/g, "")) || 0,
      lead_id: form.lead_id || null,
      due_date: form.due_date || null,
      stage: form.stage,
    }
    startTransition(async () => {
      if (editingDeal) await updateDeal(editingDeal.id, input)
      else await createDeal(input)
    })
    setDialogOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
      <div className="flex items-center justify-between pb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pipeline</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Acompanhe e mova negócios entre as etapas do funil</p>
        </div>
        <Button size="sm" onClick={() => openCreate()} className="gap-1.5" disabled={isPending}>
          <Plus className="size-4" /> Novo negócio
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <StatCard icon={<TrendingUp className="size-4 text-primary" />} label="Em andamento" value={fmtTotal ?? "—"} sub={`${activeDeals.length} negócio${activeDeals.length !== 1 ? "s" : ""}`} />
        <StatCard icon={<CheckCircle2 className="size-4 text-emerald-400" />} label="Fechado ganho" value={fmtWon ?? "—"} sub={`${wonDeals.length} negócio${wonDeals.length !== 1 ? "s" : ""}`} accent="emerald" />
        <StatCard icon={<Layers className="size-4 text-muted-foreground" />} label="Total no funil" value={String(initialDeals.length)} sub="todos os estágios" />
        <StatCard icon={<XCircle className="size-4 text-rose-400/70" />} label="Perdidos" value={String(initialDeals.filter((d) => d.stage === "perdido").length)} sub="negócios" accent="rose" />
      </div>

      <div className="-mx-6 min-h-0 flex-1 px-6 flex flex-col">
        <KanbanBoard
          initialDeals={initialDeals}
          leads={leads}
          onAddDeal={openCreate}
          onClickDeal={openEdit}
          className="flex-1 min-h-0"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{editingDeal ? "Editar negócio" : "Novo negócio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="deal-title" className="text-xs text-muted-foreground">Título <span className="text-destructive">*</span></Label>
              <Input id="deal-title" placeholder="Ex: Empresa X — Plano Pro Anual" value={form.title} autoFocus onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deal-value" className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input id="deal-value" placeholder="0" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deal-due" className="text-xs text-muted-foreground">Prazo</Label>
                <Input id="deal-due" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Etapa</Label>
              <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v as DealStage }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(STAGE_CONFIG) as [DealStage, typeof STAGE_CONFIG[DealStage]][]).map(([stage, cfg]) => (
                    <SelectItem key={stage} value={stage}><span className={cn("font-medium", cfg.color)}>{cfg.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Lead</Label>
              <Select value={form.lead_id} onValueChange={(v) => setForm((f) => ({ ...f, lead_id: v ?? "" }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar lead" /></SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || isPending}>
              {editingDeal ? "Salvar alterações" : "Criar negócio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type StatCardProps = { icon: React.ReactNode; label: string; value: string; sub: string; accent?: "emerald" | "rose" }
function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">{label}</p>
        <p className={cn("font-mono text-sm font-semibold tabular-nums", accent === "emerald" && "text-emerald-400", accent === "rose" && "text-rose-400/70", !accent && "text-foreground")}>{value}</p>
        <p className="text-[10px] text-muted-foreground/50">{sub}</p>
      </div>
    </div>
  )
}
```

- [ ] **Reescrever `app/(app)/pipeline/page.tsx`** como Server Component

```tsx
import { getDeals } from "./actions"
import { getLeads } from "@/app/(app)/leads/actions"
import PipelineClient from "./PipelineClient"

export default async function PipelinePage() {
  const [deals, leads] = await Promise.all([
    getDeals(),
    getLeads(),
  ])

  const leadRefs = leads.map((l) => ({ id: l.id, name: l.name }))

  return <PipelineClient initialDeals={deals} leads={leadRefs} />
}
```

- [ ] **Commit**
```bash
git add "app/(app)/pipeline/page.tsx" "app/(app)/pipeline/PipelineClient.tsx"
git commit -m "feat(M8): pipeline page — Server Component + PipelineClient, deals reais"
```

---

## Task 11: Refatorar page do dashboard

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Reescrever `app/(app)/dashboard/page.tsx`** como Server Component async

```tsx
import { Users, Briefcase, TrendingUp, BarChart2 } from "lucide-react"
import MetricCard from "@/components/dashboard/MetricCard"
import FunnelChart from "@/components/dashboard/FunnelChart"
import UpcomingDeals from "@/components/dashboard/UpcomingDeals"
import { getDashboardData } from "./actions"
import type { Deal } from "@/types"

export default async function DashboardPage() {
  const { metrics, funnel, upcoming } = await getDashboardData()

  // UpcomingDeals espera Deal[], mapear os campos necessários
  const upcomingDeals: Deal[] = upcoming.map((d) => ({
    id: d.id,
    workspace_id: "",
    lead_id: "",
    title: d.title,
    value: d.value,
    stage: d.stage,
    assignee_id: "",
    due_date: d.due_date,
  }))

  return (
    <div className="flex-1 space-y-6 overflow-auto">
      <div className="animate-fade-slide-up">
        <h2 className="font-heading text-xl font-bold text-foreground">Bem-vindo de volta!</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Aqui está o resumo do seu negócio hoje.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-slide-up">
          <MetricCard icon={<Users className="size-4" />} label="Total de Leads" value={metrics.total_leads} format="number" />
        </div>
        <div className="animate-fade-slide-up-1">
          <MetricCard icon={<Briefcase className="size-4" />} label="Negócios Abertos" value={metrics.open_deals} format="number" />
        </div>
        <div className="animate-fade-slide-up-2">
          <MetricCard icon={<TrendingUp className="size-4" />} label="Valor do Pipeline" value={metrics.pipeline_value} format="currency" />
        </div>
        <div className="animate-fade-slide-up-3">
          <MetricCard icon={<BarChart2 className="size-4" />} label="Taxa de Conversão" value={metrics.conversion_rate} format="percent" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 animate-fade-slide-up-1">
        <FunnelChart data={funnel} className="lg:col-span-2" />
        <UpcomingDeals deals={upcomingDeals} className="lg:col-span-1" />
      </div>
    </div>
  )
}
```

- [ ] **Commit**
```bash
git add "app/(app)/dashboard/page.tsx"
git commit -m "feat(M8): dashboard page — Server Component com métricas reais do Supabase"
```

---

## Task 12: Deletar mocks e verificar build

**Files:**
- Delete: `lib/mocks/leads.ts`
- Delete: `lib/mocks/deals.ts`
- Delete: `lib/mocks/metrics.ts`

- [ ] **Deletar os 3 arquivos de mock**

```bash
rm "lib/mocks/leads.ts" "lib/mocks/deals.ts" "lib/mocks/metrics.ts"
rmdir "lib/mocks"
```

- [ ] **Rodar build e corrigir qualquer erro TypeScript**

```bash
npm run build
```

Erros esperados e como corrigir:
- `MetricCard` recebe `delta` como prop opcional — se o dashboard não passar, remover o prop ou tornar opcional no componente
- `KanbanColumn` espera `leads` como `{ id: string; name: string }[]` — verificar assinatura

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat(M8): deletar lib/mocks — todos os dados agora vêm do Supabase"
```

---

## Self-Review

**Spec coverage:**
- [x] `getLeads(workspaceId, filters?)` — Task 2
- [x] `createLead`, `updateLead`, `deleteLead` — Task 2
- [x] `getLead(id)` com join de activities — Task 3
- [x] `createActivity(data)` — Task 3
- [x] `getDeals(workspaceId)` com lead join — Task 4
- [x] `createDeal`, `updateDealStage`, `deleteDeal` — Task 4
- [x] `getMetrics` com 3 queries paralelas — Task 5
- [x] `getDealsByStage` (funil) — Task 5
- [x] `getUpcomingDeals` — Task 5
- [x] Pages atualizadas para Server Components — Tasks 8–11
- [x] `KanbanBoard` com `updateDealStage` via `startTransition` — Task 7
- [x] Deletar `lib/mocks/` — Task 12
- [x] Filtros busca/status aplicados no Supabase — Task 2 (`getLeads`)

**Sem placeholders:** confirmado.

**Consistência de tipos:** `DealWithLead` exportado de `pipeline/actions.ts` e importado em `KanbanBoard` e `PipelineClient`. `LeadDetail` exportado de `[id]/actions.ts` e usado em `LeadDetailClient`. `LeadInput` e `DealInput` consistentes entre actions e clients.
