import type { Brief, Finish, Scheme, TradeLine, TradePackage, UseCase } from "./types";
import { clamp } from "./money";
import { buildLegal } from "./legal";

const FINISH_MULT: Record<Finish, number> = { budget: 0.82, solid: 1, pretty: 1.28 };

const DELIVERY =
  "Plotforge designs, prices, and packages. Every physical trade is bid and performed by a local licensed subcontractor. No in-house crews, machines, excavation, tree work, or construction.";

function line(item: string, qty: number, unit: string, unitCost: number, notes = ""): TradeLine {
  const q = Math.max(0.01, qty);
  return { item, qty: String(Math.round(q * 100) / 100), unit, unitCost, total: q * unitCost, notes };
}

function pack(
  trade: string,
  code: string,
  scope: string,
  lines: TradeLine[],
  assumptions: string[],
  laborHours: number,
  localShopType: string,
): TradePackage {
  return {
    trade,
    code,
    scope: `SUBCONTRACTED to a local ${localShopType}. ${scope}`,
    assumptions: ["Local licensed business performs all field work.", ...assumptions],
    lines,
    laborHours,
    subtotal: lines.reduce((s, l) => s + l.total, 0),
    delivery: "local-sub",
    localShopType,
    bidRule: "Invite 2-3 local CCB shops. This line is an allowance until they write their own bid.",
  };
}

function useLabel(u: UseCase) {
  return ({
    shop: "workshop",
    studio: "studio",
    garage: "garage",
    greenhouse: "greenhouse",
    patio: "covered outdoor room",
    adu: "backyard living unit",
    interior: "interior remodel",
    deck: "deck or yard structure",
    commercial: "commercial space",
    custom: "custom structure",
  } as const)[u];
}

