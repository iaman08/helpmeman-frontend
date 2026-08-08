"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Download, Search, Filter, CheckCircle, EyeOff, Sparkles, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

interface PlatformReviewItem {
  id: string;
  rating: number;
  feedback?: string | null;
  tags?: string[];
  anonymous: boolean;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPlatformReviewsPage() {
  const [reviews, setReviews] = useState<PlatformReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    approvedCount: 0,
    featuredCount: 0,
  });

  const { toast } = useToast();

  const fetchReviews = useCallback((targetPage = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(targetPage),
      limit: "20",
    });

    if (search) params.append("search", search);
    if (ratingFilter !== "ALL") params.append("rating", String(ratingFilter));
    if (approvalFilter !== "ALL") params.append("approved", approvalFilter === "APPROVED" ? "true" : "false");

    api
      .get(`/platform-reviews/admin?${params.toString()}`)
      .then((res) => {
        setReviews(res.data?.reviews ?? []);
        setTotalPages(res.data?.totalPages ?? 1);
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      })
      .catch(() => {
        toast("Failed to fetch platform reviews.", "error");
      })
      .finally(() => setLoading(false));
  }, [search, ratingFilter, approvalFilter, toast]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleToggleApprove = async (r: PlatformReviewItem) => {
    setActionLoadingId(r.id);
    try {
      const endpoint = r.approved
        ? `/platform-reviews/admin/${r.id}/hide`
        : `/platform-reviews/admin/${r.id}/approve`;
      const res = await api.put(endpoint);
      toast(res.data?.message || "Status updated", "success");

      setReviews((prev) =>
        prev.map((item) =>
          item.id === r.id ? { ...item, approved: !r.approved } : item
        )
      );

      setStats((prev) => ({
        ...prev,
        approvedCount: r.approved ? prev.approvedCount - 1 : prev.approvedCount + 1,
      }));
    } catch {
      toast("Failed to update approval status.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (r: PlatformReviewItem) => {
    setActionLoadingId(r.id);
    try {
      const endpoint = r.featured
        ? `/platform-reviews/admin/${r.id}/unfeature`
        : `/platform-reviews/admin/${r.id}/feature`;
      const res = await api.put(endpoint);
      toast(res.data?.message || "Featured status updated", "success");

      setReviews((prev) =>
        prev.map((item) =>
          item.id === r.id ? { ...item, featured: !r.featured } : item
        )
      );

      setStats((prev) => ({
        ...prev,
        featuredCount: r.featured ? prev.featuredCount - 1 : prev.featuredCount + 1,
      }));
    } catch {
      toast("Failed to update feature status.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this platform review?")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/platform-reviews/admin/${id}`);
      toast("Review deleted permanently.", "success");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setStats((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
      }));
    } catch {
      toast("Failed to delete review.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ["ID", "User Name", "User Email", "Rating", "Feedback", "Approved", "Featured", "Created At"];
      const rows = reviews.map((r) => [
        r.id,
        `"${r.user?.name || "Unknown"}"`,
        `"${r.user?.email || "Unknown"}"`,
        r.rating,
        `"${(r.feedback || "").replace(/"/g, '""')}"`,
        r.approved ? "TRUE" : "FALSE",
        r.featured ? "TRUE" : "FALSE",
        r.createdAt,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `platform_reviews_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toast("Failed to export reviews CSV.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ── Page Header & Export ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
            Admin Moderation
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
            Platform Reviews & Feedback
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Manage genuine platform feedback, approve reviews for landing page display, and feature top testimonials.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          style={{ border: "1px solid var(--hairline)", color: "var(--fg)", background: "color-mix(in srgb, var(--fg) 3%, transparent)" }}
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* ── Overview Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-5 flex flex-col gap-1" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Total Reviews</span>
          <span className="font-display text-3xl font-bold" style={{ color: "var(--fg)" }}>{stats.totalReviews}</span>
        </div>
        <div className="rounded-2xl border p-5 flex flex-col gap-1" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Average Rating</span>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-bold" style={{ color: "var(--fg)" }}>{stats.avgRating.toFixed(1)}</span>
            <div className="flex text-amber-500">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border p-5 flex flex-col gap-1" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Approved (Live)</span>
          <span className="font-display text-3xl font-bold text-emerald-500">{stats.approvedCount}</span>
        </div>
        <div className="rounded-2xl border p-5 flex flex-col gap-1" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Featured</span>
          <span className="font-display text-3xl font-bold text-amber-500">{stats.featuredCount}</span>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, or feedback..."
            className="w-full rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 3%, transparent)",
              color: "var(--fg)",
            }}
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rating filter */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)" }}>
            <Filter className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ color: "var(--fg)" }}
            >
              <option value="ALL" style={{ background: "var(--bg)", color: "var(--fg)" }}>All Ratings</option>
              <option value={5} style={{ background: "var(--bg)", color: "var(--fg)" }}>5 Stars</option>
              <option value={4} style={{ background: "var(--bg)", color: "var(--fg)" }}>4 Stars</option>
              <option value={3} style={{ background: "var(--bg)", color: "var(--fg)" }}>3 Stars</option>
              <option value={2} style={{ background: "var(--bg)", color: "var(--fg)" }}>2 Stars</option>
              <option value={1} style={{ background: "var(--bg)", color: "var(--fg)" }}>1 Star</option>
            </select>
          </div>

          {/* Approval filter */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)" }}>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
              style={{ color: "var(--fg)" }}
            >
              <option value="ALL" style={{ background: "var(--bg)", color: "var(--fg)" }}>All Statuses</option>
              <option value="APPROVED" style={{ background: "var(--bg)", color: "var(--fg)" }}>Approved Only</option>
              <option value="PENDING" style={{ background: "var(--bg)", color: "var(--fg)" }}>Pending / Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Reviews Table ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<Star className="w-8 h-8" />}
          title="No Platform Reviews Found"
          description="No reviews matched your search or filter criteria."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 1%, transparent)" }}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hairline)", background: "color-mix(in srgb, var(--fg) 3%, transparent)", color: "var(--muted)" }} className="font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 min-w-[220px]">Feedback & Tags</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, idx) => (
                <tr
                  key={r.id}
                  className="transition-colors"
                  style={{ borderBottom: idx < reviews.length - 1 ? "1px solid var(--hairline)" : "none" }}
                  onMouseEnter={(el) => (el.currentTarget.style.background = "color-mix(in srgb, var(--fg) 2%, transparent)")}
                  onMouseLeave={(el) => (el.currentTarget.style.background = "transparent")}
                >
                  {/* User */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {r.user?.avatar ? (
                        <img
                          src={r.user.avatar}
                          alt={r.user.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                          {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate" style={{ color: "var(--fg)" }}>
                          {r.user?.name || "Unknown User"}
                        </span>
                        <span className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
                          {r.user?.email || "No email"}
                        </span>
                        {r.anonymous && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                            Anonymous on Landing Page
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          size={13}
                          className={
                            si < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-transparent"
                          }
                          style={{ color: si < r.rating ? undefined : "var(--hairline)" }}
                        />
                      ))}
                      <span className="font-bold text-xs ml-1.5" style={{ color: "var(--fg)" }}>{r.rating}.0</span>
                    </div>
                  </td>

                  {/* Feedback & Tags */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--fg)" }}>
                        {r.feedback || <span className="italic" style={{ color: "var(--muted)" }}>No text feedback provided.</span>}
                      </p>
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                              style={{ background: "color-mix(in srgb, var(--fg) 5%, transparent)", color: "var(--muted)" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      {r.approved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Approved (Live)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ border: "1px solid var(--hairline)", color: "var(--muted)", background: "color-mix(in srgb, var(--fg) 5%, transparent)" }}>
                          <EyeOff className="w-3 h-3" /> Pending / Hidden
                        </span>
                      )}

                      {r.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Submitted Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-[11px]" style={{ color: "var(--muted)" }}>
                    {formatDate(r.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Approve/Hide Toggle Button */}
                      <button
                        onClick={() => handleToggleApprove(r)}
                        disabled={actionLoadingId === r.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          r.approved
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        {r.approved ? "Hide" : "Approve"}
                      </button>

                      {/* Feature Toggle Button */}
                      <button
                        onClick={() => handleToggleFeatured(r)}
                        disabled={actionLoadingId === r.id}
                        className="p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
                        style={{
                          background: r.featured ? "#f59e0b" : "color-mix(in srgb, var(--fg) 3%, transparent)",
                          color: r.featured ? "#000" : "var(--fg)",
                          borderColor: r.featured ? "#f59e0b" : "var(--hairline)",
                        }}
                        title={r.featured ? "Un-feature review" : "Feature review on landing page"}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent"
                        title="Delete review"
                      >
                        {deletingId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const p = Math.max(1, page - 1);
                setPage(p);
                fetchReviews(p);
              }}
              disabled={page <= 1}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40 cursor-pointer transition-colors"
              style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
            >
              Previous
            </button>
            <button
              onClick={() => {
                const p = Math.min(totalPages, page + 1);
                setPage(p);
                fetchReviews(p);
              }}
              disabled={page >= totalPages}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium disabled:opacity-40 cursor-pointer transition-colors"
              style={{ border: "1px solid var(--hairline)", color: "var(--fg)" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
