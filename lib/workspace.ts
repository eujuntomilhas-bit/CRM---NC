import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { WorkspaceMemberRow } from "@/types/supabase"

export async function getActiveWorkspaceId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const cookieStore = await cookies()
  const cached = cookieStore.get("active_workspace_id")?.value

  // Se há cookie, validar que o usuário ainda é membro — impede IDOR via cookie manipulado
  if (cached) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", cached)
      .eq("user_id", user.id)
      .single() as { data: Pick<WorkspaceMemberRow, "workspace_id"> | null }
    if (data) return cached
    // Cookie inválido (removido do workspace) — continua para buscar outro
  }

  // Sem cookie válido: buscar primeiro workspace do usuário
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single() as { data: Pick<WorkspaceMemberRow, "workspace_id"> | null }

  return data?.workspace_id ?? null
}
