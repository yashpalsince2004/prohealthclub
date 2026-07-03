import { d as defineMiddleware, s as sequence } from './chunks/sequence_C_6OXDIK.mjs';
import 'piccolore';
import 'clsx';

const onRequest$1 = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/$/, "");
  if (path === "/login" || path === "/login/") {
    const roleCookie = context.cookies.get("prro_role")?.value;
    if (roleCookie) {
      const roleRedirects = {
        admin: "/admin",
        receptionist: "/reception",
        trainer: "/trainer",
        member: "/member"
      };
      const redirectPath = roleRedirects[roleCookie];
      if (redirectPath) {
        return context.redirect(redirectPath);
      }
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
