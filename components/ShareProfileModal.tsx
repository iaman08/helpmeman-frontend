"use client";

import { useEffect, useRef, useState, useCallback } from "react";

import {
  X,
  Download,
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

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/mentors/${mentor.id}`
      : `/mentors/${mentor.id}`;

  /* QR */
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(profileUrl, {
      width: 220,
      margin: 1,
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
          max-w-[360px]
          sm:max-w-[380px]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 z-50
            h-10 w-10
            rounded-full
            bg-black/30
            backdrop-blur-xl
            border border-white/10
            flex items-center justify-center
            text-white
          "
        >
          <X size={18} />
        </button>

        {/* CARD */}
        <div
          ref={cardRef}
          className="overflow-hidden"
          style={{
            borderRadius: "42px",
            background: "#ffffff",
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.18)",
          }}
        >
          {/* TOP */}
          <div
            style={{
              background: gradient,
              height: "200px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* WAVE */}
            <div
              style={{
                position: "absolute",
                bottom: "-5px",
                left: 0,
                width: "100%",
              }}
            >
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                style={{
                  width: "100%",
                  height: "90px",
                }}
              >
                <path
                  d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                  style={{
                    stroke: "none",
                    fill: "#ffffff",
                  }}
                />
              </svg>
            </div>

            {/* AVATAR */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "18px",
                transform: "translateX(-50%)",
                width: "118px",
                height: "118px",
                borderRadius: "999px",
                overflow: "hidden",
                border: "5px solid white",
                background: "#1f1f1f",
                boxShadow:
                  "0 15px 40px rgba(0,0,0,0.22)",
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
                  onError={() =>
                    setAvatarError(true)
                  }
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
                    fontSize: "42px",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* BODY */}
          <div
            style={{
              padding: "82px 24px 42px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
            }}
          >
            {/* NAME */}
            <div className="text-center">
              <h2
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 300,
                  letterSpacing: "-0.04em",
                  color: "#111827",
                }}
              >
                {mentor.displayName}
              </h2>

              {(mentor.currentRole ||
                mentor.company) && (
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  {mentor.currentRole}
                  {mentor.company
                    ? ` at ${mentor.company}`
                    : ""}
                </p>
              )}
            </div>

            {/* BIO */}
            {mentor.bio && (
              <p
                style={{
                  margin: 0,
                  textAlign: "center",
                  lineHeight: 1.8,
                  fontSize: "15px",
                  color: "#6b7280",
                  maxWidth: "280px",

                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {mentor.bio}
              </p>
            )}

            {/* TAGS */}
            {mentor.expertise?.length >
              0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {mentor.expertise
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="
                        px-4 py-2
                        rounded-full
                        text-xs
                        font-semibold
                        bg-gray-100
                        text-gray-700
                      "
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}

            {/* QR */}
            {qrDataUrl && (
              <div className="flex flex-col items-center gap-3 mt-2">
                <img
                  src={qrDataUrl}
                  alt="QR"
                  className="
                    w-[110px]
                    h-[110px]
                    sm:w-[120px]
                    sm:h-[120px]
                  "
                />

                <span className="text-xs text-gray-400 tracking-[0.2em] uppercase">
                  HelpMeMan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SHARE BAR */}
        <div
          className="
            fixed
            bottom-[max(14px,env(safe-area-inset-bottom))]
            left-1/2
            -translate-x-1/2
            z-50

            flex items-center gap-2 sm:gap-3

            px-3 sm:px-4
            py-2.5 sm:py-3

            rounded-full

            backdrop-blur-2xl

            border border-white/20

            shadow-[0_10px_40px_rgba(0,0,0,0.18)]

            w-fit
            max-w-[95vw]
            overflow-x-auto
          "
          style={{
            background:
              "rgba(255,255,255,0.78)",
          }}
        >
          {/* LINKEDIN */}
          <button
            onClick={() =>
              shareImage("linkedin")
            }
            className="
              w-[46px] h-[46px]
              sm:w-[52px] sm:h-[52px]

              rounded-full

              flex items-center justify-center

              transition-all duration-200

              hover:scale-110
              active:scale-95

              bg-white

              shadow-md

              border border-gray-100

              flex-shrink-0
            "
          >
            <FaLinkedin
              size={22}
              color="#0077B5"
            />
          </button>

          {/* WHATSAPP */}
          <button
            onClick={() =>
              shareImage("whatsapp")
            }
            className="
              w-[46px] h-[46px]
              sm:w-[52px] sm:h-[52px]

              rounded-full

              flex items-center justify-center

              transition-all duration-200

              hover:scale-110
              active:scale-95

              bg-white

              shadow-md

              border border-gray-100

              flex-shrink-0
            "
          >
            <FaWhatsapp
              size={24}
              color="#25D366"
            />
          </button>

          {/* FACEBOOK */}
          <button
            onClick={() =>
              shareImage("facebook")
            }
            className="
              w-[46px] h-[46px]
              sm:w-[52px] sm:h-[52px]

              rounded-full

              flex items-center justify-center

              transition-all duration-200

              hover:scale-110
              active:scale-95

              bg-white

              shadow-md

              border border-gray-100

              flex-shrink-0
            "
          >
            <FaFacebook
              size={22}
              color="#1877F2"
            />
          </button>

          {/* INSTAGRAM */}
          <button
            onClick={() =>
              shareImage("instagram")
            }
            className="
              w-[46px] h-[46px]
              sm:w-[52px] sm:h-[52px]

              rounded-full

              flex items-center justify-center

              transition-all duration-200

              hover:scale-110
              active:scale-95

              bg-white

              shadow-md

              border border-gray-100

              flex-shrink-0
            "
          >
            <FaInstagram
              size={24}
              color="#E1306C"
            />
          </button>

          {/* SAVE */}
          <button
            onClick={handleSaveImage}
            className="
              w-[46px] h-[46px]
              sm:w-[52px] sm:h-[52px]

              rounded-full

              flex items-center justify-center

              transition-all duration-200

              hover:scale-110
              active:scale-95

              bg-white

              shadow-md

              border border-gray-100

              flex-shrink-0
            "
          >
            <Download
              size={20}
              color="#111827"
            />
          </button>
        </div>
      </div>
    </div>
  );
}