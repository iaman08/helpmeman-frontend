import useSWR from "swr";
import api from "./api";
import type {
  Mentor,
  MentorSearchResponse,
  MentorAvailabilityResponse,
  Category,
  Booking,
  Notification,
} from "./types";

/* ─── Generic fetcher ─── */
async function fetcher<T>(url: string): Promise<T> {
  const { data } = await api.get<T>(url);
  return data;
}

/* ─── Mentor search ─── */
export interface MentorFilters {
  q?: string;
  category?: string;
  institutionType?: string;
  minPrice?: number;    
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

function buildQuery(filters: MentorFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) {
      params.set(k, String(v));
    }
  });
  const qs = params.toString();
  return `/mentors${qs ? `?${qs}` : ""}`;
}

export function useMentors(filters: MentorFilters = {}) {
  const key = buildQuery(filters);
  return useSWR<MentorSearchResponse>(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });
}

/* ─── Single mentor ─── */
export function useMentor(id: string | null) {
  return useSWR<{ mentor: Mentor }>(
    id ? `/mentors/${id}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );
}

/* ─── Mentor availability ─── */
export function useMentorAvailability(id: string | null) {
  return useSWR<MentorAvailabilityResponse>(
    id ? `/mentors/${id}/availability` : null,
    fetcher,
    { revalidateOnFocus: false },
  );
}

/* ─── Mentor reviews ─── */
export function useMentorReviews(
  id: string | null,
  page = 1,
) {
  return useSWR<{
    reviews: import("./types").Review[];
    total: number;
    page: number;
    totalPages: number;
  }>(
    id ? `/mentors/${id}/reviews?page=${page}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );
}

/* ─── Categories ─── */
export function useCategories() {
  return useSWR<{ categories: Category[] }>("/categories", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
}

/* ─── User bookings ─── */
export function useBookings(status?: string, page = 1) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  const key = `/users/me/bookings?${params}`;
  return useSWR<{
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  }>(key, fetcher, { revalidateOnFocus: false });
}

/* ─── Notifications ─── */
export function useNotifications() {
  return useSWR<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }>("/users/me/notifications", fetcher, {
    refreshInterval: 30_000,
  });
}
