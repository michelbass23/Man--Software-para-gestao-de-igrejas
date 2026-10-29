import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://manasistemas.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/", "/setup", "/assinatura", "/checkin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
