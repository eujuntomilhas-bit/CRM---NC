# Responsividade e Polish Visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir que o CRM-NC funcione bem em telas de 375px+ e adicionar loading skeletons e toasts de sucesso nas ações de escrita.

**Architecture:** Duas passadas na branch `feat/deploy`. Primeiro responsividade (mudanças estruturais de layout), depois polish (skeletons via `loading.tsx` do App Router + toasts `sonner`). Nenhuma lógica de negócio ou Server Action é alterada.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v4, shadcn/ui (`Skeleton`), sonner (`toast.success`)

---

## Mapa de arquivos

| Arquivo | Ação |
|---------|------|
| `components/pipeline/KanbanBoard.tsx` | Modificar — snap scroll mobile |
| `components/pipeline/KanbanColumn.tsx` | Modificar — largura mínima garantida |
| `app/(app)/dashboard/page.tsx` | Modificar — grid de métricas |
| `components/leads/LeadCard.tsx` | Modificar — metadados empilhados em mobile |
| `app/(app)/settings/page.tsx` | Modificar — padding responsivo |
| `components/dashboard/DashboardSkeleton.tsx` | Criar |
| `components/leads/LeadsSkeleton.tsx` | Criar |
| `components/pipeline/PipelineSkeleton.tsx` | Criar |
| `app/(app)/dashboard/loading.tsx` | Criar |
| `app/(app)/leads/loading.tsx` | Criar |
| `app/(app)/pipeline/loading.tsx` | Criar |
| `app/(app)/leads/LeadsClient.tsx` | Modificar — toasts de sucesso |
| `app/(app)/pipeline/PipelineClient.tsx` | Modificar — toasts de sucesso |
| `app/(app)/leads/[id]/LeadDetailClient.tsx` | Modificar — toasts de sucesso |

---

## Task 1: Pipeline — scroll horizontal mobile

**Files:**
- Modify: `components/pipeline/KanbanBoard.tsx`
- Modify: `components/pipeline/KanbanColumn.tsx`

- [ ] **Step 1: Adicionar snap scroll no wrapper do KanbanBoard**

Em `components/pipeline/KanbanBoard.tsx`, substituir as classes do `<div>` interno (linha 153-157):

```tsx
// DE:
<div className={cn(
  "flex min-h-0 gap-3 overflow-x-auto pb-4",
  "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]",
  className,
)}>

// PARA:
<div className={cn(
  "flex min-h-0 gap-3 overflow-x-auto pb-4",
  "snap-x snap-mandatory",
  "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]",
  className,
)}>
```

- [ ] **Step 2: Adicionar snap-start em cada coluna**

No mesmo arquivo, na `<div>` de cada coluna (linha 160-163), adicionar `snap-start`:

```tsx
// DE:
<div
  key={stage}
  className="animate-fade-slide-up-safe flex min-h-0 shrink-0 flex-col"
  style={{ animationDelay: `${i * 60}ms`, width: 264 }}
>

// PARA:
<div
  key={stage}
  className="animate-fade-slide-up-safe flex min-h-0 shrink-0 flex-col snap-start"
  style={{ animationDelay: `${i * 60}ms`, width: 264 }}
>
```

- [ ] **Step 3: Verificar KanbanColumn — garantir `min-w-[264px]`**

Em `components/pipeline/KanbanColumn.tsx`, linha 111, adicionar `min-w-[264px]`:

```tsx
// DE:
<div className="flex min-h-0 w-full shrink-0 flex-col self-stretch">

// PARA:
<div className="flex min-h-0 w-full min-w-[264px] shrink-0 flex-col self-stretch">
```

- [ ] **Step 4: Verificar visualmente**

Rodar `npm run dev`, abrir `http://localhost:3000/pipeline`, redimensionar browser para 375px e verificar que as colunas ficam com 264px cada e o scroll horizontal funciona com snap.

---

## Task 2: Dashboard — grid de métricas

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Ajustar breakpoints do grid**

Em `app/(app)/dashboard/page.tsx`, linha 19:

```tsx
// DE:
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

// PARA:
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
```

- [ ] **Step 2: Verificar em mobile**

Com dev server rodando, verificar em 375px que os 4 cards aparecem em 2 colunas de tamanho igual, e em 1024px+ aparecem em 4 colunas.

---

## Task 3: LeadCard — metadados responsivos

**Files:**
- Modify: `components/leads/LeadCard.tsx`

- [ ] **Step 1: Empilhar email/telefone em mobile**

Em `components/leads/LeadCard.tsx`, linhas 38-45, substituir os dois `<div>` de metadados:

