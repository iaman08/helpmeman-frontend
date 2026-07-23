"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, Search, Trash2, Filter, Download, CheckCircle, EyeOff, Sparkles, Shield, User, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

interface PlatformReviewItem {
  id: string;
  rating: number;
  feedback?: string | null;
  tags: string[];
  anonymous: boolean;
  approved: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
}

interface Stats {
  totalReviews: number;
  approvedCount: number;
  featuredCount: number;
  avgRating: number;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPlatformReviewsPage() {
  const [reviews, setReviews] = useState<PlatformReviewItem[]>([]);
  const [stats, setStats] = useState<Stats>({ totalReviews: 0, approvedCount: 0, featuredCount: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [approvalFilter, setApprovalFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchReviews = (p = page) => {
    setLoading(true);
    const query = new URLSearchParams({
      page: p.toString(),
      limit: "20",
    });
    if (search.trim()) query.set("search", search.trim());
    if (ratingFilter !== "ALL") query.set("rating", ratingFilter.toString());
    if (approvalFilter === "APPROVED") query.set("approved", "true");
    if (approvalFilter === "PENDING") query.set("approved", "false");

    api
      .get(`/platform-reviews/admin?${query.toString()}`)
      .then((res) => {
        setReviews(res.data?.reviews ?? []);
        setStats(res.data?.stats ?? { totalReviews: 0, approvedCount: 0, featuredCount: 0, avgRating: 0 });
        setTotalPages(res.data?.pagination?.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch platform reviews", err);
        toast("Failed to fetch platform reviews", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews(1);
    setPage(1);
  }, [search, ratingFilter, approvalFilter]);

  const handleToggleApprove = async (review: PlatformReviewItem) => {
    setActionLoadingId(review.id);
    try {
      const newApproved = !review.approved;
      await api.patch(`/platform-reviews/admin/${review.id}`, {
        approved: newApproved,
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, approved: newApproved } : r))
      );
      setStats((prev) => ({
        ...prev,
        approvedCount: prev.approvedCount + (newApproved ? 1 : -1),
      }));
      toast(newApproved ? "Review approved for landing page!" : "Review hidden from landing page.", "success");
    } catch (err) {
      console.error("Failed to update approval status", err);
      toast("Failed to update approval status.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleFeatured = async (review: PlatformReviewItem) => {
    setActionLoadingId(review.id);
    try {
      const newFeatured = !review.featured;
      await api.patch(`/platform-reviews/admin/${review.id}`, {
        featured: newFeatured,
      });
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, featured: newFeatured } : r))
      );
      setStats((prev) => ({
        ...prev,
        featuredCount: prev.featuredCount + (newFeatured ? 1 : -1),
      }));
      toast(newFeatured ? "Review marked as featured!" : "Review un-featured.", "success");
    } catch (err) {
      console.error("Failed to update featured status", err);
      toast("Failed to update featured status.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/platform-reviews/admin/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setStats((prev) => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1),
      }));
      toast("Platform review deleted.", "success");
    } catch (err) {
      console.error("Failed to delete review", err);
      toast("Failed to delete review.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/platform-reviews/admin/export", {
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `helpmeman-platform-reviews-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast("Exported platform reviews CSV successfully!", "success");
    } catch (err) {
      console.error("Failed to export CSV", err);
      toast("Failed to export reviews CSV.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ── Page Header & Export ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-(--muted) font-semibold">
            Admin Moderation
          </span>
          <h1 className="font-display text-3xl font-bold text-(--fg) tracking-tight">
            Platform Reviews & Feedback
          </h1>
          <p className="text-sm text-(--muted) mt-1">
            Manage genuine platform feedback, approve reviews for landing page display, and feature top testimonials.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-(--hairline) bg-(--fg)/[0.03] hover:bg-(--fg)/[0.08] text-xs font-semibold text-(--fg) transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* ── Overview Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-(--hairline) bg-(--fg)/[0.02] p-5 flex flex-col gap-1">
          <span className="text-xs text-(--muted) font-medium uppercase tracking-wider">Total Reviews</span>
          <span className="font-display text-3xl font-bold">{stats.totalReviews}</span>
        </div>
        <div className="rounded-2xl border border-(--hairline) bg-(--fg)/[0.02] p-5 flex flex-col gap-1">
          <span className="text-xs text-(--muted) font-medium uppercase tracking-wider">Average Rating</span>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-bold">{stats.avgRating.toFixed(1)}</span>
            <div className="flex text-amber-500">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-(--hairline) bg-(--fg)/[0.02] p-5 flex flex-col gap-1">
          <span className="text-xs text-(--muted) font-medium uppercase tracking-wider">Approved (Live)</span>
          <span className="font-display text-3xl font-bold text-emerald-500">{stats.approvedCount}</span>
        </div>
        <div className="rounded-2xl border border-(--hairline) bg-(--fg)/[0.02] p-5 flex flex-col gap-1">
          <span className="text-xs text-(--muted) font-medium uppercase tracking-wider">Featured</span>
          <span className="font-display text-3xl font-bold text-amber-500">{stats.featuredCount}</span>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-(--fg)/[0.02] border border-(--hairline) p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-(--muted) absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name, email, or feedback..."
            className="w-full bg-(--fg)/[0.03] border border-(--hairline) rounded-xl pl-10 pr-4 py-2 text-xs text-(--fg) placeholder:text-(--muted) focus:outline-none focus:ring-2 focus:ring-(--fg)/20"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rating filter */}
          <div className="flex items-center gap-1.5 bg-(--fg)/[0.03] border border-(--hairline) rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-(--muted)" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-(--fg) focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-(--bg) text-(--fg)">All Ratings</option>
              <option value={5} className="bg-(--bg) text-(--fg)">5 Stars</option>
              <option value={4} className="bg-(--bg) text-(--fg)">4 Stars</option>
              <option value={3} className="bg-(--bg) text-(--fg)">3 Stars</option>
              <option value={2} className="bg-(--bg) text-(--fg)">2 Stars</option>
              <option value={1} className="bg-(--bg) text-(--fg)">1 Star</option>
            </select>
          </div>

          {/* Approval filter */}
          <div className="flex items-center gap-1.5 bg-(--fg)/[0.03] border border-(--hairline) rounded-xl px-3 py-1.5">
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-(--fg) focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-(--bg) text-(--fg)">All Statuses</option>
              <option value="APPROVED" className="bg-(--bg) text-(--fg)">Approved Only</option>
              <option value="PENDING" className="bg-(--bg) text-(--fg)">Pending / Hidden</option>
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
        <div className="overflow-x-auto border border-(--hairline) rounded-2xl bg-(--fg)/[0.01]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-(--hairline) bg-(--fg)/[0.03] text-(--muted) font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 min-w-[220px]">Feedback & Tags</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--hairline)">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-(--fg)/[0.02] transition-colors">
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
                        <span className="font-semibold text-(--fg) truncate">
                          {r.user?.name || "Unknown User"}
                        </span>
                        <span className="text-[11px] text-(--muted) truncate">
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
                              : "fill-transparent text-(--muted)/30"
                          }
                        />
                      ))}
                      <span className="font-bold text-xs ml-1.5">{r.rating}.0</span>
                    </div>
                  </td>

                  {/* Feedback & Tags */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-(--fg) leading-relaxed line-clamp-3">
                        {r.feedback || <span className="italic text-(--muted)">No text feedback provided.</span>}
                      </p>
                      {r.tags && r.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-(--fg)/[0.05] text-(--muted) font-medium"
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--muted) bg-(--fg)/[0.05] px-2.5 py-1 rounded-full border border-(--hairline)">
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
                  <td className="py-4 px-4 whitespace-nowrap text-(--muted) text-[11px]">
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
                        className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          r.featured
                            ? "bg-amber-500 text-black border-amber-500 hover:bg-amber-400"
                            : "bg-(--fg)/[0.03] text-(--muted) border-(--hairline) hover:text-amber-500"
                        }`}
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
          <span className="text-xs text-(--muted)">
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
              className="px-3.5 py-1.5 rounded-xl border border-(--hairline) text-xs font-medium disabled:opacity-40 cursor-pointer hover:bg-(--fg)/5"
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
              className="px-3.5 py-1.5 rounded-xl border border-(--hairline) text-xs font-medium disabled:opacity-40 cursor-pointer hover:bg-(--fg)/5"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
