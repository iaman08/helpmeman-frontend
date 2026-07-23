"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, Search, Trash2, Filter, Download, ShieldAlert } from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

interface AdminReviewItem {
  id: string;
  rating: number;
  feedback?: string | null;
  tags: string[];
  anonymous: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
  mentorName: string;
  mentorId: string;
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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReviews = () => {
    setLoading(true);
    api
      .get("/reviews/admin?limit=100")
      .then((res) => {
        setReviews(res.data?.reviews ?? []);
      })
      .catch(() => {
        toast("Failed to fetch admin reviews", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        !search ||
        r.userName?.toLowerCase().includes(search.toLowerCase()) ||
        r.mentorName?.toLowerCase().includes(search.toLowerCase()) ||
        r.feedback?.toLowerCase().includes(search.toLowerCase()) ||
        r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesRating =
        ratingFilter === "ALL" || r.rating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, search, ratingFilter]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      toast("Review deleted successfully", "success");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast("Failed to delete review", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredReviews, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `helpmeman-reviews-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm uppercase tracking-[0.22em] text-(--muted)">
            Admin Management
          </p>
          <h1 className="font-display text-4xl leading-tight">
            Review Moderation
          </h1>
          <p className="text-sm text-(--muted)">
            Manage, filter, and moderate all platform mentor ratings and reviews.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-full text-xs font-semibold border border-(--hairline) hover:bg-(--fg)/5 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mentee, mentor, feedback or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-(--hairline) bg-(--fg)/[0.02] focus:outline-none focus:border-(--fg)"
          />
        </div>

        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRatingFilter("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              ratingFilter === "ALL"
                ? "bg-(--fg) text-(--bg)"
                : "bg-(--fg)/5 text-(--muted) hover:bg-(--fg)/10"
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((r) => {
            const cnt = reviews.filter((rev) => rev.rating === r).length;
            return (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  ratingFilter === r
                    ? "bg-amber-500 text-black"
                    : "bg-(--fg)/5 text-(--muted) hover:bg-(--fg)/10"
                }`}
              >
                {r} ★ ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border p-5 flex flex-col gap-3 bg-(--fg)/[0.02] border-(--hairline) hover:border-(--fg)/20 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-(--fg)">
                      {rev.anonymous ? "Anonymous" : rev.userName}
                    </span>
                    {rev.anonymous && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-(--fg)/10 text-(--muted)">
                        Anon
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-(--muted)">
                    reviewed mentor{" "}
                    <strong className="text-(--fg)">{rev.mentorName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-(--muted)">
                    {formatDate(rev.createdAt)}
                  </span>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={deletingId === rev.id}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rating & Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-yellow-600">
                    {rev.rating}.0
                  </span>
                </div>

                {rev.tags &&
                  rev.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-(--fg)/[0.03] border-(--hairline)"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              {/* Feedback */}
              {rev.feedback && (
                <p className="text-sm text-(--fg)/80 leading-relaxed bg-(--fg)/[0.02] p-3 rounded-xl border border-(--hairline)">
                  {rev.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShieldAlert className="h-8 w-8 text-(--muted)" />}
          title="No reviews match filters"
          description="Try adjusting your search keywords or rating filter."
        />
      )}
    </div>
  );
}
