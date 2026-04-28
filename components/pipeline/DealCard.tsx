"use client"

import { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, CalendarDays, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

const ASSIGNEE_COLORS: Record<string, string> = {
  u1: "bg-violet-500/20 text-violet-300",
  u2: "bg-sky-500/20 text-sky-300",
  u3: "bg-amber-500/20 text-amber-300",
}

// All Intl/Date formatting happens only after mount to prevent hydration mismatch.
// The server renders neutral placeholders; the client fills them in useEffect.
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
      const diff =
        (new Date(deal.due_date + "T00:00:00").getTime() - Date.now()) / 86400000
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

function CardBody({
  deal,
  leads,
  users,
  accentClass = "border-l-primary/60",
  isDragging = false,
  overlay = false,
  dragHandleProps,
  nodeRef,
  style,
  onClick,
}: DealCardProps & {
  isDragging?: boolean
  overlay?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  nodeRef?: (node: HTMLElement | null) => void
  style?: React.CSSProperties
}) {
  const isDraggable = !!dragHandleProps
  const lead = leads.find((l) => l.id === deal.lead_id)
  const assignee = users.find((u) => u.id === deal.assignee_id)
  const initials =
    assignee?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?"
  const avatarColor =
    ASSIGNEE_COLORS[deal.assignee_id] ?? "bg-muted text-muted-foreground"

  const clientData = useClientFormatted(deal)

  return (
    <div
      ref={nodeRef}
      style={style}
      {...dragHandleProps}
      className={cn(
        "group relative flex flex-col gap-2.5 rounded-lg border border-l-2 bg-card p-3.5",
        "select-none transition-all duration-150 ease-out",
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        accentClass,
        !isDragging && !overlay && [
          "hover:-translate-y-1",
          "hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.5)]",
        ],
        isDragging && !overlay && "opacity-30 scale-[0.97] shadow-none",
        overlay && [
          "shadow-[0_16px_48px_-8px_rgba(0,0,0,0.6)]",
          "ring-1 ring-primary/40",
          "rotate-[0.8deg] scale-[1.03]",
        ],
      )}
      onClick={() => onClick(deal)}
    >
      {isDraggable && (
        <div
          className={cn(
            "absolute right-2 top-2 hidden",
            "rounded p-0.5 text-muted-foreground/30",
            "group-hover:flex",
          )}
        >
          <GripVertical className="size-3.5" />
        </div>
      )}

      <p className="pr-5 text-[13px] font-medium leading-snug text-foreground line-clamp-2">
        {deal.title}
      </p>

      {/* Value: server renders neutral dash, client fills after mount */}
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

      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Due date: only rendered client-side, invisible placeholder on server */}
        {clientData?.due ? (
          <span className={cn("flex items-center gap-1 text-[11px] tabular-nums font-medium", clientData.due.cls)}>
            {clientData.due.overdue
              ? <AlertCircle className="size-3 shrink-0" />
              : <CalendarDays className="size-3 shrink-0" />
            }
            {clientData.due.label}
          </span>
        ) : (
          <span className="h-4 w-0" />
        )}

        {assignee && (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden text-[11px] text-muted-foreground/50 group-hover:inline">
              {assignee.name.split(" ")[0]}
            </span>
            <Avatar className={cn("size-5 rounded-full", avatarColor)}>
              <AvatarFallback className={cn("rounded-full text-[9px] font-bold", avatarColor)}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  )
}

// Sortable card — used inside SortableContext in each column
export default function DealCard(props: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.deal.id })

  return (
    <CardBody
      {...props}
      nodeRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  )
}

// Static overlay — used in DragOverlay (no useSortable, no SortableContext needed)
export function DealCardOverlay(props: DealCardProps) {
  return <CardBody {...props} overlay />
}
