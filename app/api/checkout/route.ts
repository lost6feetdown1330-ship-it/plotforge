import { NextRequest, NextResponse } from "next/server";
import { ADDONS, entitle, PLANS, type PlanId } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = String(body.plan || "packet") as PlanId;
  const catalog = [...PLANS, ...ADDONS];
  const plan = catalog.find((p) => p.id === id);
  if (!plan || plan.price === 0) {
    return NextResponse.json({ error: "Choose a paid seat." }, { status: 400 });
  }
  const entitlement = entitle(id);
  return NextResponse.json({
    ok: true,
    demo: true,
    message:
      "Modest checkout recorded. Connect a Stripe key later to take live cards. This unlocks the desk on this browser.",
    plan,
    entitlement,
    charge: { amount: plan.price, currency: "usd", period: plan.period },
  });
}
