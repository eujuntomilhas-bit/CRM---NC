"use client"

import { memo, useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, CalendarDays, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Deal, Lead } from "@/types"

type MockUser = { id: string; name: string }

export type DealCardProps = {
  deal: Deal
  leads: Lead[]
  users: MockUser[]
  onClick: (deal: Deal) => void
  accentClass?: string
}

function useClientFormatted(deal: Deal) {
  const [formatted, setFormatted] = useState<{
    value: string
    due: { label: string; cls: string; overdue: boolean } | null
  } | null>(null)

  useEffect(() => {
    const brl = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    })

    let due: { label: string; cls: string; overdue: boolean } | null = null
    if (deal.due_date) {
      const diff = (new Date(deal.due_date + "T00:00:00").getTime() - Date.now()) / 86400000
      const label = new Date(deal.due_date + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
      if (diff < 0) {
        due = { label, cls: "bg-destructive/15 text-destructive rounded-md px-1.5 py-0.5", overdue: true }
      } else if (diff <= 3) {
        due = { label, cls: "bg-yellow-400/10 text-yellow-400 rounded-md px-1.5 py-0.5", overdue: false }
      } else {
        due = { label, cls: "text-muted-foreground/60", overdue: false }
      }
    }

    setFormatted({ value: brl.format(deal.value), due })
  }, [deal.value, deal.due_date])

  return formatted
}

const DealCard = memo(function DealCard(props: DealCardProps) {
  const { deal, leads, users, accentClass = "border-l-primary/60", onClick } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const lead = leads.find((l) => l.id === deal.lead_id)
  const clientData = useClientFormatted(deal)

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    // Promote to own layer during drag for GPU compositing
    willChange: isDragging ? "transform" : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(deal)}
      className={cn(
        "group relative flex cursor-grab flex-col gap-2.5 rounded-lg border border-l-2 bg-card p-3.5",
        "select-none",
        accentClass,
        isDragging
          ? "shadow-2xl ring-1 ring-primary/40 opacity-90 scale-[1.02]"
          : "hover:-translate-y-px hover:shadow-md active:cursor-grabbing",
      )}
    >
      <div className={cn(
        "absolute right-2 top-2 hidden rounded p-0.5 text-muted-foreground/30 group-hover:flex",
      )}>
        <GripVertical className="size-3.5" />
      </div>

      <p className="pr-5 text-[13px] font-medium leading-snug text-foreground line-clamp-2">
        {deal.title}
      </p>

      <p className="font-mono text-[15px] font-semibold tabular-nums text-foreground/90">
        {clientData?.value ?? "—"}
      </p>

      {lead && (
        <div className="flex items-center gap-1.5">
          <div className="size-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
          <p className="truncate text-xs text-muted-foreground">
            {lead.name}
            {lead.company && (
              <span className="text-muted-foreground/50"> · {lead.company}</span>
            )}
          </p>
        </div>
      )}

      {clientData?.due && (
        <div className="pt-0.5">
          <span className={cn("flex items-center gap-1 text-[11px] tabular-nums font-medium", clientData.due.cls)}>
            {clientData.due.overdue
              ? <AlertCircle className="size-3 shrink-0" />
              : <CalendarDays className="size-3 shrink-0" />
            }
            {clientData.due.label}
          </span>
        </div>
      )}
    </div>
  )
})

export default DealCard
