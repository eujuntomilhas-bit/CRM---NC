"use client"

import { useState, useRef, useTransition, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { STAGE_CONFIG } from "./KanbanColumn"
import KanbanColumn from "./KanbanColumn"
import { updateDealStage } from "@/app/(app)/pipeline/actions"
import type { Deal, DealStage, Lead } from "@/types"
import type { DealWithLead } from "@/app/(app)/pipeline/actions"

const STAGES = Object.keys(STAGE_CONFIG) as DealStage[]

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

  const draggingRef = useRef(false)
  useEffect(() => {
    if (!draggingRef.current) setDeals(initialDeals)
  }, [initialDeals])

  const dealsRef = useRef<DealWithLead[]>(deals)
  dealsRef.current = deals
  const originalStageRef = useRef<DealStage | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Stable leads array — only recompute when leads prop changes
  const leadsAsFull = useMemo<Lead[]>(() =>
    leads.map((l) => ({
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
    })),
    [leads]
  )

  function handleDragStart({ active }: DragStartEvent) {
    draggingRef.current = true
    const deal = dealsRef.current.find((d) => d.id === active.id)
    originalStageRef.current = deal?.stage ?? null
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const dragId = active.id as string
    const overId = over.id as string
    const current = dealsRef.current

    const dragged = current.find((d) => d.id === dragId)
    if (!dragged) return

    const targetStage: DealStage | undefined = STAGES.includes(overId as DealStage)
      ? (overId as DealStage)
      : current.find((d) => d.id === overId)?.stage

    if (!targetStage || dragged.stage === targetStage) return

    setDeals((prev) => prev.map((d) => d.id === dragId ? { ...d, stage: targetStage } : d))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    draggingRef.current = false
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

    if (targetStage !== originalStage) {
      // Guarda snapshot para rollback se a persistência falhar
      const snapshot = dealsRef.current.map((d) => ({ ...d }))
      startTransition(async () => {
        const result = await updateDealStage(dragId, targetStage)
        if (result?.error) {
          // Reverte para o estado antes do drag
          setDeals(snapshot)
          console.error("[pipeline] updateDealStage falhou:", result.error)
        }
      })
      return
    }

    if (dragId === overId) return
    const stageDeals = current.filter((d) => d.stage === targetStage)
    const oldIdx = stageDeals.findIndex((d) => d.id === dragId)
    const newIdx = stageDeals.findIndex((d) => d.id === overId)
    if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

    setDeals((prev) => [
      ...prev.filter((d) => d.stage !== targetStage),
      ...arrayMove(stageDeals, oldIdx, newIdx),
    ])
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn(
        "flex min-h-0 gap-3 overflow-x-auto pb-4",
        "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]",
        className,
      )}>
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className="animate-fade-slide-up-safe flex min-h-0 shrink-0 flex-col"
            style={{ animationDelay: `${i * 60}ms`, width: 264 }}
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
    </DndContext>
  )
}
