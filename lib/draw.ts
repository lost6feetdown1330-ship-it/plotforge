import type { Brief, Scheme, TradePackage } from "./types";

function esc(s: string) {
  return Array.from(s)
    .map((ch) => {
      if (ch === "&") return "&" + "amp;";
      if (ch === "<") return "&" + "lt;";
      if (ch === ">") return "&" + "gt;";
      if (ch === '"') return "&" + "quot;";
      return ch;
    })
    .join("");
}

export function isoSvg(brief: Brief, scheme: Scheme, night = false) {
  const accent = scheme.id === "a" ? "#c45c26" : scheme.id === "b" ? "#7d8f69" : "#c9a227";
  const wall = night ? "#1b2420" : "#d9cbb3";
  const roof = night ? "#0e1412" : scheme.id === "a" ? "#6a7370" : "#4a3f36";
  const sky = night ? "url(#night)" : "url(#day)";
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" font-family="ui-sans-serif,system-ui">',
    "<defs>",
    '<linearGradient id="day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ea"/><stop offset="1" stop-color="#e8dfc8"/></linearGradient>',
    '<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1220"/><stop offset="1" stop-color="#1a2218"/></linearGradient>',
    "</defs>",
    `<rect width="900" height="560" fill="${sky}"/>`,
    `<ellipse cx="450" cy="470" rx="340" ry="36" fill="${night ? "#0a0d0a" : "#7d8a62"}" opacity=".45"/>`,
    '<g transform="translate(250,210)">',
    `<polygon points="0,160 220,220 220,60 0,0" fill="${wall}" stroke="#2b241c" stroke-width="2"/>`,
    `<polygon points="220,220 420,160 420,0 220,60" fill="#b9ab93" stroke="#2b241c" stroke-width="2"/>`,
    `<polygon points="0,0 220,60 420,0 200,-70" fill="${roof}" stroke="#2b241c" stroke-width="2"/>`,
    `<rect x="70" y="70" width="70" height="90" fill="${night ? "#f1d48a" : "#8aa4b8"}" opacity="${night ? ".9" : ".7"}" stroke="#2b241c"/>`,
    `<rect x="280" y="90" width="80" height="110" fill="${accent}" opacity=".85" stroke="#2b241c"/>`,
    `<text x="10" y="250" fill="${night ? "#f4efe4" : "#241c14"}" font-size="18">${esc(scheme.name)}</text>`,
    `<text x="10" y="274" fill="${night ? "#c9c2b3" : "#5a5044"}" font-size="13">${brief.widthFt} x ${brief.depthFt} ft - ${esc(scheme.vibe)}</text>`,
    "</g></svg>",
  ].join("");
}

export function elevSvg(brief: Brief, scheme: Scheme) {
  const accent = scheme.id === "a" ? "#8a8f88" : scheme.id === "b" ? "#cfc1a6" : "#d7c27a";
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" font-family="ui-sans-serif,system-ui">',
    '<rect width="900" height="420" fill="#e7e1d4"/>',
    '<rect x="0" y="300" width="900" height="120" fill="#8b945e"/>',
    '<polygon points="120,300 450,80 780,300" fill="#4a4036"/>',
    `<rect x="160" y="160" width="580" height="140" fill="${accent}" stroke="#2b241c"/>`,
    '<rect x="210" y="200" width="70" height="50" fill="#8aa4b8" stroke="#2b241c"/>',
    '<rect x="310" y="200" width="70" height="50" fill="#8aa4b8" stroke="#2b241c"/>',
    '<rect x="520" y="175" width="150" height="125" fill="#6a3e24" stroke="#2b241c"/>',
    `<text x="160" y="40" font-size="20" fill="#241c14">${esc(scheme.name)} - yard elevation</text>`,
    `<text x="160" y="64" font-size="13" fill="#5a5044">${brief.widthFt} ft frontage - eave ${brief.heightFt} ft</text>`,
    '<line x1="160" y1="330" x2="740" y2="330" stroke="#241c14"/>',
    `<text x="400" y="352" font-size="12">${brief.widthFt} ft</text>`,
    "</svg>",
  ].join("");
}

