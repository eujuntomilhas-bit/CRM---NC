import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

type Props = {
  params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  // Buscar o convite pelo token
  const { data: invite } = await supabase
    .from('invites')
    .select('id, workspace_id, email, role, accepted_at, created_at, workspaces(name)')
    .eq('token', token)
    .maybeSingle() as {
      data: {
        id: string
        workspace_id: string
        email: string
        role: 'admin' | 'member'
        accepted_at: string | null
        created_at: string
        workspaces: { name: string } | null
      } | null
    }

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

  // Verificar usuário logado
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redireciona para login com next apontando de volta para este convite
    redirect(`/login?next=/invite/${token}`)
  }

  // Aceitar o convite: inserir em workspace_members e marcar accepted_at
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: invite.role,
    })

  if (memberError && memberError.code !== '23505') {
    // 23505 = unique violation (já é membro) — tratar como aceito
    return (
      <InviteResult
        icon={<XCircle className="size-12 text-destructive" />}
        title="Erro ao aceitar convite"
        description="Ocorreu um erro inesperado. Tente novamente ou entre em contato com o administrador do workspace."
        action={<Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>Ir para o dashboard</Link>}
      />
    )
  }

  await supabase
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  // Persistir workspace ativo e redirecionar
  const response = redirect(`/dashboard`)

  return response
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
