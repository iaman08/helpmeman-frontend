import { Metadata } from "next";
import Link from "next/link";
import axios from "axios";
import { CheckCircle2, MapPin, Calendar, Globe, Mail, Briefcase, GraduationCap, Award, FolderKanban } from "lucide-react";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import { API_BASE } from "@/lib/api";
import { Navbar } from "@/components/Navbar";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Generate Dynamic SEO Metadata on Server
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  try {
    const res = await axios.get(`${API_BASE}/team/${username}`);
    const member = res.data.member;
    if (!member) {
      return {
        title: "Member Not Found | HelpMeMan",
        description: "The requested team member profile does not exist."
      };
    }
    return {
      title: `${member.fullName} — ${member.role} at HelpMeMan`,
      description: member.bio ? member.bio.substring(0, 160) : `Meet ${member.fullName}, a valuable team member of HelpMeMan.`,
      openGraph: {
        title: `${member.fullName} — ${member.role}`,
        description: member.bio ? member.bio.substring(0, 160) : `Meet ${member.fullName} at HelpMeMan.`,
        images: member.imageUrl ? [{ url: member.imageUrl, alt: member.fullName }] : undefined,
        type: "profile",
        username: member.username
      },
      twitter: {
        card: "summary_large_image",
        title: `${member.fullName} — ${member.role}`,
        description: member.bio ? member.bio.substring(0, 160) : `Meet ${member.fullName} at HelpMeMan.`,
        images: member.imageUrl ? [member.imageUrl] : undefined
      }
    };
  } catch {
    return {
      title: "Team Profile | HelpMeMan",
      description: "Discover the amazing minds driving the HelpMeMan platform."
    };
  }
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { username } = await params;
  let member: any = null;

  try {
    const res = await axios.get(`${API_BASE}/team/${username}`);
    member = res.data.member;
  } catch (error) {
    // Member not found or fetch failed
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col bg-bg text-fg">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="font-serif text-3xl font-bold">Profile Not Found</h1>
          <p className="text-sm text-(--muted) mt-2 max-w-sm">
            We couldn't find a team member with the username <code className="bg-(--fg)/5 px-1.5 py-0.5 rounded font-mono">@{username}</code>.
          </p>
          <Link
            href="/team"
            className="mt-6 px-5 py-2 rounded-full bg-(--fg) text-(--bg) text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
          >
            ← Back to Team Directory
          </Link>
        </main>
      </div>
    );
  }

  // Schema.org Person JSON-LD
  const schemaPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": member.fullName,
    "jobTitle": member.role,
    "worksFor": {
      "@type": "Organization",
      "name": "HelpMeMan",
      "url": "https://helpmeman.com"
    },
    "url": `https://helpmeman.com/team/${member.username}`,
    "image": member.imageUrl || undefined,
    "description": member.bio,
    "knowsAbout": member.skills,
    "sameAs": [
      member.linkedin || undefined,
      member.github || undefined,
      member.twitter || undefined,
      member.website || undefined
    ].filter(Boolean)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE": return "bg-emerald-500";
      case "AWAY": return "bg-amber-500";
      case "OFFLINE": return "bg-zinc-400";
      default: return "bg-zinc-400";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <Navbar />

      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }}
      />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[900px] mx-auto px-6 sm:px-10">
          <div className="border border-(--hairline) rounded-3xl overflow-hidden shadow-xl bg-(--fg)/[0.01]">
            {/* Cover image banner */}
            <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-red-500/25 via-indigo-500/25 to-amber-500/25 overflow-hidden">
              {member.coverUrl && (
                <img
                  src={member.coverUrl}
                  alt={`${member.fullName} cover`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Profile Info Header Section */}
            <div className="relative px-6 sm:px-10 flex flex-col sm:flex-row items-end gap-5 -mt-20 sm:-mt-24 pb-6 border-b border-(--hairline)">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl border-4 border-bg overflow-hidden bg-zinc-100 shadow-md shrink-0">
                <img
                  src={member.imageUrl || "/avatar_placeholder.jpg"}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="pb-2 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--fg) flex items-center gap-2">
                    {member.fullName}
                    {member.isVerified && <CheckCircle2 className="w-5 h-5 fill-indigo-500/10 text-indigo-500" />}
                  </h1>
                  <p className="text-sm font-semibold text-(--muted) mt-0.5">
                    {member.role} · <span className="text-amber-500 font-medium">{member.department}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  {member.availableForMentorship && (
                    <Link
                      href="/become-a-mentor"
                      className="px-4 py-2 rounded-full bg-(--fg) text-(--bg) text-xs font-bold hover:opacity-90 transition-opacity no-underline shadow-sm"
                    >
                      Book Session
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Inner Details Container */}
            <div className="px-6 sm:px-10 py-8 space-y-8">
              {/* Profile metadata row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-(--muted) bg-(--fg)/5 p-3 rounded-xl border border-(--hairline)">
                {member.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {member.location}{member.country ? `, ${member.country}` : ""}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long' })}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                  Status: {member.status}
                </span>
              </div>

              {/* Bio & Long Story */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xs uppercase tracking-wider font-bold text-(--muted)">About {member.fullName.split(" ")[0]}</h2>
                  <p className="text-sm sm:text-base leading-relaxed text-(--fg)/80 whitespace-pre-line">{member.bio}</p>
                </div>

                {member.story && (
                  <div className="space-y-2 pt-4">
                    <h2 className="text-xs uppercase tracking-wider font-bold text-(--muted)">My Story</h2>
                    <p className="text-sm sm:text-base leading-relaxed text-(--fg)/80 whitespace-pre-line bg-(--fg)/[0.01] p-5 rounded-xl border border-(--hairline)">
                      {member.story}
                    </p>
                  </div>
                )}
              </div>

              {/* Experience and Education */}
              {(member.experience || member.education) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-(--hairline)">
                  {member.experience && (
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        Experience
                      </h3>
                      <div className="text-sm leading-relaxed text-(--fg)/80 whitespace-pre-line bg-(--fg)/[0.01] p-4 rounded-xl border border-(--hairline)">
                        {member.experience}
                      </div>
                    </div>
                  )}
                  {member.education && (
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        Education
                      </h3>
                      <div className="text-sm leading-relaxed text-(--fg)/80 whitespace-pre-line bg-(--fg)/[0.01] p-4 rounded-xl border border-(--hairline)">
                        {member.education}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Achievements and Projects */}
              {(member.achievements || member.projects) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-(--hairline)">
                  {member.achievements && (
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Achievements
                      </h3>
                      <div className="text-sm leading-relaxed text-(--fg)/80 whitespace-pre-line bg-(--fg)/[0.01] p-4 rounded-xl border border-(--hairline)">
                        {member.achievements}
                      </div>
                    </div>
                  )}
                  {member.projects && (
                    <div className="space-y-2">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) flex items-center gap-1.5">
                        <FolderKanban className="w-4 h-4 text-amber-500" />
                        Projects
                      </h3>
                      <div className="text-sm leading-relaxed text-(--fg)/80 whitespace-pre-line bg-(--fg)/[0.01] p-4 rounded-xl border border-(--hairline)">
                        {member.projects}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Skills, Languages, Interests tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-(--hairline)">
                {member.skills?.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.map((s: string) => (
                        <span key={s} className="text-xs bg-(--fg)/5 text-(--fg)/70 px-2.5 py-1 rounded-full border border-(--hairline)">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {member.languages?.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {member.languages.map((l: string) => (
                        <span key={l} className="text-xs bg-(--fg)/5 text-(--fg)/70 px-2.5 py-1 rounded-full border border-(--hairline)">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {member.interests?.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase tracking-wider font-bold text-(--muted) mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {member.interests.map((i: string) => (
                        <span key={i} className="text-xs bg-(--fg)/5 text-(--fg)/70 px-2.5 py-1 rounded-full border border-(--hairline)">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Footer */}
            <div className="px-6 sm:px-10 py-5 border-t border-(--hairline) bg-(--fg)/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {member.showSocialLinks && (
                  <>
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-(--hairline) text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 transition-colors">
                        <FaLinkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-(--hairline) text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 transition-colors">
                        <FaGithub className="w-4 h-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-(--hairline) text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 transition-colors">
                        <FaTwitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.website && (
                      <a href={member.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-(--hairline) text-(--muted) hover:text-(--fg) hover:bg-(--fg)/5 transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Link
                  href="/team"
                  className="px-4 py-2 rounded-full border border-(--hairline) text-xs font-semibold hover:bg-(--fg)/5 transition-colors no-underline"
                >
                  ← Back to Team
                </Link>
                {member.allowContact && member.email && member.showEmail && (
                  <a
                    href={`mailto:${member.email}`}
                    className="px-4 py-2 rounded-full bg-(--fg) text-(--bg) text-xs font-bold hover:opacity-90 transition-opacity no-underline shadow-sm flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Contact Member
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
