import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ADDONS, entitle, PLANS, type PlanId } from "@/lib/billing";
import { readLink } from "@/lib/stripeConnect";
import { siteUrl } from "@/lib/secrets";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.plan || "packet") as PlanId;
  const catalog = [...PLANS, ...ADDONS];
  const plan = catalog.find((p) => p.id === id);
  if (!plan || plan.price === 0) {
    return NextResponse.json({ error: "Choose a paid seat." }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  const link = await readLink();
  const origin = siteUrl(req.headers.get("origin"));

  if (!key) {
    return NextResponse.json({
      ok: true,
      demo: true,
      entitlement: entitle(id),
      message: "No Stripe platform key on the server. Add STRIPE_SECRET_KEY in Vercel, then Connect your account.",
    });
  }

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create(
    {
      mode: plan.period === "month" ? "subscription" : "payment",
      success_url: `${origin}/pay/success?plan=${plan.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: {
              name: `Plotforge ${plan.name}`,
              description: plan.blurb,
            },
            ...(plan.period === "month" ? { recurring: { interval: "month" as const } } : {}),
          },
        },
      ],
      metadata: { plan: plan.id, through: link?.accountId || "platform" },
    },
    link?.accountId ? { stripeAccount: link.accountId } : undefined,
  );

  return NextResponse.json({ ok: true, demo: false, url: session.url });
}
