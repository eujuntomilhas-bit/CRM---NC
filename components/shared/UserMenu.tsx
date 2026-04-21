"use client"

import { LogOut, User, CreditCard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const MOCK_USER = { name: "João Silva", email: "joao@empresa.com", initials: "JS" }

export default function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <Avatar size="sm">
          <AvatarFallback>{MOCK_USER.initials}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium text-gray-900">{MOCK_USER.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>
          <User className="size-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard className="size-4" />
          <span>Meu Plano</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut className="size-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
