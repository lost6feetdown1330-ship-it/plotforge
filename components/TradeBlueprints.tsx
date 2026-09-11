"use client";

import { dataUrl, sheetIdFor, tradeBlueprint } from "@/lib/draw";
import { downloadAllTradeBlueprints, downloadTradeBlueprint } from "@/lib/blueprintPack";
import type { Brief, Scheme } from "@/lib/types";

export function TradeBlueprints({ brief, scheme }: { brief: Brief; scheme: Scheme }) {
  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4b56a]">Digital builder set</p>
          <p className="mt-1 text-sm text-white/60">One SVG sheet and one JSON pack per trade. Send the pair to that shop.</p>
        </div>
        <button onClick={() => downloadAllTradeBlueprints(brief, scheme)} className="rounded-full bg-[#d4b56a] px-4 py-2 text-sm text-[#07080b]">Download all trades</button>
      </div>
      {scheme.trades.map((t, i) => (
        <figure key={t.trade} className="overflow-hidden rounded-2xl bg-[#0a2f5c]">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[#d6ecff]">
            <p>{sheetIdFor(t.trade, i)} · {t.trade} · {t.localShopType}</p>
            <button onClick={() => downloadTradeBlueprint(brief, scheme, t, i)} className="rounded-full border border-[#d6ecff]/40 px-3 py-1 text-xs">Download SVG + JSON</button>
          </div>
          <img src={dataUrl(tradeBlueprint(brief, scheme, t, i))} alt={`${t.trade} builder blueprint`} className="w-full" />
        </figure>
      ))}
    </div>
  );
}
