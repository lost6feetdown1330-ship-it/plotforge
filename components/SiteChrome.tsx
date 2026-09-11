import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-white/10 bg-[#07080b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[#d4b56a]/40 text-[10px] tracking-[0.2em] text-[#d4b56a]">PF</span>
          <div>
            <p className="font-display text-2xl leading-none">Plotforge Atelier</p>
            <p className="kpi">Oregon design desk</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.18em]">
          <Link href="/how" className="text-white/50 hover:text-[#d4b56a]">How</Link>
          <Link href="/pricing" className="text-[#d4b56a]">Seats</Link>
          {right}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-white/10 px-5 py-10 text-xs text-white/35">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-display text-xl text-[#f3ead7]">Plotforge</p>
          <p className="mt-2 max-w-md">Design packets only. Local licensed shops build. Not stamped plans. Not a contractor bid. Not permission to pour.</p>
        </div>
        <div className="flex flex-wrap gap-4 uppercase tracking-[0.16em]">
          <Link href="/how">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/legal">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/settings/stripe">Stripe</Link>
        </div>
      </div>
    </footer>
  );
}
