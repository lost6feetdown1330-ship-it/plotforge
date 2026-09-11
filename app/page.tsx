"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { defaultBrief } from "@/lib/engine";
import { dataUrl, elevSvg, isoSvg, planSvg, siteSvg } from "@/lib/draw";
import { soAtlasSvg } from "@/lib/soMap";
import { SoPicker } from "@/components/SoPicker";
import { SpacePicker } from "@/components/SpacePicker";
import { Paywall } from "@/components/Paywall";
import { TradeBlueprints } from "@/components/TradeBlueprints";
import { readEntitlement } from "@/components/PayButton";
import { canUnlockFull, type Entitlement } from "@/lib/billing";
import { usd } from "@/lib/money";
import type { Brief, Packet, UseCase } from "@/lib/types";

const USES: { id: UseCase; label: string }[] = [
  { id: "shop", label: "Shop" }, { id: "studio", label: "Studio" }, { id: "garage", label: "Garage" },
  { id: "greenhouse", label: "Greenhouse" }, { id: "patio", label: "Patio" }, { id: "deck", label: "Deck" },
  { id: "adu", label: "ADU" }, { id: "interior", label: "Interior" }, { id: "commercial", label: "Commercial" },
  { id: "custom", label: "Custom" },
];

const REEL = [
  "https://videos.pexels.com/video-files/7578544/7578544-uhd_2560_1440_30fps.mp4",
  "https://videos.pexels.com/video-files/3773486/3773486-uhd_2560_1440_25fps.mp4",
  "https://videos.pexels.com/video-files/5495907/5495907-uhd_2560_1440_25fps.mp4",
];

