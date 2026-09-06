import type { Brief, LegalGate, LegalPacket, Scheme, TradeLicense } from "./types";

const HILLSBORO_PORTAL = "https://aca-prod.accela.com/HILLSBORO/Default.aspx";
const HILLSBORO_PERMITS = "https://www.hillsboro-oregon.gov/services/permitting-center/developers-contractors/building-permits";
const CCB = "https://www.oregon.gov/ccb/Pages/CCB%20License.aspx";
const BCD = "https://www.oregon.gov/bcd/lbdd/pages/oregon-permits.aspx";
const CCB_LOOKUP = "https://search.ccb.state.or.us/search/";

export function classifySpace(brief: Brief) {
  const p = (brief.prompt + " " + brief.useCase).toLowerCase();
  if (/\badu\b|guest house|living unit|apartment/.test(p) || brief.useCase === "adu") return "adu";
  if (/kitchen|bath|interior|bedroom|basement|garage conversion/.test(p) || brief.useCase === "interior" || brief.indoor) return "interior-alteration";
  if (/fence|deck|patio|pergola/.test(p) || brief.useCase === "patio" || brief.useCase === "deck") return "yard-structure";
  if (/commercial|tenant|retail|office build/.test(p) || brief.useCase === "commercial") return "commercial";
  if (/green/.test(p) || brief.useCase === "greenhouse") return "greenhouse";
  return "accessory-structure";
}

export function buildLegal(brief: Brief, scheme: Pick<Scheme, "id" | "name" | "trades">): LegalPacket {
  const sf = brief.widthFt * brief.depthFt;
  const spaceClass = classifySpace(brief);
  const wet = brief.hasWater || spaceClass === "adu" || brief.useCase === "greenhouse";
  const power = brief.hasPower || spaceClass !== "yard-structure";
  const over120 = sf > 120;
  const habitable = spaceClass === "adu" || spaceClass === "interior-alteration";

  const gates: LegalGate[] = [
    { id: "jurisdiction", title: "Confirm who issues the permit", status: "required", agency: "City of Hillsboro or Washington County LUT", why: "A Hillsboro mailing address can still sit in unincorporated county. Wrong counter rejects the packet.", how: "City limits: Hillsboro Building Division. Unincorporated: Washington County LUT Building Services, 155 N First Ave. Verify the parcel before you apply.", link: HILLSBORO_PERMITS },
    { id: "zoning", title: "Zoning / setback / lot coverage", status: "required", agency: "Hillsboro CDC including 12.40.104", why: "Accessory structures follow base-zone setbacks. A 3 ft side/rear cut exists only if footprint is 450 sf or less, one story, mid-roof height max 10 ft, eaves 2 ft off the line, behind the front plane, 6 ft from other buildings.", how: "Stake the pad against the plat. 12x24 is 288 sf so height/eave rules decide whether the 3 ft setback is legal." },
    { id: "building", title: "Building / structural permit", status: over120 || habitable ? "required" : "likely", agency: "Hillsboro Building Division", why: over120 ? `${sf} sf is over the common 120 sf accessory exemption in Hillsboro guidance. City materials also say a permit is required to build a new shed or structure.` : "A tiny nonhabitable box may skip the building permit and still need zoning, electrical, and HOA. Ask a technician.", how: "Apply in the Hillsboro Permit Portal, Building module. This packet is a briefing, not the stamped set.", link: HILLSBORO_PORTAL },
    { id: "electrical", title: "Electrical permit + BCD electrical license", status: power ? "required" : "if-triggered", agency: "Hillsboro + Oregon BCD", why: "Permanent wiring, services, feeders, and branch circuits need an electrical permit even if the building permit is exempt. The installer needs CCB plus the matching BCD electrical contractor license.", how: "List CCB and BCD numbers on the electrical application. Load calc if you add a subpanel.", link: BCD },
    { id: "plumbing", title: "Plumbing permit + plumbing business license", status: wet ? "required" : "if-triggered", agency: "Hillsboro + Oregon BCD", why: "New fixtures, in-wall piping, water heaters, and new waste/vent trigger a plumbing permit. Wired appliances can also need a limited electrical license.", how: "Confirm sewer availability before you price an ADU." },
    { id: "mechanical", title: "Mechanical permit", status: scheme.id === "c" || spaceClass === "adu" || brief.useCase === "greenhouse" ? "required" : "if-triggered", agency: "Hillsboro mechanical permit", why: "Mini-splits, ducts, gas piping, and many exhaust systems need a mechanical permit.", how: "File with equipment cut sheets." },
    { id: "811", title: "Call 811 before any trench", status: "required", agency: "Oregon 811", why: "Hitting a gas line is how a backyard project becomes a disaster.", how: "Ticket, wait for marks, photograph marks." },
    { id: "ccb", title: "Oregon CCB license on anyone paid to bid or build", status: "required", agency: "Oregon Construction Contractors Board", why: "ORS 701: paid construction on real property generally requires an active CCB license. There is no useful dollar minimum once you advertise or act like a contractor. The casual under-$1000 exemption dies if you market yourself as a contractor.", how: "Look up the bidder. Require the CCB number on page 1 of any bid. Bond and insurance must be current.", link: CCB },
    { id: "stamp", title: "Licensed design professional when the city asks", status: habitable || spaceClass === "commercial" || scheme.id === "c" ? "likely" : "if-triggered", agency: "Oregon architect / engineer boards", why: "This app does not stamp plans. Habitable ADUs and non-prescriptive structures should assume an architect or engineer of record.", how: "Hand this packet to a licensed designer. They redraw it on their title block." },
    { id: "hoa", title: "HOA / CC and Rs", status: "if-triggered", agency: "Private covenants", why: "A city permit does not override a recorded ban on shops or metal roofs.", how: "Get written design-review approval if the lot has an HOA." },
  ];

  const tradeLicenses: TradeLicense[] = scheme.trades.map((t) => licenseFor(t.trade, spaceClass));
  const inspections = ["811 locate", "Footing / slab before pour", wet ? "Under-slab plumbing" : "No wet rough", "Framing / hold-downs before cover", power ? "Electrical rough" : "No electrical rough", wet ? "Plumbing rough" : "No plumbing rough", "Insulation / WRB", "Finals"];

  return {
    verdict: habitable
      ? "Habitable / occupancy path. Not legal until the city stamps drawings and a contractor with a live CCB number signs a bid."
      : over120
        ? `${sf} sf accessory structure: assume building permit, trade permits, and CCB-licensed bidders. This is the map, not the license.`
        : "Possibly building-permit-light if it stays a small nonhabitable box. Zoning, electrical, and CCB can still apply.",
    cannotClaim: "No software can make a bid 100% legal. Legality is a live license, a city approval, and a signed contract. Plotforge inventories the gates. Humans walk through them.",
    jurisdiction: brief.region,
    spaceClass,
    sf,
    gates,
    tradeLicenses,
    inspections,
    bidClauses: [
      "This is a conceptual proposal generated by Plotforge. It is not an offer to perform construction.",
      "A legally usable Oregon construction bid must be issued by a business with a CURRENT CCB license printed on the bid. Lookup: " + CCB_LOOKUP,
      "The signing contractor must hold every trade license for work they self-perform, or subcontract that work.",
      "Include CCB Information Notice to Owner and construction-lien consumer notice in the signed contract.",
      "Do not start work before permit issuance.",
      "Plotforge is not a contractor, architect, engineer, or law firm.",
    ],
    ownerNotice: [
      "Ask every bidder for CCB number, endorsement, bond, liability limits, workers comp, and BCD numbers for electrical or plumbing.",
      "Owner-builder rules are narrow and do not let you bid the work to someone else as if you were a contractor.",
      "Keep the approved permit set on site.",
    ],
    nextHuman: [
      "Verify city vs county on the parcel.",
      "Open the Hillsboro permit guide and portal.",
      "Hire a CCB-licensed contractor to convert this packet into their bid.",
      habitable ? "Hire an Oregon-licensed designer for the drawing set." : "Ask the building official if engineered drawings are required.",
      "Call 811 before the first shovel.",
    ],
  };
}

