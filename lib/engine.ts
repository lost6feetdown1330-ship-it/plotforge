import type { Brief, Finish, Scheme, TradeLine, TradePackage, UseCase } from "./types";
import { clamp } from "./money";

const FINISH_MULT: Record<Finish, number> = { budget: 0.82, solid: 1, pretty: 1.28 };

function line(item: string, qty: number, unit: string, unitCost: number, notes = ""): TradeLine {
  const q = Math.max(0.01, qty);
  return { item, qty: String(Math.round(q * 100) / 100), unit, unitCost, total: q * unitCost, notes };
}

function pack(trade: string, code: string, scope: string, lines: TradeLine[], assumptions: string[], laborHours: number): TradePackage {
  return { trade, code, scope, assumptions, lines, laborHours, subtotal: lines.reduce((s, l) => s + l.total, 0) };
}

function useLabel(u: UseCase) {
  return ({ shop: "workshop", studio: "studio", garage: "garage", greenhouse: "greenhouse", patio: "covered outdoor room", adu: "backyard living unit", custom: "custom structure" } as const)[u];
}

function programFor(brief: Brief, scheme: "a" | "b" | "c") {
  const sf = brief.widthFt * brief.depthFt;
  const u = brief.useCase;
  if (u === "patio") {
    return [
      { zone: "Covered lounge", size: `${Math.round(sf * 0.55)} sf`, note: "Dining + conversation" },
      { zone: "Cooking / serving", size: `${Math.round(sf * 0.25)} sf`, note: scheme === "c" ? "Outdoor kitchen stub" : "Grill alley" },
      { zone: "Storage / gear", size: `${Math.round(sf * 0.2)} sf`, note: "Cushions, tools" },
    ];
  }
  if (u === "greenhouse") {
    return [
      { zone: "Bench production", size: `${Math.round(sf * 0.45)} sf`, note: "Potting + starts" },
      { zone: "Circulation", size: `${Math.round(sf * 0.2)} sf`, note: "Center aisle" },
      { zone: "Climate gear", size: `${Math.round(sf * 0.15)} sf`, note: "Tank, fan, heat" },
      { zone: "Hardy beds", size: `${Math.round(sf * 0.2)} sf`, note: "In-ground or bags" },
    ];
  }
  if (u === "adu") {
    return [
      { zone: "Living / kitchen", size: `${Math.round(sf * 0.42)} sf`, note: "Open galley" },
      { zone: "Sleeping", size: `${Math.round(sf * 0.28)} sf`, note: scheme === "c" ? "Loft + nook" : "Alcove bed" },
      { zone: "Bath", size: "48-64 sf", note: "3/4 bath" },
      { zone: "Mechanical / storage", size: "remainder", note: "Stackable laundry" },
    ];
  }
  if (scheme === "a") {
    return [
      { zone: "Open work bay", size: `${Math.round(sf * 0.62)} sf`, note: "Bench + machine triangle" },
      { zone: "Lumber / rack", size: `${Math.round(sf * 0.18)} sf`, note: "Wall-hung" },
      { zone: "Dirty / finish", size: `${Math.round(sf * 0.12)} sf`, note: "Separated if possible" },
      { zone: "Entry / clean", size: `${Math.round(sf * 0.08)} sf`, note: "Coat + power" },
    ];
  }
  if (scheme === "b") {
    return [
      { zone: "Work bay", size: `${Math.round(sf * 0.5)} sf`, note: "Centered roll-up" },
      { zone: "Office nook", size: `${Math.round(sf * 0.16)} sf`, note: "Window to yard" },
      { zone: "Storage wall", size: `${Math.round(sf * 0.22)} sf`, note: "Floor-to-ceiling" },
      { zone: "Utility", size: `${Math.round(sf * 0.12)} sf`, note: "Sink + panel" },
    ];
  }
  return [
    { zone: "Flexible hall", size: `${Math.round(sf * 0.48)} sf`, note: "Shop now, studio later" },
    { zone: "Mezzanine storage", size: `${Math.round(sf * 0.2)} sf eq.`, note: "If eave height allows" },
    { zone: "Systems wall", size: `${Math.round(sf * 0.14)} sf`, note: "200A-ready" },
    { zone: "Show / guest", size: `${Math.round(sf * 0.18)} sf`, note: "Clean face to house" },
  ];
}

