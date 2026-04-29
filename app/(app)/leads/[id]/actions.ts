"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { Lead, Activity, ActivityType } from "@/types"
import type { LeadRow, ActivityRow } from "@/types/supabase"

export type LeadDetail = Lead & { activities: Activity[] }

function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    lead_id: row.lead_id,
    type: row.type,
    description: row.description,
    author_id: row.author_id ?? "",
    created_at: row.created_at,
  }
}

export async function getLead(id: string): Promise<LeadDetail | null> {
  const supabase = await createClient()

  const [leadResult, activitiesResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
      .eq("id", id)
      .single() as Promise<{ data: LeadRow | null; error: unknown }>,
    supabase
      .from("activities")
      .select("id, workspace_id, lead_id, type, description, author_id, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }) as Promise<{ data: ActivityRow[] | null; error: unknown }>,
  ])

  if (!leadResult.data) return null
  const row = leadResult.data

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
    activities: (activitiesResult.data ?? []).map(rowToActivity),
  }
}

export async function createActivity(
  leadId: string,
  type: ActivityType,
  description: string
): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("activities").insert({
    workspace_id: workspaceId,
    lead_id: leadId,
    type,
    description,
    author_id: user?.id ?? null,
  })

  if (error) return { error: error.message }
  revalidatePath(`/leads/${leadId}`)
  return {}
}

export async function updateLeadDetail(
  id: string,
  input: Partial<Pick<Lead, "name" | "email" | "phone" | "company" | "role" | "status" | "estimated_value" | "notes">>
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.email !== undefined) patch.email = input.email || null
  if (input.phone !== undefined) patch.phone = input.phone || null
  if (input.company !== undefined) patch.company = input.company || null
  if (input.role !== undefined) patch.role = input.role || null
  if (input.status !== undefined) patch.status = input.status
  if (input.estimated_value !== undefined) patch.estimated_value = input.estimated_value
  if (input.notes !== undefined) patch.notes = input.notes || null

  const { error } = await supabase.from("leads").update(patch).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/leads/${id}`)
  revalidatePath("/leads")
  return {}
}

export async function deleteLeadAndRedirect(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from("leads").delete().eq("id", id)
  redirect("/leads")
}