function programFor(brief: Brief, scheme: "a" | "b" | "c") {
  const sf = brief.widthFt * brief.depthFt;
  const u = brief.useCase;
  if (u === "patio" || u === "deck") {
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
  if (u === "adu" || u === "interior") {
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
  const wet = brief.hasWater || brief.useCase === "adu" || brief.useCase === "greenhouse" || brief.useCase === "interior";
  const power = brief.hasPower || brief.useCase !== "patio";
  const indoor = brief.indoor || brief.useCase === "interior";

  const tree = indoor
    ? null
    : pack(
        "Tree work & landscape clear",
        "32",
        "Prune, remove conflicting limbs, protect keepers, haul green waste. No Plotforge crew on site.",
        [
          line("ISA arborist consult", 1, "ls", 280 * m, "Local certified arborist"),
          line("Limb / small tree work", brief.slope === "flat" ? 1 : 1.4, "ls", 900 * slopeTax * m),
          line("Stump grind allowance", scheme === "c" ? 1 : 0.4, "ls", 420 * m),
          line("Green waste haul", 1, "ls", 240 * m),
        ],
        ["If no trees conflict, this package is zeroed by the local shop."],
        8,
        "certified arborist / landscape contractor",
      );

  const equipment = indoor
    ? null
    : pack(
        "Equipment operating",
        "31",
        "Mini-ex, skid steer, compaction, machine time only. Operator is the local shop's employee.",
        [
          line("Mini-ex + operator", brief.slope === "steep" ? 10 : 6, "hr", 165 * m),
          line("Skid steer + operator", 4, "hr", 145 * m),
          line("Compactor + haul in/out", 1, "ls", 380 * m),
          line("Machine mobilization", 1, "ls", 320 * slopeTax * m),
        ],
        ["Owner does not operate equipment. Local contractor supplies licensed operator."],
        12,
        "excavation / equipment contractor",
      );

  const site = indoor
    ? pack(
        "Protection / demo",
        "02",
        "Protect existing finishes, selective demo, haul-off.",
        [line("Protection + demo", 1, "ls", 1800 * m), line("Haul-off", 1, "ls", 620 * m)],
        ["Interior jobs skip pad work and still need dust control."],
        16,
        "remodel / demo contractor",
      )
    : pack(
        "Sitework & excavation",
        "02",
        "Strip, grade, drainage, base rock, access path. All dirt work by the local earth shop.",
        [
          line("Strip + grade pad", sf / 9, "sy", 18 * slopeTax * m, "6 in cut/fill typical"),
          line("3/4 minus base rock", gravel / 27, "cy", 62 * m, "6 in compacted"),
          line("Perimeter drain / daylight", brief.slope === "flat" ? peri * 0.4 : peri, "lf", 28 * m),
          line("Utility trench", power || wet ? 28 : 0, "lf", 22 * m),
          line("Erosion + haul-off", 1, "ls", 850 * slopeTax * m),
        ],
        ["Assumes backyard machine access arranged by the sub."],
        24 * slopeTax,
        "local excavation / sitework contractor",
      );

  const landscape = indoor
    ? null
    : pack(
        "Landscaping restore",
        "32",
        "Re-seed, path repair, drip or simple planting after construction.",
        [
          line("Disturbed-area restore", sf * 0.35, "sf", 2.4 * m),
          line("Path / gravel tidy", 1, "ls", 480 * m),
          line("Irrigation repair allowance", brief.hasWater ? 1 : 0.3, "ls", 520 * m),
        ],
        ["Finish landscape is a separate local shop from the builder."],
        10,
        "local landscape contractor",
      );

  const concrete = indoor
    ? pack(
        "Concrete / patch",
        "03",
        "Patch, level, or leave existing slab.",
        [line("Floor patch allowance", 1, "ls", 900 * m)],
        ["Existing slab assumed salvageable."],
        8,
        "concrete contractor",
      )
    : pack(
        "Concrete",
        "03",
        brief.useCase === "patio" || brief.useCase === "deck"
          ? "Thickened-edge slab or pier footings."
          : "4-6 in slab on grade, thickened edge, vapor barrier.",
        [
          line("Form + pour slab", slabIn, "sf", (brief.useCase === "patio" ? 9.5 : 11.5) * m),
          line("Vapor barrier + sand", slabIn, "sf", 1.4 * m),
          line("Rebar / WWF", slabIn, "sf", 1.9 * m),
          line("Anchor bolts / hold-downs", peri / 4, "ea", 14 * m),
          line("Equipment pad / apron", scheme === "a" ? 40 : 64, "sf", 12 * m),
        ],
        ["Not engineered for heavy vehicles unless noted."],
        18,
        "local concrete contractor",
      );

  const framing = pack(
    "Framing & structure",
    "06",
    indoor ? "Partition and opening work inside an existing shell." : scheme === "a" ? "Post frame or simple stud walls." : "2x6 walls, trusses, house-matching eave where needed.",
    [
      line("Wall framing", indoor ? wallSf * 0.4 : wallSf, "sf", (scheme === "a" ? 7.2 : 9.4) * m),
      line("Roof framing / trusses", indoor ? 0 : roofSf, "sf", (scheme === "a" ? 8.1 : 10.2) * m),
      line("Sheathing walls + roof", indoor ? wallSf * 0.2 : wallSf + roofSf, "sf", 3.4 * m),
      line("Exterior doors / openings", scheme === "a" ? 2 : 3, "ea", 980 * m),
      line("Windows", scheme === "a" ? 2 : scheme === "b" ? 4 : 5, "ea", 620 * m),
      line("Hardware / connectors", 1, "ls", 740 * m),
    ],
    ["Prescriptive wood construction unless the city demands engineering."],
    60,
    "local framing / general building sub",
  );

  const envelope = indoor
    ? pack(
        "Interior envelope",
        "07",
        "Patch WRB only if openings change.",
        [line("Opening flash / patch", 1, "ls", 720 * m)],
        ["Existing roof stays."],
        8,
        "siding / weatherization contractor",
      )
    : pack(
        "Roofing, wrap, siding",
        "07",
        scheme === "b" ? "House-matching siding." : "Metal or mixed siding + roof.",
        [
          line("WRB + flashing", wallSf, "sf", 1.8 * m),
          line("Siding", wallSf * 0.92, "sf", (scheme === "a" ? 6.5 : 11) * m),
          line("Roofing system", roofSf, "sf", (scheme === "a" ? 7.5 : 10.5) * m),
          line("Gutters + downspouts", peri * 0.7, "lf", 14 * m),
          line("Exterior paint / stain", wallSf * 0.7, "sf", 2.4 * m),
        ],
        ["PNW rain is not optional to detail."],
        40,
        "local roofing and siding shops",
      );

  const elec = pack(
    "Electrical",
    "26",
    power ? "Subpanel or circuit work, lighting, GFCI." : "Stub only.",
    power
      ? [
          line("Feeder + subpanel", indoor ? 0.4 : 1, "ls", (scheme === "c" ? 4200 : 2600) * m),
          line("Interior circuits", scheme === "c" ? 10 : 6, "ea", 280 * m),
          line("LED lighting", Math.ceil(sf / 80), "ea", 190 * m),
          line("Exterior + GFCI", indoor ? 2 : 4, "ea", 160 * m),
          line("Permit / inspection allowance", 1, "ls", 320),
        ]
      : [line("Conduit stub only", 1, "ls", 480 * m)],
    ["Load calc belongs to a licensed electrician. Plotforge does not pull wire."],
    power ? 28 : 6,
    "licensed local electrician",
  );

  const plumb = wet
    ? pack(
        "Plumbing",
        "22",
        brief.useCase === "adu" || brief.useCase === "interior" ? "Wet rooms + stubs." : "Hose bib or utility sink.",
        [
          line("Water service stub", 1, "ls", 1450 * m),
          line("Waste / vent stub", brief.useCase === "adu" || brief.useCase === "interior" ? 1 : 0.4, "ls", 2200 * m),
          line("Fixtures", brief.useCase === "adu" || brief.useCase === "interior" ? 4 : 1, "ea", 400 * m),
          line("Hose bib / isolation", 2, "ea", 190 * m),
        ],
        ["Sewer availability can kill an ADU."],
        20,
        "licensed local plumber",
      )
    : pack(
        "Plumbing",
        "22",
        "None in this scheme.",
        [line("Allowance held", 1, "ls", 0)],
        ["Sleeve now if water comes later."],
        0,
        "licensed local plumber (on call)",
      );

  const mech = pack(
    "HVAC / ventilation",
    "23",
    "Ventilation and optional mini-split.",
    [
      line("Ventilation", 1, "ls", (brief.useCase === "greenhouse" ? 1600 : 420) * m),
      line("Mini-split allowance", brief.useCase === "adu" || brief.useCase === "interior" || scheme === "c" ? 1 : 0, "ls", 3800 * m),
      line("Insulation", indoor ? wallSf * 0.3 : wallSf + roofSf * 0.5, "sf", 2 * m),
    ],
    ["Moisture control still matters."],
    10,
    "local HVAC contractor",
  );

  const finishTrade = pack(
    "Interiors & specialty",
    "09-12",
    "Interior skin, floor, built-ins.",
    [
      line("Interior skin", wallSf * 0.7, "sf", (scheme === "a" ? 2.1 : 4.4) * m),
      line("Floor finish", sf, "sf", scheme === "c" ? 4.8 : 1.2),
      line("Built-ins / benches", 1, "ls", (scheme === "a" ? 600 : 1600) * m),
      line("Clean-up + punch", 1, "ls", 480 * m),
    ],
    ["A local finish carpenter or the GC's finish sub owns this."],
    20,
    "local finish / specialty contractor",
  );

  const field = [site, concrete, framing, envelope, elec, plumb, mech, finishTrade].filter(Boolean) as TradePackage[];
  const extras = [tree, equipment, landscape].filter(Boolean) as TradePackage[];
  const fieldSub = [...extras, ...field].reduce((s, t) => s + t.subtotal, 0);

  const gc = pack(
    "Local GC / coordination only",
    "01",
    "Schedule, dumpsters, inspections liaison. GC does not self-perform Plotforge work; they hire the local trades listed above.",
    [
      line("GC coordination (no self-perform)", 1, "ls", 0.1 * fieldSub),
      line("Dumpsters + protection", 2, "ea", 520 * m),
      line("Temp power / toilet", indoor ? 0 : 1, "ls", 380 * m),
    ],
    ["Does not include architect, engineer, or impact fees. Physical building stays with the named subs."],
    16,
    "local CCB general contractor",
  );

  return [...extras, ...field, gc].filter((t) => t.subtotal > 0 || t.trade === "Plumbing");
}

function sheets(brief: Brief, name: string) {
  const wet = brief.hasWater || brief.useCase === "adu" || brief.useCase === "greenhouse" || brief.useCase === "interior";
  const list = [
    { id: "G-001", title: "Cover / code notes", scale: "n/a", notes: [`Project: ${name}`, `Size ${brief.widthFt} x ${brief.depthFt} x ${brief.heightFt} ft`, "Conceptual. Not for permit without a designer of record.", "All field work is subcontracted to local licensed shops."] },
    { id: "AS-101", title: "Site or existing-room plan", scale: "1/8 in = 1 ft", notes: ["Show existing walls or lot lines", "Confirm Hillsboro vs Washington County jurisdiction"] },
    { id: "S-101", title: "Foundation / slab / floor", scale: "1/4 in = 1 ft", notes: ["Existing or new bearing path", "Poured by local concrete sub"] },
    { id: "A-101", title: "Floor plan", scale: "1/4 in = 1 ft", notes: ["Zones, doors, electrical legend"] },
    { id: "A-301", title: "Elevations or interior elevations", scale: "1/4 in = 1 ft", notes: ["What the neighbor or the room actually sees"] },
    { id: "E-101", title: "Electrical plan", scale: "1/4 in = 1 ft", notes: ["Permit + licensed local electrician"] },
    { id: "X-101", title: "Subcontract matrix", scale: "n/a", notes: ["Every trade is a local bid package", "Plotforge never operates equipment or puts a crew on site"] },
  ];
  if (wet) list.push({ id: "P-101", title: "Plumbing rough-in", scale: "1/4 in = 1 ft", notes: ["Water, waste, vent — local plumber"] });
  if (!brief.indoor) {
    list.push({ id: "L-101", title: "Landscape / tree / equipment", scale: "n/a", notes: ["Arborist, excavator, landscape restore are separate local shops"] });
  }
  list.push({ id: "L-001", title: "Legal / license cover", scale: "n/a", notes: ["CCB number required on any bid for pay", "Trade licenses listed in the Clerk tab"] });
  return list;
}

export function buildSchemes(brief: Brief): Scheme[] {
  const label = useLabel(brief.useCase);
  const w = brief.widthFt;
  const d = brief.depthFt;
  const defs: { id: "a" | "b" | "c"; name: string; vibe: string; pitch: string; structure: string; roof: string; envelope: string; systems: string[]; weeks: string }[] = [
    { id: "a", name: `Workhorse ${label}`, vibe: "Utility first", pitch: `A clean ${w}x${d} working solution. Fast to stand up, honest to look at. Built entirely by local subs.`, structure: brief.indoor ? "Work inside the existing shell." : "Simple structure on a thickened-edge slab.", roof: brief.indoor ? "Existing roof." : "Metal or low gable, drain away from the house.", envelope: brief.indoor ? "Patch only." : "Metal or T1-11, limited openings.", systems: brief.hasPower ? ["Subpanel", "Task lighting", "GFCI"] : ["Passive vent"], weeks: "4-7" },
    { id: "b", name: `Neighbor-facing ${label}`, vibe: "Looks like it belongs", pitch: `Same footprint, calmer face. For the wall you can see from the kitchen. Local shops execute.`, structure: "Tighter openings, better wrap.", roof: brief.indoor ? "Existing, patched." : "Gable, overhangs that throw water clear.", envelope: "House-matching materials where visible.", systems: ["Subpanel", "Heat-ready insulation"], weeks: "6-10" },
    { id: "c", name: `Future-proof ${label}`, vibe: "Spend once, convert later", pitch: `Bones of something more: extra power, sleeved utilities, a clean public face. Coordination only from Plotforge; field work is local.`, structure: "Heavier headers, conversion path.", roof: brief.indoor ? "Existing plus mechanical chases." : "Standing seam, vented.", envelope: "Better windows, rainscreen if exterior.", systems: ["100-200A capable", "Mini-split allowance", wetNote(brief)], weeks: "8-14" },
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
      pitch: promptHint ? `${def.pitch} Prompt: ${promptHint.slice(0, 160)}` : def.pitch,
      why: [
        `Sized to ${w} x ${d} ft.`,
        brief.indoor ? "Existing room captured." : brief.slope === "flat" ? "Flat grade keeps the slab simple." : "Grade work is priced as a local excavation bid.",
        def.id === "a" ? "Lowest time-to-useful." : def.id === "b" ? "Best neighbor politics." : "Best conversion path.",
        "Building, landscaping, excavation, equipment, and tree work are all local sub packages.",
      ],
      footprint: `${w} ft x ${d} ft | ${w * d} sf`,
      structure: def.structure,
      roof: def.roof,
      envelope: def.envelope,
      systems: def.systems.filter(Boolean),
      program: programFor(brief, def.id),
      photos: [
        { title: "On your photo", caption: "Massing on the capture.", kind: "photo" },
        { title: "Isometric", caption: "Volume and door side.", kind: "iso" },
        { title: "Elevation", caption: "What people actually see.", kind: "elev" },
        { title: "Dusk", caption: "After 5pm.", kind: "night" },
      ],
      sheets: sheets(brief, def.name),
      trades,
      bidLow: Math.round(sub * 0.92),
      bidHigh: Math.round(sub * (1 + cont + 0.06)),
      contingencyPct: cont * 100,
      timelineWeeks: def.weeks,
      permits: permitList(brief),
      risks: riskList(brief, def.id),
      legal: buildLegal(brief, { id: def.id, name: def.name, trades }),
      deliveryModel: DELIVERY,
    };
  });
}

