/**
 * banner-generator.ts
 *
 * Deterministic banner selection and generation system following the priority:
 * 1. User-uploaded custom banner
 * 2. Organization-specific branded banner
 * 3. Profession-specific generated/predefined banner
 * 4. Professionally designed default gradient
 */

export interface BannerConfig {
  background: string;
  type: 'custom' | 'organization' | 'profession' | 'default';
  label?: string;
  hasPattern?: boolean;
}

// Curated preset banners users can preview or choose
export const PRESET_BANNERS = [
  {
    id: 'software-engineer',
    name: 'Software & Cloud',
    category: 'Engineering',
    background: '/banners/tech-campus.jpg',
    description: 'Modern illuminated tech campus at twilight',
  },
  {
    id: 'iit-bombay',
    name: 'IIT Bombay & Institutes',
    category: 'Academia',
    background: '/banners/iit-bombay.jpg',
    description: 'Iconic lakeside collegiate technology campus',
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi & Research',
    category: 'Academia',
    background: '/banners/iit-delhi.jpg',
    description: 'World-class academic halls at sunset',
  },
  {
    id: 'tech-campus',
    name: 'Silicon Valley Big Tech',
    category: 'Engineering',
    background: '/banners/tech-campus.jpg',
    description: 'Modern glass & steel innovation campus',
  },
  {
    id: 'founder-mentor',
    name: 'Leadership & Founder',
    category: 'Leadership',
    background: 'linear-gradient(135deg, #18181b 0%, #292524 50%, #d97706 100%)',
    description: 'Sophisticated warm amber & neutral charcoal',
  },
  {
    id: 'medical-doctor',
    name: 'Medical & Healthcare',
    category: 'Healthcare',
    background: 'linear-gradient(135deg, #06201b 0%, #064e3b 60%, #059669 100%)',
    description: 'Crisp emerald & botanical dark gradient',
  },
];

// Organization specific banners mapping directly to authentic photography
const ORG_BANNER_MAP: Record<string, { banner: string; orgName: string; orgType: 'university' | 'company' }> = {
  'bombay': { banner: '/banners/iit-bombay.jpg', orgName: 'IIT Bombay', orgType: 'university' },
  'iitb': { banner: '/banners/iit-bombay.jpg', orgName: 'IIT Bombay', orgType: 'university' },
  'delhi': { banner: '/banners/iit-delhi.jpg', orgName: 'IIT Delhi', orgType: 'university' },
  'iitd': { banner: '/banners/iit-delhi.jpg', orgName: 'IIT Delhi', orgType: 'university' },
  'madras': { banner: '/banners/iit-bombay.jpg', orgName: 'IIT Madras', orgType: 'university' },
  'iitm': { banner: '/banners/iit-bombay.jpg', orgName: 'IIT Madras', orgType: 'university' },
  'kanpur': { banner: '/banners/iit-delhi.jpg', orgName: 'IIT Kanpur', orgType: 'university' },
  'iitk': { banner: '/banners/iit-delhi.jpg', orgName: 'IIT Kanpur', orgType: 'university' },
  'kharagpur': { banner: '/banners/iit-bombay.jpg', orgName: 'IIT Kharagpur', orgType: 'university' },
  'roorkee': { banner: '/banners/iit-delhi.jpg', orgName: 'IIT Roorkee', orgType: 'university' },
  'jodhpur': { banner: '/banners/iit-delhi.jpg', orgName: 'IIT Jodhpur', orgType: 'university' },
  'iit': { banner: '/banners/iit-bombay.jpg', orgName: 'IIT', orgType: 'university' },
  'nit': { banner: '/banners/iit-delhi.jpg', orgName: 'NIT', orgType: 'university' },
  'bits': { banner: '/banners/iit-delhi.jpg', orgName: 'BITS Pilani', orgType: 'university' },
  'aiims': { banner: '/banners/iit-delhi.jpg', orgName: 'AIIMS', orgType: 'university' },
  'nlsiu': { banner: '/banners/iit-delhi.jpg', orgName: 'NLSIU', orgType: 'university' },

  // Big Tech & Companies
  'google': { banner: '/banners/tech-campus.jpg', orgName: 'Google', orgType: 'company' },
  'meta': { banner: '/banners/tech-campus.jpg', orgName: 'Meta', orgType: 'company' },
  'amazon': { banner: '/banners/tech-campus.jpg', orgName: 'Amazon', orgType: 'company' },
  'microsoft': { banner: '/banners/tech-campus.jpg', orgName: 'Microsoft', orgType: 'company' },
  'apple': { banner: '/banners/tech-campus.jpg', orgName: 'Apple', orgType: 'company' },
  'netflix': { banner: '/banners/tech-campus.jpg', orgName: 'Netflix', orgType: 'company' },
  'uber': { banner: '/banners/tech-campus.jpg', orgName: 'Uber', orgType: 'company' },
  'spotify': { banner: '/banners/tech-campus.jpg', orgName: 'Spotify', orgType: 'company' },
  'adobe': { banner: '/banners/tech-campus.jpg', orgName: 'Adobe', orgType: 'company' },
  'airbnb': { banner: '/banners/tech-campus.jpg', orgName: 'Airbnb', orgType: 'company' },
  'figma': { banner: '/banners/tech-campus.jpg', orgName: 'Figma', orgType: 'company' },
  'slack': { banner: '/banners/tech-campus.jpg', orgName: 'Slack', orgType: 'company' },
  'goldman': { banner: '/banners/tech-campus.jpg', orgName: 'Goldman Sachs', orgType: 'company' },
  'mckinsey': { banner: '/banners/tech-campus.jpg', orgName: 'McKinsey', orgType: 'company' },
};

