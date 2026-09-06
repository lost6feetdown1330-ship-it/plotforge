import { NextRequest, NextResponse } from "next/server";
import { clerkReply } from "@/lib/legal";
import { defaultBrief } from "@/lib/engine";
import type { Brief, LegalPacket, Scheme } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const brief: Brief = { ...defaultBrief(), ...(body.brief || {}) };
  const legal = body.legal as LegalPacket | undefined;
  if (!legal) return NextResponse.json({ error: "Missing legal packet" }, { status: 400 });
  const scheme = {
    id: String(body.schemeId || "a"),
    name: String(body.schemeName || "Scheme"),
  } as Scheme;
  const reply = clerkReply(String(body.question || ""), brief, scheme, legal);
  return NextResponse.json({ reply });
}