function wetNote(brief: Brief) {
  if (brief.useCase === "adu" || brief.useCase === "interior") return "Full wet utility path";
  if (brief.hasWater) return "Water stub + hose bib";
  return "Sleeved water path only";
}

function permitList(brief: Brief) {
  const list = [
    "Confirm Hillsboro city vs Washington County LUT",
    "Zoning / setback check",
    "Building permit if over exemption or habitable",
    "Electrical permit if any new wiring",
  ];
  if (brief.useCase === "adu" || brief.hasWater || brief.useCase === "interior") list.push("Plumbing permit + sewer availability if waste is added");
  if (brief.useCase === "adu") list.push("ADU zoning path 250-750 sf typical");
  list.push("Call 811 before any trench");
  list.push("CCB license on any paid bidder");
  list.push("Every physical trade is a local subcontract — Plotforge does not build");
  return list;
}

function riskList(brief: Brief, id: "a" | "b" | "c") {
  return [
    brief.indoor ? "Hidden rot and panel capacity move interior numbers." : "Access and drainage move exterior numbers.",
    brief.useCase === "adu" ? "ADU utilities often cost more than the box." : "Unpermitted work becomes a sale problem.",
    id === "a" ? "Cheap envelope means winter condensation." : "Pretty elevations do not replace hold-downs.",
    "A Plotforge number is not a CCB bid. Local shops write the real bids.",
  ];
}

