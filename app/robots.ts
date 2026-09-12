import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://helpmeman.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/mentors",
          "/mentors/*",
          "/services",
          "/become-a-mentor",
          "/apply-mentor",
          "/resume-roast",
          "/competitive-programming",
          "/typing-test",
          "/aptitude-test",
          "/team",
          "/team/*",
          "/help",
          "/terms",
          "/privacy",
          "/refund-policy",
          "/code-of-conduct",
          "/mentor-terms",
          "/mentor-code-of-conduct",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/superadmin",
          "/superadmin/*",
          "/dashboard",
          "/dashboard/*",
          "/mentor",
          "/mentor/*",
          "/api/*",
          "/onboarding",
          "/onboarding/*",
          "/reset-password",
          "/verify-email",
          "/forgot-password",
          "/_next/*",
          "/private/*",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/og-image.png", "/logo.png", "/logo.svg", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.svg"],
        disallow: ["/admin/*", "/superadmin/*", "/dashboard/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