export interface BannerConfig {
  background: string;
  type: 'custom' | 'organization' | 'profession' | 'default';
  label?: string;
  isImage?: boolean;
  orgName?: string;
  orgType?: 'university' | 'company';
}

/**
 * Determine the exact banner style for a user or mentor
 * PRIORITY:
 * 1. User-uploaded custom banner
 * 2. Organization / Institute banner (Auto-set by default!)
 * 3. Profession / default
 */
export function getProfileBanner(params: {
  customBannerUrl?: string | null;
  bannerPosition?: string | null;
  headline?: string | null;
  currentRole?: string | null;
  company?: string | null;
  university?: string | null;
  institutionType?: string | null;
  institutionName?: string | null;
  skills?: string[];
}): BannerConfig {
  // 1. User-uploaded custom banner
  if (params.customBannerUrl && params.customBannerUrl.trim()) {
    return {
      background: params.customBannerUrl.trim(),
      type: 'custom',
      isImage: true,
    };
  }

  // 2. Organization-specific banner (Company or Institute) - AUTO SET BY DEFAULT!
  const rawOrgSources = [
    params.company,
    params.university,
    params.institutionName,
  ].filter(Boolean) as string[];

  // Filter out 'independent' and clean 'currently at'
  const orgSources = rawOrgSources
    .map(raw => raw.replace(/^(currently\s+at|studying\s+at|working\s+at|student\s+at)\s+/i, '').trim())
    .filter(org => org && org.toLowerCase() !== 'independent');

  for (const cleanOrg of orgSources) {
    const lowerOrg = cleanOrg.toLowerCase();
    if (!lowerOrg) continue;

    // Check specific known organizations
    for (const [key, mapping] of Object.entries(ORG_BANNER_MAP)) {
      if (lowerOrg.includes(key)) {
        return {
          background: mapping.banner,
          type: 'organization',
          isImage: true,
          label: mapping.orgName,
          orgName: cleanOrg,
          orgType: mapping.orgType,
        };
      }
    }

    // Generic university/college check
    const isAcademic =
      params.institutionType === 'COLLEGE' ||
      lowerOrg.includes('iit') ||
      lowerOrg.includes('nit') ||
      lowerOrg.includes('bits') ||
      lowerOrg.includes('university') ||
      lowerOrg.includes('college') ||
      lowerOrg.includes('institute') ||
      lowerOrg.includes('aiims') ||
      lowerOrg.includes('iim');

    if (isAcademic) {
      return {
        background: '/banners/default-university.jpg',
        type: 'organization',
        isImage: true,
        label: cleanOrg,
        orgName: cleanOrg,
        orgType: 'university',
      };
    }

    // Generic company check
    return {
      background: '/banners/default-company.jpg',
      type: 'organization',
      isImage: true,
      label: cleanOrg,
      orgName: cleanOrg,
      orgType: 'company',
    };
  }

  // 3. Profession-specific generated or predefined banner fallback
  const professionText = [
    params.headline,
    params.currentRole,
    ...(params.skills || []),
  ].filter(Boolean).join(' ').toLowerCase();

  if (
    professionText.includes('ai') ||
    professionText.includes('machine learning') ||
    professionText.includes('software') ||
    professionText.includes('developer') ||
    professionText.includes('engineer') ||
    professionText.includes('tech')
  ) {
    return {
      background: '/banners/tech-campus.jpg',
      type: 'profession',
      isImage: true,
      label: 'Technology & Engineering',
    };
  }

  if (
    professionText.includes('student') ||
    professionText.includes('college') ||
    professionText.includes('jee') ||
    professionText.includes('research')
  ) {
    return {
      background: '/banners/default-university.jpg',
      type: 'profession',
      isImage: true,
      label: 'Academic Campus',
    };
  }

  // 4. Default refined banner
  return {
    background: '/banners/default-company.jpg',
    type: 'default',
    isImage: true,
  };
}

export function getComputedBanner(params: {
  bannerImageUrl?: string | null;
  bannerPosition?: string | null;
  profession?: string | null;
  company?: string | null;
  university?: string | null;
}): {
  isImage: boolean;
  bannerImageUrl?: string | null;
  bannerPosition: string;
  gradientClass: string;
  backgroundStyle: string;
} {
  const result = getProfileBanner({
    customBannerUrl: params.bannerImageUrl,
    bannerPosition: params.bannerPosition,
    headline: params.profession,
    currentRole: params.profession,
    company: params.company,
    university: params.university,
  });

  const isImage = result.isImage ?? (result.type === 'custom' || result.background.startsWith('/'));
  return {
    isImage,
    bannerImageUrl: isImage ? result.background : null,
    bannerPosition: params.bannerPosition || '50% 50%',
    gradientClass: 'from-zinc-900 to-zinc-950',
    backgroundStyle: isImage ? `url(${result.background}) center/cover no-repeat` : result.background,
  };
}
