import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

export type StripeLink = {
  accountId: string;
  accessToken: string;
  livemode: boolean;
  scope: string;
};

const COOKIE = "pf_stripe";

function key() {
  const raw = process.env.PLOTFORGE_SESSION_SECRET || process.env.STRIPE_SECRET_KEY || "plotforge-dev-only";
  return createHash("sha256").update(raw).digest();
}

export function seal(link: StripeLink) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(link), "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return Buffer.concat([iv, tag, data]).toString("base64url");
}

export function open(token: string): StripeLink | null {
  try {
    const buf = Buffer.from(token, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const d = createDecipheriv("aes-256-gcm", key(), iv);
    d.setAuthTag(tag);
    const json = Buffer.concat([d.update(data), d.final()]).toString("utf8");
    return JSON.parse(json) as StripeLink;
  } catch {
    return null;
  }
}

export async function readLink(): Promise<StripeLink | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  return raw ? open(raw) : null;
}

export async function writeLink(link: StripeLink) {
  const jar = await cookies();
  jar.set(COOKIE, seal(link), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function clearLink() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
