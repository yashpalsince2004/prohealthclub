import { getAccessToken, getRefreshToken, setTokens, clearAuth } from "./auth";
import type { ApiResponse } from "./types";

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

// Token refresh state — prevents concurrent refresh storms
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function apiFetch<T>(
  path: string, 
  options: RequestInit = {}, 
  returnEnvelope = false
): Promise<any> {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  // Attach auth token if available
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  // ── 401 handling: attempt silent token refresh ──────────────────────────
  if (response.status === 401) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // No refresh token — session is fully dead. Throw; useAuth redirects.
      clearAuth();
      throw new ApiError("Session expired. Please log in again.", "UNAUTHENTICATED");
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) throw new Error("Refresh rejected");

        const refreshData: ApiResponse<{ access_token: string; refresh_token: string }> =
          await refreshResponse.json();

        if (refreshData.success) {
          const { access_token, refresh_token } = refreshData.data;
          setTokens(access_token, refresh_token);
          isRefreshing = false;
          onRefreshed(access_token);
        } else {
          throw new Error("Refresh payload invalid");
        }
      } catch {
        isRefreshing = false;
        clearAuth();
        // Throw — useAuth decides whether to redirect to /login
        throw new ApiError("Session expired. Please log in again.", "UNAUTHENTICATED");
      }
    }

    // Queue request until refresh completes, then retry with new token
    return new Promise<any>((resolve, reject) => {
      subscribeTokenRefresh(async (newToken) => {
        headers.set("Authorization", `Bearer ${newToken}`);
        try {
          const retryRes = await fetch(url, { ...options, headers });
          const retryBody: ApiResponse<T> = await retryRes.json();
          if (retryBody.success) {
            resolve(returnEnvelope ? retryBody : retryBody.data);
          } else {
            reject(
              new ApiError(retryBody.error.message, retryBody.error.code, retryBody.error.details)
            );
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }
  // ────────────────────────────────────────────────────────────────────────

  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    if (response.ok) return returnEnvelope ? { success: true, data: {} as T } : {} as T;
    throw new ApiError("Failed to parse server response", "SERVER_ERROR");
  }

  if (!body.success) {
    throw new ApiError(body.error.message, body.error.code, body.error.details);
  }

  return returnEnvelope ? body : body.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  getEnvelope: <T>(path: string) => apiFetch<T>(path, {}, true),
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
  delete: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
      headers: body ? { "Content-Type": "application/json" } : undefined,
    }),
};
