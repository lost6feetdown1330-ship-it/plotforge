import { SOUTHERN_OREGON, SO_COUNTIES, resolvePlace } from "./regions";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Schematic atlas of known Southern Oregon places — not a survey. */
export function soAtlasSvg(activeLabel = "") {
  const active = resolvePlace(activeLabel);
  const cols: Record<string, number> = {
    Curry: 40,
    Josephine: 210,
    Jackson: 390,
    Douglas: 210,
    Klamath: 580,
    Lake: 760,
  };
  const tops: Record<string, number> = {
    Douglas: 90,
    Josephine: 250,
    Jackson: 250,
    Curry: 280,
    Klamath: 220,
    Lake: 200,
  };
  const groups = SO_COUNTIES.map((county) => {
    const places = SOUTHERN_OREGON.filter((p) => p.county === county);
    const x = cols[county];
    const y0 = tops[county];
    const rows = places
      .map((p, i) => {
        const on = p.id === active.id;
        const y = y0 + 22 + i * 16;
        return `<text x="${x + 8}" y="${y}" font-size="10" fill="${on ? "#d4b56a" : "#d6ecff"}">${on ? "◆ " : "· "}${esc(p.label)}</text>`;
      })
      .join("");
    const h = 28 + places.length * 16;
    return `<rect x="${x}" y="${y0}" width="170" height="${h}" fill="none" stroke="${active.county === county ? "#d4b56a" : "#9ec4e8"}"/>
      <text x="${x + 8}" y="${y0 + 16}" fill="#d4b56a" font-size="11">${county.toUpperCase()} CO.</text>
      ${rows}`;
  }).join("");
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 720" font-family="ui-monospace, SFMono-Regular, Menlo, monospace">',
    '<rect width="980" height="720" fill="#0a2f5c"/>',
    '<rect x="16" y="16" width="948" height="688" fill="none" stroke="#d6ecff"/>',
    '<text x="32" y="44" fill="#d6ecff" font-size="16">AS-SO  SOUTHERN OREGON KNOWN AREAS</text>',
    '<text x="32" y="64" fill="#9ec4e8" font-size="11">JACKSON · JOSEPHINE · DOUGLAS · KLAMATH · CURRY · LAKE  —  NOT A SURVEY</text>',
    groups,
    `<text x="32" y="680" fill="#d4b56a" font-size="11">ACTIVE COUNTER: ${esc(active.agency)}</text>`,
    `<text x="32" y="698" fill="#9ec4e8" font-size="10">Cities file in the city. White City, Merlin, Harbor, Altamont and rural land file at the county. Confirm the taxlot.</text>`,
    "</svg>",
  ].join("");
}
