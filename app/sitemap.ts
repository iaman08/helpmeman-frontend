import type { MetadataRoute } from "next";
import axios from "axios";
import { API_BASE } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://helpmeman.com";
  const now = new Date();

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mentors`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/mentors/discover`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resume-roast`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/competitive-programming`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/typing-test`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/aptitude-test`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/become-a-mentor`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/apply-mentor`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/code-of-conduct`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/mentor-terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/mentor-code-of-conduct`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic mentor profile routes
  let mentorRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await axios.get(`${API_BASE}/mentors?limit=100`, { timeout: 3000 });
    const mentors = res.data?.mentors || [];
    mentorRoutes = mentors
      .filter((m: any) => m && m.id)
      .map((m: any) => ({
        url: `${baseUrl}/mentors/${m.id}`,
        lastModified: m.updatedAt ? new Date(m.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    // Graceful fallback during offline builds
    mentorRoutes = [];
  }

  // Dynamic team profile routes
  let teamRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await axios.get(`${API_BASE}/team`, { timeout: 3000 });
    const members = res.data?.members || [];
    teamRoutes = members
      .filter((mem: any) => mem && mem.username)
      .map((mem: any) => ({
        url: `${baseUrl}/team/${mem.username}`,
        lastModified: mem.updatedAt ? new Date(mem.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }));
  } catch {
    teamRoutes = [];
  }

  return [...staticRoutes, ...mentorRoutes, ...teamRoutes];
}
