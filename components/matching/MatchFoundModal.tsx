"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, BookOpen, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import type { ScoredMentor } from "./useSwipeEngine";
import styles from "./MatchFoundModal.module.css";

interface MatchFoundModalProps {
  mentor: ScoredMentor | null;
  onClose: () => void;
}

export function MatchFoundModal({ mentor, onClose }: MatchFoundModalProps) {
  return mentor ? <PriorityDialog key={mentor.id} mentor={mentor} onClose={onClose} /> : null;
}

function PriorityDialog({ mentor, onClose }: { mentor: ScoredMentor; onClose: () => void }) {
  const [open, setOpen] = useState(true);
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const avatarUrl = mentor.avatar || mentor.user?.avatar;
  const name = mentor.displayName || mentor.user?.name || "Mentor";
  const initials = name.split(" ").filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} onOpenChangeComplete={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Viewport className={styles.viewport}>
          <Dialog.Popup className={styles.popup}>
            <Dialog.Close className={styles.close} aria-label="Close priority mentor"><X size={17} /></Dialog.Close>
            <span className={styles.badge} aria-hidden="true"><Star size={23} /></span>
            <Dialog.Title className={styles.title}>Your priority mentor</Dialog.Title>
            <Dialog.Description className={styles.description}>Keep this person in mind as you explore your next step.</Dialog.Description>
            <div className={styles.person}>
              {avatarUrl && failedAvatar !== avatarUrl ? <img src={avatarUrl} alt={name} width={52} height={52} onError={() => setFailedAvatar(avatarUrl)} /> : <span className={styles.initials}>{initials}</span>}
              <div className={styles.identity}><strong>{name}</strong>{mentor.currentRole && <span>{mentor.currentRole}</span>}{mentor.institutionName && <span>{mentor.institutionName}</span>}</div>
              {Number.isFinite(mentor.matchScore) && <span className={styles.score}><strong>{Math.round(mentor.matchScore)}%</strong>Fit</span>}
            </div>
            <Link href={`/book/${mentor.id}`} onClick={() => setOpen(false)} className={styles.primary}><BookOpen size={16} aria-hidden="true" />Book a session</Link>
            <Link href={`/mentors/${mentor.id}?from=discover`} onClick={() => setOpen(false)} className={styles.secondary}><MessageCircle size={16} aria-hidden="true" />View full profile</Link>
            <Dialog.Close className={styles.continue}>Keep discovering mentors</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
