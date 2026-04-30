import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import LeadsClient from "./LeadsClient"
import type { LeadRow } from "@/types/supabase"
import type { Lead } from "@/types"

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
  const { data } = await supabase
    .from("leads")
    .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false }) as { data: LeadRow[] | null }

  const leads = (data ?? []).map(rowToLead)

  return <LeadsClient initialLeads={leads} />
}
