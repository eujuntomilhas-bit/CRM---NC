import { Users, Briefcase, TrendingUp, BarChart2 } from "lucide-react"
import MetricCard from "@/components/dashboard/MetricCard"
import FunnelChart from "@/components/dashboard/FunnelChart"
import UpcomingDeals from "@/components/dashboard/UpcomingDeals"
import { mockMetrics, mockFunnel, mockUpcomingDeals } from "@/lib/mocks/metrics"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 overflow-auto">
      {/* ── Page header ── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Bem-vindo de volta!</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Aqui está o resumo do seu negócio hoje.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Users className="size-4" />}
          label="Total de Leads"
          value={mockMetrics.total_leads}
          format="number"
          delta={mockMetrics.leads_delta}
          deltaLabel="vs. mês anterior"
        />
        <MetricCard
          icon={<Briefcase className="size-4" />}
          label="Negócios Abertos"
          value={mockMetrics.open_deals}
          format="number"
          delta={mockMetrics.deals_delta}
          deltaLabel="vs. mês anterior"
        />
        <MetricCard
          icon={<TrendingUp className="size-4" />}
          label="Valor do Pipeline"
          value={mockMetrics.pipeline_value}
          format="currency"
          delta={mockMetrics.pipeline_delta}
          deltaLabel="vs. mês anterior"
        />
        <MetricCard
          icon={<BarChart2 className="size-4" />}
          label="Taxa de Conversão"
          value={mockMetrics.conversion_rate}
          format="percent"
          delta={mockMetrics.conversion_delta}
          deltaLabel="vs. mês anterior"
        />
      </div>

      {/* ── Funnel + Upcoming deals ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FunnelChart data={mockFunnel} className="lg:col-span-2" />
        <UpcomingDeals deals={mockUpcomingDeals} className="lg:col-span-1" />
      </div>
    </div>
  )
}
