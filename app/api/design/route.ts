import { NextRequest, NextResponse } from "next/server";
import { buildSchemes, defaultBrief, parsePromptHints } from "@/lib/engine";
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
  const schemes = buildSchemes(merged);
  const packet: Packet = {
    brief: merged,
    generatedAt: new Date().toISOString(),
    disclaimer:
      "Plotforge packets are conceptual design and budget studies. They are not stamped plans, not a contractor bid, and not permission to build. Oregon structures need permits, 811 locates, and licensed trades for electrical and plumbing. Hire a designer of record before you pour anything.",
    schemes,
  };
  return NextResponse.json({ packet });
}
