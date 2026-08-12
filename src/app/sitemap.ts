import type { MetadataRoute } from "next";

// Puerto de `SeoService::sitemapUrls()` — convención nativa de Next.js
// (reemplaza `www/sitemap.php`).
export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.APP_URL ?? "https://www.transferefecty.com";

  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1.0, lastModified: new Date() },
    { url: `${site}/app/login`, changeFrequency: "monthly", priority: 0.8, lastModified: new Date() },
    { url: `${site}/app/register`, changeFrequency: "monthly", priority: 0.9, lastModified: new Date() },
  ];
}
