import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import LeadsClient from "./LeadsClient"
import type { LeadRow } from "@/types/supabase"
import type { Lead, WorkspacePlan } from "@/types"

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    company: row.company ?? "",
    role: row.role ?? "",
    status: row.status,
    assignee_id: row.assignee_id ?? "",
    estimated_value: Number(row.estimated_value ?? 0),
    notes: row.notes ?? "",
    created_at: row.created_at,
  }
}

export default async function LeadsPage() {
  const workspaceId = await getActiveWorkspaceId()

  if (!workspaceId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum workspace encontrado.</p>
      </div>
    )
  }

  const supabase = await createClient()

  const [leadsResult, workspaceResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }) as Promise<{ data: LeadRow[] | null }>,
    supabase
      .from("workspaces")
      .select("plan")
      .eq("id", workspaceId)
      .single(),
  ])

  const leads = (leadsResult.data ?? []).map(rowToLead)
  const plan = (workspaceResult.data?.plan ?? "free") as WorkspacePlan

  return <LeadsClient initialLeads={leads} plan={plan} />
}
