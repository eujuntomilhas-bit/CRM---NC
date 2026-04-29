"use client"

import { useRouter } from "next/navigation"
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
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

function initials(name: string | undefined): string {
  if (!name) return "U"
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

type Props = {
  user: SupabaseUser | null
}

export default function UserMenu({ user }: Props) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Usuário"
  const displayEmail = user?.email ?? ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-primary/20 text-[11px] font-semibold text-primary">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col text-left">
          <span className="truncate text-xs font-medium text-sidebar-foreground">
            {displayName}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {displayEmail}
          </span>
        </div>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" side="right" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{displayName}</span>
            <span className="text-xs font-normal text-muted-foreground">{displayEmail}</span>
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
        <DropdownMenuItem variant="destructive" className="gap-2" onClick={handleSignOut}>
          <LogOut className="size-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