```tsx
// DE:
<div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
  {lead.company && <span className="flex items-center gap-1"><Building2 className="size-3" />{lead.company}</span>}
  {lead.role && <span className="truncate">{lead.role}</span>}
</div>
<div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
  {lead.email && <span className="flex items-center gap-1"><Mail className="size-3" />{lead.email}</span>}
  {lead.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{lead.phone}</span>}
</div>

// PARA:
<div className="flex flex-col gap-y-0.5 sm:flex-row sm:flex-wrap sm:gap-x-4 text-xs text-muted-foreground">
  {lead.company && <span className="flex items-center gap-1"><Building2 className="size-3" />{lead.company}</span>}
  {lead.role && <span className="truncate">{lead.role}</span>}
</div>
<div className="flex flex-col gap-y-0.5 sm:flex-row sm:flex-wrap sm:gap-x-4 text-xs text-muted-foreground">
  {lead.email && <span className="flex items-center gap-1 truncate"><Mail className="size-3 shrink-0" /><span className="truncate">{lead.email}</span></span>}
  {lead.phone && <span className="flex items-center gap-1"><Phone className="size-3 shrink-0" />{lead.phone}</span>}
</div>
```

- [ ] **Step 2: Verificar em mobile**

Abrir `/leads` em 375px, confirmar que empresa/cargo e email/telefone empilham verticalmente sem truncar.

---

## Task 4: Settings — padding responsivo

**Files:**
- Modify: `app/(app)/settings/page.tsx`

- [ ] **Step 1: Localizar o wrapper principal de conteúdo**

Em `app/(app)/settings/page.tsx`, localizar o `<div>` raiz do conteúdo (após o `<BillingToast />`) e adicionar padding responsivo. Localizar a linha que contém `<Tabs` e seu wrapper, substituindo:

```tsx
// Localizar o div wrapper mais externo do conteúdo (geralmente com space-y-6 ou similar)
// e garantir:
<div className="flex-1 overflow-auto">
  <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-6">
```

Se o wrapper já existir com outra classe, ajustar apenas o padding para `p-4 md:p-6`.

- [ ] **Step 2: Verificar em mobile**

Abrir `/settings` em 375px, confirmar que o conteúdo tem padding lateral adequado e não encosta nas bordas da tela.

---

## Task 5: DashboardSkeleton + loading.tsx

**Files:**
- Create: `components/dashboard/DashboardSkeleton.tsx`
- Create: `app/(app)/dashboard/loading.tsx`

- [ ] **Step 1: Criar DashboardSkeleton**

Criar `components/dashboard/DashboardSkeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 overflow-auto">
      {/* Título */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>

      {/* Funil + upcoming */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar loading.tsx do dashboard**

Criar `app/(app)/dashboard/loading.tsx`:

```tsx
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton"

