"use client";

/**
 * Professional Chat Sound Service for HelpMeMan
 * Provides subtle, modern audio feedback for messaging.
 * Uses Web Audio API synthesis for zero latency, zero network dependence,
 * smooth concurrency, and zero memory leaks.
 */
class ChatSoundService {
  private enabled: boolean = true;
  private volume: number = 0.25; // Default 25% volume
  private audioCtx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private playedMessageIds: Set<string> = new Set();
  private maxStoredMsgIds: number = 100;
  private lastSendTime: number = 0;
  private lastReceiveTime: number = 0;
  private minIntervalMs: number = 40; // Throttle interval for rapid bursts

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("helpmeman.chatSounds");
      if (saved !== null) {
        this.enabled = saved === "true";
      }
    }
  }

  /**
   * Initializes AudioContext and sets up passive user interaction listeners
   * to satisfy browser autoplay restrictions. Safe to call multiple times.
   */
  public preloadSounds(): void {
    if (typeof window === "undefined") return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === "suspended") {
        const unlock = () => {
          if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume().then(() => {
              this.isUnlocked = true;
            }).catch(() => {});
          } else {
            this.isUnlocked = true;
          }
          window.removeEventListener("click", unlock);
          window.removeEventListener("keydown", unlock);
          window.removeEventListener("touchstart", unlock);
          window.removeEventListener("pointerdown", unlock);
        };

        window.addEventListener("click", unlock, { passive: true, once: true });
        window.addEventListener("keydown", unlock, { passive: true, once: true });
        window.addEventListener("touchstart", unlock, { passive: true, once: true });
        window.addEventListener("pointerdown", unlock, { passive: true, once: true });
      } else if (this.audioCtx && this.audioCtx.state === "running") {
        this.isUnlocked = true;
      }
    } catch (err) {
      // Gracefully catch any AudioContext creation issue
    }
  }

  /**
   * Checks if sounds are currently enabled.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enables or disables chat sound effects and persists the preference to localStorage.
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("helpmeman.chatSounds", String(enabled));
    }
  }

  /**
   * Configures audio volume level (0.0 to 1.0). Default is 0.25 (25%).
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Checks whether the current page is an active chat page and document is in foreground.
   */
  public isChatPageActive(): boolean {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    
    // Tab must be active and visible
    if (document.hidden || document.visibilityState !== "visible") {
      return false;
    }

    const path = window.location.pathname.toLowerCase();
    const isChatPath =
      path.includes("/chat") ||
      path.includes("/messages") ||
      document.querySelector('[data-chat-active="true"]') !== null ||
      document.querySelector('[data-ai-chat-open="true"]') !== null;

    return isChatPath;
  }

  /**
   * Plays a subtle, modern send sound (~120ms ascending pitch pop/blip).
   */
  public playSendSound(): void {
    if (!this.enabled) return;

    // Fast burst throttle
    const now = Date.now();
    if (now - this.lastSendTime < this.minIntervalMs) return;
    this.lastSendTime = now;

    this.preloadSounds();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }

      const ctx = this.audioCtx;
      const startTime = ctx.currentTime;
      const duration = 0.12; // 120ms

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      
      // Frequency sweep from 440 Hz (A4) to 880 Hz (A5)
      osc.frequency.setValueAtTime(440, startTime);
      osc.frequency.exponentialRampToValueAtTime(880, startTime + duration * 0.8);

      // Volume envelope (smooth attack, exponential decay)
      const peakGain = this.volume * 0.8;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      // Cleanup
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      };
    } catch (err) {
      // Audio playback errors are caught silently without interrupting application flow
    }
  }

  /**
   * Plays a distinct, subtle receive sound (~180ms two-note melodic chime C5->E5).
   * @param messageId Optional message ID for deduplication across duplicate socket events.
   */
  public playReceiveSound(messageId?: string): void {
    if (!this.enabled) return;

    // Only play receive sound if chat page is active
    if (!this.isChatPageActive()) return;

    // Deduplication check
    if (messageId) {
      if (this.playedMessageIds.has(messageId)) {
        return; // Already played for this message
      }
      this.playedMessageIds.add(messageId);
      if (this.playedMessageIds.size > this.maxStoredMsgIds) {
        const first = this.playedMessageIds.values().next().value;
        if (first) this.playedMessageIds.delete(first);
      }
    }

    // Fast burst throttle
    const now = Date.now();
    if (now - this.lastReceiveTime < this.minIntervalMs) return;
    this.lastReceiveTime = now;

    this.preloadSounds();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }

      const ctx = this.audioCtx;
      const startTime = ctx.currentTime;

      // Two-note warm melodic chime (C5 = 523.25 Hz for 70ms, E5 = 659.25 Hz for 110ms)
      const notes = [
        { freq: 523.25, timeOffset: 0.0, duration: 0.08 },
        { freq: 659.25, timeOffset: 0.06, duration: 0.12 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, startTime + note.timeOffset);

        const peakGain = this.volume * 0.7;
        const noteStart = startTime + note.timeOffset;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(peakGain, noteStart + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + note.duration);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (_) {}
        };
      });
    } catch (err) {
      // Silently handle errors
    }
  }
}

export const chatSoundService = new ChatSoundService();
