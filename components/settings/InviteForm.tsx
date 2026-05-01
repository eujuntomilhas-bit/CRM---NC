'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

type Props = {
  workspaceId: string
  disabled?: boolean
  disabledReason?: string
}

export function InviteForm({ workspaceId, disabled, disabledReason }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    startTransition(async () => {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, email: email.trim(), role }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao enviar convite')
        return
      }

      toast.success(`Convite enviado para ${email}`)
      setEmail('')
      setRole('member')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {disabled && disabledReason && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          {disabledReason}
        </p>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="invite-email" className="sr-only">E-mail</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={disabled || isPending}
            required
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as 'member' | 'admin')} disabled={disabled || isPending}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Membro</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={disabled || isPending || !email.trim()}>
          <Send className="size-4" />
          {isPending ? 'Enviando…' : 'Convidar'}
        </Button>
      </div>
    </form>
  )
}
