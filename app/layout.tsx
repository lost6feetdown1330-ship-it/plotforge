import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Plotforge — snap any space, design it, bid it legally",
  description:
    "Snap any yard, room, or pad. Generate designs, per-trade plans, license lists, permits, and a legal-ready Oregon bid packet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased grain`}>{children}</body>
    </html>
  );
}
