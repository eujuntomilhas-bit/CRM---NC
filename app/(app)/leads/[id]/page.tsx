import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getLead } from "./actions"
import LeadDetailClient from "./LeadDetailClient"

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getLead(id)
  if (!detail) notFound()

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <Link
        href="/leads"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" /> Voltar para leads
      </Link>

      {/* Uma única instância — gerencia botão Editar + seção Atividades com estado compartilhado */}
      <LeadDetailClient lead={detail} />
    </div>
  )
}
