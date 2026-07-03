import { useState, useEffect } from "react";
import { Bell, Search, CheckCheck } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { timeAgo } from "../../lib/format";
import type { NotificationResponse, NotificationListResponse } from "../../lib/types";
import LogoutButton from "../auth/LogoutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onOpenSearch?: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<NotificationListResponse>("/api/v1/notifications/?is_read=false");
      // Res is NotificationListResponse. Extract notifications.
      setNotifications(res.notifications.slice(0, 5));
      setUnreadCount(res.unread_count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkNotificationsRead = async () => {
    try {
      await api.patch("/api/v1/notifications/read-all", {});
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const userName = user?.profile?.full_name || user?.email || "User";
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Guest";

  return (
    <header className="fixed top-4 left-4 right-4 z-50 h-16 bg-[#111111]/90 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-xl">
      {/* Brand Logo & Title */}
      <div className="flex items-center space-x-3">
        <img
          src={logo.src}
          alt="Prro Health Club Logo"
          className="h-9 w-9 rounded-full border border-white/10"
        />
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-wider text-white uppercase">
            Prro Health Club
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
            {userRole} Desk
          </span>
        </div>
      </div>

      {/* Global Search Button Placeholder */}
      <div className="flex-1 max-w-md mx-8 hidden sm:block">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <Search size={16} />
              <span>Search members, trainers, reports...</span>
            </div>
            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded border border-white/5 uppercase tracking-wider">
              ⌘K
            </span>
          </button>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-4">
        {/* Mobile Search Button */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <Search size={18} />
          </button>
        )}

        {/* Notification Bell Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#111111]">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-[#1D1D1D] border-white/5 text-white p-2 rounded-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Alerts & Updates
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkNotificationsRead}
                  className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <CheckCheck size={12} />
                  Mark read
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="bg-white/5" />

            <div className="max-h-64 overflow-y-auto space-y-1 py-1 scrollbar-none">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-semibold">
                  All caught up! No notifications.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg text-left transition-colors bg-white/5 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white leading-tight">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold whitespace-nowrap">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left">
            <div className="h-7 w-7 rounded-lg bg-[#FF7A00]/20 flex items-center justify-center text-primary font-black text-xs border border-[#FF7A00]/30">
              {authLoading ? ".." : getInitials(userName)}
            </div>
            <div className="flex flex-col hidden md:block">
              <span className="text-xs font-bold text-white leading-none">
                {authLoading ? "Loading..." : userName}
              </span>
              <span className="text-[9px] text-slate-500 font-bold leading-none mt-1">
                {userRole}
              </span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-[#1D1D1D] border-white/5 text-white p-2 rounded-xl">
            <DropdownMenuLabel className="text-xs font-black uppercase tracking-wider text-slate-500 p-2">
              Account Control
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="p-0 rounded-lg overflow-hidden">
              <LogoutButton className="px-3 py-2 text-xs" showText={true} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
