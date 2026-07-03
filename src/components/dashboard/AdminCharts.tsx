import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../../lib/api";
import { formatINR } from "../../lib/format";
import type { RevenueReport, AttendanceReport } from "../../lib/types";

export default function AdminCharts() {
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fromStr = thirtyDaysAgo.toISOString().split("T")[0];
      const toStr = today.toISOString().split("T")[0];

      // Fetch from real backend analytics endpoints
      const [revReport, attReport] = await Promise.all([
        api.get<RevenueReport>(`/api/v1/analytics/revenue?from_date=${fromStr}&to_date=${toStr}&group_by=month`),
        api.get<AttendanceReport>(`/api/v1/analytics/attendance?from_date=${fromStr}&to_date=${toStr}&group_by=day`),
      ]);

      // Map revenue timeline: { label: string, amount: number, payment_count: number }
      const mappedRevenue = revReport.timeline.map((point) => ({
        name: point.label,
        revenue: point.amount,
      }));

      // Map attendance timeline: { label: string, total_visits: number, ... }
      const mappedAttendance = attReport.timeline.map((point) => ({
        name: point.label,
        count: point.total_visits,
      }));

      setRevenueData(mappedRevenue);
      setAttendanceData(mappedAttendance);
    } catch (err: any) {
      setError(err.message || "Failed to load dynamic charts data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
        <div className="bg-[#171717] h-80 rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
          <div className="h-4 bg-[#1f1f1f] w-1/3 rounded"></div>
          <div className="h-48 bg-[#1f1f1f] w-full rounded"></div>
        </div>
        <div className="bg-[#171717] h-80 rounded-2xl border border-white/5 p-6 flex flex-col justify-between">
          <div className="h-4 bg-[#1f1f1f] w-1/3 rounded"></div>
          <div className="h-48 bg-[#1f1f1f] w-full rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 text-xs text-orange-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Attendance Flow Chart */}
      <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Attendance Flow Timeline
          </h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
            Check-ins
          </span>
        </div>
        <div className="h-64 w-full">
          {attendanceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-bold uppercase">
              No check-ins recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" stroke="#555555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555555" fontSize={10} tickLine={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "#1D1D1D",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  itemStyle={{ color: "#FF7A00" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#FF7A00"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Weekly Revenue Ledger */}
      <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Revenue Ledger Collections
          </h3>
          <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-widest bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/10">
            Active
          </span>
        </div>
        <div className="h-64 w-full">
          {revenueData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-bold uppercase">
              No revenue records found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" stroke="#555555" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#555555"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <ChartTooltip
                  formatter={(val: number) => [formatINR(val), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#1D1D1D",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                  itemStyle={{ color: "#00C853" }}
                />
                <Bar dataKey="revenue" fill="#00C853" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
