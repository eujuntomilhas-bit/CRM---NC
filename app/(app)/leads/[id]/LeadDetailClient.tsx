"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Pencil } from "lucide-react"
import LeadForm from "@/components/leads/LeadForm"
import ActivityForm from "@/components/leads/ActivityForm"
import ActivityTimeline from "@/components/leads/ActivityTimeline"
import { updateLeadDetail, createActivity, type LeadDetail } from "./actions"
import type { Lead, Activity, ActivityType } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

type Props = {
  lead: LeadDetail
  activitiesSection?: boolean
}

export default function LeadDetailClient({ lead, activitiesSection }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [optimisticActivities, addOptimisticActivity] = useOptimistic(
    lead.activities,
    (state: Activity[], newActivity: Activity) => [newActivity, ...state]
  )

  async function handleSave(data: FormData) {
    startTransition(async () => {
      await updateLeadDetail(lead.id, {
        name: data.name,
        email: data.email ?? "",
        phone: data.phone ?? "",
        company: data.company ?? "",
        role: data.role ?? "",
        status: data.status,
        estimated_value: data.estimated_value ?? 0,
        notes: data.notes ?? "",
      })
    })
    setFormOpen(false)
  }

  async function handleNewActivity(type: ActivityType, description: string) {
    const temp: Activity = {
      id: `temp-${Date.now()}`,
      workspace_id: lead.workspace_id,
      lead_id: lead.id,
      type,
      description,
      author_id: "",
      created_at: new Date().toISOString(),
    }
    startTransition(async () => {
      addOptimisticActivity(temp)
      await createActivity(lead.id, type, description)
    })
  }

  if (activitiesSection) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Atividades</h3>
        <ActivityForm onSave={handleNewActivity} />
        <Separator />
        <ActivityTimeline activities={optimisticActivities} />
      </div>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} disabled={isPending}>
        <Pencil className="mr-2 size-3.5" /> Editar
      </Button>
      <LeadForm
        open={formOpen}
        lead={lead}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
