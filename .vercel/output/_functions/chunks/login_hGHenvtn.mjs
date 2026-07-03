import { $ as $$Layout } from './Layout_DJ57xND-.mjs';
import { c as createComponent } from './astro-component_DFzFZJkT.mjs';
import 'piccolore';
import { I as renderTemplate, u as maybeRenderHead, _ as addAttribute } from './sequence_C_6OXDIK.mjs';
import { r as renderComponent } from './entrypoint_DzPIJZEz.mjs';
import { r as renderScript } from './script_cZabxOrM.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import * as React from 'react';
import { useState } from 'react';
import { Check, Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { c as cn, L as Label, I as Input, B as Button, h as heroImage, l as logo } from './logo_bEuTxbUc.mjs';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { toast } from 'sonner';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const ACCESS_TOKEN_KEY = "prro_access_token";
const REFRESH_TOKEN_KEY = "prro_refresh_token";
const USER_KEY = "prro_user";
function setCookie(name, value, maxAgeSeconds) {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax; Secure`;
  }
}
function deleteCookie(name) {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`;
  }
}
function setTokens(accessToken, refreshToken) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setCookie(ACCESS_TOKEN_KEY, accessToken, 30 * 24 * 60 * 60);
  }
}
function getAccessToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}
function getRefreshToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}
function setUser(user) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setCookie("prro_role", user.role, 30 * 24 * 60 * 60);
  }
}
function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie("prro_role");
  }
}

