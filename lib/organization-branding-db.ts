/**
 * organization-branding-db.ts
 *
 * Centralized, reliable database of verified organizations, their official logos,
 * and bespoke brand banners. Automatically resolves any company or university
 * string to its authentic brand identity.
 */

export interface OrganizationEntry {
  id: string;
  name: string;
  shortName: string;
  type: "UNIVERSITY" | "COMPANY";
  logoUrl: string;
  bannerBg: string;
  bannerAccent?: string;
  subtext?: string;
  aliases: string[];
}

export const ORGANIZATION_DATABASE: OrganizationEntry[] = [
  // ─── Premier Universities & Institutes ───
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    shortName: "IIT Bombay",
    type: "UNIVERSITY",
    logoUrl: "/logos/iit-bombay.svg",
    bannerBg: "linear-gradient(135deg, #051329 0%, #0d2248 50%, #15336c 100%)",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY BOMBAY",
    aliases: ["iit bombay", "iitb", "bombay", "iit-bombay"],
  },
  {
    id: "iit-delhi",
    name: "Indian Institute of Technology Delhi",
    shortName: "IIT Delhi",
    type: "UNIVERSITY",
    logoUrl: "/logos/iit-delhi.svg",
    bannerBg: "linear-gradient(135deg, #08182b 0%, #112845 50%, #1c3d69 100%)",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY DELHI",
    aliases: ["iit delhi", "iitd", "delhi", "iit-delhi"],
  },
  {
    id: "iit-madras",
    name: "Indian Institute of Technology Madras",
    shortName: "IIT Madras",
    type: "UNIVERSITY",
    logoUrl: "/logos/iit-madras.svg",
    bannerBg: "linear-gradient(135deg, #06182c 0%, #0f2746 50%, #183c6b 100%)",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY MADRAS",
    aliases: ["iit madras", "iitm", "madras", "iit-madras", "chennai"],
  },
  {
    id: "dtu",
    name: "Delhi Technological University",
    shortName: "DTU",
    type: "UNIVERSITY",
    logoUrl: "/logos/dtu.png",
    bannerBg: "linear-gradient(135deg, #2e0912 0%, #4a101f 50%, #69172c 100%)",
    subtext: "DELHI TECHNOLOGICAL UNIVERSITY · FORMERLY DCE",
    aliases: ["delhi technological university", "dtu", "dce", "delhi technological"],
  },
  {
    id: "bits-pilani",
    name: "Birla Institute of Technology and Science, Pilani",
    shortName: "BITS Pilani",
    type: "UNIVERSITY",
    logoUrl: "/logos/bits-pilani.svg",
    bannerBg: "linear-gradient(135deg, #0e1c2e 0%, #182c46 50%, #234066 100%)",
    subtext: "BITS PILANI",
    aliases: ["bits pilani", "bits", "pilani", "bits-pilani"],
  },
  {
    id: "aiims-delhi",
    name: "All India Institute of Medical Sciences",
    shortName: "AIIMS Delhi",
    type: "UNIVERSITY",
    logoUrl: "/aiimsdelhi.png",
    bannerBg: "linear-gradient(135deg, #05211b 0%, #0c3d32 50%, #155c4c 100%)",
    subtext: "ALL INDIA INSTITUTE OF MEDICAL SCIENCES",
    aliases: ["aiims", "aiims delhi", "medical"],
  },
  {
    id: "nlsiu",
    name: "National Law School of India University",
    shortName: "NLSIU Bengaluru",
    type: "UNIVERSITY",
    logoUrl: "/nlsiu.png",
    bannerBg: "linear-gradient(135deg, #200c2e 0%, #35164c 50%, #502173 100%)",
    subtext: "NATIONAL LAW SCHOOL OF INDIA UNIVERSITY",
    aliases: ["nlsiu", "nls", "national law school"],
  },

  // ─── Top Tech & Enterprise Giants ───
  {
    id: "google",
    name: "Google",
    shortName: "Google",
    type: "COMPANY",
    logoUrl: "/logos/google.svg",
    bannerBg: "linear-gradient(135deg, #18191c 0%, #1f2025 100%)",
    subtext: "GOOGLE",
    aliases: ["google", "alphabet", "google cloud", "deepmind"],
  },
  {
    id: "meta",
    name: "Meta",
    shortName: "Meta",
    type: "COMPANY",
    logoUrl: "/logos/meta.svg",
    bannerBg: "linear-gradient(135deg, #081224 0%, #0d1e38 100%)",
    subtext: "META",
    aliases: ["meta", "facebook", "instagram", "whatsapp"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    shortName: "Microsoft",
    type: "COMPANY",
    logoUrl: "/logos/microsoft.svg",
    bannerBg: "linear-gradient(135deg, #131722 0%, #1c2233 100%)",
    subtext: "MICROSOFT",
    aliases: ["microsoft", "azure", "windows"],
  },
  {
    id: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    type: "COMPANY",
    logoUrl: "/logos/amazon.svg",
    bannerBg: "linear-gradient(135deg, #10151f 0%, #17202d 100%)",
    subtext: "AMAZON",
    aliases: ["amazon", "aws"],
  },
  {
    id: "apple",
    name: "Apple",
    shortName: "Apple",
    type: "COMPANY",
    logoUrl: "/logos/apple.svg",
    bannerBg: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
    subtext: "APPLE",
    aliases: ["apple"],
  },
  {
    id: "netflix",
    name: "Netflix",
    shortName: "Netflix",
    type: "COMPANY",
    logoUrl: "/logos/netflix.svg",
    bannerBg: "linear-gradient(135deg, #0d0d0e 0%, #1a1114 100%)",
    subtext: "NETFLIX",
    aliases: ["netflix"],
  },
  {
    id: "uber",
    name: "Uber",
    shortName: "Uber",
    type: "COMPANY",
    logoUrl: "/logos/uber.svg",
    bannerBg: "linear-gradient(135deg, #0a0a0c 0%, #16171a 100%)",
    subtext: "UBER",
    aliases: ["uber"],
  },
  {
    id: "spotify",
    name: "Spotify",
    shortName: "Spotify",
    type: "COMPANY",
    logoUrl: "/logos/spotify.svg",
    bannerBg: "linear-gradient(135deg, #0c120f 0%, #11241a 100%)",
    subtext: "SPOTIFY",
    aliases: ["spotify"],
  },
  {
    id: "adobe",
    name: "Adobe",
    shortName: "Adobe",
    type: "COMPANY",
    logoUrl: "/logos/adobe.svg",
    bannerBg: "linear-gradient(135deg, #180d10 0%, #291217 100%)",
    subtext: "ADOBE",
    aliases: ["adobe"],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    shortName: "Airbnb",
    type: "COMPANY",
    logoUrl: "/logos/airbnb.svg",
    bannerBg: "linear-gradient(135deg, #190f12 0%, #2b151b 100%)",
    subtext: "AIRBNB",
    aliases: ["airbnb"],
  },
  {
    id: "figma",
    name: "Figma",
    shortName: "Figma",
    type: "COMPANY",
    logoUrl: "/logos/figma.svg",
    bannerBg: "linear-gradient(135deg, #13141a 0%, #1d1f2b 100%)",
    subtext: "FIGMA",
    aliases: ["figma"],
  },
  {
    id: "slack",
    name: "Slack",
    shortName: "Slack",
    type: "COMPANY",
    logoUrl: "/logos/slack.svg",
    bannerBg: "linear-gradient(135deg, #13181f 0%, #1b2430 100%)",
    subtext: "SLACK",
    aliases: ["slack"],
  },
];