export default function Page() {
  const [brief, setBrief] = useState<Brief>(defaultBrief());
  const [photo, setPhoto] = useState<string | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"looks" | "plans" | "prints" | "trades" | "bid" | "clerk" | "board">("board");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [ent, setEnt] = useState<Entitlement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    setEnt(readEntitlement());
    const on = () => setEnt(readEntitlement());
    window.addEventListener("storage", on);
    const id = window.setInterval(on, 1200);
    return () => { stopCam(); window.removeEventListener("storage", on); window.clearInterval(id); };
  }, []);
  const paid = canUnlockFull(ent);
  function stopCam() { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCamOn(false); }
  async function startCam() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream; setCamOn(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch { setErr("Camera blocked. Upload a still instead."); }
  }
  function snap() {
    const video = videoRef.current; if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1920; canvas.height = video.videoHeight || 1080;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.92)); stopCam();
  }
  function onFile(file?: File) { if (!file) return; const r = new FileReader(); r.onload = () => setPhoto(String(r.result)); r.readAsDataURL(file); }
  async function forge() {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/design", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Forge failed");
      setPacket(data.packet); setActive(0); setTab(paid ? "prints" : "looks");
    } catch (e) { setErr(e instanceof Error ? e.message : "Forge failed"); }
    finally { setBusy(false); }
  }
  const scheme = packet?.schemes[active];
  async function ask() {
    if (!q.trim() || !packet || !scheme) return;
    const res = await fetch("/api/clerk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, brief: packet.brief, schemeId: scheme.id, legal: scheme.legal, schemeName: scheme.name }) });
    const data = await res.json(); setA(data.reply || data.error || "No reply");
  }

  return (
    <main className="min-h-screen">
      <header className="no-print sticky top-0 z-30 border-b border-white/10 bg-[#07080b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#d4b56a]/40 text-[10px] tracking-[0.2em] text-[#d4b56a]">PF</span>
            <div>
              <p className="font-display text-2xl leading-none">Plotforge Atelier</p>
              <p className="kpi">Any space · inside or out</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-xs uppercase tracking-[0.18em] text-[#d4b56a]">Seats from $9</Link>
            {packet && paid && <button onClick={() => window.print()} className="rounded-full border border-white/15 px-4 py-2 text-xs tracking-[0.18em] uppercase">Print dossier</button>}
          </div>
        </div>
      </header>
      <section className="no-print relative mx-auto max-w-7xl px-5 pb-8 pt-8">
        <div className="film relative overflow-hidden rounded-[28px] border border-white/10">
          <video className="h-[42vh] min-h-[280px] w-full object-cover" autoPlay muted loop playsInline>
            <source src={REEL[0]} type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
            <p className="kpi text-[#d4b56a]">Room · roof · building · yard</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] sm:text-6xl">Snap any space. Redesign inside, outside, or both.</h1>
          </div>
        </div>
      </section>
      <section className="no-print mx-auto grid max-w-7xl gap-6 px-5 pb-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="film overflow-hidden rounded-[28px] border border-white/10">
          <div className="relative aspect-[16/10] bg-black">
            {camOn ? <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" /> : photo ? (
              <img src={photo} alt="Captured space" className="h-full w-full object-cover" />
            ) : (
              <video className="h-full w-full object-cover opacity-70" autoPlay muted loop playsInline>
                <source src={REEL[1]} type="video/mp4" />
              </video>
            )}
          </div>
          <div className="flex flex-wrap gap-2 bg-[#0d0f14] p-4">
            {!camOn ? <button onClick={startCam} className="rounded-full bg-[#d4b56a] px-5 py-2 text-sm text-[#07080b]">Open HD camera</button> : (
              <><button onClick={snap} className="rounded-full bg-[#d4b56a] px-5 py-2 text-sm text-[#07080b]">Capture frame</button><button onClick={stopCam} className="rounded-full border border-white/15 px-4 py-2 text-sm">Cancel</button></>
            )}
            <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm">Upload still<input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          </div>
        </div>
        <div className="glass hairline rounded-[28px] p-6">
          <p className="kpi text-[#d4b56a]">Program brief</p>
          <textarea value={brief.prompt} onChange={(e) => setBrief({ ...brief, prompt: e.target.value })} rows={3} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm outline-none" placeholder="Kitchen, roof, 12x24 shop, whole house face…" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["widthFt","depthFt","heightFt"] as const).map((k) => (
              <label key={k} className="kpi">{k.replace("Ft"," ft")}<input type="number" min={6} max={60} value={brief[k]} onChange={(e) => setBrief({ ...brief, [k]: Number(e.target.value) || 0 })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-sans text-sm tracking-normal text-[#f3ead7]" /></label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {USES.map((u) => <button key={u.id} onClick={() => setBrief({ ...brief, useCase: u.id, indoor: u.id === "interior" || brief.indoor })} className={`rounded-full px-3 py-1.5 text-xs ${brief.useCase === u.id ? "bg-[#d4b56a] text-[#07080b]" : "border border-white/10"}`}>{u.label}</button>)}
          </div>
          <SpacePicker brief={brief} setBrief={setBrief} />
          <SoPicker brief={brief} setBrief={setBrief} />
          <button onClick={forge} disabled={busy} className="mt-5 w-full rounded-2xl bg-[#d4b56a] py-3 text-sm tracking-[0.16em] uppercase text-[#07080b]">{busy ? "Composing…" : paid ? "Compose three schemes" : "Preview schemes · $9 to unlock"}</button>
          {err && <p className="mt-3 text-sm text-[#d0733a]">{err}</p>}
        </div>
      </section>
      {packet && scheme && (
        <section className="mx-auto max-w-7xl px-5 pb-24">
          <p className="mb-4 text-sm text-[#d4b56a]">{scheme.legal.jurisdiction}</p>
          <div className="no-print mb-5 flex flex-wrap gap-2">
            {packet.schemes.map((s, i) => (
              <button key={s.id} onClick={() => setActive(i)} className={`rounded-2xl border px-4 py-3 text-left ${i === active ? "border-[#d4b56a]" : "border-white/10"}`}>
                <p className="font-display text-xl">{s.name}</p>
                <p className="text-xs text-white/50">{usd(s.bidLow)} – {usd(s.bidHigh)}</p>
              </button>
            ))}
          </div>
          <div className="no-print mb-5 flex flex-wrap gap-2">
            {(["board","looks","prints","plans","trades","bid","clerk"] as const).map((id) => (
              <button key={id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${tab === id ? "bg-[#f3ead7] text-[#07080b]" : "border border-white/10"}`}>
                {id === "clerk" ? "Clerk" : id === "bid" ? "Bids" : id === "plans" ? "Atlas" : id === "trades" ? "Packages" : id === "board" ? "Dashboard" : id === "prints" ? "Blueprints" : "Looks"}
              </button>
            ))}
          </div>
          <article className="glass hairline rounded-[28px] p-6 sm:p-8">
            <h2 className="font-display text-4xl">{scheme.name}</h2>
            <p className="mt-3 text-white/75">{scheme.pitch}</p>
            {(tab === "looks" || tab === "board") && (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <img src={dataUrl(isoSvg(packet.brief, scheme))} alt="iso" className="rounded-2xl" />
                <img src={dataUrl(elevSvg(packet.brief, scheme))} alt="elev" className="rounded-2xl" />
              </div>
            )}
            {!paid && (tab === "prints" || tab === "trades" || tab === "bid" || tab === "clerk" || tab === "plans") && (
              <Paywall reason="Looks stay free. Digital builder blueprints unlock with a $9 site packet." />
            )}
            {paid && tab === "plans" && (
              <div className="mt-8 space-y-4">
                <img src={dataUrl(soAtlasSvg(packet.brief.region + " " + packet.brief.prompt))} alt="atlas" className="w-full rounded-2xl border border-white/10" />
                <img src={dataUrl(siteSvg(packet.brief))} alt="site" className="w-full rounded-2xl" />
                <img src={dataUrl(planSvg(packet.brief, scheme))} alt="plan" className="w-full rounded-2xl" />
              </div>
            )}
            {paid && (tab === "prints" || tab === "trades") && (
              <TradeBlueprints brief={packet.brief} scheme={scheme} />
            )}
            {paid && tab === "bid" && (
              <div className="mt-8">
                <p className="font-display text-3xl">{usd(scheme.bidLow)} – {usd(scheme.bidHigh)}</p>
                <ul className="mt-4 list-disc pl-5 text-sm text-white/70">{scheme.legal.bidClauses.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
            )}
            {paid && tab === "clerk" && (
              <div className="mt-8 space-y-4">
                <p>{scheme.legal.verdict}</p>
                <div className="flex gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Medford or county?" className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2" /><button onClick={ask} className="rounded-xl bg-[#d4b56a] px-4 py-2 text-[#07080b]">Ask Clerk</button></div>
                {a && <p className="text-sm text-white/75">{a}</p>}
                {scheme.legal.gates.map((g) => (
                  <div key={g.id} className="rounded-2xl border border-white/10 p-4">
                    <p className="font-display text-2xl">{g.title}</p>
                    <p className="kpi">{g.agency} · {g.status}</p>
                    <p className="mt-2 text-sm text-white/70">{g.why}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
