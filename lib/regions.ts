export type KnownPlace = {
  id: string;
  label: string;
  county: string;
  kind: "city" | "cdp" | "unincorporated";
  agency: string;
  how: string;
  portal?: string;
  notes: string[];
};

export const EPERMITS = "https://aca-oregon.accela.com/oregon/Default.aspx";
export const BCD_DIR = "https://www.oregon.gov/bcd/lbdd/pages/building-officials.aspx";

/** Southern Oregon atlas: Jackson, Josephine, Douglas, Klamath, Curry, Lake. */
export const SOUTHERN_OREGON: KnownPlace[] = [
  { id: "medford", label: "Medford", county: "Jackson", kind: "city", agency: "City of Medford Building Safety", how: "Inside city limits file with Medford Building Safety, Lausmann Annex, 200 S Ivy St. Unincorporated Jackson County is a different counter.", portal: "https://www.medfordoregon.gov/Government/Departments/Building-Safety/Apply-for-a-Permit", notes: ["Typical residential review ~14 days.", "Rogue Valley wildfire rebuild still active; local mitigation may apply."] },
  { id: "ashland", label: "Ashland", county: "Jackson", kind: "city", agency: "City of Ashland Community Development", how: "Citizen Self Service portal for structural, electrical, plumbing, mechanical, ADUs, grading, tree removals.", portal: "https://ashlandoregon.gov/onlinepermits", notes: ["New dwellings may trigger Ashland carbon-impact paperwork.", "Do not file Ashland work at Jackson County."] },
  { id: "central-point", label: "Central Point", county: "Jackson", kind: "city", agency: "City of Central Point Building", how: "City limits stay with Central Point. County only if the parcel is outside the line.", notes: ["Confirm city vs county on the taxlot."] },
  { id: "eagle-point", label: "Eagle Point", county: "Jackson", kind: "city", agency: "City of Eagle Point (NW Code Pros)", how: "Eagle Point contracts building official services. File with the city, not Medford.", notes: ["Cliff Pettigrew / NW Code Pros listed as building official."] },
  { id: "phoenix", label: "Phoenix", county: "Jackson", kind: "city", agency: "City of Phoenix Building", how: "City permit counter for parcels inside Phoenix limits.", notes: ["Almeda Fire rebuild lots still common."] },
  { id: "talent", label: "Talent", county: "Jackson", kind: "city", agency: "City of Talent Building", how: "City of Talent issues its own structural and trade permits.", notes: ["Almeda Fire rebuild overlay possible."] },
  { id: "jacksonville", label: "Jacksonville", county: "Jackson", kind: "city", agency: "City of Jacksonville (NW Code Pros)", how: "Historic district design review can sit on top of the building permit.", notes: ["Confirm historic overlay before a metal shop elevation."] },
  { id: "shady-cove", label: "Shady Cove", county: "Jackson", kind: "city", agency: "City of Shady Cove / Jackson County as contracted", how: "Verify whether the city or county building official covers the parcel.", notes: ["Rogue River floodplain checks are common."] },
  { id: "rogue-river", label: "Rogue River", county: "Jackson", kind: "city", agency: "City of Rogue River Building", how: "City limits file locally. Nearby rural lots are Jackson County.", notes: ["Floodplain and river setbacks."] },
  { id: "gold-hill", label: "Gold Hill", county: "Jackson", kind: "city", agency: "City of Gold Hill / county as contracted", how: "Confirm administering building official before you apply.", notes: [] },
  { id: "white-city", label: "White City", county: "Jackson", kind: "cdp", agency: "Jackson County Development Services", how: "White City is unincorporated. Jackson County Development Services in Medford is the counter.", notes: ["Do not file as City of Medford."] },
  { id: "butte-falls", label: "Butte Falls", county: "Jackson", kind: "city", agency: "Town of Butte Falls / Jackson County", how: "Small town — confirm who actually reviews the set.", notes: [] },
  { id: "jackson-uninc", label: "Unincorporated Jackson County", county: "Jackson", kind: "unincorporated", agency: "Jackson County Development Services", how: "Unincorporated Jackson County, including many White City and rural Rogue Valley lots. Development Services, Medford. Shed over 200 sf typically needs a structural permit; any size in a floodplain.", portal: "https://jacksoncountyor.gov/departments/development_services/building/where_do_i_start/_do_i_need_to_get_a_permit_for_my_project.php", notes: ["Cities of Medford, Ashland, Central Point, Eagle Point, Phoenix, Talent, Jacksonville run their own departments.", "Well + septic common outside city sewer."] },

  { id: "grants-pass", label: "Grants Pass", county: "Josephine", kind: "city", agency: "City of Grants Pass Building Division", how: "City Customer Self Service for structural and trade permits inside Grants Pass, including the urbanizing area the city covers.", portal: "https://www.grantspassoregon.gov/229/Building-Division", notes: ["County SmartGov is the wrong door if you are inside city limits."] },
  { id: "cave-junction", label: "Cave Junction", county: "Josephine", kind: "city", agency: "City of Cave Junction / Josephine County Building Safety", how: "Confirm whether Cave Junction or the county building official covers the parcel.", notes: ["Illinois Valley wells and septic are typical."] },
  { id: "merlin", label: "Merlin", county: "Josephine", kind: "cdp", agency: "Josephine County Building Safety", how: "Merlin is unincorporated. File at Josephine County Building Safety, 700 NW Dimmick St, Suite C, Grants Pass.", portal: "https://co-josephine-or.smartgovcommunity.com/", notes: [] },
  { id: "williams", label: "Williams", county: "Josephine", kind: "cdp", agency: "Josephine County Building Safety", how: "Unincorporated Josephine County. SmartGov public portal.", portal: "https://co-josephine-or.smartgovcommunity.com/", notes: [] },
  { id: "wolf-creek", label: "Wolf Creek", county: "Josephine", kind: "cdp", agency: "Josephine County Building Safety", how: "Unincorporated. County Building Safety in Grants Pass.", notes: [] },
  { id: "hugo", label: "Hugo", county: "Josephine", kind: "cdp", agency: "Josephine County Building Safety", how: "Unincorporated Josephine County.", notes: [] },
  { id: "josephine-uninc", label: "Unincorporated Josephine County", county: "Josephine", kind: "unincorporated", agency: "Josephine County Building Safety", how: "700 NW Dimmick Street, Suite C, Grants Pass. SmartGov portal for building, mechanical, plumbing, electrical, planning.", portal: "https://co-josephine-or.smartgovcommunity.com/", notes: ["EFU / forest zoning can block a standalone shop or ADU.", "Phone 541-474-5405."] },

  { id: "roseburg", label: "Roseburg", county: "Douglas", kind: "city", agency: "City of Roseburg Community Development", how: "City OpenGov portal for planning and many development applications. Confirm whether structural permits are city or Douglas County for that parcel.", portal: "https://www.cityofroseburg.org/", notes: [] },
  { id: "sutherlin", label: "Sutherlin", county: "Douglas", kind: "city", agency: "City of Sutherlin Building", how: "City limits file with Sutherlin. Rural lots around town are Douglas County.", notes: [] },
  { id: "winston", label: "Winston", county: "Douglas", kind: "city", agency: "City of Winston Building", how: "Confirm city vs Douglas County on the taxlot.", notes: [] },
  { id: "myrtle-creek", label: "Myrtle Creek", county: "Douglas", kind: "city", agency: "City of Myrtle Creek / Douglas County", how: "Small-city building official may be contracted. Verify the counter.", notes: [] },
  { id: "canyonville", label: "Canyonville", county: "Douglas", kind: "city", agency: "City of Canyonville / Douglas County", how: "Verify administering official before submittal.", notes: [] },
  { id: "glendale", label: "Glendale", county: "Douglas", kind: "city", agency: "City of Glendale / Douglas County", how: "South Douglas — confirm city or county building official.", notes: [] },
  { id: "oakland-or", label: "Oakland", county: "Douglas", kind: "city", agency: "City of Oakland / Douglas County", how: "Historic Oakland design review can apply.", notes: [] },
  { id: "drain", label: "Drain", county: "Douglas", kind: "city", agency: "City of Drain / Douglas County", how: "North Douglas. Confirm counter.", notes: [] },
  { id: "riddle", label: "Riddle", county: "Douglas", kind: "city", agency: "City of Riddle / Douglas County", how: "Confirm city vs county coverage.", notes: [] },
  { id: "reedsport", label: "Reedsport", county: "Douglas", kind: "city", agency: "City of Reedsport Building", how: "Coastal Douglas. Flood and coastal overlay possible.", notes: ["Not Rogue Valley — still mapped as Southern Oregon / south-central coast."] },
  { id: "douglas-uninc", label: "Unincorporated Douglas County", county: "Douglas", kind: "unincorporated", agency: "Douglas County Building Division", how: "Douglas County Building, Roseburg. Unincorporated parcels including many I-5 corridor lots.", notes: ["Building official listed with Oregon BCD directory.", "Well + septic typical outside city sewer."] },

  { id: "klamath-falls", label: "Klamath Falls", county: "Klamath", kind: "city", agency: "City of Klamath Falls Building", how: "Inside city limits file with the city. Basin lots outside the line are Klamath County.", notes: ["Snow load and frost depth differ from the Rogue Valley."] },
  { id: "altamont", label: "Altamont", county: "Klamath", kind: "cdp", agency: "Klamath County Building Division", how: "Unincorporated basin community. County Building Division, 305 Main St, Klamath Falls.", portal: EPERMITS, notes: [] },
  { id: "chiloquin", label: "Chiloquin", county: "Klamath", kind: "city", agency: "City of Chiloquin / Klamath County", how: "Confirm who reviews the set.", notes: [] },
  { id: "merrill", label: "Merrill", county: "Klamath", kind: "city", agency: "City of Merrill / Klamath County", how: "South county. Confirm counter.", notes: [] },
  { id: "malin", label: "Malin", county: "Klamath", kind: "city", agency: "City of Malin / Klamath County", how: "Confirm administering official.", notes: [] },
  { id: "bonanza", label: "Bonanza", county: "Klamath", kind: "city", agency: "City of Bonanza / Klamath County", how: "Confirm city vs county.", notes: [] },
  { id: "keno", label: "Keno", county: "Klamath", kind: "cdp", agency: "Klamath County Building Division", how: "Unincorporated. County Building Division.", notes: [] },
  { id: "klamath-uninc", label: "Unincorporated Klamath County", county: "Klamath", kind: "unincorporated", agency: "Klamath County Building Division", how: "305 Main Street, Klamath Falls. Many permits ride Oregon ePermitting.", portal: EPERMITS, notes: ["Phone 541-883-5121.", "High-desert snow, frost, and well/septic dominate rural jobs."] },

  { id: "brookings", label: "Brookings", county: "Curry", kind: "city", agency: "City of Brookings Building", how: "City limits file with Brookings. Harbor and rural south Curry are often county.", notes: ["Coastal wind and flood overlays."] },
  { id: "harbor", label: "Harbor", county: "Curry", kind: "cdp", agency: "Curry County Building Division", how: "Unincorporated south Curry. County Building Division in Gold Beach.", portal: EPERMITS, notes: [] },
  { id: "gold-beach", label: "Gold Beach", county: "Curry", kind: "city", agency: "City of Gold Beach / Curry County Building Division", how: "Curry County Building Division also serves Gold Beach and Port Orford for many building services. 94235 Moore St, Ste 113, Gold Beach.", portal: EPERMITS, notes: ["County email buildingpermits@currycountyor.gov.", "Inspection days split north/south coast."] },
  { id: "port-orford", label: "Port Orford", county: "Curry", kind: "city", agency: "Curry County Building Division", how: "County Building Division administers much of Port Orford building work.", portal: EPERMITS, notes: [] },
  { id: "curry-uninc", label: "Unincorporated Curry County", county: "Curry", kind: "unincorporated", agency: "Curry County Building Division", how: "94235 Moore St, Ste 113, Gold Beach. Oregon ePermitting for tracking. Coastal and river floodplain reviews are common.", portal: EPERMITS, notes: ["Phone 541-247-3304.", "Agness and remote sites have limited inspection days."] },

  { id: "lakeview", label: "Lakeview", county: "Lake", kind: "city", agency: "Town of Lakeview / Lake County", how: "Confirm town vs Lake County building official.", notes: ["High-desert snow load."] },
  { id: "paisley", label: "Paisley", county: "Lake", kind: "city", agency: "Lake County Building", how: "Rural Lake County.", notes: [] },
  { id: "silver-lake", label: "Silver Lake", county: "Lake", kind: "cdp", agency: "Lake County Building", how: "Unincorporated Lake County.", notes: [] },
  { id: "lake-uninc", label: "Unincorporated Lake County", county: "Lake", kind: "unincorporated", agency: "Lake County Building Department", how: "Lake County building official listed with Oregon BCD. Very rural — well, septic, snow, and long utility runs.", notes: ["Phone listed via BCD directory."] },
];

