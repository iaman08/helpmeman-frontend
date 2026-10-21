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
    id: "iit-roorkee",
    name: "Indian Institute of Technology Roorkee",
    shortName: "IIT Roorkee",
    type: "UNIVERSITY",
    logoUrl: "",
    bannerBg: "#121316",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY ROORKEE",
    aliases: ["iit roorkee", "iitr", "roorkee", "iit-roorkee"],
  },
  {
    id: "iit-bombay",
    name: "Indian Institute of Technology Bombay",
    shortName: "IIT Bombay",
    type: "UNIVERSITY",
    logoUrl: "/logos/iit-bombay.svg",
    bannerBg: "#121316",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY BOMBAY",
    aliases: ["iit bombay", "iitb", "bombay", "iit-bombay"],
  },
  {
    id: "iit-delhi",
    name: "Indian Institute of Technology Delhi",
    shortName: "IIT Delhi",
    type: "UNIVERSITY",
    logoUrl: "/logos/iit-delhi.svg",
    bannerBg: "#121316",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY DELHI",
    aliases: ["iit delhi", "iitd", "delhi", "iit-delhi"],
  },
  {
    id: "iit-madras",
    name: "Indian Institute of Technology Madras",
    shortName: "IIT Madras",
    type: "UNIVERSITY",
    logoUrl: "/logos/iit-madras.svg",
    bannerBg: "#121316",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY MADRAS",
    aliases: ["iit madras", "iitm", "madras", "iit-madras", "chennai"],
  },
  {
    id: "iit-kharagpur",
    name: "Indian Institute of Technology Kharagpur",
    shortName: "IIT Kharagpur",
    type: "UNIVERSITY",
    logoUrl: "",
    bannerBg: "#121316",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY KHARAGPUR",
    aliases: ["iit kharagpur", "iit kgp", "kharagpur", "iit-kharagpur"],
  },
  {
    id: "iit-kanpur",
    name: "Indian Institute of Technology Kanpur",
    shortName: "IIT Kanpur",
    type: "UNIVERSITY",
    logoUrl: "",
    bannerBg: "#121316",
    subtext: "INDIAN INSTITUTE OF TECHNOLOGY KANPUR",
    aliases: ["iit kanpur", "iitk", "kanpur", "iit-kanpur"],
  },
  {
    id: "dtu",
    name: "Delhi Technological University",
    shortName: "DTU",
    type: "UNIVERSITY",
    logoUrl: "/logos/dtu.png",
    bannerBg: "#161214",
    subtext: "DELHI TECHNOLOGICAL UNIVERSITY · FORMERLY DCE",
    aliases: ["delhi technological university", "dtu", "dce", "delhi technological"],
  },
  {
    id: "bits-pilani",
    name: "Birla Institute of Technology and Science, Pilani",
    shortName: "BITS Pilani",
    type: "UNIVERSITY",
    logoUrl: "/logos/bits-pilani.svg",
    bannerBg: "#121316",
    subtext: "BITS PILANI",
    aliases: ["bits pilani", "bits", "pilani", "bits-pilani"],
  },
  {
    id: "aiims-delhi",
    name: "All India Institute of Medical Sciences",
    shortName: "AIIMS Delhi",
    type: "UNIVERSITY",
    logoUrl: "/aiimsdelhi.png",
    bannerBg: "#101614",
    subtext: "ALL INDIA INSTITUTE OF MEDICAL SCIENCES",
    aliases: ["aiims", "aiims delhi", "medical"],
  },
  {
    id: "nlsiu",
    name: "National Law School of India University",
    shortName: "NLSIU Bengaluru",
    type: "UNIVERSITY",
    logoUrl: "/nlsiu.png",
    bannerBg: "#151119",
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
    bannerBg: "#131417",
    subtext: "GOOGLE",
    aliases: ["google", "alphabet", "google cloud", "deepmind"],
  },
  {
    id: "meta",
    name: "Meta",
    shortName: "Meta",
    type: "COMPANY",
    logoUrl: "/logos/meta.svg",
    bannerBg: "#121316",
    subtext: "META",
    aliases: ["meta", "facebook", "instagram", "whatsapp"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    shortName: "Microsoft",
    type: "COMPANY",
    logoUrl: "/logos/microsoft.svg",
    bannerBg: "#131417",
    subtext: "MICROSOFT",
    aliases: ["microsoft", "azure", "windows"],
  },
  {
    id: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    type: "COMPANY",
    logoUrl: "/logos/amazon.svg",
    bannerBg: "#141518",
    subtext: "AMAZON",
    aliases: ["amazon", "aws"],
  },
  {
    id: "apple",
    name: "Apple",
    shortName: "Apple",
    type: "COMPANY",
    logoUrl: "/logos/apple.svg",
    bannerBg: "#0f1012",
    subtext: "APPLE",
    aliases: ["apple"],
  },
  {
    id: "netflix",
    name: "Netflix",
    shortName: "Netflix",
    type: "COMPANY",
    logoUrl: "/logos/netflix.svg",
    bannerBg: "#141112",
    subtext: "NETFLIX",
    aliases: ["netflix"],
  },
  {
    id: "uber",
    name: "Uber",
    shortName: "Uber",
    type: "COMPANY",
    logoUrl: "/logos/uber.svg",
    bannerBg: "#0f1012",
    subtext: "UBER",
    aliases: ["uber"],
  },
  {
    id: "spotify",
    name: "Spotify",
    shortName: "Spotify",
    type: "COMPANY",
    logoUrl: "/logos/spotify.svg",
    bannerBg: "#101412",
    subtext: "SPOTIFY",
    aliases: ["spotify"],
  },
  {
    id: "adobe",
    name: "Adobe",
    shortName: "Adobe",
    type: "COMPANY",
    logoUrl: "/logos/adobe.svg",
    bannerBg: "#151112",
    subtext: "ADOBE",
    aliases: ["adobe"],
  },
  {
    id: "airbnb",
    name: "Airbnb",
    shortName: "Airbnb",
    type: "COMPANY",
    logoUrl: "/logos/airbnb.svg",
    bannerBg: "#151112",
    subtext: "AIRBNB",
    aliases: ["airbnb"],
  },
  {
    id: "figma",
    name: "Figma",
    shortName: "Figma",
    type: "COMPANY",
    logoUrl: "/logos/figma.svg",
    bannerBg: "#131417",
    subtext: "FIGMA",
    aliases: ["figma"],
  },
  {
    id: "slack",
    name: "Slack",
    shortName: "Slack",
    type: "COMPANY",
    logoUrl: "/logos/slack.svg",
    bannerBg: "#131417",
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
      bannerBg: "#121316",
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
    bannerBg: "#121316",
    subtext: clean.toUpperCase(),
    aliases: [lower],
  };
}
