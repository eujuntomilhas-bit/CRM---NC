import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pencil, Trash2, Building2, Phone, Mail } from "lucide-react"
import type { Lead } from "@/types"
import { MOCK_USERS } from "@/lib/mocks/leads"

export const STATUS_CONFIG: Record<Lead["status"], { label: string; className: string }> = {
  novo:       { label: "Novo",       className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  contato:    { label: "Contato",    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  proposta:   { label: "Proposta",   className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  negociacao: { label: "Negociação", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  ganho:      { label: "Ganho",      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  perdido:    { label: "Perdido",    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
}

type Props = {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (lead: Lead) => void
}

export default function LeadCard({ lead, onEdit, onDelete }: Props) {
  const assignee = MOCK_USERS.find((u) => u.id === lead.assignee_id)
  const status = STATUS_CONFIG[lead.status]
  const initials = lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")

  return (
    <div className="glass-card flex items-start justify-between gap-4 rounded-xl p-4">
      <Link href={`/leads/${lead.id}`} className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground truncate">{lead.name}</span>
            <Badge className={`text-xs font-medium border-0 ${status.className}`}>{status.label}</Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="size-3" />{lead.company}</span>
            <span className="truncate">{lead.role}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Mail className="size-3" />{lead.email}</span>
            <span className="flex items-center gap-1"><Phone className="size-3" />{lead.phone}</span>
          </div>
          {assignee && (
            <p className="text-xs text-muted-foreground">Responsável: {assignee.name}</p>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(lead)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => onDelete(lead)}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
