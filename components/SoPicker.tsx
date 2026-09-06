"use client";

import { soCountyGroups } from "@/lib/regions";
import type { Brief } from "@/lib/types";

export function SoPicker({ brief, setBrief }: { brief: Brief; setBrief: (b: Brief) => void }) {
  return (
    <div className="mt-4">
      <p className="kpi text-[#d4b56a]">Known areas · Southern Oregon</p>
      <div className="mt-2 space-y-3">
        {soCountyGroups().map((g) => (
          <div key={g.county}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{g.county} County</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {g.places.filter((p) => p.kind !== "unincorporated" || p.label.startsWith("Unincorporated")).slice(0, 10).map((p) => {
                const on = brief.region.toLowerCase().includes(p.label.toLowerCase());
                return (
                  <button
                    key={p.id}
                    onClick={() => setBrief({ ...brief, region: `${p.label}, ${p.county} County, Oregon`, prompt: brief.prompt.includes(p.label) ? brief.prompt : `${brief.prompt} in ${p.label}`.trim() })}
                    className={`rounded-full px-2.5 py-1 text-[11px] ${on ? "bg-[#d4b56a] text-[#07080b]" : "border border-white/10 text-white/70"}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
