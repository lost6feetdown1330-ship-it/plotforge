import type { Brief, LegalGate, LegalPacket, Scheme, TradeLicense } from "./types";
import { BCD_DIR, resolvePlace, regionLabel } from "./regions";

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
  const place = resolvePlace(`${brief.region} ${brief.prompt}`);
  const so = ["Jackson", "Josephine", "Douglas", "Klamath", "Curry", "Lake"].includes(place.county);
  const rural = place.kind !== "city" || ["Klamath", "Lake", "Curry", "Josephine", "Douglas"].includes(place.county);

  const gates: LegalGate[] = [
    {
      id: "jurisdiction",
      title: "Confirm who issues the permit",
      status: "required",
      agency: place.agency,
      why: so
        ? `${place.label} sits in ${place.county} County. Incorporated cities run their own building departments. Unincorporated land files at the county. Wrong counter rejects the packet.`
        : "A city mailing address can still sit in unincorporated county. Wrong counter rejects the packet.",
      how: place.how,
      link: place.portal || BCD_DIR,
    },
    {
      id: "zoning",
      title: "Zoning / setback / lot coverage",
      status: "required",
      agency: `${place.label} planning / ${place.county} County land use`,
      why: so
        ? "Southern Oregon rural lots are often EFU, forest, or rural residential. A shop that looks fine on a 12x24 pad can be illegal on farm or forest zoning. Floodplain along the Rogue, Umpqua, Illinois, and Chetco adds another overlay."
        : "Accessory structures follow base-zone setbacks. Confirm height, eave, and coverage before you stake.",
      how: "Pull the taxlot zoning. Stake the pad against the plat. Ask planning before you price an ADU or shop on resource land.",
    },
    {
      id: "building",
      title: "Building / structural permit",
      status: over120 || habitable ? "required" : "likely",
      agency: place.agency,
      why: over120
        ? `${sf} sf is over common accessory exemptions. Jackson County guidance treats sheds over 200 sf as permitted work; floodplain work of any size needs review. Ask ${place.agency}.`
        : "A tiny nonhabitable box may skip the building permit and still need zoning, electrical, and HOA. Ask a technician.",
      how: place.portal ? `Apply through ${place.agency}. Portal on file for this place.` : `Apply at ${place.agency}. Confirm on the Oregon BCD local directory.`,
      link: place.portal || BCD_DIR,
    },
    {
      id: "electrical",
      title: "Electrical permit + BCD electrical license",
      status: power ? "required" : "if-triggered",
      agency: `${place.agency} + Oregon BCD`,
      why: "Permanent wiring, services, feeders, and branch circuits need an electrical permit even if the building permit is exempt. The installer needs CCB plus the matching BCD electrical contractor license.",
      how: "List CCB and BCD numbers on the electrical application. Load calc if you add a subpanel.",
      link: BCD,
    },
    {
      id: "plumbing",
      title: "Plumbing permit + plumbing business license",
      status: wet ? "required" : "if-triggered",
      agency: `${place.agency} + Oregon BCD`,
      why: rural && so
        ? "New fixtures and waste/vent trigger a plumbing permit. Outside city sewer this also means DEQ or county septic approval before you price an ADU."
        : "New fixtures, in-wall piping, water heaters, and new waste/vent trigger a plumbing permit.",
      how: "Confirm sewer or septic capacity before you price wet rooms.",
    },
    {
      id: "mechanical",
      title: "Mechanical permit",
      status: scheme.id === "c" || spaceClass === "adu" || brief.useCase === "greenhouse" ? "required" : "if-triggered",
      agency: `${place.agency} mechanical permit`,
      why: "Mini-splits, ducts, gas piping, and many exhaust systems need a mechanical permit.",
      how: "File with equipment cut sheets.",
    },
    {
      id: "811",
      title: "Call 811 before any trench",
      status: "required",
      agency: "Oregon 811",
      why: "Hitting a gas line is how a backyard project becomes a disaster.",
      how: "Ticket, wait for marks, photograph marks. Local excavator calls 811 — Plotforge does not dig.",
    },
    {
      id: "ccb",
      title: "Oregon CCB license on anyone paid to bid or build",
      status: "required",
      agency: "Oregon Construction Contractors Board",
      why: "ORS 701: paid construction on real property generally requires an active CCB license statewide — Medford, Grants Pass, Roseburg, Klamath Falls, Brookings, and rural counties included.",
      how: "Look up the bidder. Require the CCB number on page 1 of any bid. Bond and insurance must be current.",
      link: CCB,
    },
    {
      id: "subs",
      title: "All physical work is local subcontract",
      status: "required",
      agency: "Plotforge delivery model",
      why: "Plotforge does not build, landscape, excavate, operate equipment, or cut trees. Hire shops that already work that county.",
      how: `Invite 2-3 CCB shops that list ${place.label} / ${place.county} County as home territory.`,
    },
    {
      id: "wildfire",
      title: "Local wildfire / WUI rules",
      status: so ? "likely" : "if-triggered",
      agency: place.agency,
      why: "Oregon repealed the statewide wildfire building map in 2025. Whether ember-resistant detailing applies now depends on the local jurisdiction — especially Jackson, Josephine, Douglas, and Klamath rebuild areas.",
      how: "Ask the building official if local WUI or defensible-space rules apply to this taxlot.",
    },
    {
      id: "septic",
      title: "Well / septic / DEQ when off city utilities",
      status: rural && (wet || habitable) ? "required" : rural ? "if-triggered" : "owner-option",
      agency: "Oregon DEQ or county onsite program",
      why: "Much of Southern Oregon outside Medford, Ashland, Grants Pass, and Roseburg cores is well and septic. An ADU or shop sink can die on soils, not on framing.",
      how: "Get a site evaluation before you lock the pad.",
    },
    {
      id: "stamp",
      title: "Licensed design professional when the city asks",
      status: habitable || spaceClass === "commercial" || scheme.id === "c" ? "likely" : "if-triggered",
      agency: "Oregon architect / engineer boards",
      why: "This app does not stamp plans. Habitable ADUs and non-prescriptive structures should assume an architect or engineer of record.",
      how: "Hand this packet to a licensed designer. They redraw it on their title block.",
    },
    {
      id: "hoa",
      title: "HOA / CC and Rs / historic overlay",
      status: place.id === "jacksonville" || place.id === "ashland" ? "likely" : "if-triggered",
      agency: "Private covenants / historic commission",
      why: "A city permit does not override a recorded ban on shops or metal roofs. Jacksonville and parts of Ashland add historic review.",
      how: "Get written design-review approval if the lot has an HOA or historic overlay.",
    },
  ];

  const tradeLicenses: TradeLicense[] = scheme.trades.map((t) => licenseFor(t.trade, spaceClass));
  const inspections = ["811 locate", "Footing / slab before pour", wet ? "Under-slab plumbing" : "No wet rough", "Framing / hold-downs before cover", power ? "Electrical rough" : "No electrical rough", wet ? "Plumbing rough" : "No plumbing rough", "Insulation / WRB", "Finals"];

  return {
    verdict: habitable
      ? `Habitable / occupancy path in ${regionLabel(place)}. Not legal until ${place.agency} stamps drawings and local CCB contractors sign their own bids.`
      : over120
        ? `${sf} sf accessory structure in ${regionLabel(place)}: assume building permit, trade permits, and local CCB-licensed subcontractors. Counter: ${place.agency}.`
        : `Possibly building-permit-light in ${regionLabel(place)} if it stays a small nonhabitable box. Zoning, electrical, and CCB can still apply.`,
    cannotClaim: "No software can make a bid 100% legal. Plotforge does not pour, frame, excavate, landscape, run equipment, or cut trees. Legality is a live local license, a city or county approval, and a signed subcontract.",
    jurisdiction: regionLabel(place),
    spaceClass,
    sf,
    gates,
    tradeLicenses,
    inspections,
    bidClauses: [
      "This is a conceptual proposal generated by Plotforge. It is not an offer to perform construction.",
      "Plotforge subcontracts ALL physical work: building, landscaping, construction, equipment operating, excavation, and tree work.",
      `File permits with ${place.agency}, not a neighboring city.`,
      "A legally usable Oregon construction bid must be issued by a local business with a CURRENT CCB license printed on the bid. Lookup: " + CCB_LOOKUP,
      "The signing contractor must hold every trade license for work they self-perform, or subcontract that work to another local licensed shop.",
      "Include CCB Information Notice to Owner and construction-lien consumer notice in the signed contract.",
      "Do not start work before permit issuance.",
      "Plotforge is not a contractor, architect, engineer, or law firm.",
    ],
    ownerNotice: [
      `Known place: ${place.label}, ${place.county} County — ${place.agency}.`,
      ...place.notes,
      "Ask every local bidder for CCB number, endorsement, bond, liability limits, workers comp, and BCD numbers for electrical or plumbing.",
      "Owner-builder rules are narrow and do not let you bid the work to someone else as if you were a contractor.",
    ],
    nextHuman: [
      `Verify the taxlot is actually ${place.label} and not the neighboring city or unincorporated ${place.county} County.`,
      place.portal ? `Open the local portal: ${place.portal}` : "Open the Oregon BCD local building department directory.",
      `Send each trade package to 2-3 licensed shops that work ${place.county} County.`,
      habitable ? "Hire an Oregon-licensed designer for the drawing set." : "Ask the building official if engineered drawings are required.",
      "Local excavator calls 811 before the first shovel.",
    ],
  };
}

