import { useState } from "react";
import { LogOut } from "lucide-react";
import { clearAuth } from "../../lib/auth";
import { api } from "../../lib/api";
import { toast } from "sonner";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({ className = "", showText = true }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Trigger API logout safely
      await api.post("/api/v1/auth/logout").catch(() => {});
    } finally {
      // Always clear local auth state and redirect
      clearAuth();
      toast.success("Successfully logged out");
      setTimeout(() => {
        window.location.href = "/prohealthclub/login";
      }, 500);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all duration-200 ${className}`}
    >
      <LogOut size={18} className="flex-shrink-0" />
      {showText && <span>{loading ? "Signing out..." : "Sign Out"}</span>}
    </button>
  );
}
