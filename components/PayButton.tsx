"use client";

import { useState } from "react";
import { entitle, type Entitlement, type PlanId } from "@/lib/billing";

const KEY = "plotforge.entitlement";

export function readEntitlement(): Entitlement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entitlement) : null;
  } catch {
    return null;
  }
}

export function writeEntitlement(ent: Entitlement) {
  localStorage.setItem(KEY, JSON.stringify(ent));
}

export function PayButton({ plan, label }: { plan: PlanId; label: string }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function pay() {
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      writeEntitlement(data.entitlement || entitle(plan));
      setMsg(data.message || "Unlocked on this browser.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button onClick={pay} disabled={busy} className="rounded-full bg-[#d4b56a] px-4 py-2 text-sm text-[#07080b]">{busy ? "Recording…" : label}</button>
      {msg && <p className="mt-2 text-xs text-white/50">{msg}</p>}
    </div>
  );
}
