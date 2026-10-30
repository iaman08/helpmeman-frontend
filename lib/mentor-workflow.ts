export type OnboardingStage = "role" | "method_choice" | "linkedin" | "name" | "preparing" | "tour" | "chat";

export function onboardingStage(state: { role: string | null; currentQuestion: number; answers: unknown[] }, params: { linkedIn: boolean; manual: boolean }): OnboardingStage {
  if (state.role !== "MENTOR") return "role";
  if (params.linkedIn) return "linkedin";
  if (state.currentQuestion > 0 || state.answers.length > 0) return "chat";
  return params.manual ? "name" : "method_choice";
}

export function mentorAnswerError(key: string, answer: string, skip = false): string | null {
  if (skip) return ["full_name", "email_address", "mentor_track"].includes(key) ? "Please answer this question to continue." : null;
  const value = answer.trim();
  if (!value) return "Please enter an answer.";
  if (value.length > 10000) return "Please keep your answer under 10,000 characters.";
  if (key === "full_name" && (value.length < 2 || value.length > 100)) return "Enter a name between 2 and 100 characters.";
  if (key === "email_address" && (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return "Enter a valid email address.";
  return null;
}

export function mentorSignupError(name: string, email: string, password: string): string | null {
  if (name.trim().length < 2 || name.trim().length > 100) return "Enter a name between 2 and 100 characters.";
  if (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
  if (password.length < 8 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return "Use 8–128 characters with an uppercase letter, a lowercase letter, and a number.";
  return null;
}

export function mentorDraftError(form: { displayName: string; bio: string; experienceYears: number; pricePerSession: number; availabilities: Array<{ dayOfWeek: number; startTime: string; endTime: string }> }): string | null {
  if (!form.displayName.trim() || form.displayName.length > 100) return "Enter a display name of up to 100 characters.";
  if (!form.bio.trim() || form.bio.length > 10000) return "Enter a bio of up to 10,000 characters.";
  if (!Number.isInteger(form.experienceYears) || form.experienceYears < 0 || form.experienceYears > 100) return "Enter experience from 0 to 100 years.";
  if (!Number.isFinite(form.pricePerSession) || form.pricePerSession < 0 || form.pricePerSession > 1000000) return "Enter a valid session price.";
  const slots = form.availabilities;
  if (slots.some(slot => !Number.isInteger(slot.dayOfWeek) || slot.dayOfWeek < 0 || slot.dayOfWeek > 6 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.endTime) || slot.startTime >= slot.endTime)) return "Each availability needs a valid start and end time.";
  if (slots.some((a, i) => slots.slice(i + 1).some(b => a.dayOfWeek === b.dayOfWeek && a.startTime < b.endTime && b.startTime < a.endTime))) return "Availability slots cannot overlap.";
  return null;
}
