import type { MetadataRoute } from "next";

// Puerto de `www/robots.txt` — convención nativa de Next.js.
export default function robots(): MetadataRoute.Robots {
  const site = process.env.APP_URL ?? "https://www.transferefecty.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/app/login", "/app/register"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/storage/",
          "/app/dashboard",
          "/app/wallets",
          "/app/swap",
          "/app/stake",
          "/app/settings",
          "/app/verification",
          "/app/support",
          "/app/payments",
          "/app/transactions",
        ],
      },
      { userAgent: "GPTBot", disallow: "/" },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
