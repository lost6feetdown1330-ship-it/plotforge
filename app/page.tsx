"use client";

import { useEffect, useRef, useState } from "react";
import { defaultBrief } from "@/lib/engine";
import { dataUrl, elevSvg, isoSvg, planSvg, siteSvg } from "@/lib/draw";
import { usd } from "@/lib/money";
import type { Brief, Finish, Packet, Scheme, UseCase } from "@/lib/types";

const USES: { id: UseCase; label: string }[] = [
  { id: "shop", label: "Shop" },
  { id: "studio", label: "Studio" },
  { id: "garage", label: "Garage" },
  { id: "greenhouse", label: "Greenhouse" },
  { id: "patio", label: "Patio room" },
  { id: "adu", label: "ADU / living" },
  { id: "custom", label: "Custom" },
];

export default function Page() {
  const [brief, setBrief] = useState<Brief>(defaultBrief());
  const [photo, setPhoto] = useState<string | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"looks" | "plans" | "trades" | "bid">("looks");
  const [err, setErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopCam();
  }, []);

  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }

  async function startCam() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1600 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setErr("Camera blocked. Use the upload button, or allow camera on this phone.");
    }
  }

  function snap() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.86));
    stopCam();
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function forge() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Forge failed");
      setPacket(data.packet);
      setActive(0);
      setTab("looks");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Forge failed");
    } finally {
      setBusy(false);
    }
  }

  const scheme = packet?.schemes[active];

  return (
    <main className="min-h-screen bg-[#12100c] text-[#efe8db]">
      <header className="no-print mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div>
          <p className="font-display text-2xl">Plotforge</p>
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9a227]">see a pad. leave with a packet.</p>
        </div>
        {packet && (
          <button onClick={() => window.print()} className="rounded-full border border-white/15 px-4 py-2 text-sm">
            Print packet
          </button>
        )}
      </header>

      <section className="no-print mx-auto max-w-6xl px-5 pb-6">
        <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          Photograph the empty 12x24. Walk out with three designs, trade plans, and bids.
        </h1>
        <p className="mt-4 max-w-2xl text-[#efe8db]/70">
          Camera or upload. Punch the size. Tell it what you want. Plotforge forges a workhorse scheme, a neighbor-friendly
          scheme, and a future-proof scheme - each with drawings and a conceptual bid by trade.
        </p>
      </section>

      <section className="no-print mx-auto grid max-w-6xl gap-6 px-5 pb-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <div className="relative aspect-[4/3] bg-[#1a1712]">
            {camOn ? (
              <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            ) : photo ? (
              <div className="relative h-full w-full">
                <img src={photo} alt="Captured pad" className="h-full w-full object-cover" />
                {scheme && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 to-transparent">
                    <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#c9a227]">massing on your photo</p>
                      <p className="font-display text-2xl">{scheme.name}</p>
                      <p className="text-sm text-white/70">{brief.widthFt} x {brief.depthFt} ft dropped on the real lot</p>
                    </div>
                    <div className="absolute left-[18%] top-[28%] h-[46%] w-[58%] rounded-sm border-2 border-[#c9a227]/80 bg-[#c9a227]/15" />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid h-full place-items-center p-8 text-center text-[#efe8db]/50">
                Point the camera at the empty pad, or upload a photo. Fences and the house edge help scale.
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {!camOn ? (
              <button onClick={startCam} className="rounded-full bg-[#c9a227] px-4 py-2 text-[#12100c]">
                Open camera
              </button>
            ) : (
              <>
                <button onClick={snap} className="rounded-full bg-[#c9a227] px-4 py-2 text-[#12100c]">
                  Capture
                </button>
                <button onClick={stopCam} className="rounded-full border border-white/15 px-4 py-2">
                  Cancel
                </button>
              </>
            )}
            <label className="cursor-pointer rounded-full border border-white/15 px-4 py-2">
              Upload photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {photo && (
              <button onClick={() => setPhoto(null)} className="rounded-full border border-white/15 px-4 py-2">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9a227]">build your own area</p>
          <textarea
            value={brief.prompt}
            onChange={(e) => setBrief({ ...brief, prompt: e.target.value })}
            rows={4}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 p-3 outline-none focus:border-[#c9a227]"
            placeholder="12x24 backyard shop, roll-up on the side yard, match the house someday..."
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Num label="Width ft" value={brief.widthFt} onChange={(n) => setBrief({ ...brief, widthFt: n })} />
            <Num label="Depth ft" value={brief.depthFt} onChange={(n) => setBrief({ ...brief, depthFt: n })} />
            <Num label="Eave ft" value={brief.heightFt} onChange={(n) => setBrief({ ...brief, heightFt: n })} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {USES.map((u) => (
              <button
                key={u.id}
                onClick={() => setBrief({ ...brief, useCase: u.id })}
                className={`rounded-full px-3 py-1.5 text-sm ${brief.useCase === u.id ? "bg-[#c9a227] text-[#12100c]" : "border border-white/10"}`}
              >
                {u.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["budget", "solid", "pretty"] as Finish[]).map((f) => (
              <button
                key={f}
                onClick={() => setBrief({ ...brief, finish: f })}
                className={`rounded-full px-3 py-1.5 text-sm capitalize ${brief.finish === f ? "bg-[#efe8db] text-[#12100c]" : "border border-white/10"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <Toggle on={brief.hasPower} label="Power from house" onClick={() => setBrief({ ...brief, hasPower: !brief.hasPower })} />
            <Toggle on={brief.hasWater} label="Water on site" onClick={() => setBrief({ ...brief, hasWater: !brief.hasWater })} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {(["flat", "gentle", "steep"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setBrief({ ...brief, slope: s })}
                className={`rounded-full px-3 py-1 capitalize ${brief.slope === s ? "border border-[#c9a227] text-[#c9a227]" : "border border-white/10"}`}
              >
                {s} grade
              </button>
            ))}
          </div>
          <button
            onClick={forge}
            disabled={busy}
            className="mt-5 w-full rounded-2xl bg-[#c9a227] py-3 text-lg text-[#12100c] disabled:opacity-60"
          >
            {busy ? "Forging schemes..." : "Forge 3 designs + bids"}
          </button>
          {err && <p className="mt-3 text-[#d0733a]">{err}</p>}
        </div>
      </section>

      {packet && scheme && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="no-print mb-5 flex flex-wrap gap-2">
            {packet.schemes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={`rounded-2xl border px-4 py-3 text-left ${i === active ? "border-[#c9a227] bg-[#c9a227]/10" : "border-white/10"}`}
              >
                <p className="text-xs text-[#c9a227]">{s.vibe}</p>
                <p className="font-display text-xl">{s.name}</p>
                <p className="text-sm text-white/60">
                  {usd(s.bidLow)} - {usd(s.bidHigh)}
                </p>
              </button>
            ))}
          </div>

          <div className="no-print mb-5 flex flex-wrap gap-2">
            {(
              [
                ["looks", "Design photos"],
                ["plans", "Trade plans"],
                ["trades", "Scope by trade"],
                ["bid", "Bid sheet"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-[#efe8db] text-[#12100c]" : "border border-white/10"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <article className="print-break rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a227]">{scheme.vibe}</p>
            <h2 className="font-display text-3xl">{scheme.name}</h2>
            <p className="mt-3 max-w-3xl text-lg text-[#efe8db]/80">{scheme.pitch}</p>
            <p className="mt-2 text-sm text-white/50">{scheme.footprint} - {packet.brief.region}</p>
            {tab === "looks" && <Looks photo={photo} brief={packet.brief} scheme={scheme} />}
            {tab === "plans" && <Plans brief={packet.brief} scheme={scheme} />}
            {tab === "trades" && <Trades scheme={scheme} />}
            {tab === "bid" && <Bid packet={packet} scheme={scheme} />}
          </article>
          <p className="mt-6 max-w-3xl text-sm text-white/40">{packet.disclaimer}</p>
        </section>
      )}
    </main>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="text-xs text-white/60">
      {label}
      <input
        type="number"
        min={6}
        max={60}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-base text-[#efe8db]"
      />
    </label>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-xl border px-3 py-2 text-left ${on ? "border-[#c9a227]/70 bg-[#c9a227]/10" : "border-white/10"}`}>
      {label}: {on ? "yes" : "no"}
    </button>
  );
}

function Looks({ photo, brief, scheme }: { photo: string | null; brief: Brief; scheme: Scheme }) {
  const cards = [
    { title: "On your lot", img: photo, svg: isoSvg(brief, scheme) },
    { title: "Isometric", img: null, svg: isoSvg(brief, scheme) },
    { title: "Yard elevation", img: null, svg: elevSvg(brief, scheme) },
    { title: "Dusk study", img: null, svg: isoSvg(brief, scheme, true) },
  ];
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {cards.map((c) => (
        <figure key={c.title} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <div className="relative aspect-[16/10]">
            {c.img ? (
              <>
                <img src={c.img} alt="" className="h-full w-full object-cover" />
                <div className="absolute left-[18%] top-[28%] h-[46%] w-[58%] border-2 border-[#c9a227] bg-[#c9a227]/20" />
              </>
            ) : (
              <img src={dataUrl(c.svg)} alt={c.title} className="h-full w-full object-cover" />
            )}
          </div>
          <figcaption className="p-3 text-sm text-white/70">{c.title}</figcaption>
        </figure>
      ))}
      <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
        {scheme.why.map((w) => (
          <p key={w} className="rounded-xl border border-white/10 p-3 text-sm text-white/75">{w}</p>
        ))}
      </div>
    </div>
  );
}

function Plans({ brief, scheme }: { brief: Brief; scheme: Scheme }) {
  return (
    <div className="mt-6 space-y-4">
      <img src={dataUrl(siteSvg(brief))} alt="Site plan" className="w-full rounded-2xl border border-white/10" />
      <img src={dataUrl(planSvg(brief, scheme))} alt="Floor plan" className="w-full rounded-2xl border border-white/10" />
      <img src={dataUrl(elevSvg(brief, scheme))} alt="Elevation" className="w-full rounded-2xl border border-white/10" />
      <div className="grid gap-3 md:grid-cols-2">
        {scheme.sheets.map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 p-4">
            <p className="font-mono text-xs text-[#c9a227]">{s.id} - {s.scale}</p>
            <p className="font-display text-xl">{s.title}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-white/70">
              {s.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Info title="Structure" body={scheme.structure} />
        <Info title="Roof" body={scheme.roof} />
        <Info title="Envelope" body={scheme.envelope} />
      </div>
    </div>
  );
}

function Trades({ scheme }: { scheme: Scheme }) {
  return (
    <div className="mt-6 space-y-4">
      {scheme.trades.map((t) => (
        <div key={t.trade} className="rounded-2xl border border-white/10 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-[#c9a227]">Division {t.code}</p>
              <h3 className="font-display text-2xl">{t.trade}</h3>
            </div>
            <p className="text-[#c9a227]">{usd(t.subtotal)}</p>
          </div>
          <p className="mt-2 text-sm text-white/70">{t.scope}</p>
          <p className="mt-1 text-xs text-white/40">{Math.round(t.laborHours)} labor hours conceptual</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/40">
                <tr>
                  <th className="py-1">Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit $</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {t.lines.map((l) => (
                  <tr key={l.item} className="border-t border-white/10">
                    <td className="py-1 pr-2">
                      {l.item}
                      {l.notes ? <span className="block text-xs text-white/40">{l.notes}</span> : null}
                    </td>
                    <td>{l.qty}</td>
                    <td>{l.unit}</td>
                    <td>{usd(l.unitCost)}</td>
                    <td>{usd(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-3 list-disc pl-5 text-xs text-white/50">
            {t.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Bid({ packet, scheme }: { packet: Packet; scheme: Scheme }) {
  const sub = scheme.trades.reduce((s, t) => s + t.subtotal, 0);
  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Info title="Low conceptual" body={usd(scheme.bidLow)} />
        <Info title="High conceptual" body={usd(scheme.bidHigh)} />
        <Info title="Timeline" body={`${scheme.timelineWeeks} weeks`} />
      </div>
      <table className="mt-5 w-full text-left text-sm">
        <thead className="text-white/40">
          <tr>
            <th className="py-2">Trade</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {scheme.trades.map((t) => (
            <tr key={t.trade} className="border-t border-white/10">
              <td className="py-2">{t.trade}</td>
              <td>{usd(t.subtotal)}</td>
            </tr>
          ))}
          <tr className="border-t border-white/20">
            <td className="py-2">Direct + GC (pre-contingency)</td>
            <td>{usd(sub)}</td>
          </tr>
          <tr>
            <td className="py-2">Contingency {scheme.contingencyPct}%</td>
            <td>{usd(sub * (scheme.contingencyPct / 100))}</td>
          </tr>
        </tbody>
      </table>
      <h3 className="mt-6 font-display text-xl">Permits and gates</h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-white/70">
        {scheme.permits.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <h3 className="mt-6 font-display text-xl">Risks that move money</h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-white/70">
        {scheme.risks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-white/40">Generated {packet.generatedAt}. Region basis: {packet.brief.region} 2026 ranges.</p>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[#c9a227]">{title}</p>
      <p className="mt-2 text-[#efe8db]/85">{body}</p>
    </div>
  );
}
