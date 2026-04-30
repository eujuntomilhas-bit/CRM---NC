import { createClient } from "@/lib/supabase/server"
import type { WorkspaceMemberRow } from "@/types/supabase"

// Resolve o workspace ativo do usuário autenticado.
// Sem dependência de cookie — o RLS garante que o usuário só vê seus próprios workspaces.
// O cookie active_workspace_id será usado no M9 (multi-workspace switcher).
export async function getActiveWorkspaceId(): Promise<string | null> {
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
