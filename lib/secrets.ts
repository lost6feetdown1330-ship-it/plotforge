export function requiredSecret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function siteUrl(fallback?: string | null) {
  return process.env.NEXT_PUBLIC_SITE_URL || fallback || "https://plotforge-mu.vercel.app";
}

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
