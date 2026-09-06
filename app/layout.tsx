import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Plotforge — photograph a lot, forge designs, plans, and bids",
  description:
    "Capture a yard or empty pad, generate multiple buildable design schemes with trade plans and conceptual bids.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased grain`}>{children}</body>
    </html>
  );
}
