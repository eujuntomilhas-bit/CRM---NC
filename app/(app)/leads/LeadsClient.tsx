"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import LeadCard from "@/components/leads/LeadCard"
import LeadFilters from "@/components/leads/LeadFilters"
import LeadForm from "@/components/leads/LeadForm"
import { createLead, updateLead, deleteLead, type LeadInput } from "./actions"
import type { Lead } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

type OptAction =
  | { type: "add"; lead: Lead }
  | { type: "update"; id: string; data: Partial<Lead> }
  | { type: "delete"; id: string }

type Props = {
  initialLeads: Lead[]
}

export default function LeadsClient({ initialLeads }: Props) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "todos">("todos")
  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isPending, startTransition] = useTransition()

  const [optimisticLeads, updateOptimistic] = useOptimistic(
    initialLeads,
    (state: Lead[], action: OptAction) => {
      if (action.type === "add") return [action.lead, ...state]
      if (action.type === "update") return state.map((l) => l.id === action.id ? { ...l, ...action.data } : l)
      if (action.type === "delete") return state.filter((l) => l.id !== action.id)
      return state
    }
  )

  const filtered = optimisticLeads.filter((l) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      l.name.toLowerCase().includes(q) ||
      (l.company ?? "").toLowerCase().includes(q)
    const matchStatus = statusFilter === "todos" || l.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleSave(data: FormData, id?: string) {
    const input: LeadInput = {
      name: data.name,
      email: data.email ?? "",
      phone: data.phone ?? "",
      company: data.company ?? "",
      role: data.role ?? "",
      status: data.status,
      estimated_value: data.estimated_value ?? 0,
      notes: data.notes ?? "",
    }

    if (id) {
      startTransition(async () => {
        updateOptimistic({ type: "update", id, data })
        await updateLead(id, input)
      })
    } else {
      const tempLead: Lead = {
        ...input,
        id: `temp-${Date.now()}`,
        workspace_id: "",
        assignee_id: "",
        created_at: new Date().toISOString(),
      }
      startTransition(async () => {
        updateOptimistic({ type: "add", lead: tempLead })
        await createLead(input)
      })
    }
    setFormOpen(false)
    setEditingLead(null)
  }

  async function handleDelete() {
    if (!deletingLead) return
    const id = deletingLead.id
    setDeletingLead(null)
    startTransition(async () => {
      updateOptimistic({ type: "delete", id })
      await deleteLead(id)
    })
  }

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-slide-up">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {optimisticLeads.length} contato{optimisticLeads.length !== 1 ? "s" : ""} no workspace
          </p>
        </div>
        <Button onClick={() => { setEditingLead(null); setFormOpen(true) }} disabled={isPending}>
          <Plus className="mr-2 size-4" />
          Novo lead
        </Button>
      </div>

      <LeadFilters
        search={search}
        status={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {optimisticLeads.length === 0
              ? "Nenhum lead ainda. Crie o primeiro!"
              : "Nenhum lead encontrado com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={(l) => { setEditingLead(l); setFormOpen(true) }}
              onDelete={setDeletingLead}
            />
          ))}
        </div>
      )}

      <LeadForm
        open={formOpen}
        lead={editingLead}
        onClose={() => { setFormOpen(false); setEditingLead(null) }}
        onSave={handleSave}
      />

      <Dialog open={!!deletingLead} onOpenChange={(v) => { if (!v) setDeletingLead(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{deletingLead?.name}</span>?
            Essa ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingLead(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