export function planSvg(brief: Brief, scheme: Scheme) {
  const W = 760;
  const H = 420;
  const fills = ["#efe6d4", "#e4d3b4", "#d7c7a5", "#cbb892"];
  let y = 16;
  const rects = scheme.program
    .map((z, i) => {
      const h = Math.max(48, (H - 40) / scheme.program.length);
      const block = `<g><rect x="16" y="${y}" width="${W - 32}" height="${h - 8}" fill="${fills[i % fills.length]}" stroke="#2b241c"/><text x="28" y="${y + 28}" font-size="16">${esc(z.zone)}</text><text x="28" y="${y + 50}" font-size="12" fill="#5a5044">${esc(z.size)} - ${esc(z.note)}</text></g>`;
      y += h;
      return block;
    })
    .join("");
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" font-family="ui-sans-serif,system-ui">',
    '<rect width="900" height="520" fill="#f7f1e6"/>',
    `<text x="20" y="28" font-size="18">${esc(scheme.name)} - floor plan concept</text>`,
    `<text x="20" y="50" font-size="12" fill="#5a5044">A-101 - ${brief.widthFt} x ${brief.depthFt} ft - diagrammatic</text>`,
    `<g transform="translate(70,70)">${rects}</g>`,
    '<text x="20" y="500" font-size="11" fill="#6a6156">Not a construction document.</text>',
    "</svg>",
  ].join("");
}

export function siteSvg(brief: Brief) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" font-family="ui-sans-serif,system-ui">',
    '<rect width="900" height="520" fill="#eef3e6"/>',
    '<rect x="40" y="40" width="820" height="440" fill="none" stroke="#241c14"/>',
    `<text x="54" y="68" font-size="18">AS-101 site concept - ${esc(brief.region)}</text>`,
    '<rect x="80" y="110" width="220" height="140" fill="#d7cfc0" stroke="#241c14"/>',
    '<text x="96" y="188" font-size="14">Existing house</text>',
    `<rect x="420" y="200" width="${Math.min(300, brief.widthFt * 8)}" height="${Math.min(200, brief.depthFt * 6)}" fill="#c9b894" stroke="#241c14" stroke-width="2"/>`,
    `<text x="432" y="240" font-size="14">New ${brief.widthFt}x${brief.depthFt}</text>`,
    '<text x="432" y="262" font-size="12">Confirm setbacks</text>',
    '<path d="M300 180 L420 240" stroke="#241c14" stroke-dasharray="6 6"/>',
    '<text x="310" y="168" font-size="12">utility path</text>',
    '<text x="54" y="460" font-size="12">North assumed up. This is not a survey.</text>',
    "</svg>",
  ].join("");
}

function ink(op = 1) {
  return `rgba(214,236,255,${op})`;
}

function frame(sheet: string, title: string, brief: Brief, scheme: Scheme, trade: string, scale: string, body: string) {
  const dim = `${brief.widthFt}'-0" x ${brief.depthFt}'-0" x ${brief.heightFt}'-0"`;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 760" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">',
    '<rect width="1100" height="760" fill="#0a2f5c"/>',
    '<rect x="18" y="18" width="1064" height="724" fill="none" stroke="#d6ecff" stroke-width="2"/>',
    '<rect x="26" y="26" width="1048" height="708" fill="none" stroke="#d6ecff" stroke-width=".6"/>',
    `<text x="40" y="52" fill="#d6ecff" font-size="13" letter-spacing="3">PLOTFORGE ATELIER  /  ${esc(brief.region.toUpperCase())}</text>`,
    `<text x="40" y="78" fill="#9ec4e8" font-size="11">CONCEPTUAL WORKING DRAWING  ·  NOT FOR CONSTRUCTION  ·  LOCAL SUB PERFORMS WORK</text>`,
    body,
    '<rect x="760" y="600" width="314" height="118" fill="#0a2f5c" stroke="#d6ecff"/>',
    `<text x="774" y="624" fill="#9ec4e8" font-size="10">SHEET</text>`,
    `<text x="774" y="646" fill="#d6ecff" font-size="20">${esc(sheet)}</text>`,
    `<text x="774" y="668" fill="#d6ecff" font-size="11">${esc(title)}</text>`,
    `<text x="774" y="686" fill="#9ec4e8" font-size="10">${esc(scheme.name)}</text>`,
    `<text x="774" y="704" fill="#9ec4e8" font-size="10">${esc(dim)}  ·  ${esc(scale)}</text>`,
    `<text x="40" y="720" fill="#7ea3c7" font-size="10">TRADE ${esc(trade.toUpperCase())}  ·  BID PACKAGE FOR LOCAL LICENSED SHOP  ·  REDRAW ON STAMPED TITLE BLOCK BEFORE PERMIT</text>`,
    "</svg>",
  ].join("");
}

