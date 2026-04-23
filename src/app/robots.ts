import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://usefulkit.io/sitemap.xml",
    host: "https://usefulkit.io",
  };
}
