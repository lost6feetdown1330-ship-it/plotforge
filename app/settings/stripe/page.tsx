"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = {
  connected: boolean;
  accountId: string | null;
  livemode: boolean;
  hasClientId: boolean;
  hasPlatformKey: boolean;
};

export default function StripeSettings() {
  const [st, setSt] = useState<Status | null>(null);
  useEffect(() => {
    fetch("/api/stripe/connect/status").then((r) => r.json()).then(setSt);
  }, []);

  return (
    <main className="min-h-screen bg-[#07080b] text-[#f3ead7]">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="font-display text-2xl">Plotforge</Link>
        <Link href="/pricing" className="text-xs uppercase tracking-[0.18em] text-[#d4b56a]">Pricing</Link>
      </header>
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4b56a]">Your Stripe</p>
        <h1 className="mt-3 font-display text-5xl">Sign in with Stripe.</h1>
        <p className="mt-4 text-white/60">Stripe will not hand this app your secret key from a normal dashboard login. You approve Plotforge once. Money lands in the Stripe account you sign in with.</p>

        <div className="mt-8 rounded-3xl border border-white/10 p-6">
          {!st && <p className="text-sm text-white/50">Checking link…</p>}
          {st?.connected && (
            <>
              <p className="font-display text-3xl">Connected</p>
              <p className="mt-2 text-sm text-white/55">Account {st.accountId} · {st.livemode ? "live" : "test"}</p>
              <button onClick={async () => { await fetch("/api/stripe/connect/status", { method: "DELETE" }); location.reload(); }} className="mt-5 rounded-full border border-white/15 px-4 py-2 text-sm">Disconnect</button>
            </>
          )}
          {st && !st.connected && (
            <>
              <p className="font-display text-3xl">Not linked</p>
              <a href="/api/stripe/connect/start" className="mt-5 inline-block rounded-full bg-[#635bff] px-5 py-3 text-sm text-white">Connect with Stripe</a>
              {(!st.hasClientId || !st.hasPlatformKey) && (
                <p className="mt-4 text-sm text-[#d0733a]">One-time platform setup is still needed: STRIPE_CLIENT_ID (ca_…) and STRIPE_SECRET_KEY from the same Stripe account, in Vercel. After that, you only tap this button.</p>
              )}
            </>
          )}
        </div>

        <ol className="mt-10 list-decimal space-y-3 pl-5 text-sm text-white/55">
          <li>Stripe Dashboard → Settings → Connect → get started as a platform (you can connect your own account).</li>
          <li>Copy the Connect client id <span className="text-[#d4b56a]">ca_…</span> into Vercel as STRIPE_CLIENT_ID.</li>
          <li>Redirect URI: <span className="text-[#d4b56a]">https://plotforge-mu.vercel.app/api/stripe/connect/callback</span></li>
          <li>Tap Connect with Stripe. Approve. Packets charge that account.</li>
        </ol>
      </section>
    </main>
  );
}