function tradesFor(brief: Brief, scheme: "a" | "b" | "c", finish: Finish): TradePackage[] {
  const m = FINISH_MULT[finish] * (scheme === "a" ? 0.92 : scheme === "b" ? 1 : 1.14);
  const sf = brief.widthFt * brief.depthFt;
  const peri = 2 * (brief.widthFt + brief.depthFt);
  const wallSf = peri * brief.heightFt;
  const roofSf = sf * 1.18;
  const slabIn = sf;
  const gravel = sf * 1.25;
  const slopeTax = brief.slope === "steep" ? 1.35 : brief.slope === "gentle" ? 1.12 : 1;
  const wet = brief.hasWater || brief.useCase === "adu" || brief.useCase === "greenhouse";
  const power = brief.hasPower || brief.useCase !== "patio";

  const site = pack("Sitework & earth", "02", "Strip, grade, drainage, base rock, access path from existing yard.", [
    line("Strip + grade pad", sf / 9, "sy", 18 * slopeTax * m, "6 in cut/fill typical"),
    line("3/4 minus base rock", gravel / 27, "cy", 62 * m, "6 in compacted"),
    line("Perimeter drain / daylight", brief.slope === "flat" ? peri * 0.4 : peri, "lf", 28 * m, "Required on PNW pads"),
    line("Utility trench", power || wet ? 28 : 0, "lf", 22 * m, "From house side"),
    line("Erosion + haul-off", 1, "ls", 850 * slopeTax * m),
  ], ["Assumes backyard machine access. Tight side yards add a wheelbarrow premium."], 24 * slopeTax);

  const concrete = pack("Concrete", "03", brief.useCase === "patio" ? "Thickened-edge slab or paver base." : "4-6 in slab on grade, thickened edge, vapor barrier, welded wire.", [
    line("Form + pour slab", slabIn, "sf", (brief.useCase === "patio" ? 9.5 : 11.5) * m, "4000 psi mix"),
    line("Vapor barrier + sand", slabIn, "sf", 1.4 * m),
    line("Rebar / WWF", slabIn, "sf", 1.9 * m),
    line("Anchor bolts / hold-downs", peri / 4, "ea", 14 * m),
    line("Equipment pad / apron", scheme === "a" ? 40 : 64, "sf", 12 * m, "Door side"),
  ], ["Not engineered for vehicles over 8k GVWR unless noted."], 18);

  const framing = pack("Framing & structure", "06", scheme === "a" ? "Post frame or simple stud walls, truss or rafter roof." : scheme === "b" ? "2x6 stud walls, raised-heel trusses, house-matching eave." : "2x6 + limited 2x8, optional loft joists.", [
    line("Wall framing", wallSf, "sf", (scheme === "a" ? 7.2 : 9.4) * m),
    line("Roof framing / trusses", roofSf, "sf", (scheme === "a" ? 8.1 : 10.2) * m),
    line("Sheathing walls + roof", wallSf + roofSf, "sf", 3.4 * m),
    line("Exterior doors / openings", scheme === "a" ? 2 : 3, "ea", 980 * m, "Includes one wide door"),
    line("Windows", scheme === "a" ? 2 : scheme === "b" ? 4 : 5, "ea", 620 * m),
    line("Hardware / connectors", 1, "ls", 740 * m),
  ], ["Prescriptive residential wood construction. Snow/wind check required for your exact lot."], 60);

  const envelope = pack("Roofing, wrap, siding", "07", scheme === "b" ? "House-matching lap or board-and-batten." : scheme === "c" ? "Metal roof + mixed siding + rainscreen." : "Metal roof and panel or T1-11.", [
    line("WRB + flashing", wallSf, "sf", 1.8 * m),
    line("Siding", wallSf * 0.92, "sf", (scheme === "a" ? 6.5 : 11) * m),
    line("Roofing system", roofSf, "sf", (scheme === "a" ? 7.5 : 10.5) * m),
    line("Gutters + downspouts", peri * 0.7, "lf", 14 * m),
    line("Exterior paint / stain", wallSf * 0.7, "sf", 2.4 * m),
  ], ["PNW rain is not a vibe. Kick-out flashing and a real overhang are not optional."], 40);

  const elec = pack("Electrical", "26", power ? (scheme === "c" ? "Subpanel, 100-200A feeder capacity, shop lighting, EV/welder-ready circuits." : "Subpanel, lighting, receptacles, exterior light and GFCI.") : "Conduit stub only.", power ? [
    line("Feeder + subpanel", 1, "ls", (scheme === "c" ? 4200 : 2600) * m),
    line("Interior circuits", scheme === "c" ? 10 : 6, "ea", 280 * m),
    line("LED high-bay / wrap", Math.ceil(sf / 80), "ea", 190 * m),
    line("Exterior + GFCI", 4, "ea", 160 * m),
    line("Permit / inspection allowance", 1, "ls", 320),
  ] : [line("Conduit stub only", 1, "ls", 480 * m)], ["Load calc belongs to a licensed electrician."], power ? 28 : 6);

  const plumb = wet ? pack("Plumbing", "22", brief.useCase === "adu" ? "3/4 bath + kitchen stub + hose bib." : brief.useCase === "greenhouse" ? "Hose bibs, drain, optional tank." : "Yard hydrant or utility sink.", [
    line("Water service stub", 1, "ls", 1450 * m),
    line("Waste / vent stub", brief.useCase === "adu" ? 1 : 0.4, "ls", 2200 * m),
    line("Fixtures", brief.useCase === "adu" ? 4 : 1, "ea", (brief.useCase === "adu" ? 480 : 260) * m),
    line("Hose bib / isolation", 2, "ea", 190 * m),
  ], ["Sewer availability can kill an ADU budget. Confirm first."], brief.useCase === "adu" ? 36 : 12) : pack("Plumbing", "22", "None in this scheme. Hose from house assumed.", [line("Allowance held", 1, "ls", 0)], ["Sleeve the slab now if water comes later."], 0);

  const mech = pack("HVAC / ventilation", "23", brief.useCase === "greenhouse" ? "Intake, exhaust, circulation, optional heat." : brief.useCase === "adu" ? "Mini-split + bath fan." : "Ridge or louver vent + one exhaust.", [
    line("Ventilation", 1, "ls", (brief.useCase === "greenhouse" ? 1600 : 420) * m),
    line("Mini-split allowance", brief.useCase === "adu" || scheme === "c" ? 1 : 0, "ls", 3800 * m),
    line("Insulation", brief.useCase === "patio" ? 0 : wallSf + roofSf * 0.5, "sf", (scheme === "a" ? 1.6 : 2.4) * m),
  ], ["Unconditioned shops still need moisture control in Oregon winters."], 10);

  const finishTrade = pack("Interiors & specialty", "09-12", scheme === "a" ? "OSB or plywood walls, basic benches." : scheme === "b" ? "GWB or plywood, paint, simple trim." : "Better lighting, built-ins, cleaner floor.", [
    line("Interior skin", brief.useCase === "patio" ? 0 : wallSf * 0.7, "sf", (scheme === "a" ? 2.1 : 4.4) * m),
    line("Floor finish", sf, "sf", (brief.useCase === "patio" ? 0.4 : scheme === "c" ? 4.8 : 1.2) * m),
    line("Built-ins / benches", 1, "ls", (scheme === "a" ? 600 : 1600) * m),
    line("Clean-up + punch", 1, "ls", 480 * m),
  ], ["Owner-build can cut this trade if you like dust."], 20);

  const gc = pack("General conditions", "01", "Supervision, temp facilities, dumpsters, small tools.", [
    line("GC / supervision", 1, "ls", 0.12 * (site.subtotal + concrete.subtotal + framing.subtotal + envelope.subtotal) * m),
    line("Dumpsters + protection", 2, "ea", 520 * m),
    line("Temp power / toilet", 1, "ls", 380 * m),
  ], ["Does not include architect, engineer, or city impact fees."], 16);

  return [site, concrete, framing, envelope, elec, plumb, mech, finishTrade, gc].filter((t) => t.subtotal > 0 || t.trade === "Plumbing");
}

