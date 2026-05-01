import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { WorkspaceMemberRow } from '@/types/supabase'

export async function getActiveWorkspaceId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Preferir workspace persistido em cookie
  const cookieStore = await cookies()
  const cookieWorkspaceId = cookieStore.get('active_workspace_id')?.value

  if (cookieWorkspaceId) {
    // Verificar que o usuário ainda é membro desse workspace
    const { data } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('workspace_id', cookieWorkspaceId)
      .eq('user_id', user.id)
      .maybeSingle() as { data: Pick<WorkspaceMemberRow, 'workspace_id'> | null }

    if (data) return data.workspace_id
  }

  // Fallback: primeiro workspace do usuário
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single() as { data: Pick<WorkspaceMemberRow, 'workspace_id'> | null }

  return data?.workspace_id ?? null
}