function pad(brief: Brief) {
  const maxW = 620;
  const maxD = 380;
  const sx = Math.min(maxW / brief.widthFt, maxD / brief.depthFt);
  const w = brief.widthFt * sx;
  const d = brief.depthFt * sx;
  const x = 80;
  const y = 120;
  return { x, y, w, d, sx };
}

function footprint(brief: Brief, dashed = false) {
  const p = pad(brief);
  return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.d}" fill="none" stroke="#d6ecff" stroke-width="2" stroke-dasharray="${dashed ? "8 6" : "0"}"/>
  <text x="${p.x}" y="${p.y - 10}" fill="#9ec4e8" font-size="11">${brief.widthFt}'-0"</text>
  <text x="${p.x + p.w + 8}" y="${p.y + p.d / 2}" fill="#9ec4e8" font-size="11">${brief.depthFt}'-0"</text>`;
}

function siteBody(brief: Brief) {
  const p = pad(brief);
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">SITE / EARTHWORK PLAN</text>
  <rect x="80" y="130" width="180" height="110" fill="none" stroke="#9ec4e8"/>
  <text x="92" y="190" fill="#9ec4e8" font-size="11">EXISTING DWELLING</text>
  <rect x="${p.x + 220}" y="${p.y + 40}" width="${Math.min(p.w, 340)}" height="${Math.min(p.d, 220)}" fill="rgba(214,236,255,0.06)" stroke="#d6ecff" stroke-width="2"/>
  <text x="${p.x + 232}" y="${p.y + 70}" fill="#d6ecff" font-size="12">NEW PAD ${brief.widthFt} x ${brief.depthFt}</text>
  <text x="${p.x + 232}" y="${p.y + 90}" fill="#9ec4e8" font-size="11">STRIP · GRADE · 6" BASE ROCK</text>
  <path d="M260 185 L${p.x + 220} ${p.y + 80}" stroke="#d6ecff" stroke-dasharray="5 5"/>
  <text x="270" y="176" fill="#9ec4e8" font-size="10">UTILITY TRENCH / 811</text>
  <text x="80" y="430" fill="#9ec4e8" font-size="11">SLOPE CLASS: ${esc(brief.slope).toUpperCase()}</text>
  <text x="80" y="450" fill="#9ec4e8" font-size="11">CALL 811 BEFORE EXCAVATION  ·  LOCAL EARTH SHOP ONLY</text>
  <text x="80" y="480" fill="#7ea3c7" font-size="10">North assumed up. Confirm setbacks and lot coverage on the plat.</text>`;
}

function treeBody(brief: Brief) {
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">TREE / LANDSCAPE PROTECTION PLAN</text>
  ${footprint(brief, true)}
  <circle cx="200" cy="200" r="36" fill="none" stroke="#d6ecff"/>
  <circle cx="200" cy="200" r="8" fill="#d6ecff"/>
  <text x="248" y="204" fill="#9ec4e8" font-size="11">KEEPER  ·  PROTECT DRIPLINE</text>
  <circle cx="520" cy="280" r="28" fill="none" stroke="#d6ecff" stroke-dasharray="4 4"/>
  <text x="556" y="284" fill="#9ec4e8" font-size="11">CONFLICT LIMB  ·  ISA PRUNE / REMOVE</text>
  <rect x="80" y="460" width="620" height="90" fill="none" stroke="#9ec4e8"/>
  <text x="92" y="486" fill="#d6ecff" font-size="11">NOTES</text>
  <text x="92" y="508" fill="#9ec4e8" font-size="11">1. No Plotforge crew. Local certified arborist only.</text>
  <text x="92" y="526" fill="#9ec4e8" font-size="11">2. Photograph trees before machine access.</text>
  <text x="92" y="544" fill="#9ec4e8" font-size="11">3. Green waste hauled by landscape sub. Pad ${brief.widthFt}x${brief.depthFt}.</text>`;
}