function sheets(brief: Brief, name: string) {
  const wet = brief.hasWater || brief.useCase === "adu" || brief.useCase === "greenhouse";
  const list = [
    { id: "G-001", title: "Cover / code notes", scale: "n/a", notes: [`Project: ${name}`, `Pad ${brief.widthFt} x ${brief.depthFt} x ${brief.heightFt} ft eave`, "Conceptual. Not for permit without a designer of record."] },
    { id: "AS-101", title: "Architectural site plan", scale: "1/8 in = 1 ft", notes: ["Show existing house, setbacks, trees, utilities, drainage", "Confirm Hillsboro / Washington County setbacks before you stake"] },
    { id: "S-101", title: "Foundation / slab plan", scale: "1/4 in = 1 ft", notes: ["Thickened edge, vapor barrier, anchor bolts", "Hold-downs at openings"] },
    { id: "A-101", title: "Floor plan", scale: "1/4 in = 1 ft", notes: ["Door swings, work zones, electrical legend reference"] },
    { id: "A-201", title: "Roof plan", scale: "1/8 in = 1 ft", notes: ["Slope, ridges, gutters, snow path away from house"] },
    { id: "A-301", title: "Elevations N/S", scale: "1/4 in = 1 ft", notes: ["Finish grade, materials, opening sizes"] },
    { id: "A-302", title: "Elevations E/W", scale: "1/4 in = 1 ft", notes: ["Match house eave if neighbor-facing"] },
    { id: "E-101", title: "Electrical plan", scale: "1/4 in = 1 ft", notes: ["Subpanel, lights, receptacles, GFCI", "Load calc by electrician"] },
  ];
  if (wet) list.push({ id: "P-101", title: "Plumbing rough-in", scale: "1/4 in = 1 ft", notes: ["Water, waste, vent, hose bibs", "Sleeve the slab now even if fixtures wait"] });
  list.push({ id: "A-401", title: "Door / window / finish schedule", scale: "n/a", notes: ["Rough openings, U-factor targets for Oregon climate"] });
  return list;
}

