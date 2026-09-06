"use client";

import { useEffect, useRef, useState } from "react";
import { defaultBrief } from "@/lib/engine";
import { dataUrl, elevSvg, isoSvg, planSvg, siteSvg } from "@/lib/draw";
import { usd } from "@/lib/money";
import type { Brief, Finish, Packet, UseCase } from "@/lib/types";

const USES: { id: UseCase; label: string }[] = [
  { id: "shop", label: "Shop" }, { id: "studio", label: "Studio" }, { id: "garage", label: "Garage" },
  { id: "greenhouse", label: "Greenhouse" }, { id: "patio", label: "Patio" }, { id: "deck", label: "Deck" },
  { id: "adu", label: "ADU" }, { id: "interior", label: "Interior" }, { id: "commercial", label: "Commercial" },
  { id: "custom", label: "Custom" },
];

export default function Page() {
  const [brief, setBrief] = useState<Brief>(defaultBrief());
  const [photo, setPhoto] = useState<string | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"looks" | "plans" | "trades" | "bid" | "clerk">("looks");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => () => stopCam(), []);
  function stopCam() { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCamOn(false); }
  async function startCam() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream; setCamOn(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch { setErr("Camera blocked. Upload a photo instead."); }
  }
  function snap() {
    const video = videoRef.current; if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.86)); stopCam();
  }
  function onFile(file?: File) { if (!file) return; const r = new FileReader(); r.onload = () => setPhoto(String(r.result)); r.readAsDataURL(file); }
  async function forge() {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/design", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Forge failed");
      setPacket(data.packet); setActive(0); setTab("looks");
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
    <main className="min-h-screen bg-[#12100c] text-[#efe8db]">
      <header className="no-print mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div><p className="font-display text-2xl">Plotforge</p><p className="text-xs uppercase tracking-[0.22em] text-[#c9a227]">design + local-sub bid packets</p></div>
        {packet && <button onClick={() => window.print()} className="rounded-full border border-white/15 px-4 py-2 text-sm">Print packet</button>}
      </header>
      <section className="no-print mx-auto max-w-6xl px-5 pb-6">
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Snap the space. Design three options. Local shops build every one of them.</h1>
        <p className="mt-4 max-w-2xl text-[#efe8db]/70">Plotforge never puts a crew on site. Building, landscaping, construction, equipment operating, excavation, and tree work are subcontracted to local licensed businesses. You get designs, trade plans, and bid packages those shops answer. A bid is only legal after a local contractor prints a live CCB number on page 1 and the city stamps required drawings.</p>
      </section>
      <section className="no-print mx-auto grid max-w-6xl gap-6 px-5 pb-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <div className="relative aspect-[4/3] bg-[#1a1712]">
            {camOn ? <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" /> : photo ? (
              <div className="relative h-full w-full">
                <img src={photo} alt="Captured space" className="h-full w-full object-cover" />
                {scheme && <div className="absolute left-[18%] top-[28%] h-[46%] w-[58%] border-2 border-[#c9a227] bg-[#c9a227]/20" />}
              </div>
            ) : <div className="grid h-full place-items-center p-8 text-center text-white/40">Point the camera at any empty space or upload a photo.</div>}
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {!camOn ? <button onClick={startCam} className="rounded-full bg-[#c9a227] px-4 py-2 text-[#12100c]">Snap space</button> : (
              <><button onClick={snap} className="rounded-full bg-[#c9a227] px-4 py-2 text-[#12100c]">Capture</button><button onClick={stopCam} className="rounded-full border border-white/15 px-4 py-2">Cancel</button></>
            )}
            <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2">Upload photo<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9a227]">build your own area</p>
          <textarea value={brief.prompt} onChange={(e) => setBrief({ ...brief, prompt: e.target.value })} rows={4} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 p-3" placeholder="12x24 backyard shop..." />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["widthFt","depthFt","heightFt"] as const).map((k) => (
              <label key={k} className="text-xs text-white/60">{k.replace("Ft"," ft")}<input type="number" min={6} max={60} value={brief[k]} onChange={(e) => setBrief({ ...brief, [k]: Number(e.target.value) || 0 })} className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[#efe8db]" /></label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {USES.map((u) => <button key={u.id} onClick={() => setBrief({ ...brief, useCase: u.id, indoor: u.id === "interior" || brief.indoor })} className={`rounded-full px-3 py-1.5 text-sm ${brief.useCase === u.id ? "bg-[#c9a227] text-[#12100c]" : "border border-white/10"}`}>{u.label}</button>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["budget","solid","pretty"] as Finish[]).map((f) => <button key={f} onClick={() => setBrief({ ...brief, finish: f })} className={`rounded-full px-3 py-1.5 text-sm capitalize ${brief.finish === f ? "bg-[#efe8db] text-[#12100c]" : "border border-white/10"}`}>{f}</button>)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <button onClick={() => setBrief({ ...brief, hasPower: !brief.hasPower })} className={`rounded-xl border px-3 py-2 ${brief.hasPower ? "border-[#c9a227]" : "border-white/10"}`}>Power: {brief.hasPower ? "yes" : "no"}</button>
            <button onClick={() => setBrief({ ...brief, hasWater: !brief.hasWater })} className={`rounded-xl border px-3 py-2 ${brief.hasWater ? "border-[#c9a227]" : "border-white/10"}`}>Water: {brief.hasWater ? "yes" : "no"}</button>
            <button onClick={() => setBrief({ ...brief, indoor: !brief.indoor })} className={`rounded-xl border px-3 py-2 ${brief.indoor ? "border-[#c9a227]" : "border-white/10"}`}>Indoor: {brief.indoor ? "yes" : "no"}</button>
          </div>
          <div className="mt-3 flex gap-2 text-sm">
            {(["flat","gentle","steep"] as const).map((s) => <button key={s} onClick={() => setBrief({ ...brief, slope: s })} className={`rounded-full px-3 py-1 capitalize ${brief.slope === s ? "border border-[#c9a227] text-[#c9a227]" : "border border-white/10"}`}>{s}</button>)}
          </div>
          <button onClick={forge} disabled={busy} className="mt-5 w-full rounded-2xl bg-[#c9a227] py-3 text-lg text-[#12100c]">{busy ? "Forging..." : "Forge 3 designs + local-sub bids"}</button>
          {err && <p className="mt-3 text-[#d0733a]">{err}</p>}
        </div>
      </section>
      {packet && scheme && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="mb-5 rounded-2xl border border-[#c9a227]/40 bg-[#c9a227]/10 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a227]">delivery model</p>
            <p className="mt-2">{scheme.deliveryModel}</p>
          </div>
          <div className="no-print mb-5 flex flex-wrap gap-2">
            {packet.schemes.map((s, i) => (
              <button key={s.id} onClick={() => setActive(i)} className={`rounded-2xl border px-4 py-3 text-left ${i === active ? "border-[#c9a227] bg-[#c9a227]/10" : "border-white/10"}`}>
                <p className="text-xs text-[#c9a227]">{s.vibe}</p>
                <p className="font-display text-xl">{s.name}</p>
                <p className="text-sm text-white/60">{usd(s.bidLow)} - {usd(s.bidHigh)}</p>
              </button>
            ))}
          </div>
          <div className="no-print mb-5 flex flex-wrap gap-2">
            {(["looks","plans","trades","bid","clerk"] as const).map((id) => (
              <button key={id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-[#efe8db] text-[#12100c]" : "border border-white/10"}`}>{id === "clerk" ? "Clerk / legality" : id === "bid" ? "Local-sub bids" : id === "plans" ? "Trade plans" : id === "trades" ? "Sub packages" : id}</button>
            ))}
          </div>
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a227]">{scheme.vibe}</p>
            <h2 className="font-display text-3xl">{scheme.name}</h2>
            <p className="mt-3 text-lg text-white/80">{scheme.pitch}</p>
            <p className="mt-2 text-sm text-white/50">{scheme.footprint} - {scheme.legal.spaceClass}</p>
            {tab === "looks" && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[{ t: "On your space", img: photo, svg: isoSvg(packet.brief, scheme) }, { t: "Iso", img: null, svg: isoSvg(packet.brief, scheme) }, { t: "Elev", img: null, svg: elevSvg(packet.brief, scheme) }, { t: "Dusk", img: null, svg: isoSvg(packet.brief, scheme, true) }].map((c) => (
                  <figure key={c.t} className="overflow-hidden rounded-2xl border border-white/10">
                    <div className="relative aspect-[16/10]">{c.img ? <><img src={c.img} alt="" className="h-full w-full object-cover" /><div className="absolute left-[18%] top-[28%] h-[46%] w-[58%] border-2 border-[#c9a227]" /></> : <img src={dataUrl(c.svg)} alt={c.t} className="h-full w-full object-cover" />}</div>
                    <figcaption className="p-3 text-sm">{c.t}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            {tab === "plans" && (
              <div className="mt-6 space-y-4">
                <img src={dataUrl(siteSvg(packet.brief))} alt="site" className="w-full rounded-2xl border border-white/10" />
                <img src={dataUrl(planSvg(packet.brief, scheme))} alt="plan" className="w-full rounded-2xl border border-white/10" />
                <div className="grid gap-3 md:grid-cols-2">{scheme.sheets.map((s) => <div key={s.id} className="rounded-2xl border border-white/10 p-4"><p className="font-mono text-xs text-[#c9a227]">{s.id}{s.trade ? ` - ${s.trade}` : ""}</p><p className="font-display text-xl">{s.title}</p><ul className="mt-2 list-disc pl-5 text-sm text-white/70">{s.notes.map((n) => <li key={n}>{n}</li>)}</ul></div>)}</div>
              </div>
            )}
            {tab === "trades" && (
              <div className="mt-6 space-y-4">
                {scheme.trades.map((t) => {
                  const lic = scheme.legal.tradeLicenses.find((x) => x.trade === t.trade);
                  return (
                    <div key={t.trade} className="rounded-2xl border border-white/10 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-display text-2xl">{t.trade}</h3><p className="text-[#c9a227]">{usd(t.subtotal)}</p></div>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#c9a227]">local sub · {t.localShopType}</p>
                      <p className="mt-2 text-sm text-white/70">{t.scope}</p>
                      <div className="mt-3 rounded-xl border border-[#c9a227]/30 p-3 text-sm">
                        <p className="text-xs uppercase text-[#c9a227]">licenses to bid this trade</p>
                        <ul className="list-disc pl-5">{(t.licenses || lic?.licenses || ["Oregon CCB"]).map((x) => <li key={x}>{x}</li>)}</ul>
                        <p className="mt-2 text-xs text-white/50">{t.whoMayAct || lic?.whoMayAct}</p>
                      </div>
                      <table className="mt-3 w-full text-sm"><tbody>{t.lines.map((l) => <tr key={l.item} className="border-t border-white/10"><td className="py-1">{l.item}</td><td>{usd(l.total)}</td></tr>)}</tbody></table>
                    </div>
                  );
                })}
              </div>
            )}
            {tab === "bid" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-[#c9a227]/40 bg-[#c9a227]/10 p-4 text-sm">
                  <p className="text-xs uppercase text-[#c9a227]">local-sub bid header — each shop fills their own</p>
                  <p className="mt-2">Local contractor: __________  CCB #: __________ (required on page 1)</p>
                  <p>BCD electrical #: __________  BCD plumbing #: __________</p>
                  <p className="mt-2 text-white/70">{scheme.legal.cannotClaim}</p>
                </div>
                <p>{usd(scheme.bidLow)} - {usd(scheme.bidHigh)} · {scheme.timelineWeeks} weeks · all field work local</p>
                <table className="w-full text-sm"><tbody>{scheme.trades.map((t) => <tr key={t.trade} className="border-t border-white/10"><td className="py-2">{t.trade}<span className="block text-xs text-white/40">{t.localShopType}</span></td><td>{usd(t.subtotal)}</td></tr>)}</tbody></table>
                <ul className="list-disc pl-5 text-sm text-white/70">{scheme.legal.bidClauses.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
            )}
            {tab === "clerk" && (
              <div className="mt-6 space-y-4">
                <p className="text-lg">{scheme.legal.verdict}</p>
                <p className="text-sm text-white/60">{scheme.legal.cannotClaim}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Who actually builds this?" className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2" />
                  <button onClick={ask} className="rounded-xl bg-[#c9a227] px-4 py-2 text-[#12100c]">Ask Clerk</button>
                </div>
                {a && <p className="text-sm text-white/75">{a}</p>}
                {scheme.legal.gates.map((g) => (
                  <div key={g.id} className="rounded-2xl border border-white/10 p-4">
                    <div className="flex justify-between gap-2"><p className="font-display text-xl">{g.title}</p><span className="text-xs uppercase text-[#c9a227]">{g.status}</span></div>
                    <p className="text-xs text-white/40">{g.agency}</p>
                    <p className="mt-2 text-sm text-white/75">{g.why}</p>
                    <p className="mt-1 text-sm text-white/55">{g.how}</p>
                  </div>
                ))}
                <div className="grid gap-3 md:grid-cols-2">
                  {scheme.legal.tradeLicenses.map((t) => (
                    <div key={t.trade} className="rounded-2xl border border-white/10 p-4">
                      <p className="font-display text-xl">{t.trade}</p>
                      <ul className="mt-2 list-disc pl-5 text-sm">{t.licenses.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                  ))}
                </div>
                <ul className="list-disc pl-5 text-sm text-white/70">{scheme.legal.inspections.map((i) => <li key={i}>{i}</li>)}</ul>
                <ul className="list-disc pl-5 text-sm text-white/70">{scheme.legal.nextHuman.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            )}
          </article>
          <p className="mt-6 max-w-3xl text-sm text-white/40">{packet.disclaimer}</p>
        </section>
      )}
    </main>
  );
}
