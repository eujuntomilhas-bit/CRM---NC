import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import InviteAcceptClient from './InviteAcceptClient'

type Props = {
  params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  // Buscar o convite pelo token via RPC pública (sem RLS — acessível mesmo sem login)
  const { data: inviteRows } = await supabase
    .rpc('get_invite_by_token', { p_token: token })

  const inviteRow = inviteRows?.[0] ?? null

  const invite = inviteRow ? {
    id: inviteRow.id as string,
    workspace_id: inviteRow.workspace_id as string,
    email: inviteRow.email as string,
    role: inviteRow.role as 'admin' | 'member',
    accepted_at: inviteRow.accepted_at as string | null,
    workspaces: { name: inviteRow.workspace_name as string },
  } : null

  // Token inválido
  if (!invite) {
    return (
      <InviteResult
        icon={<XCircle className="size-12 text-destructive" />}
        title="Convite inválido"
        description="Este link de convite não existe ou expirou."
        action={<Link href="/login" className={buttonVariants()}>Ir para o login</Link>}
      />
    )
  }

  // Convite já aceito
  if (invite.accepted_at) {
    return (
      <InviteResult
        icon={<CheckCircle2 className="size-12 text-muted-foreground" />}
        title="Convite já utilizado"
        description="Este convite já foi aceito anteriormente."
        action={<Link href="/dashboard" className={buttonVariants()}>Ir para o dashboard</Link>}
      />
    )
  }

  const workspaceName = invite.workspaces?.name ?? 'um workspace'

  // Verificar usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  // Se já está logado com o email correto → aceitar direto
  if (user && user.email === invite.email) {
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: invite.workspace_id,
        user_id: user.id,
        role: invite.role,
      })

    if (memberError && memberError.code !== '23505') {
      return (
        <InviteResult
          icon={<XCircle className="size-12 text-destructive" />}
          title="Erro ao aceitar convite"
          description="Ocorreu um erro inesperado. Tente novamente ou entre em contato com o administrador."
          action={<Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>Ir para o dashboard</Link>}
        />
      )
    }

    await supabase
      .from('invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)

    redirect('/dashboard')
  }

  // Se está logado com email diferente → fazer logout antes de mostrar a tela
  if (user && user.email !== invite.email) {
    await supabase.auth.signOut()
  }

  // Mostrar tela de boas-vindas com opção de criar conta ou fazer login
  return (
    <InviteAcceptClient
      token={token}
      inviteEmail={invite.email}
      workspaceName={workspaceName}
      role={invite.role}
    />
  )
}

function InviteResult({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h1 className="mb-2 text-xl font-semibold text-foreground">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{description}</p>
        {action}
      </div>
    </div>
  )
}
