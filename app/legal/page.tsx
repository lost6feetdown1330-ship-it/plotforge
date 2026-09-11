import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function LegalPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-7 text-white/70">
        <p className="kpi text-[#d4b56a]">Terms</p>
        <h1 className="mt-3 font-display text-5xl text-[#f3ead7]">What this desk is and is not</h1>
        <p className="mt-6">Plotforge sells conceptual design packets: schemes, trade drawings, bid allowances, and a clerk map of likely permits and licenses. Payment is for that packet and a seat in this browser.</p>
        <p className="mt-4">Packets are not construction documents, not engineered or architect-stamped plans, not a contractor bid, and not a permit. Oregon work still needs the right counter, 811 locates, and licensed trades.</p>
        <p className="mt-4">All physical work — building, landscaping, excavation, equipment operating, tree work — is performed by local licensed businesses you hire. Plotforge does not put crews on site and does not take a cut of the build on the current price list.</p>
        <p className="mt-4">You are responsible for verifying setbacks, wildfire / WUI rules, septic, utilities, and whether your taxlot sits in a city or a county. The atlas is a map of known counters, not a survey.</p>
        <p className="mt-4">Live Stripe charges are real. Refunds for unused packets can be requested before a dossier is downloaded. After download, the packet is delivered.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
