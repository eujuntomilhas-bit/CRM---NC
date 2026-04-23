"use client"

import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Visão geral do seu negócio" },
  "/leads": { title: "Leads", description: "Gerencie seus contatos e oportunidades" },
  "/pipeline": { title: "Pipeline", description: "Acompanhe o progresso dos negócios" },
  "/settings": { title: "Configurações", description: "Gerencie sua conta e workspace" },
}

import { cn } from "@/lib/utils"

export default function TopBar({ className }: { className?: string }) {
  const pathname = usePathname()
  const segment = "/" + (pathname.split("/")[1] ?? "")
  const page = PAGE_TITLES[segment] ?? { title: "CRM-NC", description: "" }

  return (
    <header className={cn("flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6", className)}>
      <div className="flex flex-col justify-center">
        <h1 className="text-sm font-semibold text-foreground">{page.title}</h1>
        {page.description && (
          <p className="text-xs text-muted-foreground">{page.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
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
