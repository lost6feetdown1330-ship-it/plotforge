"use client";

import Link from "next/link";
import { ADDONS, PLANS, TAKE_RATE } from "@/lib/billing";
import { PayButton } from "@/components/PayButton";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#07080b] text-[#f3ead7]">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <Link href="/" className="font-display text-2xl">Plotforge</Link>
        <Link href="/" className="text-xs uppercase tracking-[0.18em] text-[#d4b56a]">Back to desk</Link>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4b56a]">Quiet prices</p>
        <h1 className="mt-3 font-display text-5xl leading-tight">Enough to keep the lights on.<br />Not enough to look hungry.</h1>
        <p className="mt-4 max-w-2xl text-white/60">Packets stay cheaper than a lunch. Seats stay cheaper than a helper. We do not mark up the build. Local shops keep the job.</p>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-10 md:grid-cols-2">
        {PLANS.map((p) => (
          <article key={p.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4b56a]">{p.modest}</p>
            <h2 className="mt-2 font-display text-3xl">{p.name}</h2>
            <p className="mt-2 font-display text-4xl">{p.price === 0 ? "Free" : `$${p.price}`}<span className="text-base text-white/40">{p.period === "month" ? " / mo" : p.price ? " once" : ""}</span></p>
            <p className="mt-3 text-sm text-white/65">{p.blurb}</p>
            <ul className="mt-4 list-disc pl-5 text-sm text-white/55">{p.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            {p.price > 0 && <div className="mt-5"><PayButton plan={p.id} label={`Pay $${p.price}`} /></div>}
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4b56a]">Small add-ons</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {ADDONS.map((p) => (
            <article key={p.id} className="rounded-3xl border border-white/10 p-6">
              <h2 className="font-display text-2xl">{p.name} · ${p.price}</h2>
              <p className="mt-2 text-sm text-white/60">{p.blurb}</p>
              <p className="mt-2 text-xs text-white/40">{p.modest}</p>
              <div className="mt-4"><PayButton plan={p.id} label={`Add $${p.price}`} /></div>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-xs text-white/35">{TAKE_RATE}</p>
      </section>
    </main>
  );
}