function equipBody(brief: Brief) {
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">EQUIPMENT ACCESS AND STAGING</text>
  ${footprint(brief)}
  <rect x="80" y="500" width="220" height="70" fill="none" stroke="#d6ecff"/>
  <text x="92" y="528" fill="#d6ecff" font-size="11">STAGING</text>
  <text x="92" y="546" fill="#9ec4e8" font-size="11">MINI-EX · SKID · COMPACTOR</text>
  <path d="M300 535 L80 300" fill="none" stroke="#d6ecff" stroke-dasharray="6 4"/>
  <text x="170" y="320" fill="#9ec4e8" font-size="11">MACHINE PATH</text>
  <text x="80" y="430" fill="#9ec4e8" font-size="11">OPERATOR EMPLOYED BY LOCAL EXCAVATION SHOP</text>
  <text x="80" y="450" fill="#9ec4e8" font-size="11">SLOPE ${esc(brief.slope).toUpperCase()}  ·  CONFIRM GATE WIDTH AND OVERHEAD LINES</text>`;
}

function concreteBody(brief: Brief) {
  const p = pad(brief);
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">FOUNDATION / SLAB PLAN</text>
  ${footprint(brief)}
  <rect x="${p.x + 8}" y="${p.y + 8}" width="${p.w - 16}" height="${p.d - 16}" fill="none" stroke="#9ec4e8" stroke-dasharray="3 3"/>
  <text x="${p.x + 16}" y="${p.y + 28}" fill="#d6ecff" font-size="11">4"-6" SOG  ·  THICKENED EDGE</text>
  <text x="${p.x + 16}" y="${p.y + 46}" fill="#9ec4e8" font-size="11">VAPOR BARRIER + SAND  ·  WWF / REBAR</text>
  <circle cx="${p.x + 20}" cy="${p.y + 20}" r="4" fill="#d6ecff"/>
  <circle cx="${p.x + p.w - 20}" cy="${p.y + 20}" r="4" fill="#d6ecff"/>
  <circle cx="${p.x + 20}" cy="${p.y + p.d - 20}" r="4" fill="#d6ecff"/>
  <circle cx="${p.x + p.w - 20}" cy="${p.y + p.d - 20}" r="4" fill="#d6ecff"/>
  <text x="80" y="520" fill="#9ec4e8" font-size="11">ANCHOR BOLTS / HOLD-DOWNS AT ${Math.round((2 * (brief.widthFt + brief.depthFt)) / 4)} SPACES TYP.</text>
  <text x="80" y="540" fill="#9ec4e8" font-size="11">NOT ENGINEERED FOR VEHICLE LOADS UNLESS NOTED  ·  LOCAL CONCRETE SUB</text>`;
}

function frameBody(brief: Brief, scheme: Scheme) {
  const p = pad(brief);
  const studs = Array.from({ length: Math.min(18, Math.floor(brief.widthFt / 2)) }, (_, i) => {
    const x = p.x + 12 + i * ((p.w - 24) / Math.max(1, Math.min(17, Math.floor(brief.widthFt / 2) - 1)));
    return `<line x1="${x}" y1="${p.y + 8}" x2="${x}" y2="${p.y + p.d - 8}" stroke="#7ea3c7" stroke-width=".6"/>`;
  }).join("");
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">FRAMING PLAN</text>
  ${footprint(brief)}
  ${studs}
  <rect x="${p.x + p.w * 0.62}" y="${p.y + p.d - 28}" width="${Math.min(70, p.w * 0.18)}" height="28" fill="#0a2f5c" stroke="#d6ecff"/>
  <text x="${p.x + p.w * 0.64}" y="${p.y + p.d - 10}" fill="#d6ecff" font-size="10">DOOR</text>
  <rect x="${p.x + 24}" y="${p.y}" width="36" height="8" fill="none" stroke="#d6ecff"/>
  <text x="${p.x + 24}" y="${p.y - 8}" fill="#9ec4e8" font-size="10">WINDOW</text>
  <text x="80" y="520" fill="#9ec4e8" font-size="11">${esc(scheme.structure)}</text>
  <text x="80" y="540" fill="#9ec4e8" font-size="11">EAVE ${brief.heightFt}'-0"  ·  PRESCRIPTIVE WOOD UNLESS CITY DEMANDS ENGINEERING</text>`;
}

