"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Kanban, Settings } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import WorkspaceSwitcher from "./WorkspaceSwitcher"
import UserMenu from "./UserMenu"
import Logo from "./Logo"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"
import type { Workspace } from "@/types"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings", label: "Configurações", icon: Settings },
]

type Props = {
  user: User | null
  workspaces: Workspace[]
}

export default function Sidebar({ user, workspaces }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center px-5">
        <Logo size="sm" />
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="px-3 py-2">
        <WorkspaceSwitcher workspaces={workspaces} />
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 px-3 py-3">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        <ul className="space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
                    active
                      ? "font-medium text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  style={active ? {
                    background: "linear-gradient(90deg, rgba(202,255,51,0.12), transparent)",
                  } : undefined}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                    )}
                  />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="px-3 py-3">
        <UserMenu user={user} />
      </div>
    </aside>
  )
}
