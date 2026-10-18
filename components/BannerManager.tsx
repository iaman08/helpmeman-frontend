"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, Eye, Layers, Check, MoveVertical } from "lucide-react";
import { PRESET_BANNERS } from "@/lib/banner-generator";
import api from "@/lib/api";

interface Props {
  currentBannerUrl?: string | null;
  bannerPosition?: string | null;
  onUpdate: (bannerUrl: string | null, position?: string) => void;
  isMentor?: boolean;
}

export function BannerManager({
  currentBannerUrl,
  bannerPosition = "50% 50%",
  onUpdate,
  isMentor = false,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBannerUrl || null);
  const [position, setPosition] = useState(bannerPosition || "50% 50%");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a valid JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Banner image size should be 10MB or less.");
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleSaveUpload = async () => {
    if (!selectedFile && previewUrl === currentBannerUrl) {
      // Just updating position
      setSaving(true);
      try {
        const endpoint = isMentor ? "/mentor/me" : "/users/me";
        await api.put(endpoint, { bannerPosition: position });
        onUpdate(currentBannerUrl || null, position);
        alert("Banner position saved!");
      } catch {
        alert("Failed to update banner position.");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!selectedFile && !previewUrl) return;

    setSaving(true);
    try {
      const endpoint = isMentor ? "/mentor/me/banner" : "/users/me/banner";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("banner", selectedFile);
        formData.append("bannerPosition", position);

        const res = await api.put(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const newUrl = res.data?.bannerImageUrl;
        setPreviewUrl(newUrl);
        setSelectedFile(null);
        onUpdate(newUrl, position);
      } else if (previewUrl) {
        // Preset gradient URL or string
        const res = await api.put(endpoint, {
          bannerUrl: previewUrl,
          bannerPosition: position,
        });
        const newUrl = res.data?.bannerImageUrl || previewUrl;
        onUpdate(newUrl, position);
      }
    } catch {
      alert("Failed to save banner image. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your custom banner?")) return;
    setSaving(true);
    try {
      const endpoint = isMentor ? "/mentor/me/banner" : "/users/me/banner";
      await api.delete(endpoint);
      setPreviewUrl(null);
      setSelectedFile(null);
      onUpdate(null, "50% 50%");
    } catch {
      alert("Failed to remove banner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Banner Preview Area */}
      <div
        className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-[var(--hairline)] shadow-inner"
        style={{
          background: previewUrl ? "#0f172a" : "linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #334155 100%)",
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Banner preview"
            className="w-full h-full object-cover transition-all"
            style={{ objectPosition: position }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
            <Layers size={20} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">
              Automatic Dynamic Banner Active
            </span>
            <span className="text-[10px] text-slate-400">
              Generated deterministically from your role and company
            </span>
          </div>
        )}

        {/* Overlay Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <label className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold cursor-pointer backdrop-blur-md transition-all shadow-md flex items-center gap-1.5">
            <Upload size={13} />
            <span>Upload Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={saving}
              className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white text-xs backdrop-blur-md transition-colors cursor-pointer shadow-md"
              title="Remove custom banner"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Position and Save Bar */}
      {previewUrl && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-[var(--hairline)]"
          style={{ background: "color-mix(in srgb, var(--fg) 2%, transparent)" }}
        >
          <div className="flex items-center gap-2 text-xs">
            <MoveVertical size={14} className="text-[var(--muted)]" />
            <span className="font-medium text-[var(--fg)]">Vertical Focus:</span>
            {["50% 20%", "50% 50%", "50% 80%"].map((pos, idx) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  position === pos
                    ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
                    : "bg-[color:var(--fg)]/5 text-[color:var(--muted)] hover:text-[color:var(--fg)]"
                }`}
              >
                {idx === 0 ? "Top" : idx === 1 ? "Center" : "Bottom"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSaveUpload}
            disabled={saving}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ml-auto"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={14} />
                <span>Save Banner</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
