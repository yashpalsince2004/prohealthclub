import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  FileSpreadsheet, 
  FileDown, 
  Download 
} from "lucide-react";
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
  LineChart,
  Line
} from "recharts";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function ReportsModule() {
  const [reportTab, setReportTab] = useState<"revenue" | "attendance" | "membership">("revenue");

  // Mock Report Datasets
  const monthlyRevenueData = [
    { name: "Jan", revenue: 85000, target: 80000 },
    { name: "Feb", revenue: 95000, target: 85000 },
    { name: "Mar", revenue: 110000, target: 90000 },
    { name: "Apr", revenue: 105000, target: 95000 },
    { name: "May", revenue: 125000, target: 100000 },
    { name: "Jun", revenue: 145000, target: 110000 },
    { name: "Jul", revenue: 160000, target: 120000 }
  ];

  const monthlyAttendanceData = [
    { name: "Jan", checkins: 420 },
    { name: "Feb", checkins: 480 },
    { name: "Mar", checkins: 620 },
    { name: "Apr", checkins: 580 },
    { name: "May", checkins: 710 },
    { name: "Jun", checkins: 890 },
    { name: "Jul", checkins: 950 }
  ];

  const membershipGrowthData = [
    { name: "Jan", active: 110, new: 22 },
    { name: "Feb", active: 125, new: 28 },
    { name: "Mar", active: 140, new: 35 },
    { name: "Apr", active: 152, new: 24 },
    { name: "May", active: 168, new: 31 },
    { name: "Jun", active: 190, new: 45 },
    { name: "Jul", active: 215, new: 50 }
  ];

  const handleExport = (format: "PDF" | "Excel" | "CSV") => {
    toast.success(`Exporting operational report as ${format}...`);
    setTimeout(() => {
      toast.success(`Report downloaded successfully!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white">System Analytics & Reports</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Exportable metrics and trends</p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport("PDF")}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileDown size={14} className="text-[#FF5252]" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet size={14} className="text-[#00C853]" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleExport("CSV")}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download size={14} className="text-primary" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Main Reports Panel */}
      <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6">
        {/* Tab triggers */}
        <div className="flex items-center space-x-2 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setReportTab("revenue")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              reportTab === "revenue"
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp size={14} />
            <span>Revenue Report</span>
          </button>
          <button
            onClick={() => setReportTab("attendance")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              reportTab === "attendance"
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BarChart3 size={14} />
            <span>Attendance Frequency</span>
          </button>
          <button
            onClick={() => setReportTab("membership")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              reportTab === "membership"
                ? "bg-primary text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users size={14} />
            <span>Roster Growth</span>
          </button>
        </div>

        {/* Report Chart Display */}
        <div className="min-h-[350px]">
          {/* TAB 1: REVENUE */}
          {reportTab === "revenue" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Monthly Collection Target Flow</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target vs Realized Gross</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-[#00C853]">
                    <span className="h-2 w-2 rounded-full bg-current" />
                    Realized Revenue
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-current" />
                    Target
                  </span>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C853" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} />
                    <YAxis stroke="#555555" fontSize={11} tickLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }} 
                      itemStyle={{ color: "#00C853" }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#00C853" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
                    <Line type="monotone" dataKey="target" stroke="#555555" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {reportTab === "attendance" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Monthly Attendance Frequency</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total biometric gate sync registers</p>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} />
                    <YAxis stroke="#555555" fontSize={11} tickLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }} 
                      itemStyle={{ color: "#FF7A00" }}
                    />
                    <Bar dataKey="checkins" fill="#FF7A00" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: MEMBERSHIP */}
          {reportTab === "membership" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Roster Membership growth</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active roster size vs new registers</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-500">
                    <span className="h-2 w-2 rounded-full bg-current" />
                    Active Members
                  </span>
                  <span className="flex items-center gap-1.5 text-primary">
                    <span className="h-2 w-2 rounded-full bg-current" />
                    New Additions
                  </span>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={membershipGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} />
                    <YAxis stroke="#555555" fontSize={11} tickLine={false} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }} 
                    />
                    <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} />
                    <Line type="monotone" dataKey="new" stroke="#FF7A00" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
