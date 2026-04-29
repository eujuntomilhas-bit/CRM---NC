"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
}

export async function createWorkspace(formData: FormData) {
  const name = (formData.get("workspaceName") as string)?.trim()
  if (!name) return { error: "Nome do workspace obrigatório" }

  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: "Sessão inválida. Faça login novamente." }

  const slug = `${toSlug(name)}-${Date.now().toString(36)}`

  // RPC atômica: workspace + membro admin em uma única transação
  const { error: rpcError } = await supabase.rpc("create_workspace_with_admin", {
    p_name: name,
    p_slug: slug,
  })

  if (rpcError) {
    return { error: "Erro ao criar workspace. Tente novamente." }
  }

  redirect("/dashboard")
}
