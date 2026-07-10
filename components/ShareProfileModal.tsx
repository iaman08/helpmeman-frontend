"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import {
  X,
  Download,
  MoreHorizontal,
} from "lucide-react";

import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
} from "react-icons/fa";

import { toPng } from "html-to-image";
import QRCode from "qrcode";

import type { Mentor } from "@/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
};

const GRADIENTS = [
  "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
  "linear-gradient(135deg,#ff9966 0%,#ff5e62 100%)",
  "linear-gradient(135deg,#00c6ff 0%,#0072ff 100%)",
  "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)",
];

function getGradient(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function ShareProfileModal({
  isOpen,
  onClose,
  mentor,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [otherLabel, setOtherLabel] = useState("Other");

  const defaultGradient = getGradient(mentor.id);
  const GRADIENT_OPTIONS = [
    defaultGradient,
    "linear-gradient(135deg, #FFD225 0%, #FFA800 100%)", // Warm Golden Yellow
    "linear-gradient(135deg, #E28253 0%, #8C4325 100%)", // Sunset Orange-Brown
    "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)", // Indigo Purple
    "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)", // Cyan Teal
    "linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)", // Pink Rose
  ];

  const handleCycleColor = useCallback(() => {
    setColorIndex((prev) => (prev + 1) % GRADIENT_OPTIONS.length);
  }, [GRADIENT_OPTIONS.length]);

  const handleShareOther = async () => {
    try {
      const dataUrl = await generateCardImage();
      if (dataUrl) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${mentor.displayName}.png`, {
          type: "image/png",
        });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: mentor.displayName,
            text: `Check out ${mentor.displayName}'s profile on HelpMeMan 🚀`,
          });
          return;
        }
      }
    } catch (err) {
      console.error("Native share failed:", err);
    }

    try {
      await navigator.clipboard.writeText(profileUrl);
      setOtherLabel("Copied!");
      setTimeout(() => {
        setOtherLabel("Other");
      }, 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/mentors/${mentor.id}`
      : `/mentors/${mentor.id}`;

  /* QR */
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(profileUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    }).then(setQrDataUrl);
  }, [profileUrl, isOpen]);

  /* GENERATE IMAGE */
  const generateCardImage = async () => {
    if (!cardRef.current) return null;

    await new Promise((r) => setTimeout(r, 300));

    return await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 4,
      backgroundColor: "#ffffff",
    });
  };

  /* SAVE */
  const handleSaveImage = useCallback(async () => {
    try {
      const dataUrl = await generateCardImage();

      if (!dataUrl) return;

      const link = document.createElement("a");

      link.download = `${mentor.displayName}.png`;
      link.href = dataUrl;

      link.click();
    } catch (err) {
      console.error(err);
    }
  }, [mentor.displayName]);

  /* SHARE */
  const shareImage = async (
    platform:
      | "whatsapp"
      | "facebook"
      | "linkedin"
      | "instagram"
  ) => {
    try {
      const dataUrl = await generateCardImage();

      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();

      const file = new File(
        [blob],
        `${mentor.displayName}.png`,
        {
          type: "image/png",
        }
      );

      /* MOBILE SHARE */
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: mentor.displayName,
          text: `Check out ${mentor.displayName}'s profile on HelpMeMan 🚀`,
        });

        return;
      }

      /* DESKTOP FALLBACKS */
      if (platform === "whatsapp") {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(profileUrl)}`,
          "_blank"
        );
      }

      if (platform === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
          "_blank"
        );
      }

      if (platform === "linkedin") {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
          "_blank"
        );
      }

      if (platform === "instagram") {
        const link = document.createElement("a");

        link.download = `${mentor.displayName}.png`;
        link.href = dataUrl;

        link.click();

        setTimeout(() => {
          window.open(
            "https://instagram.com",
            "_blank"
          );
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const initials = mentor.displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradient = getGradient(mentor.id);

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        p-3 sm:p-5
        overflow-y-auto
      "
      onClick={onClose}
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* MODAL */}
      <div
        className="
          relative z-10
          w-[90vw]
          max-w-[340px]
          sm:max-w-[350px]
          bg-white
          rounded-[36px]
          overflow-hidden
          shadow-[0_25px_80px_rgba(0,0,0,0.3)]
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* CARD CONTAINER */}
        <div
          ref={cardRef}
          onClick={handleCycleColor}
          className="cursor-pointer select-none active:brightness-95 transition-all duration-150"
          style={{
            background: GRADIENT_OPTIONS[colorIndex],
            padding: "36px 20px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* WHITE INNER CARD */}
          <div
            className="w-full bg-white relative flex flex-col items-center"
            style={{
              borderRadius: "24px",
              padding: "48px 16px 20px",
              marginTop: "42px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* AVATAR */}
            <div
              style={{
                position: "absolute",
                top: "-42px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "84px",
                height: "84px",
                borderRadius: "999px",
                overflow: "hidden",
                border: "4px solid white",
                background: "#1f1f1f",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 20,
              }}
            >
              {mentor.avatar && !avatarError ? (
                <img
                  src={
                    mentor.avatar?.startsWith("http")
                      ? mentor.avatar
                      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${mentor.avatar?.replace(/^\/+/, "")}`
                  }
                  alt={mentor.displayName}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "28px",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* NAME */}
            <h2
              className="text-center font-bold tracking-tight text-gray-900"
              style={{
                fontSize: "18px",
                margin: "0 0 16px 0",
              }}
            >
              {mentor.displayName}
            </h2>

            {/* QR */}
            {qrDataUrl && (
              <div className="relative flex items-center justify-center p-1 bg-white mb-3">
                <img
                  src={qrDataUrl}
                  alt="QR"
                  className="w-[160px] h-[160px]"
                />
                <div
                  className="
                    absolute
                    w-[32px] h-[32px]
                    bg-white
                    rounded-lg
                    flex items-center justify-center
                    shadow-[0_2px_8px_rgba(0,0,0,0.15)]
                    p-1
                    border border-gray-100
                  "
                >
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    style={{ color: "#4f46e5" }}
                  >
                    <path d="M20 20h12v60H20V20z" fill="currentColor" />
                    <path d="M68 20h12v60H68V20z" fill="currentColor" />
                    <path d="M32 60h12v8H32v-8z" fill="currentColor" />
                    <path d="M44 48h12v8H44v-8z" fill="currentColor" />
                    <path d="M56 36h12v8H56v-8z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}

            {/* SUBTITLE */}
            <span
              className="text-center text-gray-400 font-normal mb-3"
              style={{
                fontSize: "10px",
                maxWidth: "180px",
                lineHeight: "1.4",
              }}
            >
              Scan to connect with {mentor.displayName} on HelpMeMan
            </span>

            {/* LOGO */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4 h-4 text-gray-900">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ color: "#111827" }}
                >
                  <path d="M20 20h12v60H20V20z" fill="currentColor" />
                  <path d="M68 20h12v60H68V20z" fill="currentColor" />
                  <path d="M32 60h12v8H32v-8z" fill="currentColor" />
                  <path d="M44 48h12v8H44v-8z" fill="currentColor" />
                  <path d="M56 36h12v8H56v-8z" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold tracking-tight text-gray-900 text-xs">
                HelpMeMan
              </span>
            </div>
          </div>

          {/* TAP TO CHANGE COLOR TEXT */}
          <span
            className="text-white/80 font-medium text-center mt-4 tracking-wide text-[10px]"
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }}
          >
            Tap background to change color
          </span>
        </div>

        {/* BOTTOM SHEET */}
        <div className="bg-white px-5 py-4 border-t border-gray-100 relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-semibold tracking-widest uppercase text-[10px] mx-auto">
              Share to
            </span>
            <button
              onClick={onClose}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex justify-around items-center gap-2">
            {/* DOWNLOAD */}
            <button
              onClick={handleSaveImage}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="
                  w-11 h-11
                  rounded-full
                  bg-gray-50
                  flex items-center justify-center
                  text-gray-700
                  border border-gray-100
                  shadow-sm
                  transition-all duration-200
                  group-hover:scale-110 group-hover:bg-gray-100
                  group-active:scale-95
                "
              >
                <Download size={18} />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">
                Download
              </span>
            </button>

            {/* WHATSAPP */}
            <button
              onClick={() => shareImage("whatsapp")}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="
                  w-11 h-11
                  rounded-full
                  bg-[#25D366]
                  flex items-center justify-center
                  text-white
                  shadow-md
                  transition-all duration-200
                  group-hover:scale-110 group-hover:bg-[#20ba56]
                  group-active:scale-95
                "
              >
                <FaWhatsapp size={20} />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">
                WhatsApp
              </span>
            </button>

            {/* LINKEDIN */}
            <button
              onClick={() => shareImage("linkedin")}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="
                  w-11 h-11
                  rounded-full
                  bg-[#0077B5]
                  flex items-center justify-center
                  text-white
                  shadow-md
                  transition-all duration-200
                  group-hover:scale-110 group-hover:bg-[#006396]
                  group-active:scale-95
                "
              >
                <FaLinkedin size={18} />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">
                LinkedIn
              </span>
            </button>

            {/* OTHER */}
            <button
              onClick={handleShareOther}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className="
                  w-11 h-11
                  rounded-full
                  bg-[#6366F1]
                  flex items-center justify-center
                  text-white
                  shadow-md
                  transition-all duration-200
                  group-hover:scale-110 group-hover:bg-[#4f46e5]
                  group-active:scale-95
                "
              >
                <MoreHorizontal size={18} />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">
                {otherLabel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}