"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { Lead, LeadStatus } from "@/types"
import type { LeadRow } from "@/types/supabase"

export type LeadFilters = {
  search?: string
  status?: LeadStatus | "todos"
}

export type LeadInput = {
  name: string
  email: string
  phone: string
  company: string
  role: string
  status: LeadStatus
  estimated_value: number
  notes: string
}

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

export async function getLeads(filters?: LeadFilters): Promise<Lead[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  let q = supabase
    .from("leads")
    .select("id, workspace_id, name, email, phone, company, role, status, assignee_id, estimated_value, notes, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (filters?.status && filters.status !== "todos") {
    q = q.eq("status", filters.status)
  }
  if (filters?.search?.trim()) {
    q = q.or(`name.ilike.%${filters.search.trim()}%,company.ilike.%${filters.search.trim()}%`)
  }

  const { data } = await q as { data: LeadRow[] | null }
  return (data ?? []).map(rowToLead)
}

export async function createLead(input: LeadInput): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const supabase = await createClient()
  const { error } = await supabase.from("leads").insert({
    workspace_id: workspaceId,
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    company: input.company || null,
    role: input.role || null,
    status: input.status,
    estimated_value: input.estimated_value,
    notes: input.notes || null,
  })

  if (error) return { error: error.message }
  revalidatePath("/leads")
  return {}
}

export async function updateLead(id: string, input: Partial<LeadInput>): Promise<{ error?: string }> {
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
  revalidatePath("/leads")
  revalidatePath(`/leads/${id}`)
  return {}
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/leads")
  return {}
}