function envelopeBody(brief: Brief, scheme: Scheme) {
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">ENVELOPE / ROOF / SIDING</text>
  <polygon points="120,420 420,160 720,420" fill="none" stroke="#d6ecff" stroke-width="2"/>
  <rect x="180" y="300" width="480" height="120" fill="none" stroke="#d6ecff"/>
  <rect x="220" y="330" width="70" height="50" fill="none" stroke="#9ec4e8"/>
  <rect x="520" y="318" width="90" height="102" fill="none" stroke="#d6ecff"/>
  <text x="120" y="450" fill="#9ec4e8" font-size="11">WRB + FLASHING  ·  SIDING  ·  ROOF  ·  GUTTERS</text>
  <text x="120" y="474" fill="#9ec4e8" font-size="11">${esc(scheme.envelope)}  ·  ${esc(scheme.roof)}</text>
  <text x="120" y="520" fill="#9ec4e8" font-size="11">PNW RAIN DETAIL IS MANDATORY  ·  LOCAL ROOFING / SIDING SHOPS</text>
  <text x="120" y="540" fill="#9ec4e8" font-size="11">FRONTAGE ${brief.widthFt}'-0"  ·  WALL HEIGHT ${brief.heightFt}'-0"</text>`;
}

function elecBody(brief: Brief) {
  const p = pad(brief);
  const outlets = Array.from({ length: 6 }, (_, i) => {
    const x = p.x + 30 + (i % 3) * (p.w / 3);
    const y = p.y + 40 + Math.floor(i / 3) * (p.d / 2.2);
    return `<rect x="${x}" y="${y}" width="10" height="10" fill="none" stroke="#d6ecff"/><text x="${x + 14}" y="${y + 9}" fill="#9ec4e8" font-size="9">GFCI</text>`;
  }).join("");
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">ELECTRICAL PLAN</text>
  ${footprint(brief)}
  ${outlets}
  <rect x="${p.x + p.w - 54}" y="${p.y + 16}" width="38" height="48" fill="none" stroke="#d6ecff"/>
  <text x="${p.x + p.w - 50}" y="${p.y + 36}" fill="#d6ecff" font-size="9">PNL</text>
  <text x="${p.x + p.w - 50}" y="${p.y + 50}" fill="#9ec4e8" font-size="8">SUB</text>
  <circle cx="${p.x + p.w / 2}" cy="${p.y + p.d / 2}" r="8" fill="none" stroke="#d6ecff"/>
  <text x="${p.x + p.w / 2 + 12}" y="${p.y + p.d / 2 + 4}" fill="#9ec4e8" font-size="10">LED</text>
  <text x="80" y="520" fill="#9ec4e8" font-size="11">POWER ${brief.hasPower ? "YES — FEEDER + SUBPANEL" : "STUB ONLY"}</text>
  <text x="80" y="540" fill="#9ec4e8" font-size="11">BCD ELECTRICAL CONTRACTOR + PERMIT REQUIRED  ·  LOAD CALC BY THAT SHOP</text>`;
}

function plumbBody(brief: Brief) {
  const p = pad(brief);
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">PLUMBING ROUGH-IN</text>
  ${footprint(brief)}
  <circle cx="${p.x + 40}" cy="${p.y + p.d - 40}" r="8" fill="none" stroke="#d6ecff"/>
  <text x="${p.x + 54}" y="${p.y + p.d - 36}" fill="#9ec4e8" font-size="10">CWM</text>
  <circle cx="${p.x + 90}" cy="${p.y + p.d - 40}" r="8" fill="none" stroke="#d6ecff"/>
  <text x="${p.x + 104}" y="${p.y + p.d - 36}" fill="#9ec4e8" font-size="10">WASTE</text>
  <path d="M${p.x + 40} ${p.y + p.d - 40} L${p.x + 40} ${p.y + p.d + 40}" stroke="#d6ecff" stroke-dasharray="4 3"/>
  <text x="80" y="500" fill="#9ec4e8" font-size="11">WATER ${brief.hasWater ? "STUB + FIXTURES" : "SLEEVE ONLY UNLESS ADU / INTERIOR"}</text>
  <text x="80" y="520" fill="#9ec4e8" font-size="11">CONFIRM SEWER AVAILABILITY BEFORE PRICING WASTE</text>
  <text x="80" y="540" fill="#9ec4e8" font-size="11">BCD PLUMBING BUSINESS LICENSE  ·  LOCAL PLUMBER ONLY</text>`;
}

