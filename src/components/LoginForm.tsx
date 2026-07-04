import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../lib/api";
import { setTokens, setUser } from "../lib/auth";
import type { LoginResponse, UserContext } from "../lib/types";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    try {
      // 1. Authenticate with JSON payload expected by FastAPI LoginRequest
      const loginRes = await fetch(
        `${import.meta.env.PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: loginEmail, password: loginPass }),
        }
      );

      if (!loginRes.ok) {
        let errMsg = "Invalid email or password";
        try {
          const errBody = await loginRes.json();
          if (errBody?.error?.message) errMsg = errBody.error.message;
        } catch {}
        throw new Error(errMsg);
      }

      const rawBody = await loginRes.json();
      const loginData: LoginResponse = rawBody.success ? rawBody.data : rawBody;

      // 2. Set tokens in localStorage and cookies
      setTokens(loginData.access_token, loginData.refresh_token);

      // 3. Fetch user details
      const userContext = await api.get<UserContext>("/api/v1/auth/me");

      // 4. Save user details in storage and cookie
      setUser(userContext);

      toast.success(`Successfully signed in as ${userContext.profile?.full_name || userContext.email}!`);

      // 5. Redirect based on user role — direct to role dashboard (no /dashboard hop)
      const roleRedirects: Record<string, string> = {
        admin: "/admin",
        receptionist: "/reception",
        trainer: "/trainer",
        member: "/member",
      };
      // Small delay so toast renders, then redirect
      setTimeout(() => {
        window.location.replace(roleRedirects[userContext.role] || "/login");
      }, 500);
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    executeLogin(email, password);
  };

  const handleQuickLogin = (role: "admin" | "receptionist" | "trainer" | "member") => {
    const creds = {
      admin: { u: "admin@prrohealthclub.com", p: "Admin@123" },
      receptionist: { u: "reception@prrohealthclub.com", p: "Reception@123" },
      trainer: { u: "trainer@prrohealthclub.com", p: "Trainer@123" },
      member: { u: "member1@prrohealthclub.com", p: "Member1@123" },
    };

    const target = creds[role];
    setEmail(target.u);
    setPassword(target.p);
    executeLogin(target.u, target.p);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
          Welcome <span className="text-primary">Back</span> !
        </h2>
        <p className="text-sm text-slate-400">
          Sign in to access the Prro Health Club ERP gateway.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary rounded-lg shadow-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary rounded-lg shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-sm pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              className="border-slate-600 rounded text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label htmlFor="remember" className="text-sm font-semibold cursor-pointer text-slate-400 hover:text-white select-none">
              Remember me
            </Label>
          </div>
          <a
            href="/forgot-password"
            className="font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password
          </a>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11 font-bold text-sm bg-primary hover:bg-primary/95 text-white shadow-md rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Quick Demo Login
        </span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      {/* Quick Fill Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={() => handleQuickLogin("admin")}
          className="h-10 bg-slate-800/80 hover:bg-slate-700 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all"
          disabled={loading}
        >
          Admin Portal
        </Button>
        <Button
          type="button"
          onClick={() => handleQuickLogin("receptionist")}
          className="h-10 bg-slate-800/80 hover:bg-slate-700 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-all"
          disabled={loading}
        >
          Receptionist Desk
        </Button>
        <Button
          type="button"
          onClick={() => handleQuickLogin("trainer")}
          className="h-10 bg-slate-800/80 hover:bg-slate-700 border border-green-500/20 text-green-400 text-xs font-bold rounded-lg transition-all"
          disabled={loading}
        >
          Trainer Panel
        </Button>
        <Button
          type="button"
          onClick={() => handleQuickLogin("member")}
          className="h-10 bg-slate-800/80 hover:bg-slate-700 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg transition-all"
          disabled={loading}
        >
          Member Card
        </Button>
      </div>

      {/* Footer Text */}
      <div className="text-center text-sm text-slate-400 pt-2">
        Don't have an account?{" "}
        <a
          href="#signup"
          onClick={(e) => {
            e.preventDefault();
            toast.info("Member registration is handled at the front desk!");
          }}
          className="font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Contact Reception
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
