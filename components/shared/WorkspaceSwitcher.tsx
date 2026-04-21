"use client"

import { useState } from "react"
import { ChevronsUpDown, Check, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { Workspace } from "@/types"

const MOCK_WORKSPACES: Workspace[] = [
  { id: "1", name: "Minha Empresa", slug: "minha-empresa", plan: "pro" },
  { id: "2", name: "Freelancer", slug: "freelancer", plan: "free" },
]

export default function WorkspaceSwitcher() {
  const [current, setCurrent] = useState<Workspace>(MOCK_WORKSPACES[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <span className="truncate">{current.name}</span>
        <ChevronsUpDown className="size-4 shrink-0 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {MOCK_WORKSPACES.map((ws) => (
          <DropdownMenuItem key={ws.id} onClick={() => setCurrent(ws)}>
            <span className="flex-1 truncate">{ws.name}</span>
            {ws.id === current.id && <Check className="size-4 text-indigo-600" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="size-4" />
          <span>Criar workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
