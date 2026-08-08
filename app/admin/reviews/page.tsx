"use client";

import { useEffect, useState, useMemo } from "react";
import { Star, Search, Trash2, Download, ShieldAlert } from "lucide-react";
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
        <div className="flex flex-col gap-1.5">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: "var(--muted)" }}>
            Admin Management
          </p>
          <h1 className="font-display text-4xl leading-tight" style={{ color: "var(--fg)" }}>
            Review Moderation
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Manage, filter, and moderate all platform mentor ratings and reviews.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
          style={{ border: "1px solid var(--hairline)", color: "var(--fg)", background: "transparent" }}
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by mentee, mentor, feedback or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              border: "1px solid var(--hairline)",
              background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              color: "var(--fg)",
            }}
          />
        </div>

        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRatingFilter("ALL")}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            style={{
              background: ratingFilter === "ALL" ? "var(--fg)" : "color-mix(in srgb, var(--fg) 5%, transparent)",
              color: ratingFilter === "ALL" ? "var(--bg)" : "var(--fg)",
            }}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((r) => {
            const cnt = reviews.filter((rev) => rev.rating === r).length;
            const isSelected = ratingFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                style={{
                  background: isSelected ? "#f59e0b" : "color-mix(in srgb, var(--fg) 5%, transparent)",
                  color: isSelected ? "#000" : "var(--fg)",
                }}
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
              className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
              style={{
                border: "1px solid var(--hairline)",
                background: "color-mix(in srgb, var(--fg) 2%, transparent)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>
                      {rev.anonymous ? "Anonymous" : rev.userName}
                    </span>
                    {rev.anonymous && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: "color-mix(in srgb, var(--fg) 10%, transparent)", color: "var(--fg)" }}>
                        Anon
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    reviewed mentor{" "}
                    <strong style={{ color: "var(--fg)" }}>{rev.mentorName}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
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
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">
                    {rev.rating}.0
                  </span>
                </div>

                {rev.tags &&
                  rev.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                      style={{
                        background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                        border: "1px solid var(--hairline)",
                        color: "var(--muted)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              {/* Feedback */}
              {rev.feedback && (
                <p
                  className="text-sm leading-relaxed p-3 rounded-xl"
                  style={{
                    color: "var(--fg)",
                    background: "color-mix(in srgb, var(--fg) 3%, transparent)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  {rev.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShieldAlert className="h-8 w-8" style={{ color: "var(--muted)" }} />}
          title="No reviews match filters"
          description="Try adjusting your search keywords or rating filter."
        />
      )}
    </div>
  );
}
