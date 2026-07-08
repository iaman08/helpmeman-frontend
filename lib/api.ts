import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("helpmeman.com"))
  ) {
    return "https://helpmeman-backend-7r53z.ondigitalocean.app/api";
  }
  return "http://localhost:8080/api";
};

export const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

/* ─── Request interceptor: attach token ─── */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("helpmeman.accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ─── Response interceptor: auto-refresh on 401 ─── */
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !original._retry &&
      typeof window !== "undefined"
    ) {
      const refreshToken = localStorage.getItem("helpmeman.refreshToken");
      if (!refreshToken) {
        // No refresh token — clear session and redirect to landing
        localStorage.clear();
        sessionStorage.clear();
        try {
          document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        } catch {}
        window.location.replace("/");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (original.headers) {
            original.headers.Authorization = `Bearer ${token}`;
          }
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });

        const newToken = data.accessToken as string;
        localStorage.setItem("helpmeman.accessToken", newToken);
        document.cookie = `helpmeman.accessToken=${newToken};path=/;max-age=31536000;SameSite=Lax`;
        processQueue(null, newToken);

        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        sessionStorage.clear();
        try {
          document.cookie.split(";").forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        } catch {}
        window.location.replace("/");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
