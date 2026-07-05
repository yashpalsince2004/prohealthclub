import React from "react";
import { Clock, User, ShieldAlert, History } from "lucide-react";

interface AuditInfoProps {
  createdByName?: string | null;
  createdById?: string | null;
  updatedByName?: string | null;
  updatedById?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLogin?: string | null;
  lastActivity?: string | null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return "N/A";
  }
}

export default function AuditInfo({
  createdByName,
  createdById,
  updatedByName,
  updatedById,
  createdAt,
  updatedAt,
  lastLogin,
  lastActivity
}: AuditInfoProps) {
  return (
    <div className="bg-[#171717] border border-white/5 p-4 rounded-2xl space-y-4 text-slate-400">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <History size={14} className="text-[#FF6B00]" />
        <span className="text-[10px] font-black uppercase tracking-wider text-white">
          Record Audit Information
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-bold">
        {/* Creation Audit */}
        <div className="space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
          <span className="text-slate-500 uppercase block text-[8px]">Creation Details</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <User size={12} className="text-slate-500" />
            <span>Created By: {createdByName || createdById || "System / Registrar"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock size={12} className="text-slate-500" />
            <span>Created At: {formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Update Audit */}
        <div className="space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
          <span className="text-slate-500 uppercase block text-[8px]">Latest Modification</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <User size={12} className="text-slate-500" />
            <span>Updated By: {updatedByName || updatedById || "System / Registrar"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock size={12} className="text-slate-500" />
            <span>Updated At: {formatDate(updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Activity Logs (optional check-in / staff tracker) */}
      {(lastLogin || lastActivity) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-bold pt-2 border-t border-white/5">
          {lastLogin && (
            <div>
              <span className="text-slate-500 uppercase block text-[8px]">Last Account Login</span>
              <span className="text-white block mt-0.5">{formatDate(lastLogin)}</span>
            </div>
          )}
          {lastActivity && (
            <div>
              <span className="text-slate-500 uppercase block text-[8px]">Last Trace Activity</span>
              <span className="text-white block mt-0.5">{formatDate(lastActivity)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
