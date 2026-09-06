import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/lib/secrets";
import { writeLink } from "@/lib/stripeConnect";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const err = req.nextUrl.searchParams.get("error");
  const origin = siteUrl(req.nextUrl.origin);
  if (err || !code) {
    return NextResponse.redirect(`${origin}/settings/stripe?error=${encodeURIComponent(err || "denied")}`);
  }
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.redirect(`${origin}/settings/stripe?error=missing_platform_key`);
  }
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_secret: secret,
  });
  const res = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok || !data.stripe_user_id) {
    return NextResponse.redirect(`${origin}/settings/stripe?error=token`);
  }
  await writeLink({
    accountId: data.stripe_user_id,
    livemode: Boolean(data.livemode),
  });
  return NextResponse.redirect(`${origin}/settings/stripe?linked=1`);
}
