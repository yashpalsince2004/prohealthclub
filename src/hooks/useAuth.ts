import { useState, useEffect } from "react";
import { getUser, getAccessToken, setUser, clearAuth, isTokenExpired } from "../lib/auth";
import { api, ApiError } from "../lib/api";
import type { UserContext } from "../lib/types";

type AllowedRole = "admin" | "trainer" | "receptionist" | "member";

const ROLE_DASHBOARDS: Record<AllowedRole, string> = {
  admin: "/admin",
  receptionist: "/reception",
  trainer: "/trainer",
  member: "/member",
};

function redirectTo(path: string) {
  if (typeof window !== "undefined") {
    window.location.replace(path);
  }
}

/**
 * useAuth — THE single source of truth for authentication state.
 *
 * Responsibilities:
 * - Verifies the access token is present and not expired.
 * - Calls /auth/me to fetch a fresh user context from the server.
 * - Saves the user to localStorage on success.
 * - If auth fails for any reason: clears storage and redirects to /login.
 * - If the user's role doesn't match allowedRoles: redirects to their correct dashboard.
 *
 * Nothing else in the app should redirect on auth failure.
 */
export function useAuth(allowedRoles?: AllowedRole[]) {
  const [user, setUserState] = useState<UserContext | null>(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = getAccessToken();

      // 1. No token or expired token → go to login immediately
      if (!token || isTokenExpired(token)) {
        clearAuth();
        redirectTo("/login");
        return;
      }

      try {
        // 2. Fetch fresh user from server (api.ts handles token refresh silently)
        const freshUser = await api.get<UserContext>("/api/v1/auth/me");

        if (cancelled) return;

        // 3. Wrong role for this page → redirect to their correct dashboard
        if (allowedRoles && !allowedRoles.includes(freshUser.role)) {
          redirectTo(ROLE_DASHBOARDS[freshUser.role] || "/login");
          return;
        }

        // 4. All good — save and expose user
        setUser(freshUser);
        setUserState(freshUser);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        // 5. Any auth error (UNAUTHENTICATED or network) → clear and go to login
        if (err instanceof ApiError && err.code === "UNAUTHENTICATED") {
          clearAuth();
          redirectTo("/login");
        } else {
          // Non-auth error (network outage, etc.) — still clear and redirect
          // to avoid leaving the user on a broken auth state
          clearAuth();
          redirectTo("/login");
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
