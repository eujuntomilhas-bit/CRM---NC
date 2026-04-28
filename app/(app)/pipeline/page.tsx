"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, Layers, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import KanbanBoard from "@/components/pipeline/KanbanBoard"
import { STAGE_CONFIG } from "@/components/pipeline/KanbanColumn"
import { mockLeads, MOCK_USERS } from "@/lib/mocks/leads"
import { mockDeals } from "@/lib/mocks/deals"
import type { Deal, DealStage } from "@/types"
import { cn } from "@/lib/utils"

type DealForm = {
  title: string
  value: string
  lead_id: string
  assignee_id: string
  due_date: string
  stage: DealStage
}

const DEFAULT_FORM: DealForm = {
  title: "",
  value: "",
  lead_id: "",
  assignee_id: "",
  due_date: "",
  stage: "novo",
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<DealForm>(DEFAULT_FORM)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)

  const activeDeals = deals.filter((d) => d.stage !== "ganho" && d.stage !== "perdido")
  const wonDeals = deals.filter((d) => d.stage === "ganho")
  const totalValue = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)

  // Format client-side only — Intl.NumberFormat output differs between Node and browser
  const [fmtTotal, setFmtTotal] = useState<string | null>(null)
  const [fmtWon, setFmtWon] = useState<string | null>(null)
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

  function openEdit(deal: Deal) {
    setEditingDeal(deal)
    setForm({
      title: deal.title,
      value: String(deal.value),
      lead_id: deal.lead_id,
      assignee_id: deal.assignee_id,
      due_date: deal.due_date,
      stage: deal.stage,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.title.trim()) return
    const payload: Omit<Deal, "id" | "workspace_id"> = {
      title: form.title.trim(),
      value: Number(form.value.replace(/\D/g, "")) || 0,
      lead_id: form.lead_id,
      assignee_id: form.assignee_id,
      due_date: form.due_date,
      stage: form.stage,
    }
    if (editingDeal) {
      setDeals((prev) =>
        prev.map((d) => (d.id === editingDeal.id ? { ...d, ...payload } : d))
      )
    } else {
      const newDeal: Deal = {
        ...payload,
        id: `d${Date.now()}`,
        workspace_id: "w1",
      }
      setDeals((prev) => [newDeal, ...prev])
    }
    setDialogOpen(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between pb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pipeline</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Acompanhe e mova negócios entre as etapas do funil
          </p>
        </div>
        <Button size="sm" onClick={() => openCreate()} className="gap-1.5">
          <Plus className="size-4" />
          Novo negócio
        </Button>
      </div>

      {/* ── Summary strip ── */}
      <div className="mb-5 flex flex-wrap gap-2">
        <StatCard
          icon={<TrendingUp className="size-4 text-primary" />}
          label="Em andamento"
          value={fmtTotal ?? "—"}
          sub={`${activeDeals.length} negócio${activeDeals.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          icon={<CheckCircle2 className="size-4 text-emerald-400" />}
          label="Fechado ganho"
          value={fmtWon ?? "—"}
          sub={`${wonDeals.length} negócio${wonDeals.length !== 1 ? "s" : ""}`}
          accent="emerald"
        />
        <StatCard
          icon={<Layers className="size-4 text-muted-foreground" />}
          label="Total no funil"
          value={String(deals.length)}
          sub="todos os estágios"
        />
        <StatCard
          icon={<XCircle className="size-4 text-rose-400/70" />}
          label="Perdidos"
          value={String(deals.filter((d) => d.stage === "perdido").length)}
          sub="negócios"
          accent="rose"
        />
      </div>

      {/* ── Board ── */}
      <div className="-mx-6 min-h-0 flex-1 px-6 flex flex-col">
        <KanbanBoard
          externalDeals={deals}
          onDealsChange={setDeals}
          onAddDeal={openCreate}
          onClickDeal={openEdit}
          className="flex-1 min-h-0"
        />
      </div>

      {/* ── Dialog criar / editar ── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          if (!v) setDialogOpen(false)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingDeal ? "Editar negócio" : "Novo negócio"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="deal-title" className="text-xs text-muted-foreground">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deal-title"
                placeholder="Ex: Empresa X — Plano Pro Anual"
                value={form.title}
                autoFocus
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Value + Due date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deal-value" className="text-xs text-muted-foreground">
                  Valor (R$)
                </Label>
                <Input
                  id="deal-value"
                  placeholder="0"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deal-due" className="text-xs text-muted-foreground">
                  Prazo
                </Label>
                <Input
                  id="deal-due"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            {/* Stage */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Etapa</Label>
              <Select
                value={form.stage}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, stage: v as DealStage }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(STAGE_CONFIG) as [
                      DealStage,
                      (typeof STAGE_CONFIG)[DealStage],
                    ][]
                  ).map(([stage, cfg]) => (
                    <SelectItem key={stage} value={stage}>
                      <span className={cn("font-medium", cfg.color)}>{cfg.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lead */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Lead</Label>
              <Select
                value={form.lead_id}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, lead_id: v ?? "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar lead" />
                </SelectTrigger>
                <SelectContent>
                  {mockLeads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                      {lead.company && (
                        <span className="text-muted-foreground"> — {lead.company}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Responsável</Label>
              <Select
                value={form.assignee_id}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, assignee_id: v ?? "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar responsável" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_USERS.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              {editingDeal ? "Salvar alterações" : "Criar negócio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Local sub-component ── */
type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent?: "emerald" | "rose"
}

function StatCard({ icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
        <p
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            accent === "emerald" && "text-emerald-400",
            accent === "rose" && "text-rose-400/70",
            !accent && "text-foreground",
          )}
        >
          {value}
        </p>
        <p className="text-[10px] text-muted-foreground/50">{sub}</p>
      </div>
    </div>
  )
}
