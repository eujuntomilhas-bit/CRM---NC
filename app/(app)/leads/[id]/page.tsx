import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, Mail, Phone } from "lucide-react"
import { STATUS_CONFIG } from "@/components/leads/LeadCard"
import { getLead } from "./actions"
import LeadDetailClient from "./LeadDetailClient"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getLead(id)
  if (!detail) notFound()

  const status = STATUS_CONFIG[detail.status]
  const initials = detail.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <Link
        href="/leads"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" /> Voltar para leads
      </Link>

      {/* Perfil do lead */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">{detail.name}</h2>
                <Badge className={`text-xs font-medium border-0 ${status.className}`}>
                  {status.label}
                </Badge>
              </div>
              {(detail.role || detail.company) && (
                <p className="text-sm text-muted-foreground">
                  {[detail.role, detail.company].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          {/* Botão editar — client */}
          <LeadDetailClient lead={detail} />
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {detail.email && <InfoItem icon={Mail} label="E-mail" value={detail.email} />}
          {detail.phone && <InfoItem icon={Phone} label="Telefone" value={detail.phone} />}
          {detail.company && <InfoItem icon={Building2} label="Empresa" value={detail.company} />}
        </div>
      </div>

      {/* Atividades — client */}
      <LeadDetailClient lead={detail} activitiesSection />
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
