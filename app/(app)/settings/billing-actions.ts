'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/workspace'
import { stripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!

export async function createCheckoutSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) throw new Error('Workspace não encontrado')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, plan, stripe_customer_id')
    .eq('id', workspaceId)
    .single()

  if (!workspace) throw new Error('Workspace não encontrado')
  if (workspace.plan === 'pro') throw new Error('Workspace já está no plano Pro')

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'subscription',
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/settings?billing=success`,
    cancel_url: `${APP_URL}/settings?billing=cancel`,
    metadata: { workspace_id: workspaceId },
    subscription_data: { metadata: { workspace_id: workspaceId } },
    allow_promotion_codes: true,
  }

  if (workspace.stripe_customer_id) {
    sessionParams.customer = workspace.stripe_customer_id
  } else {
    sessionParams.customer_email = user.email
  }

  const session = await stripe.checkout.sessions.create(sessionParams)
  // redirect() deve ficar fora de try/catch — ele lança uma exceção internamente
  redirect(session.url!)
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) throw new Error('Workspace não encontrado')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('stripe_customer_id')
    .eq('id', workspaceId)
    .single()

  if (!workspace?.stripe_customer_id) {
    throw new Error('Nenhuma assinatura encontrada')
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${APP_URL}/settings`,
  })

  // redirect() deve ficar fora de try/catch — ele lança uma exceção internamente
  redirect(portalSession.url)
}
