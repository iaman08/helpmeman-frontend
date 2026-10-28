/** Shared timings for user interface feedback; marketing sequences opt in explicitly. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const MOTION_DURATION = {
  press: 0.16,
  feedback: 0.15,
  surface: 0.2,
  dialog: 0.24,
} as const;