function mechBody(brief: Brief, scheme: Scheme) {
  const p = pad(brief);
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">MECHANICAL / VENTILATION</text>
  ${footprint(brief)}
  <rect x="${p.x + p.w - 80}" y="${p.y + 20}" width="60" height="36" fill="none" stroke="#d6ecff"/>
  <text x="${p.x + p.w - 74}" y="${p.y + 42}" fill="#d6ecff" font-size="10">HRV / FAN</text>
  <rect x="${p.x + 16}" y="${p.y + 20}" width="70" height="36" fill="none" stroke="#9ec4e8"/>
  <text x="${p.x + 22}" y="${p.y + 42}" fill="#9ec4e8" font-size="10">MINI-SPLIT</text>
  <text x="80" y="500" fill="#9ec4e8" font-size="11">SYSTEMS: ${esc(scheme.systems.join(" / ") || "VENT ONLY")}</text>
  <text x="80" y="520" fill="#9ec4e8" font-size="11">INSULATION AT WALLS + ROOF  ·  MOISTURE CONTROL REQUIRED</text>
  <text x="80" y="540" fill="#9ec4e8" font-size="11">LOCAL HVAC SHOP  ·  MECHANICAL PERMIT IF EQUIPMENT IS SET</text>`;
}

function finishBody(brief: Brief, scheme: Scheme) {
  let y = 140;
  const zones = scheme.program
    .map((z) => {
      const block = `<text x="90" y="${y}" fill="#d6ecff" font-size="13">${esc(z.zone)}</text>
      <text x="90" y="${y + 18}" fill="#9ec4e8" font-size="11">${esc(z.size)}  ·  ${esc(z.note)}</text>`;
      y += 48;
      return block;
    })
    .join("");
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">INTERIOR / SPECIALTY FINISH PLAN</text>
  ${footprint(brief, true)}
  ${zones}
  <text x="80" y="540" fill="#9ec4e8" font-size="11">SKIN · FLOOR · BUILT-INS  ·  LOCAL FINISH CARPENTER</text>`;
}

function landscapeBody(brief: Brief) {
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">LANDSCAPE RESTORE</text>
  ${footprint(brief, true)}
  <path d="M90 500 Q 200 440 320 500 T 560 500" fill="none" stroke="#9ec4e8"/>
  <text x="80" y="430" fill="#9ec4e8" font-size="11">RE-SEED DISTURBED AREA  ·  PATH TIDY  ·  IRRIGATION REPAIR</text>
  <text x="80" y="450" fill="#9ec4e8" font-size="11">SEPARATE FROM BUILDER  ·  LOCAL LANDSCAPE CONTRACTOR</text>
  <text x="80" y="540" fill="#9ec4e8" font-size="11">PAD ${brief.widthFt} x ${brief.depthFt}  ·  DO NOT PLANT OVER UTILITY TRENCH</text>`;
}

function demoBody(brief: Brief) {
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">PROTECTION / SELECTIVE DEMO</text>
  ${footprint(brief)}
  <rect x="80" y="470" width="640" height="80" fill="none" stroke="#9ec4e8"/>
  <text x="92" y="498" fill="#d6ecff" font-size="11">DUST CONTROL  ·  FLOOR / WALL PROTECTION  ·  HAUL-OFF</text>
  <text x="92" y="520" fill="#9ec4e8" font-size="11">EXISTING ROOM ${brief.widthFt} x ${brief.depthFt}  ·  LOCAL REMODEL SUB</text>`;
}

