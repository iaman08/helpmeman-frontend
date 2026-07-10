import useSWR from "swr";
import api from "./api";
import { useAuth } from "./auth-context";
import type {
  Mentor,
  MentorSearchResponse,
  MentorAvailabilityResponse,
  Category,
  Booking,
  Notification,
} from "./types";

/* ─── Generic fetcher ─── */
async function fetcher<T>(urlOrArray: string | [string, string]): Promise<T> {
  const url = Array.isArray(urlOrArray) ? urlOrArray[0] : urlOrArray;
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
  const { user } = useAuth();
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  const key = user?.id ? [`/users/me/bookings?${params}`, user.id] as [string, string] : null;
  return useSWR<{
    bookings: Booking[];
    total: number;
    page: number;
    totalPages: number;
  }>(key, fetcher, { revalidateOnFocus: false });
}

/* ─── Notifications ─── */
export function useNotifications(type?: string) {
  const { user } = useAuth();
  const url = type ? `/users/me/notifications?type=${type}` : "/users/me/notifications";
  const key = user?.id ? [url, user.id] as [string, string] : null;
  return useSWR<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
  }>(key, fetcher, {
    refreshInterval: 30_000,
  });
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const key = user?.id ? ["/users/me/notification-preferences", user.id] as [string, string] : null;
  return useSWR<{ preferences: import("./types").NotificationPreferences }>(
    key,
    fetcher,
    { revalidateOnFocus: false }
  );
}
