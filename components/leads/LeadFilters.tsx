"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { MOCK_USERS } from "@/lib/mocks/leads"
import type { Lead } from "@/types"

type Props = {
  search: string
  status: Lead["status"] | "todos"
  assignee: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: Lead["status"] | "todos") => void
  onAssigneeChange: (v: string) => void
}

export default function LeadFilters({ search, status, assignee, onSearchChange, onStatusChange, onAssigneeChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-48 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou empresa…"
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v as Lead["status"] | "todos")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="novo">Novo</SelectItem>
          <SelectItem value="contato">Contato</SelectItem>
          <SelectItem value="proposta">Proposta</SelectItem>
          <SelectItem value="negociacao">Negociação</SelectItem>
          <SelectItem value="ganho">Ganho</SelectItem>
          <SelectItem value="perdido">Perdido</SelectItem>
        </SelectContent>
      </Select>

      <Select value={assignee} onValueChange={(v) => onAssigneeChange(v ?? "todos")}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos</SelectItem>
          {MOCK_USERS.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
