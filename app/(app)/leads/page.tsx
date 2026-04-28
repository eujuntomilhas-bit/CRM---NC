"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import LeadCard from "@/components/leads/LeadCard"
import LeadFilters from "@/components/leads/LeadFilters"
import LeadForm from "@/components/leads/LeadForm"
import { mockLeads } from "@/lib/mocks/leads"
import type { Lead } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | "todos">("todos")
  const [assigneeFilter, setAssigneeFilter] = useState("todos")

  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase()
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q)
      const matchStatus = statusFilter === "todos" || l.status === statusFilter
      const matchAssignee = assigneeFilter === "todos" || l.assignee_id === assigneeFilter
      return matchSearch && matchStatus && matchAssignee
    })
  }, [leads, search, statusFilter, assigneeFilter])

  function handleSave(data: FormData, id?: string) {
    if (id) {
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, ...data } : l))
    } else {
      const newLead: Lead = {
        ...data,
        id: `l${Date.now()}`,
        workspace_id: "w1",
        created_at: new Date().toISOString(),
      }
      setLeads((prev) => [newLead, ...prev])
    }
    setFormOpen(false)
    setEditingLead(null)
  }

  function handleEdit(lead: Lead) {
    setEditingLead(lead)
    setFormOpen(true)
  }

  function handleDelete() {
    if (!deletingLead) return
    setLeads((prev) => prev.filter((l) => l.id !== deletingLead.id))
    setDeletingLead(null)
  }

  return (
    <div className="flex-1 overflow-auto space-y-6">
      <div className="flex items-center justify-between animate-fade-slide-up">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {leads.length} contato{leads.length !== 1 ? "s" : ""} no workspace
          </p>
        </div>
        <Button onClick={() => { setEditingLead(null); setFormOpen(true) }}>
          <Plus className="mr-2 size-4" />
          Novo lead
        </Button>
      </div>

      <LeadFilters
        search={search}
        status={statusFilter}
        assignee={assigneeFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onAssigneeChange={setAssigneeFilter}
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">Nenhum lead encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={handleEdit}
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
            Tem certeza que deseja excluir <span className="font-medium text-foreground">{deletingLead?.name}</span>?
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
