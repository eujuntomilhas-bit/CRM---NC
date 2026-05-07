# Design Spec — Responsividade e Polish Visual (Aula 5.2)

**Branch:** `feat/deploy`  
**Data:** 2026-05-04  
**Escopo:** Responsividade mobile + loading skeletons + feedback de ações

---

## 1. Objetivo

Garantir que o CRM-NC funcione bem em telas de 375px+ e adicionar polish visual nas camadas de loading e feedback, sem tocar em lógica de negócio, auth, Stripe, CRUD ou schema.

---

## 2. Responsividade

### 2.1 Pipeline — Scroll horizontal mobile

**Problema atual:** `KanbanBoard` usa `flex` com 6 colunas de largura fixa. Em mobile as colunas ficam espremidas ou quebram o layout.

**Solução:** Wrapper com `overflow-x-auto` + `snap-x snap-mandatory` para que cada coluna "encaixe" ao parar o scroll. Colunas mantêm `w-64 shrink-0`. Drag-and-drop continua funcional entre colunas visíveis — o `@dnd-kit` já suporta scroll durante drag.

**Breakpoint:** abaixo de `md` (768px) o wrapper ativa scroll; em `md+` mantém o comportamento atual de flex expansível.

**Mudanças:**
- `components/pipeline/KanbanBoard.tsx` — adiciona wrapper de scroll mobile
- `components/pipeline/KanbanColumn.tsx` — garante `shrink-0` e largura mínima

### 2.2 Dashboard — Grid de métricas

**Problema atual:** `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` pula o breakpoint `md`, deixando 2 colunas até 1280px.

**Solução:** Mudar para `grid-cols-2 md:grid-cols-2 lg:grid-cols-4` — 2 colunas desde 375px, 4 a partir de `lg` (1024px). Mais natural em tablets.

**Mudanças:**
- `app/(app)/dashboard/page.tsx` — ajustar classe do grid

### 2.3 Leads — Lista em mobile

**Problema atual:** `LeadCard` exibe email e telefone em linha, trunca mal em 375px.

**Solução:** Em mobile, empilhar email/telefone verticalmente (`flex-col sm:flex-row`). Botões de ação (editar/deletar) ficam compactos mas sempre visíveis.

**Mudanças:**
- `components/leads/LeadCard.tsx` — ajuste de flex direction nos metadados

### 2.4 Settings — Layout em mobile

**Problema atual:** Seções de settings sem padding adequado em telas pequenas.

**Solução:** Padding responsivo `p-4 md:p-6`, formulários com `max-w-full` em mobile.

**Mudanças:**
- `app/(app)/settings/page.tsx` — ajuste de padding e largura

### 2.5 TopBar mobile

**Problema atual:** A `TopBar` está com `hidden md:flex` no layout — em mobile só aparece a `MobileSidebar`. Isso é correto. Não precisa mudar.

---

## 3. Loading Skeletons

Usar o componente `Skeleton` já disponível no shadcn/ui (`components/ui/skeleton`).

### 3.1 Dashboard skeleton

Criar `components/dashboard/DashboardSkeleton.tsx`:
- 4 cards de métrica com skeleton (ícone + label + valor)
- 2 blocos: funil (col-span-2) + upcoming (col-span-1)
- Usado como `loading.tsx` da rota `/dashboard`

### 3.2 Leads skeleton

Criar `components/leads/LeadsSkeleton.tsx`:
- Header com título + botão fantasma
- 5 linhas de LeadCard skeleton (avatar + 3 linhas de texto)
- Usado como `loading.tsx` da rota `/leads`

### 3.3 Pipeline skeleton

Criar `components/pipeline/PipelineSkeleton.tsx`:
- Header + 4 stat cards skeleton
- 3 colunas kanban com 2-3 cards cada
- Usado como `loading.tsx` da rota `/pipeline`

### Padrão de implementação

Cada skeleton usa apenas o componente `<Skeleton />` do shadcn com classes `animate-pulse`. Nenhuma dependência nova. Arquivos `loading.tsx` do Next.js App Router — carregam automaticamente durante o fetch de Server Components.

---

## 4. Feedback de Ações

### 4.1 Toasts atuais

O projeto já usa `sonner` com `toast.error()`. Vamos enriquecer com `toast.success()` em todas as ações de escrita que atualmente não confirmam sucesso visualmente.

### 4.2 Ações que ganham toast.success

| Ação | Mensagem |
|------|----------|
| Criar lead | "Lead criado com sucesso" |
| Atualizar lead | "Lead atualizado" |
| Deletar lead | "Lead removido" |
| Criar deal | "Negócio criado" |
| Atualizar deal | "Negócio atualizado" |
| Mover deal (drag) | Sem toast — feedback visual do kanban é suficiente |
| Salvar nome do workspace | "Nome atualizado" |
| Remover membro | "Membro removido" |
| Cancelar convite | "Convite cancelado" |
| Criar atividade | "Atividade registrada" |

### 4.3 Onde adicionar

- `app/(app)/leads/LeadsClient.tsx` — `handleSave` e `handleDelete`
- `app/(app)/pipeline/PipelineClient.tsx` — `handleSave`
- `app/(app)/leads/[id]/LeadDetailClient.tsx` — atividade e update do lead
- `components/settings/WorkspaceNameForm.tsx` — submit
- `components/settings/MemberActions.tsx` — remover e cancelar

---

## 5. O que NÃO muda

- Lógica de negócio, Server Actions, queries Supabase
- Sistema de cores e tokens CSS
- Componentes shadcn/ui (não editar `components/ui/`)
- Drag-and-drop — apenas wrapper de scroll ao redor
- Auth, Stripe, webhook, migrations

---

## 6. Ordem de implementação

1. Pipeline scroll horizontal (impacto estrutural, testar primeiro)
2. Ajustes de grid/padding nas demais telas
3. Loading skeletons (arquivos `loading.tsx`)
4. Toasts de sucesso nas ações
5. Build + commit