export default function DashboardLoading() {
  return <DashboardSkeleton />
}
```

---

## Task 6: LeadsSkeleton + loading.tsx

**Files:**
- Create: `components/leads/LeadsSkeleton.tsx`
- Create: `app/(app)/leads/loading.tsx`

- [ ] **Step 1: Criar LeadsSkeleton**

Criar `components/leads/LeadsSkeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function LeadsSkeleton() {
  return (
    <div className="flex-1 overflow-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Lead cards */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex gap-1 shrink-0">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar loading.tsx dos leads**

Criar `app/(app)/leads/loading.tsx`:

```tsx
import LeadsSkeleton from "@/components/leads/LeadsSkeleton"

export default function LeadsLoading() {
  return <LeadsSkeleton />
}
```

---

## Task 7: PipelineSkeleton + loading.tsx

**Files:**
- Create: `components/pipeline/PipelineSkeleton.tsx`
- Create: `app/(app)/pipeline/loading.tsx`

- [ ] **Step 1: Criar PipelineSkeleton**

Criar `components/pipeline/PipelineSkeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Stat cards */}
      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <Skeleton className="size-4 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex w-[264px] shrink-0 flex-col gap-2.5">
            <div className="space-y-2 px-0.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-6 rounded" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-[2px] w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border p-2">
              {Array.from({ length: i === 1 ? 3 : 2 }).map((_, j) => (
                <div key={j} className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Criar loading.tsx do pipeline**

Criar `app/(app)/pipeline/loading.tsx`:

```tsx
import PipelineSkeleton from "@/components/pipeline/PipelineSkeleton"

export default function PipelineLoading() {
  return <PipelineSkeleton />
}
```

---

## Task 8: Toasts de sucesso — LeadsClient

**Files:**
- Modify: `app/(app)/leads/LeadsClient.tsx`

- [ ] **Step 1: Adicionar toast.success no handleSave**

Em `app/(app)/leads/LeadsClient.tsx`, localizar `handleSave` (linha 78). Após `setFormOpen(false)` e dentro das transitions, adicionar toasts. Substituir os dois blocos de `startTransition` dentro de `handleSave`:

```tsx
if (id) {
  startTransition(async () => {
    updateOptimistic({ type: "update", id, data })
    const result = await updateLead(id, input)
    if (result.error) toast.error(result.error)
    else toast.success("Lead atualizado")
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
    const result = await createLead(input)
    if (result.error) toast.error(result.error)
    else toast.success("Lead criado com sucesso")
  })
}
```

- [ ] **Step 2: Adicionar toast.success no handleDelete**

Em `handleDelete` (linha 114), substituir o bloco de `startTransition`:

```tsx
async function handleDelete() {
  if (!deletingLead) return
  const id = deletingLead.id
  setDeletingLead(null)
  startTransition(async () => {
    updateOptimistic({ type: "delete", id })
    const result = await deleteLead(id)
    if (result.error) toast.error(result.error)
    else toast.success("Lead removido")
  })
}
```

---

## Task 9: Toasts de sucesso — PipelineClient

**Files:**
- Modify: `app/(app)/pipeline/PipelineClient.tsx`

- [ ] **Step 1: Adicionar toast import e toasts no handleSave**

Verificar se `toast` já está importado de `"sonner"`. Se não, adicionar no topo:
```tsx
import { toast } from "sonner"
```

Localizar `handleSave` (linha 81) e substituir o bloco `startTransition`:

```tsx
startTransition(async () => {
  if (editingDeal) {
    await updateDeal(editingDeal.id, input)
    toast.success("Negócio atualizado")
  } else {
    await createDeal(input)
    toast.success("Negócio criado")
  }
})
```

---

## Task 10: Toasts de sucesso — LeadDetailClient

**Files:**
- Modify: `app/(app)/leads/[id]/LeadDetailClient.tsx`

- [ ] **Step 1: Adicionar toast import**

No topo de `app/(app)/leads/[id]/LeadDetailClient.tsx`, adicionar:
```tsx
import { toast } from "sonner"
```

- [ ] **Step 2: Adicionar toast.success no handleSave**

Localizar `handleSave` (linha 32). Substituir o bloco interno:

```tsx
async function handleSave(data: FormData) {
  startTransition(async () => {
    const result = await updateLeadDetail(lead.id, {
      name: data.name,
      email: data.email ?? "",
      phone: data.phone ?? "",
      company: data.company ?? "",
      role: data.role ?? "",
      status: data.status,
      estimated_value: data.estimated_value ?? 0,
      notes: data.notes ?? "",
    })
    if (result?.error) {
      toast.error(result.error)
    } else {
      setLead((prev) => ({ ...prev, ...data }))
      toast.success("Lead atualizado")
    }
  })
  setFormOpen(false)
}
```

- [ ] **Step 3: Adicionar toast.success no handleNewActivity**

Localizar `handleNewActivity` (linha 52). Adicionar toast após sucesso:

```tsx
async function handleNewActivity(type: ActivityType, description: string) {
  const newActivity: Activity = {
    id: `temp-${Date.now()}`,
    workspace_id: lead.workspace_id,
    lead_id: lead.id,
    type,
    description,
    author_id: "",
    created_at: new Date().toISOString(),
  }
  startTransition(async () => {
    addOptimisticActivity(newActivity)
    const result = await createActivity(lead.id, type, description)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setLead((prev) => ({
        ...prev,
        activities: [newActivity, ...prev.activities],
      }))
      toast.success("Atividade registrada")
    }
  })
}
```

---

## Task 11: Build + commit final

**Files:** — (verificação)

- [ ] **Step 1: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem output (sem erros).

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Esperado: `✓ Compiled successfully` sem erros de tipo.

- [ ] **Step 3: Commit**

```bash
git add \
  components/pipeline/KanbanBoard.tsx \
  components/pipeline/KanbanColumn.tsx \
  components/pipeline/PipelineSkeleton.tsx \
  app/\(app\)/pipeline/loading.tsx \
  app/\(app\)/dashboard/page.tsx \
  components/dashboard/DashboardSkeleton.tsx \
  app/\(app\)/dashboard/loading.tsx \
  components/leads/LeadCard.tsx \
  components/leads/LeadsSkeleton.tsx \
  app/\(app\)/leads/loading.tsx \
  app/\(app\)/leads/LeadsClient.tsx \
  app/\(app\)/leads/\[id\]/LeadDetailClient.tsx \
  app/\(app\)/pipeline/PipelineClient.tsx \
  app/\(app\)/settings/page.tsx

git commit -m "feat(polish): responsividade mobile, loading skeletons e toasts de sucesso"
```
