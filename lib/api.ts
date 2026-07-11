import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const getApiBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("helpmeman.com"))
  ) {
    return "https://helpmeman-backend-7r53z.ondigitalocean.app/api";
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:8080/api";
};

export const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  },
  timeout: 15_000,
});

let startLoaderCallback: ((show: boolean) => void) | null = null;
let stopLoaderCallback: ((show: boolean) => void) | null = null;

export function registerApiLoader(
  start: (show: boolean) => void,
  stop: (show: boolean) => void
) {
  startLoaderCallback = start;
  stopLoaderCallback = stop;
}

/* ─── Request interceptor: attach token ─── */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const showLoader = config.headers?.["x-show-loader"] === "true";

  if (showLoader) {
    (config as any)._showLoader = true;
  }

  if (startLoaderCallback) {
    startLoaderCallback(showLoader);
  }

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
  (res) => {
    const show = res.config && (res.config as any)._showLoader;
    if (stopLoaderCallback) stopLoaderCallback(show);
    return res;
  },
  async (error: AxiosError) => {
    const show = error?.config && (error.config as any)._showLoader;
    if (stopLoaderCallback) stopLoaderCallback(show);
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthRoute = original?.url?.includes("/auth/");

    if (
      error.response?.status === 401 &&
      !isAuthRoute &&
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
        if (data.refreshToken) {
          localStorage.setItem("helpmeman.refreshToken", data.refreshToken);
        }
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
