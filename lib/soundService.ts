/**
 * Professional Sound Service for HelpMeMan
 * Uses Web Audio API synthesis for zero latency, zero network dependence,
 * zero asset 404s, and a pristine executive sound experience.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private hasPlayedForSession: Set<string> = new Set();

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Plays a warm, crisp, executive success chime.
   * Harmonic sequence (C Major resonant arpeggio):
   * C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz) -> C6 (1046.50 Hz)
   */
  public playSuccessSound(volume: number = 0.35, sessionId?: string): void {
    if (sessionId) {
      if (this.hasPlayedForSession.has(sessionId)) return;
      this.hasPlayedForSession.add(sessionId);
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const startTime = ctx.currentTime;
      const notes = [
        { freq: 523.25, timeOffset: 0.0, duration: 0.25, gainRatio: 0.45 },
        { freq: 659.25, timeOffset: 0.07, duration: 0.28, gainRatio: 0.55 },
        { freq: 783.99, timeOffset: 0.15, duration: 0.35, gainRatio: 0.65 },
        { freq: 1046.5, timeOffset: 0.23, duration: 0.6, gainRatio: 0.8 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, startTime + note.timeOffset);

        const noteStart = startTime + note.timeOffset;
        const peakGain = volume * note.gainRatio;

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(peakGain, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + note.duration);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });
    } catch {
      // Audio playback errors are caught safely without throwing
    }
  }
}

export const soundService = new SoundService();
export const playSuccessSound = (volume?: number, sessionId?: string) =>
  soundService.playSuccessSound(volume, sessionId);
