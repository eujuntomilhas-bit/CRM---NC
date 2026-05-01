'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateWorkspaceName } from '@/app/(app)/settings/actions'

type Props = {
  workspaceId: string
  currentName: string
  isAdmin: boolean
}

export function WorkspaceNameForm({ workspaceId, currentName, isAdmin }: Props) {
  const [name, setName] = useState(currentName)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() === currentName) return

    startTransition(async () => {
      try {
        await updateWorkspaceName(workspaceId, name)
        toast.success('Nome do workspace atualizado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao atualizar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="workspace-name">Nome do workspace</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isAdmin || isPending}
          maxLength={80}
        />
      </div>
      {isAdmin && (
        <Button
          type="submit"
          variant="outline"
          disabled={isPending || name.trim() === currentName || !name.trim()}
        >
          {isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      )}
    </form>
  )
}
