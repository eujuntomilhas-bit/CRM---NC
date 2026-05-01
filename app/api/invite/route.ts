import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend/client'
import { buildInviteEmailHtml } from '@/lib/resend/templates/invite'

const FREE_MEMBER_LIMIT = 2

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { workspaceId, email, role = 'member' } = body as {
    workspaceId: string
    email: string
    role?: 'admin' | 'member'
  }

  if (!workspaceId || !email) {
    return NextResponse.json({ error: 'workspaceId e email são obrigatórios' }, { status: 400 })
  }

  // Verificar se o usuário autenticado é admin do workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas admins podem convidar membros' }, { status: 403 })
  }

  // Buscar workspace para verificar plano e nome
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name, plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
  }

  // Verificar limite de membros no plano Free
  if (workspace.plan === 'free') {
    const { count: memberCount } = await supabase
      .from('workspace_members')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)

    const { count: pendingCount } = await supabase
      .from('invites')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)

    const total = (memberCount ?? 0) + (pendingCount ?? 0)
    if (total >= FREE_MEMBER_LIMIT) {
      return NextResponse.json(
        { error: `O plano Free permite no máximo ${FREE_MEMBER_LIMIT} membros. Faça upgrade para Pro.` },
        { status: 403 }
      )
    }
  }

  // Verificar se já existe convite pendente para esse email
  const { data: existingInvite } = await supabase
    .from('invites')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('email', email)
    .is('accepted_at', null)
    .maybeSingle()

  if (existingInvite) {
    return NextResponse.json({ error: 'Já existe um convite pendente para esse e-mail' }, { status: 409 })
  }

  // Inserir convite
  const { data: invite, error: insertError } = await supabase
    .from('invites')
    .insert({ workspace_id: workspaceId, email, role })
    .select('token')
    .single()

  if (insertError || !invite) {
    return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 })
  }

  // Buscar nome do convidador
  const { data: profile } = await supabase.auth.getUser()
  const inviterName = profile.user?.user_metadata?.name ?? profile.user?.email ?? 'Alguém'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const acceptUrl = `${appUrl}/invite/${invite.token}`

  const html = buildInviteEmailHtml({
    workspaceName: workspace.name,
    inviterName,
    acceptUrl,
  })

  const resend = getResend()
  const { error: emailError } = await resend.emails.send({
    from: 'CRM-NC <onboarding@resend.dev>',
    to: email,
    subject: `Você foi convidado para ${workspace.name}`,
    html,
  })

  if (emailError) {
    // Rollback do convite se o email falhar
    await supabase.from('invites').delete().eq('token', invite.token)
    return NextResponse.json({ error: 'Erro ao enviar e-mail de convite' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
