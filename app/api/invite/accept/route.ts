import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { token } = await request.json() as { token: string }
  if (!token) {
    return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })
  }

  // Buscar convite
  const { data: invite } = await supabase
    .from('invites')
    .select('id, workspace_id, email, role, accepted_at')
    .eq('token', token)
    .maybeSingle()

  if (!invite) {
    return NextResponse.json({ error: 'Convite inválido ou expirado' }, { status: 404 })
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Convite já foi aceito' }, { status: 409 })
  }

  // Verificar que o email do usuário logado bate com o convite
  if (user.email !== invite.email) {
    return NextResponse.json(
      { error: `Este convite é para ${invite.email}. Você está logado como ${user.email}.` },
      { status: 403 }
    )
  }

  // Inserir membro
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role,
    })

  if (memberError && memberError.code !== '23505') {
    return NextResponse.json({ error: 'Erro ao aceitar convite' }, { status: 500 })
  }

  // Marcar convite como aceito
  await supabase
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  // Setar workspace ativo no cookie
  const response = NextResponse.json({ success: true })
  response.cookies.set('active_workspace_id', invite.workspace_id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
