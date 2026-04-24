"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import type { Activity } from "@/types"

type Props = {
  onSave: (type: Activity["type"], description: string) => void
}

export default function ActivityForm({ onSave }: Props) {
  const [type, setType] = useState<Activity["type"]>("note")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError("Descrição obrigatória"); return }
    setError("")
    setPending(true)
    await new Promise((r) => setTimeout(r, 400))
    setPending(false)
    onSave(type, description.trim())
    setDescription("")
    setType("note")
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Select value={type} onValueChange={(v) => setType(v as Activity["type"])} disabled={pending}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="note">Nota</SelectItem>
            <SelectItem value="call">Ligação</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="meeting">Reunião</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Registrar atividade</span>
      </div>

      <Textarea
        placeholder="Descreva o que aconteceu…"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={pending}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending
            ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Salvando…</>
            : <><Plus className="mr-2 size-3.5" />Salvar atividade</>
          }
        </Button>
      </div>
    </form>
  )
}
