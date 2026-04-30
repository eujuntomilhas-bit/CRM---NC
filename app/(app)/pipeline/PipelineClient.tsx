"use client"

import { useState, useTransition, useEffect } from "react"
import { Plus, TrendingUp, Layers, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import KanbanBoard from "@/components/pipeline/KanbanBoard"
import { STAGE_CONFIG } from "@/components/pipeline/KanbanColumn"
import {
  createDeal, updateDeal, type DealWithLead, type DealInput,
} from "./actions"
import type { Lead, DealStage } from "@/types"
import { cn } from "@/lib/utils"

type DealForm = {
  title: string
  value: string
  lead_id: string
  due_date: string
  stage: DealStage
}

const DEFAULT_FORM: DealForm = {
  title: "", value: "", lead_id: "", due_date: "", stage: "novo",
}

type Props = {
  initialDeals: DealWithLead[]
  leads: Pick<Lead, "id" | "name">[]
}

export default function PipelineClient({ initialDeals, leads }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<DealForm>(DEFAULT_FORM)
  const [editingDeal, setEditingDeal] = useState<DealWithLead | null>(null)
  const [isPending, startTransition] = useTransition()

  // Client-only BRL formatting to avoid hydration mismatch
  const [fmtTotal, setFmtTotal] = useState<string | null>(null)
  const [fmtWon, setFmtWon] = useState<string | null>(null)

  const activeDeals = initialDeals.filter((d) => d.stage !== "ganho" && d.stage !== "perdido")
  const wonDeals = initialDeals.filter((d) => d.stage === "ganho")
  const totalValue = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)

  useEffect(() => {
    const brl = new Intl.NumberFormat("pt-BR", {
      style: "currency", currency: "BRL", maximumFractionDigits: 0,
    })
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
      title: deal.title,
      value: String(deal.value),
      lead_id: deal.lead_id ?? "",
      due_date: deal.due_date ?? "",
      stage: deal.stage,
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
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pipeline</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Acompanhe e mova negócios entre as etapas do funil
          </p>
        </div>
        <Button size="sm" onClick={() => openCreate()} className="gap-1.5" disabled={isPending}>
          <Plus className="size-4" /> Novo negócio
        </Button>
      </div>

      {/* Stats */}
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
          value={String(initialDeals.length)}
          sub="todos os estágios"
        />
        <StatCard
          icon={<XCircle className="size-4 text-rose-400/70" />}
          label="Perdidos"
          value={String(initialDeals.filter((d) => d.stage === "perdido").length)}
          sub="negócios"
          accent="rose"
        />
      </div>

      {/* Board */}
      <div className="-mx-6 min-h-0 flex-1 px-6 flex flex-col">
        <KanbanBoard
          initialDeals={initialDeals}
          leads={leads}
          onAddDeal={openCreate}
          onClickDeal={openEdit}
          className="flex-1 min-h-0"
        />
      </div>

      {/* Dialog criar / editar — key força remontagem ao trocar entre criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setDialogOpen(false) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editingDeal ? "Editar negócio" : "Novo negócio"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="deal-value" className="text-xs text-muted-foreground">Valor (R$)</Label>
                <Input
                  id="deal-value"
                  placeholder="0"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deal-due" className="text-xs text-muted-foreground">Prazo</Label>
                <Input
                  id="deal-due"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Etapa</Label>
              <Select
                value={form.stage}
                onValueChange={(v) => setForm((f) => ({ ...f, stage: v as DealStage }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(STAGE_CONFIG) as [DealStage, typeof STAGE_CONFIG[DealStage]][]).map(
                    ([stage, cfg]) => (
                      <SelectItem key={stage} value={stage}>
                        <span className={cn("font-medium", cfg.color)}>{cfg.label}</span>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {leads.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Lead</Label>
                <Select
                  value={form.lead_id || "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, lead_id: v === "none" ? "" : (v ?? "") }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Nenhum lead</span>
                    </SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">{label}</p>
        <p className={cn(
          "font-mono text-sm font-semibold tabular-nums",
          accent === "emerald" && "text-emerald-400",
          accent === "rose" && "text-rose-400/70",
          !accent && "text-foreground",
        )}>{value}</p>
        <p className="text-[10px] text-muted-foreground/50">{sub}</p>
      </div>
    </div>
  )
}