export function defaultBrief(): Brief {
  return {
    widthFt: 12,
    depthFt: 24,
    heightFt: 10,
    useCase: "shop",
    prompt: "Snap this space and design a shop I can permit in Hillsboro.",
    finish: "solid",
    region: "Hillsboro, Oregon",
    hasPower: true,
    hasWater: false,
    slope: "flat",
    indoor: false,
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
  else if (/kitchen|bath|interior|remodel|basement/.test(p)) next.useCase = "interior";
  else if (/deck|fence/.test(p)) next.useCase = "deck";
  else if (/commercial|tenant|retail/.test(p)) next.useCase = "commercial";
  else if (/green\s*house|grow/.test(p)) next.useCase = "greenhouse";
  else if (/patio|pavilion|pergola|outdoor/.test(p)) next.useCase = "patio";
  else if (/garage/.test(p)) next.useCase = "garage";
  else if (/studio|office|art/.test(p)) next.useCase = "studio";
  else if (/shop|workshop|shed|barn/.test(p)) next.useCase = "shop";
  if (/indoor|inside|interior/.test(p)) next.indoor = true;
  if (/cheap|budget|bare/.test(p)) next.finish = "budget";
  if (/pretty|nice|match the house|beautiful|high end/.test(p)) next.finish = "pretty";
  if (/no power|off grid/.test(p)) next.hasPower = false;
  if (/water|sink|bath|hose/.test(p)) next.hasWater = true;
  if (/slope|hill|grade/.test(p)) next.slope = "gentle";
  if (/steep/.test(p)) next.slope = "steep";
  return next;
}
