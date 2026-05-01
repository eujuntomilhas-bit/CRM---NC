"use client"

import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Visão geral do seu negócio" },
  "/leads": { title: "Leads", description: "Gerencie seus contatos e oportunidades" },
  "/pipeline": { title: "Pipeline", description: "Acompanhe o progresso dos negócios" },
  "/settings": { title: "Configurações", description: "Gerencie sua conta e workspace" },
}

type Member = { user_id: string; email: string; role: string }

export default function TopBar({ className, members = [] }: { className?: string; members?: Member[] }) {
  const pathname = usePathname()
  const segment = "/" + (pathname.split("/")[1] ?? "")
  const page = PAGE_TITLES[segment] ?? { title: "CRM-NC", description: "" }

  const visible = members.slice(0, 3)
  const overflow = members.length - 3

  return (
    <header className={cn("flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6", className)}>
      <div className="flex flex-col justify-center">
        <h1 className="text-sm font-semibold text-foreground">{page.title}</h1>
        {page.description && (
          <p className="text-xs text-muted-foreground">{page.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {members.length > 0 && (
          <div className="flex items-center -space-x-1">
            {visible.map((m) => (
              <div
                key={m.user_id}
                title={m.email}
                className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary ring-2 ring-background"
              >
                {m.email.slice(0, 2).toUpperCase()}
              </div>
            ))}
            {overflow > 0 && (
              <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
                +{overflow}
              </div>
            )}
          </div>
        )}

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="size-4" />
          <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full p-0 text-[9px]">
            3
          </Badge>
          <span className="sr-only">Notificações</span>
        </Button>
      </div>
    </header>
  )
}
