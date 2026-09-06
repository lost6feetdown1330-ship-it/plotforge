import type { Brief, Scheme } from "./types";

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

export function dataUrl(svg: string) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
