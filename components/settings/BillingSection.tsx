'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Check, Minus, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { createCheckoutSession, createPortalSession } from '@/app/(app)/settings/billing-actions'
import type { WorkspacePlan } from '@/types'

type Props = {
  plan: WorkspacePlan
  isAdmin: boolean
}

const features = [
  { label: 'Membros da equipe', free: 'Até 2', pro: 'Ilimitados' },
  { label: 'Leads', free: 'Até 50', pro: 'Ilimitados' },
  { label: 'Pipeline Kanban', free: true, pro: true },
  { label: 'Dashboard de métricas', free: true, pro: true },
  { label: 'Convites por e-mail', free: true, pro: true },
  { label: 'Suporte prioritário', free: false, pro: true },
] as const

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'string') return <span className="text-xs font-medium">{value}</span>
  if (value) return <Check className="size-4 text-primary mx-auto" />
  return <Minus className="size-4 text-muted-foreground mx-auto" />
}

export function BillingSection({ plan, isAdmin }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade() {
    startTransition(async () => {
      try {
        await createCheckoutSession()
      } catch (err) {
        if (isRedirectError(err)) throw err
        toast.error(err instanceof Error ? err.message : 'Erro ao iniciar checkout')
      }
    })
  }

  function handlePortal() {
    startTransition(async () => {
      try {
        await createPortalSession()
      } catch (err) {
        if (isRedirectError(err)) throw err
        toast.error(err instanceof Error ? err.message : 'Erro ao abrir portal')
      }
    })
  }

  const planLabel = plan === 'pro' ? 'Pro' : 'Free'
  const planDescription = {
    free: 'Até 2 membros e 50 leads. Ideal para começar.',
    pro: 'Membros ilimitados · Todos os recursos · R$49/mês',
    payment_failed: 'Pagamento com falha — atualize seu método de pagamento',
  }[plan]

  return (
    <section className="rounded-xl border border-border bg-card p-5 space-y-5">
      {/* Plano atual */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Plano atual{' '}
            <Badge
              variant={plan === 'pro' ? 'default' : plan === 'payment_failed' ? 'destructive' : 'secondary'}
              className="ml-1 text-xs"
            >
              {plan === 'payment_failed' ? (
                <span className="flex items-center gap-1"><AlertTriangle className="size-3" /> Falha</span>
              ) : planLabel}
            </Badge>
          </p>
          <p className={`text-xs mt-0.5 ${plan === 'payment_failed' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {planDescription}
          </p>
        </div>
        {isAdmin && plan !== 'free' && (
          <Button variant="outline" size="sm" onClick={handlePortal} disabled={isPending}>
            {isPending ? 'Abrindo…' : plan === 'payment_failed' ? 'Atualizar pagamento' : 'Gerenciar assinatura'}
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabela comparativa */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Compare os planos
        </p>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-1/2"></th>
                <th className="text-center px-4 py-3 w-1/4">
                  <div>
                    <p className="font-semibold text-foreground">Free</p>
                    <p className="text-xs text-muted-foreground font-normal">R$0/mês</p>
                  </div>
                </th>
                <th className="text-center px-4 py-3 w-1/4 bg-primary/5 relative">
                  <div>
                    <p className="font-semibold text-foreground">Pro</p>
                    <p className="text-xs text-muted-foreground font-normal">R$49/mês</p>
                  </div>
                  {plan !== 'pro' && (
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-px rounded-b-md">
                      Recomendado
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature.label}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground">{feature.label}</td>
                  <td className="px-4 py-3 text-center">
                    <FeatureValue value={feature.free} />
                  </td>
                  <td className="px-4 py-3 text-center bg-primary/5">
                    <FeatureValue value={feature.pro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botão de upgrade (só Free) */}
      {isAdmin && plan === 'free' && (
        <Button onClick={handleUpgrade} disabled={isPending} className="w-full gap-2">
          <Zap className="size-4" />
          {isPending ? 'Redirecionando…' : 'Assinar Pro — R$49/mês'}
        </Button>
      )}
    </section>
  )
}
