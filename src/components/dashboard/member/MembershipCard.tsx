import { QrCode, CreditCard, ShieldCheck } from "lucide-react";
import { formatDate, formatINR } from "../../../lib/format";
import type { MembershipResponse } from "../../../lib/types";

interface MembershipCardProps {
  membership: MembershipResponse | null;
  memberName: string;
  memberEmail: string;
}

export default function MembershipCard({ membership, memberName, memberEmail }: MembershipCardProps) {
  const status = membership ? membership.status : "expired";

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 text-white max-w-md mx-auto">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
          Gym Access Token
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
            status === "active"
              ? "bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20"
              : "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Premium Credit Card Graphic Visual */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FF4500] p-6 shadow-2xl flex flex-col justify-between h-48 border border-white/10 group">
        {/* Glow decorative overlays */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
              Prro Health Club
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {membership ? membership.plan.name : "Guest Pass"}
            </h3>
          </div>
          <CreditCard className="text-white/60" size={24} />
        </div>

        <div className="space-y-4">
          {/* Card Number emulation */}
          <div className="font-mono text-white/90 text-sm tracking-widest">
            {membership ? `PHC - ${membership.id.substring(0, 8).toUpperCase()}` : "NO ACTIVE MEMBERSHIP"}
          </div>

          <div className="flex justify-between items-end text-white/80">
            <div className="space-y-0.5">
              <span className="text-[7px] font-bold uppercase tracking-wider text-white/60 block">
                Card Holder
              </span>
              <span className="text-xs font-bold uppercase leading-none block">
                {memberName}
              </span>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-[7px] font-bold uppercase tracking-wider text-white/60 block">
                Valid Thru
              </span>
              <span className="text-xs font-mono font-bold leading-none block">
                {membership ? formatDate(membership.end_date) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code emulation for Gate scanners */}
      <div className="bg-[#111111] p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center space-y-4">
        <div className="bg-white p-3 rounded-xl border border-white/10 relative group">
          <QrCode className="text-[#090909]" size={140} />
          <div className="absolute inset-0 bg-[#090909]/80 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
            Scan at entry terminal
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-white uppercase tracking-wide">Access Entry Scan</p>
          <p className="text-[9px] text-slate-500 font-mono">{memberEmail}</p>
        </div>
      </div>

      {/* Additional package info */}
      {membership && (
        <div className="space-y-2.5 text-xs border-t border-white/5 pt-4 text-slate-400 font-semibold">
          <div className="flex justify-between">
            <span>Started Date:</span>
            <span className="text-white font-mono">{formatDate(membership.start_date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Package Price:</span>
            <span className="text-[#00C853] font-bold">{formatINR(membership.plan.price)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
