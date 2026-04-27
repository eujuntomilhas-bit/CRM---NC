"use client"

import { useState, useRef } from "react"
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
import { mockDeals } from "@/lib/mocks/deals"
import { mockLeads, MOCK_USERS } from "@/lib/mocks/leads"
import type { Deal, DealStage } from "@/types"

// ssr:false keeps the entire DnD tree (useSortable/useDroppable attrs) out of SSR
const KanbanColumn = dynamic(() => import("./KanbanColumn"), { ssr: false })

const STAGES = Object.keys(STAGE_CONFIG) as DealStage[]

// Prefer column droppables so empty columns always register.
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
  onAddDeal: (stage: DealStage) => void
  onClickDeal: (deal: Deal) => void
  externalDeals?: Deal[]
  onDealsChange?: (deals: Deal[]) => void
  className?: string
}

export default function KanbanBoard({
  onAddDeal,
  onClickDeal,
  externalDeals,
  onDealsChange,
  className,
}: Props) {
  // Use internal state when no external deals provided
  const [internalDeals, setInternalDeals] = useState<Deal[]>(mockDeals)

  // The active deal list: external when provided, internal otherwise
  const deals = externalDeals ?? internalDeals

  // Sync ref immediately during render (not in useEffect) so drag handlers
  // always read the most recent deals without async lag
  const dealsRef = useRef<Deal[]>(deals)
  dealsRef.current = deals

  function updateDeals(next: Deal[]) {
    if (onDealsChange) onDealsChange(next)
    else setInternalDeals(next)
  }

  const [activeId, setActiveId] = useState<string | null>(null)
  const activeDeal = deals.find((d) => d.id === activeId) ?? null
  const activeStage = activeDeal?.stage

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  // Move card to target column in real time while dragging over it.
  // Reads dealsRef so it always has the current list even mid-drag.
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

    updateDeals(current.map((d) => (d.id === dragId ? { ...d, stage: targetStage } : d)))
  }

  // Reorder within same column; cross-column move was done in onDragOver.
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

    // Only reorder if dropped on a card in the same column
    if (!targetStage || targetStage !== dragged.stage) return
    if (dragId === overId) return

    const stageDeals = current.filter((d) => d.stage === targetStage)
    const oldIdx = stageDeals.findIndex((d) => d.id === dragId)
    const newIdx = stageDeals.findIndex((d) => d.id === overId)
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

    updateDeals([
      ...current.filter((d) => d.stage !== targetStage),
      ...arrayMove(stageDeals, oldIdx, newIdx),
    ])
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
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={deals.filter((d) => d.stage === stage)}
            leads={mockLeads}
            users={MOCK_USERS}
            onAddDeal={onAddDeal}
            onClickDeal={onClickDeal}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDeal && (
          <DealCardOverlay
            deal={activeDeal}
            leads={mockLeads}
            users={MOCK_USERS}
            onClick={() => {}}
            accentClass={activeStage ? STAGE_CONFIG[activeStage].border : undefined}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
