"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Globe,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Briefcase,
  Users,
  MessageCircle,
  Bell,
  Search as SearchIcon,
  Settings,
  ChevronRight,
  LayoutDashboard,
  CheckCircle2,
  GraduationCap,
  FolderKanban,
  ExternalLink,
  Map,
  Compass,
  ArrowUp,
  Inbox,
} from "lucide-react";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { SidebarShell } from "@/components/SidebarShell";
import { useUnreadChatCount } from "@/lib/hooks";

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Design",
  "AI",
  "Backend",
  "Frontend",
  "Mobile",
  "Marketing",
  "Community",
  "Support",
  "Research",
  "Operations",
  "Finance",
  "Legal",
  "HR",
  "Other"
];

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Custom Counter Component for Statistics
function Counter({ value, duration = 1.5 }: { value: string; duration?: number }) {
  const numberPart = parseInt(value);
  const suffix = value.replace(String(numberPart), "");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isNaN(numberPart)) return;
    let start = 0;
    const end = numberPart;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);

    const timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [numberPart, duration]);

  return (
    <span>
      {isNaN(numberPart) ? value : count}
      {suffix}
    </span>
  );
}

export default function TeamPage() {
  const { user, logout, isMentor, isAdmin } = useAuth();
  const { data: unreadData } = useUnreadChatCount();
  const unreadChatCount = unreadData?.unreadCount ?? 0;

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [filterType, setFilterType] = useState<"all" | "founders" | "leadership" | "contributors">("all");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Simulated State for "Notify Me" in career empty state
  const [isNotified, setIsNotified] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [showNotificationInput, setShowNotificationInput] = useState(false);

  const { data, error, isLoading } = useSWR("/team?active=all", fetcher);
  const members = useMemo(() => data?.members ?? [], [data]);

  const filteredMembers = useMemo(() => {
    return members.filter((m: any) => {
      if (!m.isActive && !isAdmin) return false;
      if (selectedDept !== "All" && m.department !== selectedDept) return false;

      if (filterType === "founders" && !m.isFounder) return false;
      if (filterType === "leadership" && !m.isLeadership) return false;
      if (filterType === "contributors" && (m.isFounder || m.isLeadership)) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = m.fullName.toLowerCase().includes(query);
        const matchesRole = m.role.toLowerCase().includes(query);
        const matchesLocation = m.location?.toLowerCase().includes(query);
        const matchesSkills = m.skills.some((s: string) => s.toLowerCase().includes(query));
        return matchesName || matchesRole || matchesLocation || matchesSkills;
      }

      return true;
    });
  }, [members, selectedDept, filterType, search, isAdmin]);

  // Statistics
  const stats = [
    { label: "Team Members", value: "25+" },
    { label: "Countries Represented", value: "10+" },
    { label: "Mentees Guided", value: "500+" },
    { label: "Satisfaction Rate", value: "99%" },
    { label: "Completed Projects", value: "50+" },
  ];

  // Core Values
  const values = [
    { name: "Radical Transparency", desc: "We document openly and build in public, maintaining default-open communications." },
    { name: "Continuous Learning", desc: "We value intellectual curiosity and hold structural mentorship as a core service." },
    { name: "Empathy & Kindness", desc: "We approach peers and users with deep curiosity and genuine interest in their path." },
    { name: "Technical Excellence", desc: "We focus on clean, high-performance implementations and refuse simple shortcuts." },
    { name: "Community Alignment", desc: "Every product feature we deploy maps directly to real peer helper needs." },
    { name: "Velocity & Focus", desc: "We iterate quickly, value crisp execution, and prioritize absolute simplicity." },
  ];

  // Timeline
  const milestones = [
    { year: "2024", title: "Foundation", desc: "Established with the mission to build the world's most trusted, instant help exchange." },
    { year: "Late 2024", title: "Alpha Deployment", desc: "Rolled out initial real-time socket chat, connecting our first cohort of mentors." },
    { year: "2025", title: "Scale to 1K Bookings", desc: "Expanded subject fields and deployed AI copilot pipelines to guide users." },
    { year: "2026", title: "Direct Integrations", desc: "Released direct Firebase notification triggers and AWS-S3 document verification." },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE": return "bg-emerald-500";
      case "AWAY": return "bg-amber-500";
      default: return "bg-zinc-400";
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationEmail.trim()) {
      setIsNotified(true);
      setTimeout(() => {
        setIsNotified(false);
        setNotificationEmail("");
        setShowNotificationInput(false);
      }, 4000);
    }
  };

  const publicContent = (
    <div className="w-full text-zinc-900 bg-[#FAFAFB]">

      {/* ─── Hero / Header Section ─── */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-28 pb-12 flex flex-col items-start select-none">
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          Team
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mt-4 leading-none font-display">
          Meet the Brains
        </h1>

        <p className="mt-4 text-sm sm:text-base text-zinc-500 max-w-2xl leading-relaxed">
          Meet the talented individuals who drive our company's success with their dedication, expertise, and passion for innovation.
        </p>
      </section>

      {/* ─── Directory Controls Segment ─── */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-10 pb-8 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, role, skill, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-800 outline-none focus:border-zinc-400 transition-colors font-medium shadow-sm"
            />
          </div>

          <div className="flex p-0.5 rounded-xl bg-zinc-100 border border-zinc-200 self-start shadow-sm shrink-0">
            {(["all", "founders", "leadership", "contributors"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${filterType === type ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {(search || selectedDept !== "All" || filterType !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedDept("All");
                setFilterType("all");
              }}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-500 text-xs font-bold hover:bg-zinc-50 hover:border-zinc-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar scroll-smooth">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shadow-sm ${selectedDept === dept
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Grid Listing (Redesigned Team Cards) ─── */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-[2rem] bg-zinc-100 animate-pulse border border-zinc-200" />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          // Professional Empty State for Directory Filters
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center bg-white shadow-sm max-w-xl mx-auto my-10 px-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800">No matching team members</h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed">
              We couldn't find anyone matching your current filters or search keywords. Try adjusting your query or resetting filters to browse our full roster.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedDept("All");
                setFilterType("all");
              }}
              className="mt-5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Browse All Members
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMembers.map((m: any) => (
              <motion.div
                key={m.id}
                layout
                onClick={() => setSelectedMember(m)}
                className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-100 border border-zinc-200/40 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-zinc-350 transition-all duration-300 flex flex-col"
              >
                {/* Full-card image backsheet */}
                <img
                  src={m.imageUrl || "/avatar_placeholder.jpg"}
                  alt={m.fullName}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                />

                {/* Pulsing Status Dot */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm select-none">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor(m.status)}`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${getStatusColor(m.status)}`} />
                  </span>
                  {m.status}
                </div>

                {/* Floating white capsule box at the bottom */}
                <div className="absolute left-4 right-4 bottom-4 bg-white rounded-2xl p-4 shadow-lg border border-zinc-100 flex items-center justify-between transition-transform duration-300 group-hover:scale-[0.99]">
                  <div className="truncate pr-2 select-none">
                    <h3 className="font-bold text-zinc-900 text-sm sm:text-base truncate flex items-center gap-1.5">
                      {m.fullName}
                      {m.isFounder && (
                        <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide border border-indigo-100">
                          Founder
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500 font-semibold truncate mt-0.5">{m.role}</p>
                  </div>

                  {/* LinkedIn Icon Badge */}
                  {m.linkedin && m.showSocialLinks && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} // Stop modal popup
                      className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 shrink-0 transition-all active:scale-95"
                      title="LinkedIn Profile"
                    >
                      <FaLinkedin className="w-4 h-4 fill-zinc-800" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Team Statistics ─── */}
      <section className="border-t border-b border-zinc-200 py-16 px-6 sm:px-10 bg-white select-none">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-8 md:gap-8 text-center md:divide-x md:divide-zinc-200">
            {stats.map((stat, i) => (
              <div key={i} className={`flex flex-col items-center justify-center px-4 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
                  <Counter value={stat.value} />
                </span>
                <span className="mt-2 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Company Values ─── */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-10 py-20 border-b border-zinc-200 select-none">
        <div className="text-left mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Values</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 font-display text-zinc-900">Our Operating Code</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          {values.map((v, i) => (
            <div key={i} className="border-r border-b border-zinc-200 p-8 hover:bg-zinc-50 transition-colors">
              <span className="text-xs font-mono font-bold text-amber-500">0{i + 1}.</span>
              <h3 className="font-bold text-base mt-2 text-zinc-900">{v.name}</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Journey Timeline ─── */}
      <section className="max-w-[1200px] mx-auto px-6 sm:px-10 py-20 border-b border-zinc-200 select-none">
        <div className="text-left mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Timeline</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 font-display text-zinc-900">How we got here</h2>
        </div>

        <div className="relative max-w-[700px] mx-auto border-l border-zinc-200 pl-8 space-y-12">
          {milestones.map((m, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[38px] top-1.5 w-3.5 h-3.5 rounded-full border border-amber-500 bg-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              </span>
              <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">{m.year}</div>
              <h3 className="font-bold text-base text-zinc-900 mt-0.5">{m.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Professional Careers Empty State ─── */}
      <section id="careers" className="max-w-[1200px] mx-auto px-6 sm:px-10 py-20 scroll-mt-12">
        <div className="text-left mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Careers</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 font-display text-zinc-900">Open Opportunities</h2>
        </div>

        {/* Professional Empty State Box */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 shadow-sm text-center max-w-[850px] mx-auto relative overflow-hidden">
          {/* Accent border strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900" />

          <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-500 mx-auto mb-4">
            <Inbox className="w-5 h-5 text-zinc-400" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 font-display">No Open Positions</h3>
          <p className="mt-3 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            We're not hiring at the moment, but we're always looking for exceptional people. Check back soon for future opportunities or subscribe to get notified.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            {!showNotificationInput ? (
              <div className="flex flex-wrap justify-center gap-3 w-full">
                <button
                  onClick={() => setShowNotificationInput(true)}
                  className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-transform active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  Notify Me
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("careers");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    // Scroll to top of directory
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-5 py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Back to Team
                </button>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-sm w-full mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  disabled={isNotified}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 bg-white"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isNotified}
                    className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isNotified ? "Subscribed!" : "Subscribe"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotificationInput(false)}
                    className="px-3 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 font-semibold text-xs rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isNotified && (
              <p className="text-[11px] text-emerald-600 font-bold mt-2 animate-pulse">
                ✓ Perfect! We will notify you at {notificationEmail} as soon as we open positions.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <>
      {user ? (
        <SidebarShell
          navItems={[
            { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
            { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
            { href: "/dashboard/chat", label: "Chat", icon: MessageCircle, badge: unreadChatCount },
            { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
            {
              onClick: () => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("open-ai"));
                }
              },
              label: "Ruth",
              icon: Sparkles,
            },
            { href: "/mentors", label: "Browse Mentors", icon: SearchIcon },
            { href: "/team", label: "Our Team", icon: Users },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
          ]}
          rootPath={isMentor ? "/mentor" : "/dashboard"}
          brandLabel={isMentor ? "Mentor Panel" : "Dashboard"}
          userName={user.name}
          userEmail={user.email}
          userAvatar={user.avatar}
          onLogout={async () => {
            await logout();
            window.location.href = "/";
          }}
        >
          <div className="pt-6 pb-12">{publicContent}</div>
        </SidebarShell>
      ) : (
        <div className="min-h-screen flex flex-col bg-[#FAFAFB]">
          <Navbar />
          <main className="flex-grow pt-2">{publicContent}</main>
        </div>
      )}

      {/* ─── Premium Redesigned Profile Modal ─── */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[4px] transition-all"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="relative w-full max-w-[650px] max-h-[85vh] bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 text-zinc-800"
            >
              {/* Cover Banner (Clean Light Grid style) */}
              <div className="relative h-28 w-full bg-[linear-gradient(to_right,var(--hairline)_1px,transparent_1px),linear-gradient(to_bottom,var(--hairline)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] bg-zinc-50/50 border-b border-zinc-150 shrink-0 select-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 text-zinc-400 hover:text-zinc-800 hover:bg-white border border-zinc-200/60 shadow-sm cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Header Box (Profile Image, Title and Verified details) */}
              <div className="px-6 sm:px-8 shrink-0 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 pb-6 z-20 relative border-b border-zinc-100">
                {/* Small circular profile image (90px) */}
                <div className="w-[88px] h-[88px] rounded-2xl border-4 border-white bg-white overflow-hidden shadow-md shrink-0">
                  <img
                    src={selectedMember.imageUrl || "/avatar_placeholder.jpg"}
                    alt={selectedMember.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name, Badges, & Role details */}
                <div className="flex-grow pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-zinc-900 leading-tight">
                      {selectedMember.fullName}
                    </h3>

                    {selectedMember.isVerified && (
                      <span className="inline-flex" title="Verified HelpMeMan Member">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-50" />
                      </span>
                    )}

                    {selectedMember.isFounder && (
                      <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Founder
                      </span>
                    )}
                    {selectedMember.isLeadership && !selectedMember.isFounder && (
                      <span className="text-[9px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-zinc-200">
                        Leadership
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-zinc-500 mt-1">
                    {selectedMember.role} · <span className="text-zinc-850 font-bold uppercase tracking-wider text-[10px] bg-zinc-100/80 px-2 py-0.5 rounded border border-zinc-200/50">{selectedMember.department}</span>
                  </p>
                </div>
              </div>

              {/* Main Content Layout (Structured Cards Layout) */}
              <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6 no-scrollbar">

                {/* About Section */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 select-none">About</h4>
                  <div className="p-5 bg-zinc-50/50 border border-zinc-150 rounded-2xl shadow-sm text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                    {selectedMember.bio}
                  </div>
                </div>

                {/* Journey Section */}
                {selectedMember.story && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 select-none">Journey</h4>
                    <div className="p-5 bg-zinc-900 text-zinc-100 border border-zinc-950 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium italic relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 text-zinc-800/40 text-7xl font-serif pointer-events-none select-none">“</div>
                      <span className="relative z-10">"{selectedMember.story}"</span>
                    </div>
                  </div>
                )}

                {/* Experiences & Education Cards Grid */}
                {(selectedMember.experience || selectedMember.education) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMember.experience && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1 select-none">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                          Experience
                        </h4>
                        <div className="p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                          {selectedMember.experience}
                        </div>
                      </div>
                    )}
                    {selectedMember.education && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1 select-none">
                          <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                          Education
                        </h4>
                        <div className="p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                          {selectedMember.education}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Achievements & Projects Cards Grid */}
                {(selectedMember.achievements || selectedMember.projects) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMember.achievements && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1 select-none">
                          <Award className="w-3.5 h-3.5 text-zinc-400" />
                          Achievements
                        </h4>
                        <div className="p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                          {selectedMember.achievements}
                        </div>
                      </div>
                    )}
                    {selectedMember.projects && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center gap-1 select-none">
                          <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                          Projects
                        </h4>
                        <div className="p-4 bg-white border border-zinc-150 rounded-2xl shadow-sm text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
                          {selectedMember.projects}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills, Languages, Interests Grid tag blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {selectedMember.skills?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 mb-2 select-none">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMember.skills.map((s: string) => (
                          <span key={s} className="text-[10px] bg-zinc-50 border border-zinc-200/60 text-zinc-700 font-semibold px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMember.languages?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 mb-2 select-none">Languages</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMember.languages.map((l: string) => (
                          <span key={l} className="text-[10px] bg-zinc-50 border border-zinc-200/60 text-zinc-750 font-semibold px-2 py-0.5 rounded-md">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMember.interests?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 mb-2 select-none">Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMember.interests.map((i: string) => (
                          <span key={i} className="text-[10px] bg-zinc-50 border border-zinc-200/60 text-zinc-700 font-semibold px-2 py-0.5 rounded-md">
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta details footer line */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-zinc-450 border-t border-zinc-100 pt-4 select-none">
                  {selectedMember.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {selectedMember.location}{selectedMember.country ? `, ${selectedMember.country}` : ""}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    Joined {formatDate(selectedMember.joinedAt)}
                  </span>
                </div>
              </div>

              {/* Modal footer (SaaS Actions & Social row) */}
              <div className="px-6 py-4 border-t border-zinc-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50">
                <div className="flex items-center gap-2">
                  {selectedMember.showSocialLinks && (
                    <>
                      {selectedMember.linkedin && (
                        <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 shadow-sm transition-colors cursor-pointer" title="LinkedIn Profile">
                          <FaLinkedin className="w-3.5 h-3.5 fill-zinc-600 group-hover:fill-zinc-800" />
                        </a>
                      )}
                      {selectedMember.github && (
                        <a href={selectedMember.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 shadow-sm transition-colors cursor-pointer" title="GitHub Profile">
                          <FaGithub className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {selectedMember.twitter && (
                        <a href={selectedMember.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 shadow-sm transition-colors cursor-pointer" title="Twitter/X Profile">
                          <FaTwitter className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {selectedMember.website && (
                        <a href={selectedMember.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-800 shadow-sm transition-colors cursor-pointer" title="Personal Website">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {selectedMember.allowContact && selectedMember.email && selectedMember.showEmail && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-xs font-bold rounded-lg transition-colors shadow-sm no-underline cursor-pointer"
                    >
                      Email Member
                    </a>
                  )}
                  {selectedMember.availableForMentorship && (
                    <Link
                      href={`/become-a-mentor`}
                      onClick={() => setSelectedMember(null)}
                      className="flex-1 sm:flex-none text-center px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg active:scale-[0.98] transition-all no-underline shadow-sm cursor-pointer"
                    >
                      Book Session
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
