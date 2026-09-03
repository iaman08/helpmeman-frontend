"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bug,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Phone,
  Mail,
  FileImage,
  FileVideo,
  FileText,
  Eye,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

interface BugReportItem {
  id: string;
  name: string;
  email: string;
  contactNo: string;
  bugName: string;
  description?: string | null;
  fileUrl?: string | null;
  googleDriveLink?: string | null;
  googleDriveFileId?: string | null;
  fileType?: string | null;
  fileName?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
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

export default function AdminBugsPage() {
  const [reports, setReports] = useState<BugReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<BugReportItem | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const { toast } = useToast();

  const fetchReports = useCallback(
    (targetPage = 1) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "20",
      });

      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      api
        .get(`/bugs/admin?${params.toString()}`)
        .then((res) => {
          setReports(res.data?.reports ?? []);
          setTotalPages(res.data?.pagination?.pages ?? 1);
          if (res.data?.stats) {
            setStats(res.data.stats);
          }
        })
        .catch((err) => {
          console.error("Failed to load bug reports:", err);
          toast("Failed to load bug reports", "error");
        })
        .finally(() => setLoading(false));
    },
    [search, statusFilter, toast]
  );

  useEffect(() => {
    fetchReports(page);
  }, [fetchReports, page]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/bugs/admin/${id}/status`, { status: newStatus });
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus as BugReportItem["status"] } : r
        )
      );
      toast(`Status updated to ${newStatus}`, "success");
      // refresh stats
      fetchReports(page);
    } catch {
      toast("Failed to update status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this bug report?")) return;
    setActionLoadingId(id);
    try {
      await api.delete(`/bugs/admin/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast("Bug report deleted", "success");
      fetchReports(page);
    } catch {
      toast("Failed to delete report", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F5F5F5]">
              Bug Reports & Google Drive Attachments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Live
            </span>
          </div>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1AA] mt-1">
            Submitted bug reports with photo and video attachments linked with Google Drive.
          </p>
        </div>

        <button
          onClick={() => fetchReports(page)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] hover:bg-[#F9FAFB] dark:hover:bg-[#1F1F26] transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1AA] uppercase tracking-wider">
              Total Bugs
            </span>
            <Bug size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-[#111111] dark:text-[#F5F5F5] mt-2">
            {stats.total}
          </p>
        </div>

        <div className="bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
              Open / Needs Action
            </span>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
            {stats.open}
          </p>
        </div>

        <div className="bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              In Progress
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats.inProgress}
          </p>
        </div>

        <div className="bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Resolved
            </span>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
            {stats.resolved}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by reporter name, email, contact no, bug title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] text-sm text-[#111111] dark:text-[#F5F5F5] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by bug report status"
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] text-sm text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* ── Reports List ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] space-y-3"
            >
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<Bug size={28} className="text-[#9CA3AF]" />}
          title="No bug reports found"
          description="Users have not submitted any bug reports matching your filter."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isVideo = report.fileType?.startsWith("video/");
            const isImage = report.fileType?.startsWith("image/");

            return (
              <div
                key={report.id}
                className="rounded-2xl bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] p-5 sm:p-6 shadow-xs hover:border-[#D1D5DB] dark:hover:border-[#3F3F46] transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
              >
                {/* Left Side: Report Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        report.status === "OPEN"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          : report.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-[#111111] dark:text-[#F5F5F5] tracking-tight">
                      {report.bugName}
                    </h3>
                  </div>

                  {report.description && (
                    <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed whitespace-pre-line bg-[#F9FAFB] dark:bg-[#111114] p-3 rounded-xl border border-[#E5E7EB] dark:border-[#27272A]">
                      {report.description}
                    </p>
                  )}

                  {/* Reporter Contact Info Bar */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#A1A1AA] pt-1">
                    <span className="font-semibold text-[#111111] dark:text-[#F5F5F5]">
                      Reported by: {report.name}
                    </span>
                    <a
                      href={`mailto:${report.email}`}
                      className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Mail size={13} />
                      <span>{report.email}</span>
                    </a>
                    <a
                      href={`tel:${report.contactNo}`}
                      className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Phone size={13} />
                      <span>{report.contactNo}</span>
                    </a>
                    <span>•</span>
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>

                {/* Right Side: Google Drive Media Attachment & Status Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                  {/* Google Drive Link & Preview Button */}
                  {report.googleDriveLink || report.fileUrl ? (
                    <div className="flex items-center gap-2">
                      {/* Media Preview Trigger */}
                      <button
                        onClick={() => setPreviewItem(report)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F3F4F6] dark:bg-[#1F1F26] text-[#111111] dark:text-[#F5F5F5] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2A34] transition-all cursor-pointer"
                        title="Preview attachment"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>

                      {/* Google Drive Direct Button */}
                      <a
                        href={report.googleDriveLink || report.fileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all no-underline cursor-pointer"
                        title="Open file in Google Drive"
                      >
                        {isVideo ? (
                          <FileVideo size={14} />
                        ) : isImage ? (
                          <FileImage size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                        <span>Open in Google Drive</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-[#9CA3AF] italic">No attachment</span>
                  )}

                  {/* Status Dropdown & Delete */}
                  <div className="flex items-center gap-2">
                    <select
                      value={report.status}
                      disabled={actionLoadingId === report.id}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      aria-label="Update report status"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F9FAFB] dark:bg-[#111114] border border-[#E5E7EB] dark:border-[#27272A] text-[#111111] dark:text-[#F5F5F5] cursor-pointer focus:outline-none"
                    >
                      <option value="OPEN">Set Open</option>
                      <option value="IN_PROGRESS">Set In Progress</option>
                      <option value="RESOLVED">Set Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={actionLoadingId === report.id}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete report"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-[#6B7280] dark:text-[#A1A1AA]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Media Preview Modal ── */}
      {previewItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#17171C] border border-[#E5E7EB] dark:border-[#27272A] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#27272A] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111] dark:text-[#F5F5F5]">
                  {previewItem.bugName}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#A1A1AA]">
                  {previewItem.fileName || "Bug Media Proof"} • Reported by {previewItem.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {previewItem.googleDriveLink && (
                  <a
                    href={previewItem.googleDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white no-underline"
                  >
                    <span>Google Drive</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1 rounded-full text-[#6B7280] hover:text-[#111111] dark:hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Media Body */}
            <div className="p-6 flex items-center justify-center bg-black/5 dark:bg-black/40 overflow-auto flex-1">
              {previewItem.fileType?.startsWith("video/") ? (
                <video
                  src={previewItem.fileUrl || previewItem.googleDriveLink || ""}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-auto max-w-full rounded-2xl shadow-lg"
                />
              ) : (
                <img
                  src={previewItem.fileUrl || previewItem.googleDriveLink || ""}
                  alt={previewItem.bugName}
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
