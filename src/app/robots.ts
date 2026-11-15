import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/safety", "/valentines", "/login", "/signup", "/onboarding"],
        disallow: [
          "/admin",
          "/admin/*",
          "/messages",
          "/messages/*",
          "/matches",
          "/notifications",
          "/settings",
          "/settings/*",
          "/account/*",
        ],
      },
    ],
    sitemap: "https://campuschemistry.in/sitemap.xml",
  };
}
