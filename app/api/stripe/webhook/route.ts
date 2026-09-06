import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const hook = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !hook) {
    return NextResponse.json({ error: "Stripe webhook secrets not set" }, { status: 501 });
  }
  const stripe = new Stripe(key);
  const raw = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });
  try {
    const event = stripe.webhooks.constructEvent(raw, sig, hook);
    return NextResponse.json({ received: true, type: event.type });
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }
}
