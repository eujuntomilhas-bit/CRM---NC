import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkspaceNameForm } from '@/components/settings/WorkspaceNameForm'
import { InviteForm } from '@/components/settings/InviteForm'
import { RemoveMemberButton, CancelInviteButton } from '@/components/settings/MemberActions'
import { BillingSection } from '@/components/settings/BillingSection'
import { BillingToast } from '@/components/settings/BillingToast'
import { Crown, Users, Clock } from 'lucide-react'

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

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug, plan')
    .eq('id', workspaceId)
    .single()

  if (!workspace) return null

  type MemberWithEmail = {
    id: string
    workspace_id: string
    user_id: string
    role: 'admin' | 'member'
    email: string
    created_at: string
  }

  const { data: membersRaw } = await supabase
    .rpc('get_workspace_members_with_email', { p_workspace_id: workspaceId }) as { data: MemberWithEmail[] | null }

  const members = membersRaw ?? []
  const currentMembership = members.find((m) => m.user_id === user.id)
  const isAdmin = currentMembership?.role === 'admin'

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
    <div className="flex-1 space-y-6 overflow-auto">
      <Suspense fallback={null}>
        <BillingToast />
      </Suspense>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">Gerencie seu workspace e conta</p>
      </div>

      <Tabs defaultValue="workspace">
        <TabsList className="mb-4">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        </TabsList>

        {/* ── Aba Workspace ── */}
        <TabsContent value="workspace">
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
        </TabsContent>

        {/* ── Aba Membros ── */}
        <TabsContent value="membros">
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

            <ul className="space-y-2">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(member.email ?? '??').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{member.email}</p>
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
                      {isAdmin && <CancelInviteButton workspaceId={workspaceId} inviteId={invite.id} />}
                    </li>
                  ))}
                </ul>
              </>
            )}

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
        </TabsContent>

        {/* ── Aba Assinatura ── */}
        <TabsContent value="assinatura">
          <BillingSection plan={workspace.plan} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
