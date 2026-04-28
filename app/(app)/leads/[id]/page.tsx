"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, Mail, Phone, Pencil } from "lucide-react"
import ActivityTimeline from "@/components/leads/ActivityTimeline"
import ActivityForm from "@/components/leads/ActivityForm"
import LeadForm from "@/components/leads/LeadForm"
import { mockLeads, mockActivities, MOCK_USERS } from "@/lib/mocks/leads"
import { STATUS_CONFIG } from "@/components/leads/LeadCard"
import type { Lead, Activity } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [lead, setLead] = useState<Lead | undefined>(() => mockLeads.find((l) => l.id === id))
  const [activities, setActivities] = useState<Activity[]>(
    () => mockActivities.filter((a) => a.lead_id === id)
  )
  const [formOpen, setFormOpen] = useState(false)

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link href="/leads" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="size-4" /> Voltar para leads
        </Link>
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">Lead não encontrado.</p>
        </div>
      </div>
    )
  }

  const status = STATUS_CONFIG[lead.status]
  const assignee = MOCK_USERS.find((u) => u.id === lead.assignee_id)
  const initials = lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")

  function handleSave(data: FormData) {
    setLead((prev) => prev ? { ...prev, ...data } : prev)
    setFormOpen(false)
  }

  function handleNewActivity(type: Activity["type"], description: string) {
    const newActivity: Activity = {
      id: `a${Date.now()}`,
      workspace_id: "w1",
      lead_id: id,
      type,
      description,
      author_id: "u1",
      created_at: new Date().toISOString(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <Link
        href="/leads"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" /> Voltar para leads
      </Link>

      {/* Cabeçalho do perfil */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">{lead.name}</h2>
                <Badge className={`text-xs font-medium border-0 ${status.className}`}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{lead.role} · {lead.company}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="mr-2 size-3.5" /> Editar
          </Button>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <InfoItem icon={Mail} label="E-mail" value={lead.email} />
          <InfoItem icon={Phone} label="Telefone" value={lead.phone || "—"} />
          <InfoItem icon={Building2} label="Empresa" value={lead.company} />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Responsável</p>
            <p className="text-sm font-medium text-foreground">{assignee?.name ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* Timeline de atividades */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Atividades</h3>
        <ActivityForm onSave={handleNewActivity} />
        <Separator />
        <ActivityTimeline activities={activities} />
      </div>

      <LeadForm
        open={formOpen}
        lead={lead}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </div>
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
