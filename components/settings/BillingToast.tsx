'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function BillingToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const billing = searchParams.get('billing')

  useEffect(() => {
    if (billing === 'success') {
      toast.success('Assinatura Pro ativada! 🎉')
      router.replace('/settings')
    } else if (billing === 'cancel') {
      toast.info('Checkout cancelado.')
      router.replace('/settings')
    }
  }, [billing, router])

  return null
}
