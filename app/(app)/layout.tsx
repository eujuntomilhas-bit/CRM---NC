import { createClient } from "@/lib/supabase/server"
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

export default async function AppLayout({ children }: Props) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let workspaces: Workspace[] = []
  if (user) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspaces!inner(id, name, slug, plan)")
      .eq("user_id", user.id) as { data: WorkspaceJoinRow[] | null }

    workspaces = (data ?? []).map((row) => row.workspaces as Workspace)
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar user={user} workspaces={workspaces} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileSidebar user={user} workspaces={workspaces} />
        <TopBar className="hidden md:flex" />
        <main className="flex-1 overflow-hidden p-6 flex flex-col min-h-0 animate-page-enter">{children}</main>
      </div>
    </div>
  )
}
