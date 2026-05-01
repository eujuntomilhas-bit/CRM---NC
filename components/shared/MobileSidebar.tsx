"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import Sidebar from "./Sidebar"
import Logo from "./Logo"
import type { User } from "@supabase/supabase-js"
import type { Workspace } from "@/types"

type Props = {
  user: User | null
  workspaces: Workspace[]
  activeWorkspaceId?: string | null
}

export default function MobileSidebar({ user, workspaces, activeWorkspaceId }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex h-14 items-center border-b border-border bg-background px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        <div className="ml-2">
          <Logo size="sm" />
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 p-0 bg-sidebar border-sidebar-border"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>

          <div className="absolute right-2 top-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Fechar menu</span>
            </Button>
          </div>

          {/* click em qualquer link fecha o sheet via bubbling */}
          <div className="h-full" onClick={() => setOpen(false)}>
            <Sidebar user={user} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
