import { createClient } from '@/lib/supabase/server'

const FREE_LEAD_LIMIT = 50
const FREE_MEMBER_LIMIT = 2

export async function canAddLead(workspaceId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return { allowed: false, reason: 'Workspace não encontrado' }
  if (workspace.plan !== 'free') return { allowed: true }

  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  if ((count ?? 0) >= FREE_LEAD_LIMIT) {
    return {
      allowed: false,
      reason: `O plano Free permite até ${FREE_LEAD_LIMIT} leads. Faça upgrade para Pro para leads ilimitados.`,
    }
  }

  return { allowed: true }
}

export async function canAddMember(workspaceId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return { allowed: false, reason: 'Workspace não encontrado' }
  if (workspace.plan !== 'free') return { allowed: true }

  const { count: memberCount } = await supabase
    .from('workspace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  const { count: inviteCount } = await supabase
    .from('invites')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)

  const total = (memberCount ?? 0) + (inviteCount ?? 0)

  if (total >= FREE_MEMBER_LIMIT) {
    return {
      allowed: false,
      reason: `Limite de ${FREE_MEMBER_LIMIT} membros atingido no plano Free. Faça upgrade para Pro para convidar mais pessoas.`,
    }
  }

  return { allowed: true }
}
