"use client"

import { useState } from "react"
import { ChevronsUpDown, Check, Plus, Building2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Workspace } from "@/types"

type Props = {
  workspaces: Workspace[]
}

export default function WorkspaceSwitcher({ workspaces }: Props) {
  const [current, setCurrent] = useState<Workspace | null>(workspaces[0] ?? null)

  if (!current) {
    return (
      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
          <Building2 className="size-3.5" />
        </div>
        <span className="flex-1 truncate text-left">Nenhum workspace</span>
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/20">
          <Building2 className="size-3.5 text-primary" />
        </div>
        <span className="flex-1 truncate text-left font-medium text-sidebar-foreground">
          {current.name}
        </span>
        {current.plan === "pro" && (
          <Badge variant="secondary" className="h-4 px-1 text-[9px] font-semibold uppercase">
            Pro
          </Badge>
        )}
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setCurrent(ws)}
              className="gap-2"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold uppercase text-muted-foreground">
                {ws.name[0]}
              </div>
              <span className="flex-1 truncate">{ws.name}</span>
              {ws.plan === "pro" && (
                <Badge variant="secondary" className="h-4 px-1 text-[9px] font-semibold uppercase">
                  Pro
                </Badge>
              )}
              <Check
                className={cn(
                  "size-3.5 text-primary",
                  ws.id === current.id ? "opacity-100" : "opacity-0"
                )}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Plus className="size-4" />
          <span>Criar workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
