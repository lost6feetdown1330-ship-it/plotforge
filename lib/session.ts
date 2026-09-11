import type { Brief, Packet } from "./types";

const PACKET = "plotforge.packet";
const BRIEF = "plotforge.brief";

export function readPacket(): Packet | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PACKET);
    return raw ? (JSON.parse(raw) as Packet) : null;
  } catch {
    return null;
  }
}

export function writePacket(packet: Packet) {
  localStorage.setItem(PACKET, JSON.stringify(packet));
}

export function readBrief(): Brief | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BRIEF);
    return raw ? (JSON.parse(raw) as Brief) : null;
  } catch {
    return null;
  }
}

export function writeBrief(brief: Brief) {
  localStorage.setItem(BRIEF, JSON.stringify(brief));
}
