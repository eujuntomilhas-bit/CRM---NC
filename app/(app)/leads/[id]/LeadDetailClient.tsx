"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Building2, Mail, Phone, Pencil } from "lucide-react"
import LeadForm from "@/components/leads/LeadForm"
import ActivityForm from "@/components/leads/ActivityForm"
import ActivityTimeline from "@/components/leads/ActivityTimeline"
import { STATUS_CONFIG } from "@/components/leads/LeadCard"
import { updateLeadDetail, createActivity, type LeadDetail } from "./actions"
import type { Lead, Activity, ActivityType } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

type Props = { lead: LeadDetail }

// Único componente client para a página de detalhe — botão Editar e Atividades
// compartilham o mesmo isPending e useOptimistic.
export default function LeadDetailClient({ lead: initialLead }: Props) {
  const [lead, setLead] = useState(initialLead)
  const [formOpen, setFormOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [optimisticActivities, addOptimisticActivity] = useOptimistic(
    lead.activities,
    (state: Activity[], newActivity: Activity) => [newActivity, ...state]
  )

  async function handleSave(data: FormData) {
    startTransition(async () => {
      const result = await updateLeadDetail(lead.id, {
        name: data.name,
        email: data.email ?? "",
        phone: data.phone ?? "",
        company: data.company ?? "",
        role: data.role ?? "",
        status: data.status,
        estimated_value: data.estimated_value ?? 0,
        notes: data.notes ?? "",
      })
      if (!result?.error) {
        // Atualiza o estado local para refletir mudanças sem aguardar re-render do server
        setLead((prev) => ({ ...prev, ...data }))
      }
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

  const status = STATUS_CONFIG[lead.status]
  const initials = lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")

  return (
    <>
      {/* Perfil */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">{lead.name}</h2>
                <Badge className={`text-xs font-medium border-0 ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
              {(lead.role || lead.company) && (
                <p className="text-sm text-muted-foreground">
                  {[lead.role, lead.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} disabled={isPending}>
            <Pencil className="mr-2 size-3.5" /> Editar
          </Button>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {lead.email && <InfoItem icon={Mail} label="E-mail" value={lead.email} />}
          {lead.phone && <InfoItem icon={Phone} label="Telefone" value={lead.phone} />}
          {lead.company && <InfoItem icon={Building2} label="Empresa" value={lead.company} />}
        </div>
      </div>

      {/* Atividades */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Atividades</h3>
        <ActivityForm onSave={handleNewActivity} />
        <Separator />
        <ActivityTimeline activities={optimisticActivities} />
      </div>

      <LeadForm
        open={formOpen}
        lead={lead}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        <Icon className="size-3" />{label}
      </p>
      <p className="text-sm font-medium text-foreground break-all">{value}</p>
    </div>
  )
}