function licenseFor(trade: string, spaceClass: string): TradeLicense {
  const t = trade.toLowerCase();
  if (t.includes("electrical")) return { trade, licenses: ["Oregon CCB", "BCD Electrical Contractor license matching scope"], whoMayAct: "Only a CCB + BCD electrical contractor.", bidRule: "Electrical dollars stay an allowance until that contractor writes their own bid." };
  if (t.includes("plumbing")) return { trade, licenses: ["Oregon CCB", "BCD Plumbing Business license", "Limited electrical if they reconnect wired appliances"], whoMayAct: "Plumbing contractor for piping and fixtures.", bidRule: "Say in writing if the slab is only sleeved." };
  if (t.includes("hvac") || t.includes("mechanical")) return { trade, licenses: ["Oregon CCB", "Mechanical permit scope"], whoMayAct: "HVAC contractor, not a handyman with a ladder.", bidRule: "Equipment stays an allowance until model numbers exist." };
  return { trade, licenses: ["Oregon CCB with an endorsement that matches the work", spaceClass === "commercial" ? "Commercial endorsement if this is not a dwelling accessory" : "Residential endorsement for a home-lot structure", "Bond + CGL at CCB minimums", "Workers comp if they have employees"], whoMayAct: "A currently licensed contractor, or an owner acting under actual owner-builder rules.", bidRule: "No CCB number on page 1 means it is not a legal construction bid." };
}

export function clerkReply(question: string, brief: Brief, scheme: Scheme, legal: LegalPacket) {
  const q = question.toLowerCase();
  if (/100%|fully legal|perfectly legal/.test(q)) return legal.cannotClaim + " " + legal.verdict;
  if (/permit/.test(q)) return legal.gates.filter((g) => g.status === "required" || g.status === "likely").map((g) => g.title + " - " + g.why).join(" ");
  if (/license|ccb/.test(q)) return "Anyone paid to build this generally needs a live Oregon CCB license. Electrical and plumbing add BCD trade licenses. Look up the number before a deposit.";
  if (/inspect/.test(q)) return "Inspection spine: " + legal.inspections.join("; ") + ".";
  if (/adu/.test(q)) return "Hillsboro ADUs are zoning plus building plus trade permits. Typical size 250-750 sf, one per lot. Not a shed with a bed.";
  return legal.verdict + " You asked about: " + question + ". For " + scheme.name + " (" + legal.sf + " sf " + legal.spaceClass + " in " + brief.region + "), use the required gates. This is not legal advice.";
}
