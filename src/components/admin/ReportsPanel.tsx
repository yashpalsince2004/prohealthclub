import React, { useState } from "react";
import { 
  Users, Clock, Landmark, AlertCircle, FileSpreadsheet, 
  Download, Loader2, Calendar 
} from "lucide-react";
import { getAccessToken } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

export default function ReportsPanel() {
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  // Form states
  const [memberStatus, setMemberStatus] = useState("all");
  const [attendanceFrom, setAttendanceFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [attendanceTo, setAttendanceTo] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentFrom, setPaymentFrom] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [paymentTo, setPaymentTo] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDays, setExpiryDays] = useState("30");

  const handleDownload = async (reportType: string, path: string, filename: string) => {
    setDownloading(prev => ({ ...prev, [reportType]: true }));
    try {
      const token = getAccessToken();
      const baseUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl}${path}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Could not generate report file on backend.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(`${filename} exported successfully.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to download report");
    } finally {
      setDownloading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
      
      {/* 1. Members Report */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Members Catalog Report</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Roster, registration dates, and payment summaries
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Membership Status Filter</Label>
            <select
              value={memberStatus}
              onChange={(e) => setMemberStatus(e.target.value)}
              className="w-full h-10 bg-black border border-white/5 rounded-xl text-white text-xs px-3 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="all">All Members</option>
              <option value="active">Active Memberships Only</option>
              <option value="expired">Expired Memberships Only</option>
              <option value="paused">Paused Memberships Only</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => handleDownload(
            "members", 
            `/api/v1/admin/reports/members?status=${memberStatus}`,
            `members-catalog-${memberStatus}-${new Date().toISOString().split("T")[0]}.xlsx`
          )}
          disabled={downloading["members"]}
          className="w-full h-11 bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
        >
          {downloading["members"] ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export Members Excel
        </Button>
      </div>

      {/* 2. Attendance Summary */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Daily Attendance Summary</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Biometric scanner stats and unique member counts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From Date</Label>
              <Input
                type="date"
                value={attendanceFrom}
                onChange={(e) => setAttendanceFrom(e.target.value)}
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Date</Label>
              <Input
                type="date"
                value={attendanceTo}
                onChange={(e) => setAttendanceTo(e.target.value)}
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={() => handleDownload(
            "attendance", 
            `/api/v1/admin/reports/attendance?from_date=${attendanceFrom}&to_date=${attendanceTo}`,
            `attendance-report-${attendanceFrom}-to-${attendanceTo}.xlsx`
          )}
          disabled={downloading["attendance"]}
          className="w-full h-11 bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
        >
          {downloading["attendance"] ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export Attendance Excel
        </Button>
      </div>

      {/* 3. Payments Report */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Payments & Finance Audit</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Success receipts, totals, and breakdown by payment methods
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From Date</Label>
              <Input
                type="date"
                value={paymentFrom}
                onChange={(e) => setPaymentFrom(e.target.value)}
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To Date</Label>
              <Input
                type="date"
                value={paymentTo}
                onChange={(e) => setPaymentTo(e.target.value)}
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={() => handleDownload(
            "payments", 
            `/api/v1/admin/reports/payments?from_date=${paymentFrom}&to_date=${paymentTo}`,
            `payments-audit-${paymentFrom}-to-${paymentTo}.xlsx`
          )}
          disabled={downloading["payments"]}
          className="w-full h-11 bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
        >
          {downloading["payments"] ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export Finance Excel
        </Button>
      </div>

      {/* 4. Membership Expiry */}
      <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Membership Expiry Warnings</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Client renewals, expiring packages, and contact details
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expiring In The Next (Days)</Label>
            <Input
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
            />
          </div>
        </div>

        <Button
          onClick={() => handleDownload(
            "expiry", 
            `/api/v1/admin/reports/expiry?days_ahead=${expiryDays}`,
            `expiry-warning-next-${expiryDays}-days.xlsx`
          )}
          disabled={downloading["expiry"]}
          className="w-full h-11 bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2"
        >
          {downloading["expiry"] ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Export Expiry Excel
        </Button>
      </div>

    </div>
  );
}
