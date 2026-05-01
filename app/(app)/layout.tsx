import { createClient } from "@/lib/supabase/server"
import { getActiveWorkspaceId } from "@/lib/workspace"
import Sidebar from "@/components/shared/Sidebar"
import MobileSidebar from "@/components/shared/MobileSidebar"
import TopBar from "@/components/shared/TopBar"
import type { Workspace } from "@/types"

type Props = {
  children: React.ReactNode
}

type WorkspaceJoinRow = {
  workspaces: {
    id: string
    name: string
    slug: string
    plan: 'free' | 'pro'
  }
}

type MemberWithEmail = { user_id: string; email: string; role: string }

export default async function AppLayout({ children }: Props) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let workspaces: Workspace[] = []
  let activeWorkspaceId: string | null = null
  let members: MemberWithEmail[] = []

  if (user) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspaces!inner(id, name, slug, plan)")
      .eq("user_id", user.id) as { data: WorkspaceJoinRow[] | null }

    workspaces = (data ?? []).map((row) => row.workspaces as Workspace)
    activeWorkspaceId = await getActiveWorkspaceId()

    if (activeWorkspaceId) {
      const { data: membersData } = await supabase
        .rpc('get_workspace_members_with_email', { p_workspace_id: activeWorkspaceId }) as {
          data: MemberWithEmail[] | null
        }
      members = membersData ?? []
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar user={user} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileSidebar user={user} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
        <TopBar className="hidden md:flex" members={members} />
        <main className="flex-1 overflow-hidden p-6 flex flex-col min-h-0 animate-page-enter">{children}</main>
      </div>
    </div>
  )
}
