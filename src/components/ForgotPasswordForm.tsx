import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { api } from "../lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/forgot-password", { email });
      setSubmitted(true);
      toast.success("Recovery request processed.");
    } catch (err: any) {
      // Show success anyway to prevent email enumeration
      setSubmitted(true);
      console.warn("Error during password recovery request: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-white bg-[#0f0f0f] border border-white/5 p-8 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">
          Recover <span className="text-[#FF6B00]">Password</span>
        </h2>
        <p className="text-sm text-slate-400">
          Enter your email to receive recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6 text-center animate-in fade-in duration-300">
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
            If this email is registered, a reset link has been sent to your inbox.
          </div>
          <a
            href="/login"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#FF6B00] hover:text-[#FF6B00]/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </a>
        </div>
      ) : (
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
                className="pl-11 h-11 border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-[#FF6B00] focus-visible:border-[#FF6B00] rounded-lg shadow-sm w-full"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-[#FF6B00]/20 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </Button>

          <div className="text-center pt-2">
            <a
              href="/login"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
