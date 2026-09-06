import { NextRequest, NextResponse } from "next/server";
import { buildSchemes, defaultBrief, parsePromptHints } from "@/lib/engine";
import { regionLabel, resolvePlace } from "@/lib/regions";
import type { Brief, Packet } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const base = defaultBrief();
  const brief: Brief = {
    ...base,
    ...body.brief,
    widthFt: Number(body.brief?.widthFt || base.widthFt),
    depthFt: Number(body.brief?.depthFt || base.depthFt),
    heightFt: Number(body.brief?.heightFt || base.heightFt),
  };
  const merged = parsePromptHints(String(body.brief?.prompt || brief.prompt || ""), brief);
  const place = resolvePlace(`${merged.region} ${merged.prompt}`);
  merged.region = regionLabel(place);
  const schemes = buildSchemes(merged);
  const packet: Packet = {
    brief: merged,
    generatedAt: new Date().toISOString(),
    disclaimer:
      "Plotforge designs and packages bids only. All physical work — building, landscaping, construction, equipment operating, excavation, and tree work — is subcontracted to local licensed businesses. Packets are not stamped plans, not a contractor bid, and not permission to build. Oregon structures need permits, 811 locates, and licensed trades. Hire a designer of record before anyone pours. Southern Oregon parcels must be filed with the city or county that actually contains the taxlot.",
    schemes,
  };
  return NextResponse.json({ packet, place });
}
