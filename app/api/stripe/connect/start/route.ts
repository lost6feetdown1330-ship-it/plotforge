import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/secrets";

export async function GET() {
  const clientId = process.env.STRIPE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({
      error:
        "Add STRIPE_CLIENT_ID (ca_...) from Stripe → Settings → Connect. Stripe will not give an app your secret key from a normal dashboard login.",
    }, { status: 400 });
  }
  const redirect = `${siteUrl()}/api/stripe/connect/callback`;
  const url = new URL("https://connect.stripe.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "read_write");
  url.searchParams.set("redirect_uri", redirect);
  return NextResponse.redirect(url.toString());
}
