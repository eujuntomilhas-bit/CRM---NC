"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CalendarDays, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Deal, DealStage } from "@/types"

const TODAY = new Date("2026-04-27")

const STAGE_LABELS: Record<DealStage, string> = {
  novo:        "Novo Lead",
  contato:     "Contato",
  proposta:    "Proposta",
  negociacao:  "Negociação",
  ganho:       "Ganho",
  perdido:     "Perdido",
}

const STAGE_COLORS: Record<DealStage, string> = {
  novo:        "bg-slate-500/20 text-slate-400",
  contato:     "bg-blue-500/20 text-blue-400",
  proposta:    "bg-amber-500/20 text-amber-400",
  negociacao:  "bg-orange-500/20 text-orange-400",
  ganho:       "bg-emerald-500/20 text-emerald-400",
  perdido:     "bg-rose-500/20 text-rose-400/80",
}

type RowProps = { deal: Deal }

function DealRow({ deal }: RowProps) {
  const [fmtValue, setFmtValue] = useState<string | null>(null)
  const [dueInfo, setDueInfo] = useState<{ label: string; diff: number } | null>(null)

  useEffect(() => {
    setFmtValue(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(deal.value)
    )
    if (deal.due_date) {
      const due = new Date(deal.due_date + "T00:00:00")
      const diff = Math.round((due.getTime() - TODAY.getTime()) / 86400000)
      const label = due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      setDueInfo({ label, diff })
    }
  }, [deal.value, deal.due_date])

  const isOverdue = dueInfo !== null && dueInfo.diff < 0
  const isUrgent = dueInfo !== null && dueInfo.diff >= 0 && dueInfo.diff <= 3

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]">
      {/* Stage badge */}
      <span
        className={cn(
          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
          STAGE_COLORS[deal.stage],
        )}
      >
        {STAGE_LABELS[deal.stage]}
      </span>

      {/* Title */}
      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground/90">
        {deal.title}
      </p>

      {/* Value */}
      <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground/70">
        {fmtValue ?? "—"}
      </span>

      {/* Due date */}
      {dueInfo && (
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 text-[11px] tabular-nums font-medium",
            isOverdue && "text-destructive",
            isUrgent && "text-yellow-400",
            !isOverdue && !isUrgent && "text-muted-foreground/50",
          )}
        >
          {isOverdue
            ? <AlertCircle className="size-3 shrink-0" />
            : isUrgent
            ? <Clock className="size-3 shrink-0" />
            : <CalendarDays className="size-3 shrink-0" />
          }
          {dueInfo.label}
        </span>
      )}
    </div>
  )
}

type Props = {
  deals: Deal[]
  className?: string
}

export default function UpcomingDeals({ deals, className }: Props) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">Negócios com Prazo Próximo</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">Próximos 30 dias</p>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-sm text-muted-foreground/50">Nenhum negócio com prazo próximo</p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {deals.map((deal) => (
            <DealRow key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
