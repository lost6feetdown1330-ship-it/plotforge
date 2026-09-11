import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ADDONS, entitle, PLANS, type PlanId } from "@/lib/billing";
import { readLink } from "@/lib/stripeConnect";
import { siteUrl } from "@/lib/secrets";

function cleanKey(raw?: string) {
  return (raw || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\s+/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body.plan || "packet") as PlanId;
    const catalog = [...PLANS, ...ADDONS];
    const plan = catalog.find((p) => p.id === id);
    if (!plan || plan.price === 0) {
      return NextResponse.json({ error: "Choose a paid seat." }, { status: 400 });
    }

    const key = cleanKey(process.env.STRIPE_SECRET_KEY);
    const link = await readLink();
    const origin = siteUrl(req.headers.get("origin"));

    if (!key) {
      return NextResponse.json({
        ok: true,
        demo: true,
        entitlement: entitle(id),
        message: "No Stripe platform key on the server.",
      });
    }

    if (!/^sk_(test|live)_/.test(key) && !/^rk_(test|live)_/.test(key)) {
      return NextResponse.json({
        error: "STRIPE_SECRET_KEY must start with sk_test_, sk_live_, rk_test_, or rk_live_. Re-paste the secret key only — no quotes, spaces, or pk_ publishable key.",
      }, { status: 400 });
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
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
