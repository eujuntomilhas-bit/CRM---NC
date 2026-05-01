import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { WorkspaceNameForm } from '@/components/settings/WorkspaceNameForm'
import { InviteForm } from '@/components/settings/InviteForm'
import { RemoveMemberButton, CancelInviteButton } from '@/components/settings/MemberActions'
import { Crown, Users, CreditCard, Clock } from 'lucide-react'

const FREE_MEMBER_LIMIT = 2

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const workspaceId = await getActiveWorkspaceId()

  if (!user || !workspaceId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Nenhum workspace encontrado.</p>
      </div>
    )
  }

  // Buscar workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug, plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return null

  // Buscar membros com seus dados de auth
  type MemberWithMeta = {
    id: string
    user_id: string
    role: 'admin' | 'member'
    created_at: string
  }

  const { data: membersRaw } = await supabase
    .from('workspace_members')
    .select('id, user_id, role, created_at')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true }) as { data: MemberWithMeta[] | null }

  const members = membersRaw ?? []

  // Buscar emails dos membros via auth.users (service role não disponível no client, usar metadata)
  // Os dados de nome/email ficam em auth.users — exposto via RPC ou metadata do usuário atual
  const currentMembership = members.find((m) => m.user_id === user.id)
  const isAdmin = currentMembership?.role === 'admin'

  // Buscar convites pendentes
  type InviteRow = { id: string; email: string; role: 'admin' | 'member'; created_at: string }
  const { data: pendingInvites } = await supabase
    .from('invites')
    .select('id, email, role, created_at')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false }) as { data: InviteRow[] | null }

  const invites = pendingInvites ?? []
  const totalMembersAndInvites = members.length + invites.length
  const atFreeLimit = workspace.plan === 'free' && totalMembersAndInvites >= FREE_MEMBER_LIMIT

  return (
    <div className="flex-1 overflow-auto space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">Gerencie seu workspace e conta</p>
      </div>

      {/* ── Workspace ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Workspace</h3>
        </div>
        <Separator />
        <WorkspaceNameForm
          workspaceId={workspace.id}
          currentName={workspace.name}
          isAdmin={isAdmin}
        />
        <p className="text-xs text-muted-foreground">
          Slug: <span className="font-mono">{workspace.slug}</span>
        </p>
      </section>

      {/* ── Membros ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Membros</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {workspace.plan === 'free'
              ? `${totalMembersAndInvites} / ${FREE_MEMBER_LIMIT} (Free)`
              : `${members.length} membros`}
          </span>
        </div>
        <Separator />

        {/* Lista de membros */}
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {member.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {member.user_id === user.id ? user.email : `Membro ${member.user_id.slice(0, 8)}…`}
                </p>
                {member.user_id === user.id && (
                  <p className="text-xs text-muted-foreground">Você</p>
                )}
              </div>
              <Badge
                variant={member.role === 'admin' ? 'default' : 'secondary'}
                className="text-[10px] h-5"
              >
                {member.role === 'admin' ? 'Admin' : 'Membro'}
              </Badge>
              {isAdmin && member.user_id !== user.id && (
                <RemoveMemberButton workspaceId={workspaceId} userId={member.user_id} />
              )}
            </li>
          ))}
        </ul>

        {/* Convites pendentes */}
        {invites.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Convites pendentes
            </p>
            <ul className="space-y-2">
              {invites.map((invite) => (
                <li key={invite.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Clock className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">Convite enviado</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5 border-amber-500/40 text-amber-500">
                    Pendente
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {invite.role === 'admin' ? 'Admin' : 'Membro'}
                  </Badge>
                  {isAdmin && <CancelInviteButton inviteId={invite.id} />}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Formulário de convite */}
        {isAdmin && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Convidar por e-mail</p>
              <InviteForm
                workspaceId={workspaceId}
                disabled={atFreeLimit}
                disabledReason={
                  atFreeLimit
                    ? `Limite de ${FREE_MEMBER_LIMIT} membros atingido no plano Free. Faça upgrade para Pro para convidar mais pessoas.`
                    : undefined
                }
              />
            </div>
          </>
        )}
      </section>

      {/* ── Plano ── */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Plano</h3>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {workspace.plan === 'pro' ? 'Pro' : 'Free'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {workspace.plan === 'free'
                ? `Até ${FREE_MEMBER_LIMIT} membros · Leads ilimitados`
                : 'Membros ilimitados · Todos os recursos'}
            </p>
          </div>
          <Badge
            variant={workspace.plan === 'pro' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {workspace.plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
        </div>
        {workspace.plan === 'free' && (
          <p className="text-xs text-muted-foreground">
            Upgrade para Pro disponível em breve.
          </p>
        )}
      </section>
    </div>
  )
}
