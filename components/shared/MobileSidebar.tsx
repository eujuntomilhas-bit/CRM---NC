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
    <div className="flex h-14 items-center border-b border-gray-200 bg-white px-4 md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>
      <span className="ml-2 text-base font-semibold text-gray-900">CRM-NC</span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="p-0 w-64">
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
