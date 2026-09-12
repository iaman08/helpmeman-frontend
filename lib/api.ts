import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (
    !url &&
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("helpmeman.com"))
  ) {
    url = "https://api.helpmeman.com/api";
  }
  if (!url) {
    url = "http://localhost:8080/api";
  }
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

export const API_BASE = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
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

export function getCookieDomain(): string {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname;
  if (hostname.endsWith("helpmeman.com")) {
    return ";domain=.helpmeman.com";
  }
  return "";
}

export function setAuthCookies(accessToken: string, role?: string) {
  if (typeof window === "undefined") return;
  try {
    const isHttps = window.location.protocol === "https:";
    const secureFlag = isHttps ? ";Secure" : "";
    const domainFlag = getCookieDomain();

    document.cookie = `helpmeman.accessToken=${accessToken};path=/;max-age=31536000;SameSite=Lax${secureFlag}${domainFlag}`;
    if (role) {
      document.cookie = `helpmeman.role=${role};path=/;max-age=31536000;SameSite=Lax${secureFlag}${domainFlag}`;
    }
  } catch {}
}

export function clearAuthCookies() {
  if (typeof window === "undefined") return;
  try {
    const domainFlag = getCookieDomain();
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      if (domainFlag) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainFlag}`;
      }
    });
  } catch {}
}

/* ─── Request interceptor: attach token & dynamic baseURL ─── */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const showLoader = config.headers?.["x-show-loader"] === "true";

  if (showLoader) {
    (config as any)._showLoader = true;
  }

  if (startLoaderCallback) {
    startLoaderCallback(showLoader);
  }

  // Ensure baseURL is resolved dynamically if on client
  if (typeof window !== "undefined" && config.baseURL !== getApiBaseUrl()) {
    config.baseURL = getApiBaseUrl();
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
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      const url = (error.config?.baseURL || "") + (error.config?.url || "");
      const method = error.config?.method?.toUpperCase() || "UNKNOWN";
      console.groupCollapsed(`🚨 [API Error] ${method} ${url}`);
      console.error(`Error Message: ${error.message}`);
      if (error.response) {
        console.error(`Status Code: ${error.response.status}`);
        console.log("Response Body:", error.response.data);
      }
      console.groupEnd();
    }

    const show = error?.config && (error.config as any)._showLoader;
    if (stopLoaderCallback) stopLoaderCallback(show);
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthRoute = original?.url?.includes("/auth/");

    // If request failed on an auth route (e.g. /auth/login), do not trigger auto-logout
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !original._retry &&
      typeof window !== "undefined"
    ) {
      const refreshToken = localStorage.getItem("helpmeman.refreshToken");
      if (!refreshToken) {
        const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
        if (isOffline) {
          return Promise.reject(error);
        }
        // No refresh token — clear session and redirect to landing
        localStorage.clear();
        sessionStorage.clear();
        clearAuthCookies();
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
        const baseUrl = getApiBaseUrl();
        const { data } = await axios.post(`${baseUrl}/auth/refresh`, {
          refreshToken,
        }, {
          withCredentials: true
        });

        const newToken = data.accessToken as string;
        localStorage.setItem("helpmeman.accessToken", newToken);
        if (data.refreshToken) {
          localStorage.setItem("helpmeman.refreshToken", data.refreshToken);
        }
        setAuthCookies(newToken);
        processQueue(null, newToken);

        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(original);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        // Only wipe credentials if the server explicitly rejected the refresh token with a 401.
        // If the server is restarting/deploying (502, 503, network error), DO NOT clear session!
        if (refreshError?.response?.status === 401) {
          localStorage.clear();
          sessionStorage.clear();
          clearAuthCookies();
          window.location.replace("/");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
