import { useState, useEffect } from "react";
import { getUser, getAccessToken, clearAuth, isTokenExpired } from "../lib/auth";
import { api } from "../lib/api";
import type { UserContext } from "../lib/types";

export function useAuth(allowedRoles?: ("admin" | "trainer" | "receptionist" | "member")[]) {
  const [user, setUserState] = useState<UserContext | null>(getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/prohealthclub/login";
      }
      return;
    }

    let isMounted = true;

    api
      .get<UserContext>("/api/v1/auth/me")
      .then((freshUser) => {
        if (isMounted) {
          if (allowedRoles && !allowedRoles.includes(freshUser.role)) {
            // Redirect to appropriate dashboard if not allowed
            const roleRedirects = {
              admin: "/prohealthclub/admin",
              receptionist: "/prohealthclub/reception",
              trainer: "/prohealthclub/trainer",
              member: "/prohealthclub/member",
            };
            if (typeof window !== "undefined") {
              window.location.href = roleRedirects[freshUser.role] || "/prohealthclub/login";
            }
            return;
          }
          setUserState(freshUser);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch user context");
          setLoading(false);
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/prohealthclub/login";
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading, error };
}
