export type UseCase =
  | "shop"
  | "studio"
  | "garage"
  | "greenhouse"
  | "patio"
  | "adu"
  | "interior"
  | "deck"
  | "commercial"
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
  indoor: boolean;
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
  licenses: string[];
  whoMayAct: string;
  bidRule: string;
  planNotes: string[];
  inspections: string[];
  permit: string;
};

export type PlanSheet = {
  id: string;
  title: string;
  scale: string;
  notes: string[];
  trade?: string;
};

export type GateStatus = "required" | "likely" | "if-triggered" | "owner-option" | "blocked";

export type LegalGate = {
  id: string;
  title: string;
  status: GateStatus;
  agency: string;
  why: string;
  how: string;
  link?: string;
};

export type TradeLicense = {
  trade: string;
  licenses: string[];
  whoMayAct: string;
  bidRule: string;
};

export type LegalPacket = {
  verdict: string;
  cannotClaim: string;
  jurisdiction: string;
  spaceClass: string;
  sf: number;
  gates: LegalGate[];
  tradeLicenses: TradeLicense[];
  inspections: string[];
  bidClauses: string[];
  ownerNotice: string[];
  nextHuman: string[];
  readiness: { item: string; doneBySoftware: boolean; ownerMust: string }[];
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
  legal: LegalPacket;
};

export type Packet = {
  brief: Brief;
  generatedAt: string;
  disclaimer: string;
  schemes: Scheme[];
};
