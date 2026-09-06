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
  const [tab, setTab] = useState<"looks" | "plans" | "trades" | "bid" | "clerk" | "board">("board");
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
      setPacket(data.packet); setActive(0); setTab("board");
    } catch (e) { setErr(e instanceof Error ? e.message : "Forge failed"); }
    finally { setBusy(false); }
  }
  const scheme = packet?.schemes[active];
  async function ask() {
    if (!q.trim() || !packet || !scheme) return;
    const res = await fetch("/api/clerk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, brief: packet.brief, schemeId: scheme.id, legal: scheme.legal, schemeName: scheme.name }) });
    const data = await res.json(); setA(data.reply || data.error || "No reply");
  }
  const requiredGates = scheme?.legal.gates.filter((g) => g.status === "required").length ?? 0;

  return (
    <main className="min-h-screen">
      <header className="no-print sticky top-0 z-30 border-b border-white/10 bg-[#07080b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[#d4b56a]/40 text-[10px] tracking-[0.2em] text-[#d4b56a]">PF</span>
            <div>
              <p className="font-display text-2xl leading-none">Plotforge Atelier</p>
              <p className="kpi">Hillsboro studio · local-sub delivery</p>
            </div>
          </div>
          {packet && <button onClick={() => window.print()} className="rounded-full border border-white/15 px-4 py-2 text-xs tracking-[0.18em] uppercase">Print dossier</button>}
        </div>
      </header>

      <section className="no-print relative mx-auto max-w-7xl px-5 pb-8 pt-8">
        <div className="film relative overflow-hidden rounded-[28px] border border-white/10">
          <video className="h-[46vh] min-h-[320px] w-full object-cover" autoPlay muted loop playsInline poster="">
            <source src={REEL[0]} type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
            <p className="kpi text-[#d4b56a]">Cinematic design desk</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] sm:text-7xl">Snap the space.<br />Design the building.<br />Local shops execute.</h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 sm:text-base">HD capture, three schemes, trade drawings, and legal-ready bid packets. Plotforge never puts a crew on site.</p>
          </div>
        </div>
      </section>

      <section className="no-print mx-auto grid max-w-7xl gap-6 px-5 pb-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="film overflow-hidden rounded-[28px] border border-white/10">
          <div className="relative aspect-[16/10] bg-black">
            {camOn ? <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" /> : photo ? (
              <div className="relative h-full w-full">
                <img src={photo} alt="Captured space" className="h-full w-full object-cover" />
                {scheme && <div className="absolute left-[18%] top-[28%] h-[46%] w-[58%] border border-[#d4b56a] bg-[#d4b56a]/15" />}
              </div>
            ) : (
              <video className="h-full w-full object-cover opacity-70" autoPlay muted loop playsInline>
                <source src={REEL[1]} type="video/mp4" />
              </video>
            )}
            <div className="pointer-events-none absolute left-5 top-5 kpi text-[#d4b56a]">Live capture · 1080p+</div>
          </div>
          <div className="flex flex-wrap gap-2 bg-[#0d0f14] p-4">
            {!camOn ? <button onClick={startCam} className="rounded-full bg-[#d4b56a] px-5 py-2 text-sm text-[#07080b]">Open HD camera</button> : (
              <><button onClick={snap} className="rounded-full bg-[#d4b56a] px-5 py-2 text-sm text-[#07080b]">Capture frame</button><button onClick={stopCam} className="rounded-full border border-white/15 px-4 py-2 text-sm">Cancel</button></>
            )}
            <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2 text-sm">Upload still<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          </div>
        </div>

        <div className="glass hairline rounded-[28px] p-6">
          <p className="kpi text-[#d4b56a]">Program brief</p>
          <textarea value={brief.prompt} onChange={(e) => setBrief({ ...brief, prompt: e.target.value })} rows={4} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-[#d4b56a]/50" placeholder="12x24 backyard shop in Hillsboro…" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["widthFt","depthFt","heightFt"] as const).map((k) => (
              <label key={k} className="kpi">{k.replace("Ft"," ft")}<input type="number" min={6} max={60} value={brief[k]} onChange={(e) => setBrief({ ...brief, [k]: Number(e.target.value) || 0 })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-sans text-sm tracking-normal text-[#f3ead7]" /></label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {USES.map((u) => <button key={u.id} onClick={() => setBrief({ ...brief, useCase: u.id, indoor: u.id === "interior" || brief.indoor })} className={`rounded-full px-3 py-1.5 text-xs ${brief.useCase === u.id ? "bg-[#d4b56a] text-[#07080b]" : "border border-white/10"}`}>{u.label}</button>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["budget","solid","pretty"] as Finish[]).map((f) => <button key={f} onClick={() => setBrief({ ...brief, finish: f })} className={`rounded-full px-3 py-1.5 text-xs capitalize ${brief.finish === f ? "bg-[#f3ead7] text-[#07080b]" : "border border-white/10"}`}>{f}</button>)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <button onClick={() => setBrief({ ...brief, hasPower: !brief.hasPower })} className={`rounded-xl border px-3 py-2 ${brief.hasPower ? "border-[#d4b56a]" : "border-white/10"}`}>Power {brief.hasPower ? "on" : "off"}</button>
            <button onClick={() => setBrief({ ...brief, hasWater: !brief.hasWater })} className={`rounded-xl border px-3 py-2 ${brief.hasWater ? "border-[#d4b56a]" : "border-white/10"}`}>Water {brief.hasWater ? "on" : "off"}</button>
            <button onClick={() => setBrief({ ...brief, indoor: !brief.indoor })} className={`rounded-xl border px-3 py-2 ${brief.indoor ? "border-[#d4b56a]" : "border-white/10"}`}>Indoor {brief.indoor ? "yes" : "no"}</button>
            <div className="flex gap-1">{(["flat","gentle","steep"] as const).map((s) => <button key={s} onClick={() => setBrief({ ...brief, slope: s })} className={`flex-1 rounded-xl border px-2 py-2 text-xs capitalize ${brief.slope === s ? "border-[#d4b56a] text-[#d4b56a]" : "border-white/10"}`}>{s}</button>)}</div>
          </div>
          <button onClick={forge} disabled={busy} className="mt-5 w-full rounded-2xl bg-[#d4b56a] py-3 text-sm tracking-[0.16em] uppercase text-[#07080b]">{busy ? "Composing atelier…" : "Compose three schemes"}</button>
          {err && <p className="mt-3 text-sm text-[#d0733a]">{err}</p>}
        </div>
      </section>

      {packet && scheme && (
        <section className="mx-auto max-w-7xl px-5 pb-24">
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Range", `${usd(scheme.bidLow)} – ${usd(scheme.bidHigh)}`],
              ["Local packages", String(scheme.trades.length)],
              ["Required gates", String(requiredGates)],
              ["Field weeks", scheme.timelineWeeks],
              ["Delivery", "Local subs only"],
            ].map(([k, v]) => (
              <div key={k} className="glass hairline rise rounded-2xl p-4">
                <p className="kpi">{k}</p>
                <p className="mt-2 font-display text-2xl leading-tight">{v}</p>
              </div>
            ))}
          </div>

          <div className="no-print mb-5 flex flex-wrap gap-2">
            {packet.schemes.map((s, i) => (
              <button key={s.id} onClick={() => setActive(i)} className={`overflow-hidden rounded-2xl border text-left ${i === active ? "border-[#d4b56a]" : "border-white/10"}`}>
                <div className="h-16 w-56 overflow-hidden sm:w-64">
                  <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
                    <source src={REEL[i % REEL.length]} type="video/mp4" />
                  </video>
                </div>
                <div className="p-3">
                  <p className="kpi text-[#d4b56a]">{s.vibe}</p>
                  <p className="font-display text-xl">{s.name}</p>
                  <p className="text-xs text-white/50">{usd(s.bidLow)} – {usd(s.bidHigh)}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="no-print mb-5 flex flex-wrap gap-2">
            {(["board","looks","plans","trades","bid","clerk"] as const).map((id) => (
              <button key={id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${tab === id ? "bg-[#f3ead7] text-[#07080b]" : "border border-white/10"}`}>
                {id === "clerk" ? "Clerk" : id === "bid" ? "Bids" : id === "plans" ? "Drawings" : id === "trades" ? "Packages" : id === "board" ? "Dashboard" : "Looks"}
              </button>
            ))}
          </div>

          <article className="glass hairline rise rounded-[28px] p-6 sm:p-8">
            <p className="kpi text-[#d4b56a]">{scheme.vibe}</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">{scheme.name}</h2>
            <p className="mt-3 max-w-3xl text-lg text-white/75">{scheme.pitch}</p>
            <p className="mt-2 text-sm text-white/40">{scheme.footprint} · {scheme.legal.spaceClass}</p>
            <p className="mt-4 max-w-3xl text-sm text-[#d4b56a]/80">{scheme.deliveryModel}</p>

            {tab === "board" && (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="film overflow-hidden rounded-2xl border border-white/10">
                  <video className="h-64 w-full object-cover" autoPlay muted loop playsInline>
                    <source src={REEL[active % REEL.length]} type="video/mp4" />
                  </video>
                </div>
                <div className="space-y-3">
                  {scheme.why.map((w) => <p key={w} className="border-b border-white/10 pb-3 text-sm text-white/70">{w}</p>)}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div><p className="kpi">Structure</p><p className="mt-1 text-sm">{scheme.structure}</p></div>
                    <div><p className="kpi">Envelope</p><p className="mt-1 text-sm">{scheme.envelope}</p></div>
                  </div>
                </div>
                <div className="lg:col-span-2 grid gap-3 md:grid-cols-3">
                  {scheme.program.map((z) => (
                    <div key={z.zone} className="rounded-2xl border border-white/10 p-4">
                      <p className="font-display text-2xl">{z.zone}</p>
                      <p className="kpi mt-2">{z.size}</p>
                      <p className="mt-2 text-sm text-white/55">{z.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "looks" && (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  { t: "On your lot", img: photo, svg: isoSvg(packet.brief, scheme), vid: null },
                  { t: "Massing reel", img: null, svg: isoSvg(packet.brief, scheme), vid: REEL[0] },
                  { t: "Street elevation", img: null, svg: elevSvg(packet.brief, scheme), vid: REEL[1] },
                  { t: "Dusk volume", img: null, svg: isoSvg(packet.brief, scheme, true), vid: REEL[2] },
                ].map((c) => (
                  <figure key={c.t} className="film overflow-hidden rounded-2xl border border-white/10">
                    <div className="relative aspect-[16/10] bg-black">
                      {c.img ? <><img src={c.img} alt="" className="h-full w-full object-cover" /><div className="absolute left-[18%] top-[28%] h-[46%] w-[58%] border border-[#d4b56a]" /></> : c.vid ? (
                        <>
                          <video className="h-full w-full object-cover opacity-50" autoPlay muted loop playsInline><source src={c.vid} type="video/mp4" /></video>
                          <img src={dataUrl(c.svg)} alt={c.t} className="absolute inset-0 h-full w-full object-contain mix-blend-screen opacity-90" />
                        </>
                      ) : <img src={dataUrl(c.svg)} alt={c.t} className="h-full w-full object-cover" />}
                    </div>
                    <figcaption className="bg-[#0d0f14] px-4 py-3 text-sm">{c.t}</figcaption>
                  </figure>
                ))}
              </div>
            )}

            {tab === "plans" && (
              <div className="mt-8 space-y-4">
                <img src={dataUrl(siteSvg(packet.brief))} alt="site" className="w-full rounded-2xl border border-white/10" />
                <img src={dataUrl(planSvg(packet.brief, scheme))} alt="plan" className="w-full rounded-2xl border border-white/10" />
                <div className="grid gap-3 md:grid-cols-2">{scheme.sheets.map((s) => <div key={s.id} className="rounded-2xl border border-white/10 p-4"><p className="kpi text-[#d4b56a]">{s.id}{s.trade ? ` · ${s.trade}` : ""}</p><p className="font-display text-2xl">{s.title}</p><ul className="mt-2 list-disc pl-5 text-sm text-white/70">{s.notes.map((n) => <li key={n}>{n}</li>)}</ul></div>)}</div>
              </div>
            )}

            {tab === "trades" && (
              <div className="mt-8 space-y-4">
                {scheme.trades.map((t) => {
                  const lic = scheme.legal.tradeLicenses.find((x) => x.trade === t.trade);
                  return (
                    <div key={t.trade} className="rounded-2xl border border-white/10 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-display text-3xl">{t.trade}</h3><p className="text-[#d4b56a]">{usd(t.subtotal)}</p></div>
                      <p className="kpi mt-2 text-[#d4b56a]">Local sub · {t.localShopType}</p>
                      <p className="mt-2 text-sm text-white/70">{t.scope}</p>
                      <div className="mt-3 rounded-xl border border-[#d4b56a]/25 p-3 text-sm">
                        <p className="kpi text-[#d4b56a]">Licenses</p>
                        <ul className="mt-2 list-disc pl-5">{(t.licenses || lic?.licenses || ["Oregon CCB"]).map((x) => <li key={x}>{x}</li>)}</ul>
                        <p className="mt-2 text-xs text-white/45">{t.whoMayAct || lic?.whoMayAct}</p>
                      </div>
                      <table className="mt-3 w-full text-sm"><tbody>{t.lines.map((l) => <tr key={l.item} className="border-t border-white/10"><td className="py-1.5">{l.item}</td><td className="text-right">{usd(l.total)}</td></tr>)}</tbody></table>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "bid" && (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-[#d4b56a]/40 bg-[#d4b56a]/10 p-5 text-sm">
                  <p className="kpi text-[#d4b56a]">Local-sub bid header</p>
                  <p className="mt-3">Local contractor __________ · CCB # __________</p>
                  <p>BCD electrical __________ · BCD plumbing __________</p>
                  <p className="mt-3 text-white/70">{scheme.legal.cannotClaim}</p>
                </div>
                <p className="font-display text-3xl">{usd(scheme.bidLow)} – {usd(scheme.bidHigh)} <span className="text-base text-white/40">· {scheme.timelineWeeks} weeks</span></p>
                <table className="w-full text-sm"><tbody>{scheme.trades.map((t) => <tr key={t.trade} className="border-t border-white/10"><td className="py-3">{t.trade}<span className="block text-xs text-white/35">{t.localShopType}</span></td><td className="text-right">{usd(t.subtotal)}</td></tr>)}</tbody></table>
                <ul className="list-disc pl-5 text-sm text-white/70">{scheme.legal.bidClauses.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
            )}

            {tab === "clerk" && (
              <div className="mt-8 space-y-4">
                <p className="text-xl">{scheme.legal.verdict}</p>
                <p className="text-sm text-white/55">{scheme.legal.cannotClaim}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Who actually builds this?" className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2" />
                  <button onClick={ask} className="rounded-xl bg-[#d4b56a] px-4 py-2 text-[#07080b]">Ask Clerk</button>
                </div>
                {a && <p className="text-sm text-white/75">{a}</p>}
                {scheme.legal.gates.map((g) => (
                  <div key={g.id} className="rounded-2xl border border-white/10 p-4">
                    <div className="flex justify-between gap-2"><p className="font-display text-2xl">{g.title}</p><span className="kpi text-[#d4b56a]">{g.status}</span></div>
                    <p className="kpi mt-1">{g.agency}</p>
                    <p className="mt-2 text-sm text-white/75">{g.why}</p>
                    <p className="mt-1 text-sm text-white/45">{g.how}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
          <p className="mt-6 max-w-3xl text-xs text-white/35">{packet.disclaimer}</p>
        </section>
      )}
    </main>
  );
}
