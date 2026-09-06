import { NextResponse } from "next/server";
import { clearLink, readLink } from "@/lib/stripeConnect";

export async function GET() {
  const link = await readLink();
  return NextResponse.json({
    connected: Boolean(link),
    accountId: link?.accountId || null,
    livemode: link?.livemode || false,
    hasClientId: Boolean(process.env.STRIPE_CLIENT_ID),
    hasPlatformKey: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}

export async function DELETE() {
  await clearLink();
  return NextResponse.json({ connected: false });
}
