export type PlanId = "look" | "packet" | "bundle" | "atelier" | "desk" | "dossier" | "intros";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  period: "once" | "month";
  blurb: string;
  includes: string[];
  modest: string;
};

export const PLANS: Plan[] = [
  {
    id: "look",
    name: "Look",
    price: 0,
    period: "once",
    blurb: "See the space and one scheme. Enough to know if the lot works.",
    includes: ["Camera + upload", "One scheme preview", "Atlas of known Southern Oregon places"],
    modest: "Always free.",
  },
  {
    id: "packet",
    name: "Site packet",
    price: 9,
    period: "once",
    blurb: "One lot. Three schemes. Trade blueprints and a clerk map for that county.",
    includes: ["3 schemes", "Per-trade blueprints", "Local-sub bid sheet", "Clerk + permits for that city or county", "Print dossier"],
    modest: "Less than a lunch. Pays for the desk on that job.",
  },
  {
    id: "bundle",
    name: "Five-lot bundle",
    price: 29,
    period: "once",
    blurb: "Five packets when you are pricing a few pads or a small street.",
    includes: ["5 site packets", "Same drawings and clerk maps", "Keeps the per-lot cost under $6"],
    modest: "For people who do not want a subscription.",
  },
  {
    id: "atelier",
    name: "Atelier",
    price: 17,
    period: "month",
    blurb: "Unlimited personal packets. Cancel any month.",
    includes: ["Unlimited site packets", "Southern Oregon + Hillsboro counters", "Print included", "New trade sheets as we add them"],
    modest: "Priced like a cheap software seat, not a contractor fee.",
  },
  {
    id: "desk",
    name: "Shop desk",
    price: 39,
    period: "month",
    blurb: "For a local GC or trade shop sending packets to owners.",
    includes: ["Everything in Atelier", "No Plotforge mark on owner PDFs", "Save jobs by address", "Invite three shop emails per job"],
    modest: "One hour of a helper. Not a franchise fee.",
  },
];

export const ADDONS: Plan[] = [
  {
    id: "dossier",
    name: "Paper dossier",
    price: 6,
    period: "once",
    blurb: "We queue a print-ready set. You still walk it to the counter.",
    includes: ["Print-formatted packet", "Sheet index"],
    modest: "Ink money. Not a permit fee.",
  },
  {
    id: "intros",
    name: "Three local intros",
    price: 15,
    period: "once",
    blurb: "We pass the packet to three CCB shops that list that county. They bid you. We do not take a cut of the build.",
    includes: ["3 introductions", "Packet attached", "No build markup"],
    modest: "A tank of gas, not a finder's fortune.",
  },
];

export const TAKE_RATE =
  "If we ever introduce a bid-won fee it will stay at 3% of the accepted subcontract, capped at $120, and only when both sides opt in. Not on today.";

export type Entitlement = {
  plan: PlanId;
  packetsLeft: number;
  unlimited: boolean;
  desk: boolean;
  paidAt: string;
};

export function entitle(plan: PlanId): Entitlement {
  const paidAt = new Date().toISOString();
  if (plan === "desk") return { plan, packetsLeft: 999, unlimited: true, desk: true, paidAt };
  if (plan === "atelier") return { plan, packetsLeft: 999, unlimited: true, desk: false, paidAt };
  if (plan === "bundle") return { plan, packetsLeft: 5, unlimited: false, desk: false, paidAt };
  if (plan === "packet") return { plan, packetsLeft: 1, unlimited: false, desk: false, paidAt };
  return { plan: "look", packetsLeft: 0, unlimited: false, desk: false, paidAt };
}

export function canUnlockFull(ent: Entitlement | null) {
  if (!ent) return false;
  return ent.unlimited || ent.packetsLeft > 0 || ent.desk;
}
