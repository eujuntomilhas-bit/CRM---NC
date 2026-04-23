"use client"

import { LogOut, User, CreditCard, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const MOCK_USER = {
  name: "João Silva",
  email: "joao@empresa.com",
  initials: "JS",
  role: "Admin",
}

export default function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-primary/20 text-[11px] font-semibold text-primary">
            {MOCK_USER.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate text-xs font-medium text-sidebar-foreground">
            {MOCK_USER.name}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {MOCK_USER.role}
          </span>
        </div>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" side="right" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{MOCK_USER.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{MOCK_USER.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2">
            <User className="size-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <CreditCard className="size-4" />
            <span>Meu Plano</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="gap-2">
          <LogOut className="size-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