function licenseFor(trade: string, spaceClass: string): TradeLicense {
  const t = trade.toLowerCase();
  if (t.includes("electrical")) return { trade, licenses: ["Oregon CCB", "BCD Electrical Contractor license matching scope"], whoMayAct: "Only a local CCB + BCD electrical contractor. Plotforge does not pull wire.", bidRule: "Electrical dollars stay an allowance until that contractor writes their own bid." };
  if (t.includes("plumbing")) return { trade, licenses: ["Oregon CCB", "BCD Plumbing Business license", "Limited electrical if they reconnect wired appliances"], whoMayAct: "Local plumbing contractor for piping and fixtures.", bidRule: "Say in writing if the slab is only sleeved." };
  if (t.includes("hvac") || t.includes("mechanical")) return { trade, licenses: ["Oregon CCB", "Mechanical permit scope"], whoMayAct: "Local HVAC contractor, not a handyman with a ladder.", bidRule: "Equipment stays an allowance until model numbers exist." };
  if (t.includes("tree") || t.includes("arbor")) return { trade, licenses: ["Oregon CCB landscape / tree endorsement where required", "ISA certified arborist for removals near structures"], whoMayAct: "Local arborist / landscape contractor only.", bidRule: "Tree work is never self-performed by Plotforge." };
  if (t.includes("equipment") || t.includes("excav")) return { trade, licenses: ["Oregon CCB", "Equipment operator employed by the excavation contractor"], whoMayAct: "Local excavation shop. Homeowner does not run the mini-ex on a Plotforge job.", bidRule: "Machine hours are an allowance until the local shop walks the site." };
  if (t.includes("landscape")) return { trade, licenses: ["Oregon CCB landscape contractor"], whoMayAct: "Local landscape contractor after the structure is up.", bidRule: "Restore package is separate from the builder." };
  return { trade, licenses: ["Oregon CCB with an endorsement that matches the work", spaceClass === "commercial" ? "Commercial endorsement if this is not a dwelling accessory" : "Residential endorsement for a home-lot structure", "Bond + CGL at CCB minimums", "Workers comp if they have employees"], whoMayAct: "A currently licensed LOCAL contractor. Plotforge coordinates the packet only.", bidRule: "No CCB number on page 1 means it is not a legal construction bid." };
}

