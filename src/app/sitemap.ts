import type { MetadataRoute } from "next";
import { LEGAL_DOCS } from "@/lib/legal";

// Puerto de `SeoService::sitemapUrls()` — convención nativa de Next.js
// (reemplaza `www/sitemap.php`).
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.APP_URL ?? "https://www.transferefecty.com";
  const now = new Date();

  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1.0, lastModified: now },
    { url: `${site}/app/login`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${site}/app/register`, changeFrequency: "monthly", priority: 0.9, lastModified: now },
    ...LEGAL_DOCS.map((doc) => ({
      url: `${site}/legal/${doc.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
      lastModified: now,
    })),
  ];
}
