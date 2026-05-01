'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { removeMember, cancelInvite } from '@/app/(app)/settings/actions'
import { UserX, X } from 'lucide-react'

export function RemoveMemberButton({ workspaceId, userId }: { workspaceId: string; userId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      try {
        await removeMember(workspaceId, userId)
        toast.success('Membro removido')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao remover membro')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-destructive"
      onClick={handleRemove}
      disabled={isPending}
      title="Remover membro"
    >
      <UserX className="size-3.5" />
    </Button>
  )
}

export function CancelInviteButton({ inviteId }: { inviteId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelInvite(inviteId)
        toast.success('Convite cancelado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao cancelar convite')
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-destructive"
      onClick={handleCancel}
      disabled={isPending}
      title="Cancelar convite"
    >
      <X className="size-3.5" />
    </Button>
  )
}
