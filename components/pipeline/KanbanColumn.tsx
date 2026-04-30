"use client"

import { memo, useState, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import DealCard from "./DealCard"
import type { Deal, DealStage, Lead } from "@/types"

type MockUser = { id: string; name: string }

export const STAGE_CONFIG: Record<
  DealStage,
  {
    label: string
    color: string
    bg: string
    border: string
    glow: string
    barColor: string
  }
> = {
  novo: {
    label: "Novo Lead",
    color: "text-slate-400",
    bg: "bg-slate-500/[0.04]",
    border: "border-l-slate-500/50",
    glow: "ring-slate-500/25 border-slate-500/30 bg-slate-500/[0.07]",
    barColor: "bg-slate-400",
  },
  contato: {
    label: "Contato",
    color: "text-blue-400",
    bg: "bg-blue-500/[0.04]",
    border: "border-l-blue-500/60",
    glow: "ring-blue-500/25 border-blue-500/30 bg-blue-500/[0.07]",
    barColor: "bg-blue-400",
  },
  proposta: {
    label: "Proposta",
    color: "text-amber-400",
    bg: "bg-amber-500/[0.04]",
    border: "border-l-amber-500/60",
    glow: "ring-amber-500/25 border-amber-500/30 bg-amber-500/[0.07]",
    barColor: "bg-amber-400",
  },
  negociacao: {
    label: "Negociação",
    color: "text-orange-400",
    bg: "bg-orange-500/[0.04]",
    border: "border-l-orange-500/60",
    glow: "ring-orange-500/25 border-orange-500/30 bg-orange-500/[0.07]",
    barColor: "bg-orange-400",
  },
  ganho: {
    label: "Ganho",
    color: "text-emerald-400",
    bg: "bg-emerald-500/[0.04]",
    border: "border-l-emerald-500/60",
    glow: "ring-emerald-500/25 border-emerald-500/30 bg-emerald-500/[0.07]",
    barColor: "bg-emerald-400",
  },
  perdido: {
    label: "Perdido",
    color: "text-rose-400/70",
    bg: "bg-rose-500/[0.03]",
    border: "border-l-rose-500/40",
    glow: "ring-rose-500/20 border-rose-500/25 bg-rose-500/[0.06]",
    barColor: "bg-rose-400/60",
  },
}

const MAX_DEALS_VISUAL = 4

type Props = {
  stage: DealStage
  deals: Deal[]
  leads: Lead[]
  users: MockUser[]
  onAddDeal: (stage: DealStage) => void
  onClickDeal: (deal: Deal) => void
}

const KanbanColumn = memo(function KanbanColumn({
  stage,
  deals,
  leads,
  users,
  onAddDeal,
  onClickDeal,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const cfg = STAGE_CONFIG[stage]
  const totalValue = deals.reduce((s, d) => s + d.value, 0)
  const dealIds = deals.map((d) => d.id)
  const barWidth = Math.min(100, (deals.length / MAX_DEALS_VISUAL) * 100)

  const [formattedTotal, setFormattedTotal] = useState<string | null>(null)
  useEffect(() => {
    setFormattedTotal(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(totalValue)
    )
  }, [totalValue])

  return (
    <div className="flex min-h-0 w-full shrink-0 flex-col self-stretch">
      {/* Header */}
      <div className="mb-2.5 space-y-2 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn("text-[11px] font-semibold uppercase tracking-[0.08em]", cfg.color)}>
            {cfg.label}
          </h3>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
            {deals.length}
          </span>
        </div>

        <p className="font-mono text-sm font-semibold tabular-nums text-foreground/70">
          {formattedTotal ?? "—"}
        </p>

        {/* Progress bar — no transition during drag to avoid layout work */}
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={cn("h-full rounded-full", cfg.barColor)}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-1 flex-col rounded-xl border",
          cfg.bg,
          isOver
            ? cn("ring-1", cfg.glow)
            : "border-border/40",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]">
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                leads={leads}
                users={users}
                onClick={onClickDeal}
                accentClass={cfg.border}
              />
            ))}
          </SortableContext>
        </div>

        <button
          onClick={() => onAddDeal(stage)}
          className={cn(
            "flex w-full shrink-0 items-center gap-1.5 rounded-b-xl border-t border-border/20 px-3 py-2",
            "text-[11px] text-muted-foreground/40 transition-colors",
            "hover:bg-white/5 hover:text-muted-foreground/80",
          )}
        >
          <Plus className="size-3.5 shrink-0" />
          <span>Adicionar negócio</span>
        </button>
      </div>
    </div>
  )
})

export default KanbanColumn
