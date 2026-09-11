"use client";

import type { Brief, SpaceTarget } from "@/lib/types";

const TARGETS: { id: SpaceTarget; label: string }[] = [
  { id: "outside", label: "Outside" },
  { id: "inside", label: "Inside" },
  { id: "room", label: "One room" },
  { id: "roof", label: "Roof only" },
  { id: "both", label: "Inside + outside" },
];

export function SpacePicker({ brief, setBrief }: { brief: Brief; setBrief: (b: Brief) => void }) {
  return (
    <div className="mt-4">
      <p className="kpi text-[#d4b56a]">What to redesign</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TARGETS.map((t) => (
          <button
            key={t.id}
            onClick={() =>
              setBrief({
                ...brief,
                spaceTarget: t.id,
                indoor: t.id === "inside" || t.id === "room",
                useCase: t.id === "roof" ? "roof" : t.id === "room" ? "room" : brief.useCase === "roof" || brief.useCase === "room" ? "custom" : brief.useCase,
              })
            }
            className={`rounded-full px-3 py-1.5 text-xs ${brief.spaceTarget === t.id ? "bg-[#d4b56a] text-[#07080b]" : "border border-white/10"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
