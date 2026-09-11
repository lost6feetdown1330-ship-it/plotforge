import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-7 text-white/70">
        <p className="kpi text-[#d4b56a]">Privacy</p>
        <h1 className="mt-3 font-display text-5xl text-[#f3ead7]">What stays on the phone</h1>
        <p className="mt-6">Photos and last packets are stored in this browser unless you pay and we add server jobs later. We do not sell lot photos.</p>
        <p className="mt-4">Stripe processes cards. Plotforge does not store full card numbers. Checkout metadata includes the plan you bought.</p>
        <p className="mt-4">Region chips and prompts are sent to the design API so the clerk can name the right counter. Do not put a street address in the prompt if you do not want it in that request log.</p>
        <p className="mt-4">To clear a seat on this device, wipe site data for this domain.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
