import type { Metadata } from "next";
import axios from "axios";
import { API_BASE } from "@/lib/api";

interface MentorLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await axios.get(`${API_BASE}/mentors/${id}`, { timeout: 3500 });
    const mentor = res.data?.mentor;
    if (!mentor) {
      return {
        title: "Mentor Profile | HelpMeMan",
        description: "Connect with verified mentors on HelpMeMan.",
      };
    }

    const name = mentor.user?.name || "Verified Mentor";
    const headline = mentor.headline ? ` — ${mentor.headline}` : "";
    const bio =
      mentor.bio?.slice(0, 160) ||
      `Book a 1-on-1 personalized mentorship session with ${name} on HelpMeMan.`;
    const avatar = mentor.user?.avatar || "/og-image.png";

    return {
      title: `${name}${headline}`,
      description: bio,
      alternates: {
        canonical: `https://helpmeman.com/mentors/${id}`,
      },
      openGraph: {
        title: `${name}${headline} | HelpMeMan`,
        description: bio,
        url: `https://helpmeman.com/mentors/${id}`,
        type: "profile",
        images: [
          {
            url: avatar,
            alt: name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name}${headline} | HelpMeMan`,
        description: bio,
        images: [avatar],
      },
    };
  } catch {
    return {
      title: "Mentor Profile | HelpMeMan",
      description:
        "Connect with verified mentors from Google, Meta, YC, and IIT (AIR 1) on HelpMeMan.",
    };
  }
}

export default async function MentorProfileLayout({
  children,
  params,
}: MentorLayoutProps) {
  const { id } = await params;
  let schemaData: any = null;

  try {
    const res = await axios.get(`${API_BASE}/mentors/${id}`, { timeout: 3500 });
    const mentor = res.data?.mentor;
    if (mentor) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: mentor.user?.name || "Mentor",
        jobTitle: mentor.headline || "Verified Mentor",
        description: mentor.bio || undefined,
        image: mentor.user?.avatar || undefined,
        url: `https://helpmeman.com/mentors/${id}`,
        worksFor: {
          "@type": "Organization",
          name: "HelpMeMan",
          url: "https://helpmeman.com",
        },
        ...(mentor.ratingAvg && Number(mentor.ratingAvg) > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number(mentor.ratingAvg).toFixed(1),
                reviewCount:
                  mentor.reviews?.length && mentor.reviews.length > 0
                    ? mentor.reviews.length
                    : mentor.totalSessions && mentor.totalSessions > 0
                    ? mentor.totalSessions
                    : 1,
                bestRating: "5",
                worstRating: "1",
              },
            }
          : {}),
      };
    }
  } catch {}

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {children}
    </>
  );
}
