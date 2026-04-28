import { mockDeals } from "./deals"
import { mockLeads } from "./leads"
import type { DealStage } from "@/types"

const TODAY = new Date("2026-04-27")

// ── Derived from existing mocks for consistency ──────────────────────────────

const activeDeals = mockDeals.filter((d) => d.stage !== "ganho" && d.stage !== "perdido")
const wonDeals = mockDeals.filter((d) => d.stage === "ganho")

export const mockMetrics = {
  total_leads: mockLeads.length,
  open_deals: activeDeals.length,
  pipeline_value: activeDeals.reduce((s, d) => s + d.value, 0),
  conversion_rate: Math.round((wonDeals.length / mockDeals.length) * 100),
  // month-over-month deltas (positive = growth)
  leads_delta: +12,
  deals_delta: +3,
  pipeline_delta: +18,
  conversion_delta: -2,
}

// ── Funnel data: count + value per stage ─────────────────────────────────────

type FunnelRow = { stage: DealStage; label: string; count: number; value: number }

const STAGE_LABELS: Record<DealStage, string> = {
  novo: "Novo Lead",
  contato: "Contato",
  proposta: "Proposta",
  negociacao: "Negociação",
  ganho: "Ganho",
  perdido: "Perdido",
}

const FUNNEL_STAGES: DealStage[] = ["novo", "contato", "proposta", "negociacao", "ganho"]

export const mockFunnel: FunnelRow[] = FUNNEL_STAGES.map((stage) => {
  const deals = mockDeals.filter((d) => d.stage === stage)
  return {
    stage,
    label: STAGE_LABELS[stage],
    count: deals.length,
    value: deals.reduce((s, d) => s + d.value, 0),
  }
})

// ── Upcoming deals: due within 30 days, active stages only ───────────────────

export const mockUpcomingDeals = mockDeals
  .filter((d) => {
    if (d.stage === "ganho" || d.stage === "perdido") return false
    if (!d.due_date) return false
    const due = new Date(d.due_date + "T00:00:00")
    const diffDays = (due.getTime() - TODAY.getTime()) / 86400000
    return diffDays <= 30
  })
  .sort((a, b) => {
    const da = new Date(a.due_date + "T00:00:00").getTime()
    const db = new Date(b.due_date + "T00:00:00").getTime()
    return da - db
  })
