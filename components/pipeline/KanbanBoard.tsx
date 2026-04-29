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
import type { Deal, DealStage, Lead } from "@/types"
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

type Props = {
  initialDeals: DealWithLead[]
  leads: Pick<Lead, "id" | "name">[]
  onAddDeal: (stage: DealStage) => void
  onClickDeal: (deal: DealWithLead) => void
  className?: string
}

export default function KanbanBoard({
  initialDeals,
  leads,
  onAddDeal,
  onClickDeal,
  className,
}: Props) {
  const [deals, setDeals] = useState<DealWithLead[]>(initialDeals)
  const [, startTransition] = useTransition()

  const dealsRef = useRef<DealWithLead[]>(deals)
  dealsRef.current = deals

  // Guarda o stage original no início do drag, antes de handleDragOver mutar o estado.
  // Sem isso, dragged.stage em handleDragEnd já reflete o destino e a persistência nunca dispara.
  const originalStageRef = useRef<DealStage | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeDeal = deals.find((d) => d.id === activeId) ?? null
  const activeStage = activeDeal?.stage

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
    const deal = dealsRef.current.find((d) => d.id === active.id)
    originalStageRef.current = deal?.stage ?? null
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
    const originalStage = originalStageRef.current
    originalStageRef.current = null

    if (!over || !originalStage) return

    const current = dealsRef.current
    const dragId = active.id as string
    const overId = over.id as string

    const dragged = current.find((d) => d.id === dragId)
    if (!dragged) return

    const targetStage: DealStage | undefined = STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : current.find((d) => d.id === overId)?.stage

    if (!targetStage) return

    // Cross-column: o estado local já foi atualizado pelo handleDragOver.
    // Compara com o stage ORIGINAL (não o atual) para detectar mudança real.
    if (targetStage !== originalStage) {
      startTransition(() => { updateDealStage(dragId, targetStage) })
      return
    }

    // Same-column reorder
    if (dragId === overId) return
    const stageDeals = current.filter((d) => d.stage === targetStage)
    const oldIdx = stageDeals.findIndex((d) => d.id === dragId)
    const newIdx = stageDeals.findIndex((d) => d.id === overId)
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

    setDeals([
      ...current.filter((d) => d.stage !== targetStage),
      ...arrayMove(stageDeals, oldIdx, newIdx),
    ])
  }

  const leadsAsFull = leads.map((l) => ({
    id: l.id,
    name: l.name,
    workspace_id: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    status: "novo" as const,
    assignee_id: "",
    estimated_value: 0,
    notes: "",
    created_at: "",
  })) satisfies Lead[]

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
              leads={leadsAsFull}
              users={[]}
              onAddDeal={onAddDeal}
              onClickDeal={(deal) => onClickDeal(deal as unknown as DealWithLead)}
            />
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDeal && (
          <DealCardOverlay
            deal={activeDeal as unknown as Deal}
            leads={leadsAsFull}
            users={[]}
            onClick={() => {}}
            accentClass={activeStage ? STAGE_CONFIG[activeStage].border : undefined}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