export function clerkReply(question: string, brief: Brief, scheme: Scheme, legal: LegalPacket) {
  const q = question.toLowerCase();
  const place = resolvePlace(`${brief.region} ${brief.prompt}`);
  if (/100%|fully legal|perfectly legal/.test(q)) return legal.cannotClaim + " " + legal.verdict;
  if (/southern|medford|ashland|grants pass|roseburg|klamath|brookings|jackson|josephine|douglas|curry|lakeview/.test(q)) {
    return `${place.label}, ${place.county} County files with ${place.agency}. ${place.how} Cities and unincorporated land are different counters. This is a map of known Southern Oregon places, not a stamped approval.`;
  }
  if (/sub|who builds|do you build|crew|excavat|tree|equipment|landscape/.test(q)) return "Plotforge does not build. Every physical trade is subcontracted to local licensed businesses in the county of the parcel.";
  if (/permit/.test(q)) return legal.gates.filter((g) => g.status === "required" || g.status === "likely").map((g) => g.title + " - " + g.why).join(" ");
  if (/license|ccb/.test(q)) return "Anyone paid to build this generally needs a live Oregon CCB license. Electrical and plumbing add BCD trade licenses. Look up the number before a deposit.";
  if (/inspect/.test(q)) return "Inspection spine: " + legal.inspections.join("; ") + ".";
  if (/adu/.test(q)) return `An ADU in ${place.label} is zoning plus building plus trade permits. Rural ${place.county} County often adds septic. Not a shed with a bed.`;
  return legal.verdict + " You asked about: " + question + ". For " + scheme.name + " (" + legal.sf + " sf " + legal.spaceClass + " in " + legal.jurisdiction + "), use the required gates. This is not legal advice.";
}
