"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import Sidebar from "./Sidebar"

export default function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
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
      <div className="ml-2 flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary">
          <span className="text-[10px] font-bold text-primary-foreground">C</span>
        </div>
        <span className="text-sm font-semibold text-foreground">CRM-NC</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>
          <div className="h-full" onClick={() => setOpen(false)}>
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
