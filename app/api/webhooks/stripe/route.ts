import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import type { Database } from '@/types/supabase'
import type Stripe from 'stripe'

// Service-role client: bypasses RLS — only used here for webhook processing
function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function setWorkspacePlan(
  workspaceId: string,
  plan: 'free' | 'pro',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string | null,
) {
  const supabase = createServiceClient()
  const update: Database['public']['Tables']['workspaces']['Update'] = { plan }
  if (stripeCustomerId) update.stripe_customer_id = stripeCustomerId
  if (stripeSubscriptionId !== undefined) update.stripe_subscription_id = stripeSubscriptionId

  const { error } = await supabase
    .from('workspaces')
    .update(update)
    .eq('id', workspaceId)

  if (error) throw new Error(`Supabase update failed: ${error.message}`)
}

async function getWorkspaceIdFromCustomer(customerId: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('workspaces')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const workspaceId = session.metadata?.workspace_id
        if (!workspaceId) break

        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        await setWorkspacePlan(workspaceId, 'pro', customerId, subscriptionId)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspace_id
          ?? await getWorkspaceIdFromCustomer(subscription.customer as string)

        if (!workspaceId) break

        const isActive = subscription.status === 'active' || subscription.status === 'trialing'
        const plan: 'free' | 'pro' = isActive ? 'pro' : 'free'
        const subscriptionId = isActive ? subscription.id : null

        await setWorkspacePlan(workspaceId, plan, subscription.customer as string, subscriptionId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const workspaceId = subscription.metadata?.workspace_id
          ?? await getWorkspaceIdFromCustomer(subscription.customer as string)

        if (!workspaceId) break

        await setWorkspacePlan(workspaceId, 'free', subscription.customer as string, null)
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[stripe-webhook] Error processing ${event.type}:`, message)
    return NextResponse.json({ error: 'Internal error processing webhook' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