export const SO_COUNTIES = ["Jackson", "Josephine", "Douglas", "Klamath", "Curry", "Lake"] as const;

export function resolvePlace(text: string): KnownPlace {
  const p = text.toLowerCase();
  const hits = SOUTHERN_OREGON.filter((place) => {
    if (place.kind === "unincorporated") return false;
    return p.includes(place.label.toLowerCase());
  });
  if (hits.length) return hits.sort((a, b) => b.label.length - a.label.length)[0];
  if (/white\s*city/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "white-city")!;
  if (/illinois valley|o.?brien|kerby/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "josephine-uninc")!;
  if (/rogue valley|jackson county/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "jackson-uninc")!;
  if (/josephine/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "josephine-uninc")!;
  if (/douglas|umpqua/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "douglas-uninc")!;
  if (/klamath/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "klamath-uninc")!;
  if (/curry|south coast|gold beach/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "curry-uninc")!;
  if (/\blake\b|lakeview/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "lake-uninc")!;
  if (/southern oregon|so oregon|soregon/.test(p)) return SOUTHERN_OREGON.find((x) => x.id === "jackson-uninc")!;
  return {
    id: "hillsboro",
    label: "Hillsboro",
    county: "Washington",
    kind: "city",
    agency: "City of Hillsboro Building Division or Washington County LUT",
    how: "City limits: Hillsboro Building Division. Unincorporated: Washington County LUT Building Services, 155 N First Ave.",
    portal: "https://www.hillsboro-oregon.gov/services/permitting-center/developers-contractors/building-permits",
    notes: ["Default desk when no Southern Oregon city is named."],
  };
}

export function regionLabel(place: KnownPlace) {
  return place.kind === "unincorporated"
    ? `${place.label}, Oregon`
    : `${place.label}, ${place.county} County, Oregon`;
}

export function soCountyGroups() {
  return SO_COUNTIES.map((county) => ({
    county,
    places: SOUTHERN_OREGON.filter((p) => p.county === county),
  }));
}
