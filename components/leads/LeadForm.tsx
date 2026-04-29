"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import type { Lead } from "@/types"

type FormData = Omit<Lead, "id" | "workspace_id" | "created_at">

type Errors = Partial<Record<keyof FormData, string>>

function validate(data: FormData): Errors {
  const errors: Errors = {}
  if (!data.name.trim()) errors.name = "Nome obrigatório"
  if (!data.email) errors.email = "E-mail obrigatório"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "E-mail inválido"
  if (!data.company.trim()) errors.company = "Empresa obrigatória"
  return errors
}

const EMPTY: FormData = {
  name: "", email: "", phone: "", company: "", role: "",
  status: "novo", assignee_id: "", estimated_value: 0, notes: "",
}

type Props = {
  open: boolean
  lead?: Lead | null
  onClose: () => void
  onSave: (data: FormData, id?: string) => void
}

export default function LeadForm({ open, lead, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (lead) {
      const { id, workspace_id, created_at, ...rest } = lead
      setForm(rest)
    } else {
      setForm(EMPTY)
    }
    setErrors({})
  }, [lead, open])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setPending(true)
    await new Promise((r) => setTimeout(r, 500))
    setPending(false)
    onSave(form, lead?.id)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Editar lead" : "Novo lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="lf-name">Nome completo *</Label>
              <Input id="lf-name" value={form.name} onChange={(e) => set("name", e.target.value)} disabled={pending} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lf-email">E-mail *</Label>
              <Input id="lf-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={pending} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lf-phone">Telefone</Label>
              <Input id="lf-phone" value={form.phone} placeholder="(11) 99999-0000" onChange={(e) => set("phone", e.target.value)} disabled={pending} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lf-company">Empresa *</Label>
              <Input id="lf-company" value={form.company} onChange={(e) => set("company", e.target.value)} disabled={pending} aria-invalid={!!errors.company} />
              {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lf-role">Cargo</Label>
              <Input id="lf-role" value={form.role} onChange={(e) => set("role", e.target.value)} disabled={pending} />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as Lead["status"])} disabled={pending}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contato">Contato</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="ganho">Ganho</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lf-value">Valor estimado (R$)</Label>
              <Input
                id="lf-value"
                type="number"
                min={0}
                placeholder="0"
                value={form.estimated_value || ""}
                onChange={(e) => set("estimated_value", Number(e.target.value) || 0)}
                disabled={pending}
              />
            </div>

          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lf-notes">Notas</Label>
            <Textarea
              id="lf-notes"
              placeholder="Observações sobre este lead…"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              disabled={pending}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? <><Loader2 className="mr-2 size-4 animate-spin" />{lead ? "Salvando…" : "Criando…"}</> : lead ? "Salvar" : "Criar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
