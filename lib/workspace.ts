import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { WorkspaceMemberRow } from "@/types/supabase"

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const cached = cookieStore.get("active_workspace_id")?.value
  if (cached) return cached

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single() as { data: Pick<WorkspaceMemberRow, "workspace_id"> | null }

  return data?.workspace_id ?? null
}
