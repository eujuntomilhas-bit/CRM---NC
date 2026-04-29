"use server"

import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { DealStage } from "@/types"

export type DashboardMetrics = {
  total_leads: number
  open_deals: number
  pipeline_value: number
  conversion_rate: number
}

export type FunnelRow = {
  stage: DealStage
  label: string
  count: number
  value: number
}

export type UpcomingDeal = {
  id: string
  title: string
  value: number
  stage: DealStage
  due_date: string
}

export type DashboardData = {
  metrics: DashboardMetrics
  funnel: FunnelRow[]
  upcoming: UpcomingDeal[]
}

const STAGE_LABELS: Record<DealStage, string> = {
  novo: "Novo Lead",
  contato: "Contato",
  proposta: "Proposta",
  negociacao: "Negociação",
  ganho: "Ganho",
  perdido: "Perdido",
}

const FUNNEL_STAGES: DealStage[] = ["novo", "contato", "proposta", "negociacao", "ganho"]

export async function getDashboardData(): Promise<DashboardData> {
  const workspaceId = await getActiveWorkspaceId()

  const empty: DashboardData = {
    metrics: { total_leads: 0, open_deals: 0, pipeline_value: 0, conversion_rate: 0 },
    funnel: FUNNEL_STAGES.map((stage) => ({ stage, label: STAGE_LABELS[stage], count: 0, value: 0 })),
    upcoming: [],
  }
  if (!workspaceId) return empty

  const supabase = await createClient()

  const today = new Date().toISOString().split("T")[0]
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  const dueCutoff = sevenDaysFromNow.toISOString().split("T")[0]

  const [leadsResult, dealsResult, upcomingResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("deals")
      .select("id, stage, value")
      .eq("workspace_id", workspaceId) as Promise<{ data: { id: string; stage: DealStage; value: number }[] | null }>,
    supabase
      .from("deals")
      .select("id, title, value, stage, due_date")
      .eq("workspace_id", workspaceId)
      .not("stage", "in", "(ganho,perdido)")
      .gte("due_date", today)
      .lte("due_date", dueCutoff)
      .order("due_date", { ascending: true })
      .limit(10) as Promise<{ data: UpcomingDeal[] | null }>,
  ])

  const allDeals = dealsResult.data ?? []
  const activeDeals = allDeals.filter((d) => d.stage !== "ganho" && d.stage !== "perdido")
  const wonDeals = allDeals.filter((d) => d.stage === "ganho")

  const metrics: DashboardMetrics = {
    total_leads: leadsResult.count ?? 0,
    open_deals: activeDeals.length,
    pipeline_value: activeDeals.reduce((s, d) => s + Number(d.value ?? 0), 0),
    conversion_rate: allDeals.length > 0
      ? Math.round((wonDeals.length / allDeals.length) * 100)
      : 0,
  }

  const funnel: FunnelRow[] = FUNNEL_STAGES.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage)
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + Number(d.value ?? 0), 0),
    }
  })

  return {
    metrics,
    funnel,
    upcoming: upcomingResult.data ?? [],
  }
}