function gcBody(scheme: Scheme) {
  const rows = scheme.trades
    .filter((t) => !t.trade.toLowerCase().includes("coordination"))
    .map((t, i) => `<text x="80" y="${150 + i * 22}" fill="#d6ecff" font-size="12">${String(i + 1).padStart(2, "0")}  ${esc(t.trade.toUpperCase())}  —  ${esc(t.localShopType)}</text>`)
    .join("");
  return `
  <text x="40" y="110" fill="#d6ecff" font-size="16">SUBCONTRACT MATRIX / COORDINATION</text>
  ${rows}
  <text x="80" y="540" fill="#9ec4e8" font-size="11">GC COORDINATES ONLY  ·  NO PLOTFORGE CREW  ·  EACH LINE IS A LOCAL BID</text>`;
}

export function sheetIdFor(trade: string, index: number) {
  const t = trade.toLowerCase();
  if (t.includes("tree")) return "L-101";
  if (t.includes("equipment")) return "EQ-101";
  if (t.includes("site") || t.includes("excav")) return "C-101";
  if (t.includes("demo") || t.includes("protection")) return "D-101";
  if (t.includes("concrete")) return "S-101";
  if (t.includes("fram")) return "S-201";
  if (t.includes("roof") || t.includes("siding") || t.includes("envelope")) return "A-401";
  if (t.includes("electrical")) return "E-101";
  if (t.includes("plumbing")) return "P-101";
  if (t.includes("hvac") || t.includes("mech")) return "M-101";
  if (t.includes("interior") || t.includes("specialty") || t.includes("finish")) return "A-601";
  if (t.includes("landscape")) return "L-201";
  if (t.includes("gc") || t.includes("coordination")) return "G-101";
  return `T-${String(index + 1).padStart(3, "0")}`;
}

export function tradeBlueprint(brief: Brief, scheme: Scheme, trade: TradePackage, index: number) {
  const t = trade.trade.toLowerCase();
  const sheet = sheetIdFor(trade.trade, index);
  let body = siteBody(brief);
  let title = "TRADE PLAN";
  let scale = "1/8\" = 1'-0\"";
  if (t.includes("tree")) {
    body = treeBody(brief);
    title = "TREE / CLEAR";
  } else if (t.includes("equipment")) {
    body = equipBody(brief);
    title = "EQUIPMENT PLAN";
  } else if (t.includes("site") || t.includes("excav")) {
    body = siteBody(brief);
    title = "SITE / EARTHWORK";
  } else if (t.includes("demo") || t.includes("protection")) {
    body = demoBody(brief);
    title = "DEMO / PROTECT";
  } else if (t.includes("concrete")) {
    body = concreteBody(brief);
    title = "SLAB / FOUNDATION";
    scale = "1/4\" = 1'-0\"";
  } else if (t.includes("fram")) {
    body = frameBody(brief, scheme);
    title = "FRAMING PLAN";
    scale = "1/4\" = 1'-0\"";
  } else if (t.includes("roof") || t.includes("siding") || t.includes("envelope")) {
    body = envelopeBody(brief, scheme);
    title = "ENVELOPE / ROOF";
  } else if (t.includes("electrical")) {
    body = elecBody(brief);
    title = "ELECTRICAL";
    scale = "1/4\" = 1'-0\"";
  } else if (t.includes("plumbing")) {
    body = plumbBody(brief);
    title = "PLUMBING";
    scale = "1/4\" = 1'-0\"";
  } else if (t.includes("hvac") || t.includes("mech")) {
    body = mechBody(brief, scheme);
    title = "MECHANICAL";
  } else if (t.includes("interior") || t.includes("specialty") || t.includes("finish")) {
    body = finishBody(brief, scheme);
    title = "FINISH PLAN";
  } else if (t.includes("landscape")) {
    body = landscapeBody(brief);
    title = "LANDSCAPE";
  } else if (t.includes("gc") || t.includes("coordination")) {
    body = gcBody(scheme);
    title = "SUB MATRIX";
    scale = "n/a";
  }
  return frame(sheet, title, brief, scheme, trade.trade, scale, body);
}

export function dataUrl(svg: string) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
