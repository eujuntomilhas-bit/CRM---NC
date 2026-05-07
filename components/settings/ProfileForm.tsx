"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updateProfile } from "@/app/(app)/settings/actions"
import { toast } from "sonner"

type Props = {
  currentName: string
  email: string
}

export function ProfileForm({ currentName, email }: Props) {
  const [name, setName] = useState(currentName)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setPending(true)
    try {
      await updateProfile(name.trim())
      toast.success("Perfil atualizado")
    } catch {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <div className="flex gap-2">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="flex-1"
          />
          <Button type="submit" disabled={pending || name.trim() === currentName}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-muted-foreground">E-mail</Label>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
    </form>
  )
}