export function buildSchemes(brief: Brief): Scheme[] {
  const label = useLabel(brief.useCase);
  const w = brief.widthFt;
  const d = brief.depthFt;
  const defs: { id: "a" | "b" | "c"; name: string; vibe: string; pitch: string; structure: string; roof: string; envelope: string; systems: string[]; weeks: string }[] = [
    { id: "a", name: `Workhorse ${label}`, vibe: "Utility first", pitch: `A clean ${w}x${d} working box. Cheap to stand up, honest to look at, built so you can use the square footage.`, structure: "Post-frame or simple stud walls on a thickened-edge slab.", roof: "Single-slope or low gable metal, drains away from the house.", envelope: "Metal or T1-11, limited openings, one wide door.", systems: brief.hasPower ? ["Subpanel", "Task lighting", "GFCI walls", "Vent"] : ["Passive vent", "Later feeder sleeve"], weeks: "4-7" },
    { id: "b", name: `Neighbor-facing ${label}`, vibe: "Looks like it belongs", pitch: `Same pad, calmer elevations. For the lot line you can see from the kitchen.`, structure: "2x6 walls, raised-heel trusses, openings that can take house-matching siding.", roof: "Gable, shingles or standing seam, overhangs that throw water clear.", envelope: "Board-and-batten or lap, real windows on the house side.", systems: ["Subpanel", "Heat-ready insulation", "Dimmed interior", "Exterior lanterns"], weeks: "6-10" },
    { id: "c", name: `Future-proof ${label}`, vibe: "Spend once, convert later", pitch: `Built as a ${label} now with the bones of something more: extra height, extra power, sleeved utilities.`, structure: "2x6+ with optional loft storage if eave is 10 ft or more.", roof: "Standing seam, hidden fasteners, ventilation bay.", envelope: "Rainscreen gap, better windows, two-tone siding.", systems: ["100-200A capable feeder", "Mini-split allowance", "Data / conduit", wetNote(brief)], weeks: "8-14" },
  ];
  return defs.map((def) => {
    const trades = tradesFor(brief, def.id, brief.finish);
    const sub = trades.reduce((s, t) => s + t.subtotal, 0);
    const cont = def.id === "c" ? 0.15 : 0.12;
    const promptHint = brief.prompt.trim();
    return {
      id: def.id,
      name: def.name,
      vibe: def.vibe,
      pitch: promptHint ? `${def.pitch} Prompt taken seriously: ${promptHint.slice(0, 160)}` : def.pitch,
      why: [
        `Fits a ${w} x ${d} ft clear pad without eating the rest of the yard.`,
        brief.slope === "flat" ? "Flat grade keeps the slab simple." : "Grade work is priced; do not skip drainage.",
        brief.hasPower ? "Power path is assumed from the house side." : "No feeder in the base bid - we still sleeve the trench.",
        def.id === "a" ? "Lowest time-to-useful." : def.id === "b" ? "Best resale / neighbor politics." : "Best conversion path if this becomes living space later.",
      ],
      footprint: `${w} ft x ${d} ft | ${w * d} sf enclosed pad`,
      structure: def.structure,
      roof: def.roof,
      envelope: def.envelope,
      systems: def.systems.filter(Boolean),
      program: programFor(brief, def.id),
      photos: [
        { title: "On your photo", caption: "Massing dropped onto the capture so you can judge scale.", kind: "photo" },
        { title: "Isometric", caption: "Volume, roof pitch, door side, and work zones.", kind: "iso" },
        { title: "Yard elevation", caption: "What the house and neighbor actually see.", kind: "elev" },
        { title: "Dusk", caption: "Lighting after 5pm, because that is when you will be out there.", kind: "night" },
      ],
      sheets: sheets(brief, def.name),
      trades,
      bidLow: Math.round(sub * 0.92),
      bidHigh: Math.round(sub * (1 + cont + 0.06)),
      contingencyPct: cont * 100,
      timelineWeeks: def.weeks,
      permits: permitList(brief),
      risks: riskList(brief, def.id),
    };
  });
}

