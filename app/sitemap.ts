import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://plotforge-mu.vercel.app";
  return ["", "/pricing", "/how", "/legal", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
