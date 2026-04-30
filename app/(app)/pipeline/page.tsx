import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import PipelineClient from "./PipelineClient"
import type { DealWithLead } from "./actions"
import type { LeadRow, DealRow } from "@/types/supabase"
import type { Lead, DealStage } from "@/types"

type DealRowWithLead = DealRow & { leads: { name: string } | null }

export default async function PipelinePage() {
  const workspaceId = await getActiveWorkspaceId()

  if (!workspaceId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum workspace encontrado.</p>
      </div>
    )
  }

  const supabase = await createClient()

  // Uma única resolução de workspace — sem race condition entre queries paralelas
  const [dealsResult, leadsResult] = await Promise.all([
    supabase
      .from("deals")
      .select("id, workspace_id, lead_id, title, value, stage, assignee_id, due_date, created_at, leads(name)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }) as unknown as Promise<{ data: DealRowWithLead[] | null }>,
    supabase
      .from("leads")
      .select("id, name")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true }) as unknown as Promise<{ data: Pick<LeadRow, "id" | "name">[] | null }>,
  ])

  const deals: DealWithLead[] = (dealsResult.data ?? []).map((row) => ({
    id: row.id,
    workspace_id: row.workspace_id,
    lead_id: row.lead_id ?? "",
    title: row.title,
    value: Number(row.value ?? 0),
    stage: row.stage as DealStage,
    assignee_id: row.assignee_id ?? "",
    due_date: row.due_date ?? "",
    created_at: row.created_at,
    lead_name: row.leads?.name ?? null,
  }))

  const leadRefs = (leadsResult.data ?? []).map((l) => ({ id: l.id, name: l.name }))

  return <PipelineClient initialDeals={deals} leads={leadRefs} />
}
