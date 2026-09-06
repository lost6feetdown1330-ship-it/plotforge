"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { entitle, type PlanId } from "@/lib/billing";
import { writeEntitlement } from "@/components/PayButton";
import { Suspense } from "react";

function SuccessInner() {
  const params = useSearchParams();
  const plan = (params.get("plan") || "packet") as PlanId;
  useEffect(() => {
    writeEntitlement(entitle(plan));
  }, [plan]);
  return (
    <main className="grid min-h-screen place-items-center bg-[#07080b] px-6 text-[#f3ead7]">
      <div className="max-w-lg text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4b56a]">Paid · modest</p>
        <h1 className="mt-4 font-display text-5xl">Seat is open.</h1>
        <p className="mt-4 text-white/60">Stripe took the card. This browser now has the drawings, clerk, and blueprints for that seat.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-[#d4b56a] px-5 py-3 text-sm text-[#07080b]">Back to the desk</Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#07080b] text-[#f3ead7]">Recording seat…</main>}>
      <SuccessInner />
    </Suspense>
  );
}
