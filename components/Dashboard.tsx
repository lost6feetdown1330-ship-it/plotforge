import { usd } from "@/lib/money";
import type { Brief, Scheme } from "@/lib/types";

export function Dashboard({ brief, scheme }: { brief: Brief; scheme: Scheme }) {
  const gates = scheme.legal.gates.filter((g) => g.status === "required" || g.status === "likely").length;
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-white/10 p-4">
        <p className="kpi">Bid range</p>
        <p className="mt-2 font-display text-3xl">{usd(scheme.bidLow)}–{usd(scheme.bidHigh)}</p>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <p className="kpi">Trades</p>
        <p className="mt-2 font-display text-3xl">{scheme.trades.length}</p>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <p className="kpi">Permit gates</p>
        <p className="mt-2 font-display text-3xl">{gates}</p>
      </div>
      <div className="rounded-2xl border border-white/10 p-4">
        <p className="kpi">Weeks</p>
        <p className="mt-2 font-display text-3xl">{scheme.timelineWeeks}</p>
      </div>
      <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-white/10 p-4 text-sm text-white/60">
        <p className="kpi text-[#d4b56a]">{brief.spaceTarget || (brief.indoor ? "inside" : "outside")} · {brief.region}</p>
        <p className="mt-2">{scheme.deliveryModel}</p>
      </div>
    </div>
  );
}
