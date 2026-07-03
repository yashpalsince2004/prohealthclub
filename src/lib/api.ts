import { getAccessToken, getRefreshToken, setTokens, clearAuth } from "./auth";
import type { ApiResponse, ApiSuccess, ApiError as ApiErrorInterface } from "./types";

const BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  code: string;
  details: Record<string, unknown>;

  constructor(message: string, code: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  
  // Attach auth token if available
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const finalOptions = {
    ...options,
    headers,
  };

  const response = await fetch(url, finalOptions);

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/prohealthclub/login";
      }
      throw new ApiError("Session expired", "UNAUTHENTICATED");
    }

    // Attempt token refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Refresh token invalid");
        }

        const refreshData: ApiResponse<{ access_token: string; refresh_token: string }> = await refreshResponse.json();
        
        if (refreshData.success) {
          const { access_token, refresh_token } = refreshData.data;
          setTokens(access_token, refresh_token);
          isRefreshing = false;
          onRefreshed(access_token);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (err) {
        isRefreshing = false;
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/prohealthclub/login";
        }
        throw new ApiError("Session expired", "UNAUTHENTICATED");
      }
    }

    // Wait for the token refresh and retry
    return new Promise<T>((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        headers.set("Authorization", `Bearer ${newToken}`);
        fetch(url, { ...options, headers })
          .then(async (res) => {
            const body: ApiResponse<T> = await res.json();
            if (body.success) {
              resolve(body.data);
            } else {
              reject(new ApiError(body.error.message, body.error.code, body.error.details));
            }
          })
          .catch(reject);
      });
    });
  }

  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch (parseErr) {
    if (response.ok) {
      return {} as T;
    }
    throw new ApiError("Failed to parse response payload", "SERVER_ERROR");
  }

  if (!body.success) {
    throw new ApiError(body.error.message, body.error.code, body.error.details);
  }

  return body.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json" },
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
