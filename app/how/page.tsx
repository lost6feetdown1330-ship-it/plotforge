import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

const STEPS = [
  { n: "01", t: "Snap the space", d: "Camera or upload. Yard, room, roof, or the face of a building. Measure width, depth, height." },
  { n: "02", t: "Name the job", d: "Shop, room, roof only, inside and out. Pick the Southern Oregon city or county." },
  { n: "03", t: "Three schemes", d: "Workhorse, neighbor-facing, future-proof. Looks are free. Full packets are $9." },
  { n: "04", t: "Digital blueprints", d: "One SVG sheet and one JSON pack per trade. Send that pair to the local shop." },
  { n: "05", t: "Clerk map", d: "Permits, licenses, inspections for that counter. Software does not stamp or file." },
  { n: "06", t: "Local shops build", d: "Plotforge never puts a crew on site. You hire CCB trades. They write the real bid." },
];

export default function HowPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <p className="kpi text-[#d4b56a]">The loop</p>
        <h1 className="mt-3 font-display text-5xl">Snap. Packet. Local shop.</h1>
        <p className="mt-4 max-w-2xl text-white/60">The desk is automated from photo to download. The build is not. That split is the product.</p>
        <ol className="mt-12 space-y-6">
          {STEPS.map((s) => (
            <li key={s.n} className="glass hairline rounded-3xl p-6">
              <p className="kpi text-[#d4b56a]">{s.n}</p>
              <h2 className="mt-2 font-display text-3xl">{s.t}</h2>
              <p className="mt-2 text-white/65">{s.d}</p>
            </li>
          ))}
        </ol>
        <Link href="/" className="mt-10 inline-block rounded-full bg-[#d4b56a] px-5 py-3 text-sm text-[#07080b]">Open the desk</Link>
      </section>
      <SiteFooter />
    </main>
  );
}
