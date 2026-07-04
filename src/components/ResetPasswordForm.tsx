import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../lib/api";

interface Props {
  token: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/\d/.test(pwd)) return "Password must contain at least one digit.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/reset-password", {
        token,
        new_password: newPassword,
      });
      setStatus("success");
      toast.success("Password updated successfully!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      const msg = err.message || "This reset link has expired or already been used.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-white bg-[#0f0f0f] border border-white/5 p-8 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
          Reset <span className="text-[#FF6B00]">Password</span>
        </h2>
        <p className="text-sm text-slate-400">
          Enter your new password below.
        </p>
      </div>

      {status === "success" && (
        <div className="space-y-6 text-center animate-in fade-in duration-300">
          <div className="flex justify-center text-emerald-500">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-slate-300">
            Password updated successfully! Redirecting to login...
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-6 text-center animate-in fade-in duration-300">
          <div className="flex justify-center text-rose-500">
            <XCircle className="h-16 w-16" />
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-slate-300">
            {errorMessage}
          </div>
          <a
            href="/forgot-password"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#FF6B00] hover:text-[#FF6B00]/80 transition-colors"
          >
            <span>Request a New Reset Link</span>
          </a>
        </div>
      )}

      {status === "idle" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-11 pr-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00] rounded-lg shadow-sm w-full"
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
            {/* Complexity Indicator Guidelines */}
            <div className="text-[10px] text-slate-500 space-y-0.5 mt-1 font-semibold leading-relaxed">
              <p>• Minimum 8 characters</p>
              <p>• At least one uppercase letter (A-Z)</p>
              <p>• At least one digit (0-9)</p>
              <p>• At least one special symbol (!@#$%^&*)</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 pr-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00] rounded-lg shadow-sm w-full"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[#FF6B00]/20 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? "Resetting password..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
