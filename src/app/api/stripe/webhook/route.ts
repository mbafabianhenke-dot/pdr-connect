import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  const getUserIdFromCustomer = async (customerId: string): Promise<string | null> => {
    const { data } = await supabase.from('users').select('id').eq('stripe_customer_id', customerId).single();
    return data?.id ?? null;
  };

  const logEvent = async (userId: string, eventType: string, stripeEventId: string, metadata?: object) => {
    await supabase.from('subscription_events').insert({
      user_id: userId,
      event_type: eventType,
      stripe_event_id: stripeEventId,
      metadata,
    });
  };

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id
        ?? await getUserIdFromCustomer(sub.customer as string);
      if (!userId) break;

      const isActive = sub.status === 'active' || sub.status === 'trialing';
      await supabase.from('users').update({
        is_premium: isActive,
        stripe_subscription_id: sub.id,
      }).eq('id', userId);

      await logEvent(userId, event.type, event.id, { status: sub.status });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id
        ?? await getUserIdFromCustomer(sub.customer as string);
      if (!userId) break;

      await supabase.from('users').update({ is_premium: false, stripe_subscription_id: null }).eq('id', userId);
      await logEvent(userId, event.type, event.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = await getUserIdFromCustomer(invoice.customer as string);
      if (!userId) break;
      await logEvent(userId, event.type, event.id);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
