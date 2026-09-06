"use client";

import Link from "next/link";
import { PLANS } from "@/lib/billing";
import { PayButton } from "./PayButton";

export function Paywall({ reason }: { reason: string }) {
  const paid = PLANS.filter((p) => p.price > 0 && p.id !== "desk");
  return (
    <div className="mt-8 rounded-3xl border border-[#d4b56a]/30 bg-[#d4b56a]/8 p-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4b56a]">Modest unlock</p>
      <h3 className="mt-2 font-display text-3xl">Keep the drawings. Pay a small desk fee.</h3>
      <p className="mt-2 text-sm text-white/65">{reason}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {paid.slice(0, 3).map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 p-4">
            <p className="font-display text-xl">{p.name}</p>
            <p className="text-[#d4b56a]">${p.price}{p.period === "month" ? "/mo" : ""}</p>
            <p className="mt-2 text-xs text-white/45">{p.modest}</p>
            <div className="mt-3"><PayButton plan={p.id} label={`$${p.price}`} /></div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/40"><Link href="/pricing" className="text-[#d4b56a]">All seats and add-ons</Link> · Live cards when Stripe is connected. Today this unlocks the browser.</p>
    </div>
  );
}
