import { Users, Briefcase, TrendingUp, BarChart2 } from "lucide-react"
import MetricCard from "@/components/dashboard/MetricCard"
import FunnelChart from "@/components/dashboard/FunnelChart"
import UpcomingDeals from "@/components/dashboard/UpcomingDeals"
import { getDashboardData } from "./actions"
import type { Deal } from "@/types"

export default async function DashboardPage() {
  const { metrics, funnel, upcoming } = await getDashboardData()

  // UpcomingDeals espera Deal[] — mapear os campos mínimos necessários
  const upcomingDeals: Deal[] = upcoming.map((d) => ({
    id: d.id,
    workspace_id: "",
    lead_id: "",
    title: d.title,
    value: d.value,
    stage: d.stage,
    assignee_id: "",
    due_date: d.due_date,
    created_at: "",
  }))

  return (
    <div className="flex-1 space-y-6 overflow-auto">
      <div className="animate-fade-slide-up">
        <h2 className="font-heading text-xl font-bold text-foreground">Bem-vindo de volta!</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Aqui está o resumo do seu negócio hoje.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="animate-fade-slide-up">
          <MetricCard
            icon={<Users className="size-4" />}
            label="Total de Leads"
            value={metrics.total_leads}
            format="number"
          />
        </div>
        <div className="animate-fade-slide-up-1">
          <MetricCard
            icon={<Briefcase className="size-4" />}
            label="Negócios Abertos"
            value={metrics.open_deals}
            format="number"
          />
        </div>
        <div className="animate-fade-slide-up-2">
          <MetricCard
            icon={<TrendingUp className="size-4" />}
            label="Valor do Pipeline"
            value={metrics.pipeline_value}
            format="currency"
          />
        </div>
        <div className="animate-fade-slide-up-3">
          <MetricCard
            icon={<BarChart2 className="size-4" />}
            label="Taxa de Conversão"
            value={metrics.conversion_rate}
            format="percent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 animate-fade-slide-up-1">
        <FunnelChart data={funnel} className="lg:col-span-2" />
        <UpcomingDeals deals={upcomingDeals} className="lg:col-span-1" />
      </div>
    </div>
  )
}
