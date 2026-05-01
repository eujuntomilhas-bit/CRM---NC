'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateWorkspaceName(workspaceId: string, name: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const trimmed = name.trim()
  if (!trimmed) throw new Error('Nome não pode ser vazio')

  const { error } = await supabase
    .from('workspaces')
    .update({ name: trimmed })
    .eq('id', workspaceId)

  if (error) throw new Error('Erro ao atualizar workspace')

  revalidatePath('/settings')
}

export async function removeMember(workspaceId: string, userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  if (userId === user.id) throw new Error('Você não pode remover a si mesmo')

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    throw new Error('Apenas admins podem remover membros')
  }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)

  if (error) throw new Error('Erro ao remover membro')

  revalidatePath('/settings')
}

export async function cancelInvite(workspaceId: string, inviteId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  // Verificar que o usuário é admin do workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    throw new Error('Apenas admins podem cancelar convites')
  }

  const { error } = await supabase
    .from('invites')
    .delete()
    .eq('id', inviteId)
    .eq('workspace_id', workspaceId)

  if (error) throw new Error('Erro ao cancelar convite')

  revalidatePath('/settings')
}
