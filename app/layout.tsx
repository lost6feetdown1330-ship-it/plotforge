import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://plotforge-mu.vercel.app"),
  title: {
    default: "Plotforge Atelier — snap any space",
    template: "%s · Plotforge",
  },
  description:
    "Photograph a yard, room, roof, or building. Get three schemes, per-trade digital blueprints, and a Southern Oregon permit clerk map. Local shops build.",
  openGraph: {
    title: "Plotforge Atelier",
    description: "Snap any space. Design inside, outside, or both. $9 packets. Local subcontract.",
    url: "https://plotforge-mu.vercel.app",
    siteName: "Plotforge",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