const BASE_URL = "https://your-railway-app.up.railway.app";
class ApiError extends Error {
  code;
  details;
  constructor(message, code, details = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}
let isRefreshing = false;
let refreshSubscribers = [];
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const finalOptions = {
    ...options,
    headers
  };
  const response = await fetch(url, finalOptions);
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired", "UNAUTHENTICATED");
    }
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
        if (!refreshResponse.ok) {
          throw new Error("Refresh token invalid");
        }
        const refreshData = await refreshResponse.json();
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
          window.location.href = "/login";
        }
        throw new ApiError("Session expired", "UNAUTHENTICATED");
      }
    }
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        headers.set("Authorization", `Bearer ${newToken}`);
        fetch(url, { ...options, headers }).then(async (res) => {
          const body2 = await res.json();
          if (body2.success) {
            resolve(body2.data);
          } else {
            reject(new ApiError(body2.error.message, body2.error.code, body2.error.details));
          }
        }).catch(reject);
      });
    });
  }
  let body;
  try {
    body = await response.json();
  } catch (parseErr) {
    if (response.ok) {
      return {};
    }
    throw new ApiError("Failed to parse response payload", "SERVER_ERROR");
  }
  if (!body.success) {
    throw new ApiError(body.error.message, body.error.code, body.error.details);
  }
  return body.data;
}
const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : void 0,
    headers: { "Content-Type": "application/json" }
  }),
  patch: (path, body) => apiFetch(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : void 0,
    headers: { "Content-Type": "application/json" }
  }),
  delete: (path) => apiFetch(path, { method: "DELETE" })
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const executeLogin = async (loginEmail, loginPass) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", loginEmail);
      formData.append("password", loginPass);
      const loginRes = await fetch(
        `${"https://your-railway-app.up.railway.app"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData
        }
      );
      if (!loginRes.ok) {
        let errMsg = "Invalid email or password";
        try {
          const errBody = await loginRes.json();
          if (errBody?.error?.message) errMsg = errBody.error.message;
        } catch {
        }
        throw new Error(errMsg);
      }
      const rawBody = await loginRes.json();
      const loginData = rawBody.success ? rawBody.data : rawBody;
      setTokens(loginData.access_token, loginData.refresh_token);
      const userContext = await api.get("/api/v1/auth/me");
      setUser(userContext);
      toast.success(`Successfully signed in as ${userContext.profile?.full_name || userContext.email}!`);
      setTimeout(() => {
        const roleRedirects = {
          admin: "/admin",
          receptionist: "/reception",
          trainer: "/trainer",
          member: "/member"
        };
        window.location.href = roleRedirects[userContext.role] || "/login";
      }, 1e3);
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    executeLogin(email, password);
  };
  const handleQuickLogin = (role) => {
    const creds = {
      admin: { u: "admin@prrohealthclub.com", p: "Admin@123" },
      receptionist: { u: "reception@prrohealthclub.com", p: "Reception@123" },
      trainer: { u: "trainer@prrohealthclub.com", p: "Trainer@123" },
      member: { u: "member1@prrohealthclub.com", p: "Member1@123" }
    };
    const target = creds[role];
    setEmail(target.u);
    setPassword(target.p);
    executeLogin(target.u, target.p);
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md mx-auto space-y-6 text-white", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-3xl font-extrabold tracking-tight text-white uppercase", children: [
        "Welcome ",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Back" }),
        " !"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Sign in to access the Prro Health Club ERP gateway." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "text-xs font-bold text-slate-300 uppercase tracking-wider", children: "Email Address" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              placeholder: "Enter your email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              className: "pl-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary rounded-lg shadow-sm",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", className: "text-xs font-bold text-slate-300 uppercase tracking-wider", children: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: showPassword ? "text" : "password",
              placeholder: "••••••••",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "pl-11 pr-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary rounded-lg shadow-sm",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowPassword(!showPassword),
              className: "absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors",
              children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm pt-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "remember",
              checked: rememberMe,
              onCheckedChange: (checked) => setRememberMe(!!checked),
              className: "border-slate-600 rounded text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            }
          ),
          /* @__PURE__ */ jsx(Label, { htmlFor: "remember", className: "text-sm font-semibold cursor-pointer text-slate-400 hover:text-white select-none", children: "Remember me" })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "#forgot-password",
            onClick: (e) => {
              e.preventDefault();
              toast.info("Password resets are managed at the front desk.");
            },
            className: "font-bold text-primary hover:text-primary/80 transition-colors",
            children: "Forgot password"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          className: "w-full h-11 font-bold text-sm bg-primary hover:bg-primary/95 text-white shadow-md rounded-lg transition-transform duration-150 hover:-translate-y-0.5",
          disabled: loading,
          children: loading ? "Signing in..." : "Sign in"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative flex py-1 items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-grow border-t border-slate-800" }),
      /* @__PURE__ */ jsx("span", { className: "flex-shrink mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest", children: "Quick Demo Login" }),
      /* @__PURE__ */ jsx("div", { className: "flex-grow border-t border-slate-800" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: () => handleQuickLogin("admin"),
          className: "h-10 bg-slate-800/80 hover:bg-slate-700 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all",
          disabled: loading,
          children: "Admin Portal"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: () => handleQuickLogin("receptionist"),
          className: "h-10 bg-slate-800/80 hover:bg-slate-700 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-all",
          disabled: loading,
          children: "Receptionist Desk"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: () => handleQuickLogin("trainer"),
          className: "h-10 bg-slate-800/80 hover:bg-slate-700 border border-green-500/20 text-green-400 text-xs font-bold rounded-lg transition-all",
          disabled: loading,
          children: "Trainer Panel"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          onClick: () => handleQuickLogin("member"),
          className: "h-10 bg-slate-800/80 hover:bg-slate-700 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg transition-all",
          disabled: loading,
          children: "Member Card"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center text-sm text-slate-400 pt-2", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "#signup",
          onClick: (e) => {
            e.preventDefault();
            toast.info("Member registration is handled at the front desk!");
          },
          className: "font-bold text-primary hover:text-primary/80 transition-colors",
          children: "Contact Reception"
        }
      )
    ] })
  ] });
};

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login - Prro Health Cllub", "description": "Log in to your account at Prro Health Cllub and continue your fitness journey." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center bg-[#070c0e] p-6 lg:p-8 z-10"> <!-- Premium background glowing gradients to simulate dark marble atmosphere --> <div class="absolute inset-0 pointer-events-none z-0"> <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]"></div> <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#0e4859]/20 blur-[150px]"></div>  <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div> </div> <a href="/" class="absolute top-10 left-10 text-sm font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-2 group z-50 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform"> <path d="m15 18-6-6 6-6"></path> </svg>
Back to Home
</a> <!-- Outer Card (Split View, stretched to full viewport with equal margin on all sides) --> <div class="w-full h-full bg-[#111820] rounded-[2.5rem] overflow-hidden grid lg:grid-cols-12 shadow-[0_0_80px_-15px_rgba(255,92,36,0.25)] border border-primary/30 relative z-10 p-4 gap-4">  <div class="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-10 rounded-[1.8rem] overflow-hidden h-full">  <img${addAttribute(heroImage.src, "src")} alt="Gym Interior" class="absolute inset-0 w-full h-full object-cover scale-105">  <div class="absolute inset-0 bg-black/40 z-10"></div> <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>  <div class="relative z-20 flex flex-col justify-between h-full">  <div class="flex items-center space-x-3"> <img${addAttribute(logo.src, "src")} alt="Prro Health Cllub Logo" class="h-10 w-10 object-contain rounded-full border border-white/20"> <span class="text-lg font-black text-white tracking-wider">Prro Health Cllub</span> </div>  <div class="space-y-4 text-left"> <h3 class="text-3xl font-black leading-tight uppercase tracking-tight text-white">
Transform <br>
Your <span class="text-primary text-glow">Limits</span> !
</h3> <p class="text-xs text-gray-300 leading-relaxed font-semibold">
Log in to unlock exclusive deals, plan your schedules, and track your fitness progress with certified guidance.
</p> <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2">
Your journey starts here.
</div> </div> </div> </div>  <div class="lg:col-span-7 flex items-center justify-center p-6 sm:p-10 bg-transparent h-full overflow-y-auto"> ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/components/LoginForm", "client:component-export": "default" })} </div> </div> </div> ${renderScript($$result2, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/login.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/login.astro", void 0);

const $$file = "/Users/yashpal/Documents/Vibe_Project/Pro_health_club/prohealthclub-main/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
