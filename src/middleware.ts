import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);

  // Normalize path by stripping base and trailing slash
  const path = url.pathname.replace(/\/$/, "");

  // If user goes to login page and already has a role cookie, redirect to their dashboard
  if (path === "/prohealthclub/login" || path === "/prohealthclub/login/") {
    const roleCookie = context.cookies.get("prro_role")?.value;
    if (roleCookie) {
      const roleRedirects: Record<string, string> = {
        admin: "/prohealthclub/admin",
        receptionist: "/prohealthclub/reception",
        trainer: "/prohealthclub/trainer",
        member: "/prohealthclub/member",
      };
      const redirectPath = roleRedirects[roleCookie];
      if (redirectPath) {
        return context.redirect(redirectPath);
      }
    }
  }

  return next();
});