/**
 * Automatically resolve any organization string to its verified branding entry
 */
export function resolveOrganizationBranding(
  rawInput?: string | null,
  typeHint?: string | null
): OrganizationEntry | null {
  if (!rawInput) return null;

  // Clean "Currently at", "Working at", "Studying at"
  const clean = rawInput
    .replace(/^(currently\s+at|studying\s+at|working\s+at|student\s+at)\s+/i, "")
    .trim();

  if (!clean || clean.toLowerCase() === "independent") return null;
  const lower = clean.toLowerCase();

  // 1. Direct match on database
  for (const entry of ORGANIZATION_DATABASE) {
    if (entry.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))) {
      return entry;
    }
  }

  // 2. Generic academic fallback
  const isAcademic =
    typeHint === "COLLEGE" ||
    lower.includes("iit") ||
    lower.includes("nit") ||
    lower.includes("university") ||
    lower.includes("college") ||
    lower.includes("institute") ||
    lower.includes("academy") ||
    lower.includes("school");

  if (isAcademic) {
    return {
      id: `custom-${lower.replace(/[^a-z0-9]/g, "-")}`,
      name: clean,
      shortName: clean,
      type: "UNIVERSITY",
      logoUrl: "",
      bannerBg: "linear-gradient(135deg, #091728 0%, #132742 50%, #1f395e 100%)",
      subtext: clean.toUpperCase(),
      aliases: [lower],
    };
  }

  // 3. Generic company fallback
  return {
    id: `custom-${lower.replace(/[^a-z0-9]/g, "-")}`,
    name: clean,
    shortName: clean,
    type: "COMPANY",
    logoUrl: "",
    bannerBg: "linear-gradient(135deg, #11151e 0%, #1a202d 50%, #242c3d 100%)",
    subtext: clean.toUpperCase(),
    aliases: [lower],
  };
}
