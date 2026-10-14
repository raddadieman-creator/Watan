import type { MetadataRoute } from "next";
import { regions } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = ["", "/regions", "/heritage", "/numbers", "/sources", "/about"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" as const })),
    ...regions.map((r) => ({ url: `${base}/regions/${r.id}`, changeFrequency: "monthly" as const })),
  ];
}
