"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Kanban, Settings } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import WorkspaceSwitcher from "./WorkspaceSwitcher"
import UserMenu from "./UserMenu"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings", label: "Configurações", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-indigo-600">
          <span className="text-xs font-bold text-white">C</span>
        </div>
        <span className="text-base font-semibold text-gray-900">CRM-NC</span>
      </div>

      <Separator />

      <div className="px-3 py-3">
        <WorkspaceSwitcher />
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-3">
        <ul className="space-y-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Separator />

      <div className="px-3 py-3">
        <UserMenu />
      </div>
    </aside>
  )
}
