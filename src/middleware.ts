import { defineMiddleware } from "astro:middleware";

const ROLE_DASHBOARDS: Record<string, string> = {
  admin: "/admin",
  receptionist: "/reception",
  trainer: "/trainer",
  member: "/member",
};

// Paths that require authentication (server-side check via cookie)
const PROTECTED_PREFIXES = ["/admin", "/reception", "/trainer", "/member"];

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";

  // If the user has a role cookie and visits /login → send them to their dashboard
  if (path === "/login") {
    const role = context.cookies.get("prro_role")?.value;
    if (role && ROLE_DASHBOARDS[role]) {
      return context.redirect(ROLE_DASHBOARDS[role]);
    }
  }

  // If the user has NO role cookie and visits a protected path → send to /login
  const isProtected = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (isProtected) {
    const role = context.cookies.get("prro_role")?.value;
    if (!role) {
      return context.redirect("/login");
    }
  }

  return next();
});
