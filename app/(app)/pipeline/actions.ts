"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import type { Deal, DealStage } from "@/types"
import type { DealRow, Database } from "@/types/supabase"

type DealUpdate = Database["public"]["Tables"]["deals"]["Update"]

export type DealInput = {
  title: string
  value: number
  lead_id: string | null
  due_date: string | null
  stage: DealStage
}

export type DealWithLead = Deal & { lead_name: string | null; created_at?: string }

type DealRowWithLead = DealRow & { leads: { name: string } | null }

function rowToDeal(row: DealRowWithLead): DealWithLead {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    lead_id: row.lead_id ?? "",
    title: row.title,
    value: Number(row.value ?? 0),
    stage: row.stage,
    assignee_id: row.assignee_id ?? "",
    due_date: row.due_date ?? "",
    created_at: row.created_at,
    lead_name: row.leads?.name ?? null,
  }
}

export async function getDeals(): Promise<DealWithLead[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("deals")
    .select("id, workspace_id, lead_id, title, value, stage, assignee_id, due_date, created_at, leads(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true }) as { data: DealRowWithLead[] | null }

  return (data ?? []).map(rowToDeal)
}

export async function createDeal(input: DealInput): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: "Workspace não encontrado" }

  const supabase = await createClient()
  const { error } = await supabase.from("deals").insert({
    workspace_id: workspaceId,
    title: input.title,
    value: input.value,
    lead_id: input.lead_id || null,
    due_date: input.due_date || null,
    stage: input.stage,
  })

  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function updateDeal(id: string, input: Partial<DealInput>): Promise<{ error?: string }> {
  const supabase = await createClient()
  const patch: DealUpdate = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.value !== undefined) patch.value = input.value
  if (input.lead_id !== undefined) patch.lead_id = input.lead_id || null
  if (input.due_date !== undefined) patch.due_date = input.due_date || null
  if (input.stage !== undefined) patch.stage = input.stage

  const { error } = await supabase.from("deals").update(patch).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function updateDealStage(id: string, stage: DealStage): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("deals").update({ stage }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}

export async function deleteDeal(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("deals").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  return {}
}