function wetNote(brief: Brief) {
  if (brief.useCase === "adu") return "Full wet utility path";
  if (brief.hasWater) return "Water stub + hose bib";
  return "Sleeved water path only";
}

function permitList(brief: Brief) {
  const list = [
    "Zoning / setback check (Hillsboro + Washington County overlay if applicable)",
    "Building permit for a structure over typical shed exemption",
    "Electrical permit if a feeder or new circuits land",
  ];
  if (brief.useCase === "adu" || brief.hasWater) list.push("Plumbing permit + sewer availability letter if you add waste");
  if (brief.useCase === "adu") list.push("ADU path: owner-occupancy, parking, and utility hookup rules");
  list.push("Call 811 before any trench.");
  return list;
}

function riskList(brief: Brief, id: "a" | "b" | "c") {
  return [
    brief.slope !== "flat" ? "Grade and drainage will move the number more than siding color." : "Flat pads still pond. Pitch the slab.",
    "Access: if a mini-ex cannot reach the pad, labor steps off a cliff.",
    brief.useCase === "adu" ? "ADU cost of utilities often exceeds the box." : "Unpermitted shops become a sale problem.",
    id === "a" ? "Cheap envelope means condensation in January. Vent it." : "Nice elevations do not replace hold-downs.",
    "These numbers are conceptual 2026 PNW ranges, not a contractor bid.",
  ];
}

export function defaultBrief(): Brief {
  return {
    widthFt: 12,
    depthFt: 24,
    heightFt: 10,
    useCase: "shop",
    prompt: "A clean backyard shop I can actually build, with room for a bench, a mower, and a roll-up door facing the side yard.",
    finish: "solid",
    region: "Hillsboro, Oregon",
    hasPower: true,
    hasWater: false,
    slope: "flat",
  };
}

export function parsePromptHints(prompt: string, brief: Brief): Brief {
  const p = prompt.toLowerCase();
  const next = { ...brief, prompt };
  const dim = p.match(/(\d{1,2})\s*[xby]\s*(\d{1,2})/);
  if (dim) {
    next.widthFt = clamp(Number(dim[1]), 6, 40);
    next.depthFt = clamp(Number(dim[2]), 6, 60);
  }
  if (/\badu\b|guest house|living/.test(p)) next.useCase = "adu";
  else if (/green\s*house|grow/.test(p)) next.useCase = "greenhouse";
  else if (/patio|pavilion|pergola|outdoor/.test(p)) next.useCase = "patio";
  else if (/garage/.test(p)) next.useCase = "garage";
  else if (/studio|office|art/.test(p)) next.useCase = "studio";
  else if (/shop|workshop|shed|barn/.test(p)) next.useCase = "shop";
  if (/cheap|budget|bare/.test(p)) next.finish = "budget";
  if (/pretty|nice|match the house|beautiful|high end/.test(p)) next.finish = "pretty";
  if (/no power|off grid/.test(p)) next.hasPower = false;
  if (/water|sink|bath|hose/.test(p)) next.hasWater = true;
  if (/slope|hill|grade/.test(p)) next.slope = "gentle";
  if (/steep/.test(p)) next.slope = "steep";
  return next;
}
