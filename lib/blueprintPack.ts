import { dataUrl, sheetIdFor, tradeBlueprint } from "./draw";
import type { Brief, Scheme, TradePackage } from "./types";

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "trade";
}

export function digitalBlueprint(brief: Brief, scheme: Scheme, trade: TradePackage, index: number) {
  const sheet = sheetIdFor(trade.trade, index);
  return {
    format: "plotforge.digital-builder-blueprint.v1",
    notForConstruction: true,
    sheet,
    trade: trade.trade,
    localShopType: trade.localShopType,
    scheme: scheme.name,
    region: brief.region,
    useCase: brief.useCase,
    footprint: {
      widthFt: brief.widthFt,
      depthFt: brief.depthFt,
      heightFt: brief.heightFt,
      areaSf: brief.widthFt * brief.depthFt,
    },
    structure: scheme.structure,
    roof: scheme.roof,
    envelope: scheme.envelope,
    systems: scheme.systems,
    scope: trade.scope,
    assumptions: trade.assumptions,
    planNotes: trade.planNotes || [],
    lines: trade.lines,
    laborHours: trade.laborHours,
    subtotal: trade.subtotal,
    licenses: trade.licenses || [],
    whoMayAct: trade.whoMayAct || "Local licensed shop",
    bidRule: trade.bidRule || "Local subcontract only",
    inspections: trade.inspections || [],
    permit: trade.permit || "",
    drawing: {
      kind: "svg",
      filename: `${sheet}-${slug(trade.trade)}.svg`,
      previewDataUrl: dataUrl(tradeBlueprint(brief, scheme, trade, index)),
    },
    stamp: "Conceptual working drawing. Redraw on a stamped title block before permit.",
  };
}

function save(filename: string, mime: string, body: string) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTradeBlueprint(brief: Brief, scheme: Scheme, trade: TradePackage, index: number) {
  const sheet = sheetIdFor(trade.trade, index);
  const base = `${sheet}-${slug(trade.trade)}`;
  save(`${base}.svg`, "image/svg+xml", tradeBlueprint(brief, scheme, trade, index));
  save(`${base}.json`, "application/json", JSON.stringify(digitalBlueprint(brief, scheme, trade, index), null, 2));
}

export function downloadAllTradeBlueprints(brief: Brief, scheme: Scheme) {
  scheme.trades.forEach((trade, index) => downloadTradeBlueprint(brief, scheme, trade, index));
}
