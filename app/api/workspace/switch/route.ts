import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { workspaceId } = await request.json() as { workspaceId: string }
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
  }

  // Verificar que o usuário é membro do workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('active_workspace_id', workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  })

  return response
}
