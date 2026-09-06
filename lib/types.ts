export type UseCase =
  | "shop"
  | "studio"
  | "garage"
  | "greenhouse"
  | "patio"
  | "adu"
  | "custom";

export type Finish = "budget" | "solid" | "pretty";

export type Brief = {
  widthFt: number;
  depthFt: number;
  heightFt: number;
  useCase: UseCase;
  prompt: string;
  finish: Finish;
  region: string;
  hasPower: boolean;
  hasWater: boolean;
  slope: "flat" | "gentle" | "steep";
};

export type TradeLine = {
  item: string;
  qty: string;
  unit: string;
  unitCost: number;
  total: number;
  notes: string;
};

export type TradePackage = {
  trade: string;
  code: string;
  scope: string;
  assumptions: string[];
  lines: TradeLine[];
  laborHours: number;
  subtotal: number;
};

export type PlanSheet = {
  id: string;
  title: string;
  scale: string;
  notes: string[];
};

export type Scheme = {
  id: string;
  name: string;
  vibe: string;
  pitch: string;
  why: string[];
  footprint: string;
  structure: string;
  roof: string;
  envelope: string;
  systems: string[];
  program: { zone: string; size: string; note: string }[];
  photos: { title: string; caption: string; kind: "photo" | "iso" | "elev" | "night" }[];
  sheets: PlanSheet[];
  trades: TradePackage[];
  bidLow: number;
  bidHigh: number;
  contingencyPct: number;
  timelineWeeks: string;
  permits: string[];
  risks: string[];
};

export type Packet = {
  brief: Brief;
  generatedAt: string;
  disclaimer: string;
  schemes: Scheme[];
};
