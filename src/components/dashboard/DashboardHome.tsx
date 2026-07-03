import { motion } from "framer-motion";
import { 
  Users, 
  Activity, 
  CreditCard, 
  TrendingUp, 
  PlusCircle, 
  UserCheck, 
  RefreshCw, 
  Coins, 
  QrCode,
  AlertCircle
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
  ResponsiveContainer 
} from "recharts";
import { Member, Trainer, BiometricDevice, ActivityLog } from "./mockData";
import { SidebarTab } from "./Sidebar";

interface DashboardHomeProps {
  members: Member[];
  trainers: Trainer[];
  devices: BiometricDevice[];
  activities: ActivityLog[];
  onNavigate: (tab: SidebarTab) => void;
  onQuickAction: (action: string) => void;
}

export default function DashboardHome({
  members,
  trainers,
  devices,
  activities,
  onNavigate,
  onQuickAction
}: DashboardHomeProps) {
  // Compute metrics
  const activeMembers = members.filter(m => m.status === "Active");
  const insideMembers = members.filter(m => m.attendanceToday && m.status === "Active");
  const checkinsTodayCount = members.filter(m => m.attendanceToday).length;
  
  // Total Revenue Today (paid invoices from today)
  const todayStr = new Date().toISOString().split('T')[0]; // matching format or generic mock
  const totalRevenue = members.reduce((sum, m) => {
    return sum + m.invoices.filter(inv => inv.status === "Paid").reduce((s, inv) => s + inv.amount, 0);
  }, 0);

  // Generate charts mock data
  const attendanceChartData = [
    { name: "06:00", count: 8 },
    { name: "08:00", count: 24 },
    { name: "10:00", count: 18 },
    { name: "12:00", count: 12 },
    { name: "14:00", count: 15 },
    { name: "16:00", count: 22 },
    { name: "18:00", count: 35 },
    { name: "20:00", count: 28 },
    { name: "22:00", count: 10 }
  ];

  const revenueChartData = [
    { name: "Mon", revenue: 12000 },
    { name: "Tue", revenue: 15500 },
    { name: "Wed", revenue: 9800 },
    { name: "Thu", revenue: 22000 },
    { name: "Fri", revenue: 18000 },
    { name: "Sat", revenue: 25000 },
    { name: "Sun", revenue: 14000 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Overview Title */}
      <div>
        <h1 className="text-2xl font-black uppercase text-white tracking-wider">
          Overview Control
        </h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
          Real-time Operations Ledger
        </p>
      </div>

      {/* KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Today's Check-ins
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{checkinsTodayCount}</span>
              <span className="text-xs font-bold text-emerald-500">+12% vs yesterday</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <UserCheck size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Members Currently Inside
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{insideMembers.length}</span>
              <span className="text-xs font-bold text-slate-500">Peak hour starting</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#00C853]/10 flex items-center justify-center text-[#00C853] group-hover:scale-110 transition-transform">
            <Activity size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Active Memberships
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{activeMembers.length}</span>
              <span className="text-xs font-bold text-emerald-500">92% retention rate</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Users size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Gross Collections
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">Month to date</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#FFC107]/10 flex items-center justify-center text-[#FFC107] group-hover:scale-110 transition-transform">
            <Coins size={22} />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Panel */}
      <motion.div variants={itemVariants} className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Operational Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onQuickAction("add-member")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1D1D1D] hover:bg-primary/10 hover:text-white border border-white/5 hover:border-primary/20 text-slate-300 transition-all text-center group"
          >
            <PlusCircle size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Add Member</span>
          </button>
          <button
            onClick={() => onQuickAction("renew")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1D1D1D] hover:bg-primary/10 hover:text-white border border-white/5 hover:border-primary/20 text-slate-300 transition-all text-center group"
          >
            <RefreshCw size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Renew Plan</span>
          </button>
          <button
            onClick={() => onQuickAction("check-in")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1D1D1D] hover:bg-primary/10 hover:text-white border border-white/5 hover:border-primary/20 text-slate-300 transition-all text-center group"
          >
            <UserCheck size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Manual Check-In</span>
          </button>
          <button
            onClick={() => onQuickAction("collect-payment")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1D1D1D] hover:bg-primary/10 hover:text-white border border-white/5 hover:border-primary/20 text-slate-300 transition-all text-center group"
          >
            <CreditCard size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Collect Pay</span>
          </button>
          <button
            onClick={() => onNavigate("biometrics")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1D1D1D] hover:bg-primary/10 hover:text-white border border-white/5 hover:border-primary/20 text-slate-300 transition-all text-center group"
          >
            <QrCode size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Sync Biometrics</span>
          </button>
          <button
            onClick={() => onNavigate("reports")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#1D1D1D] hover:bg-primary/10 hover:text-white border border-white/5 hover:border-primary/20 text-slate-300 transition-all text-center group"
          >
            <TrendingUp size={20} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">View Reports</span>
          </button>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance Flow Chart */}
        <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Today's Attendance Flow
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
              Live Hourly
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceChartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} />
                <YAxis stroke="#555555" fontSize={11} tickLine={false} />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }} 
                  itemStyle={{ color: "#FF7A00" }}
                />
                <Area type="monotone" dataKey="count" stroke="#FF7A00" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Revenue Ledger */}
        <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Weekly Collection Ledger
            </h3>
            <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-widest bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/10">
              Target Achieved
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" stroke="#555555" fontSize={11} tickLine={false} />
                <YAxis stroke="#555555" fontSize={11} tickLine={false} />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderRadius: "8px", color: "white" }} 
                  itemStyle={{ color: "#00C853" }}
                />
                <Bar dataKey="revenue" fill="#00C853" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Live Feed & Device Status */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Realtime Activity Timeline */}
        <div className="lg:col-span-2 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Realtime Activity Timeline
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
            {activities.map((act, index) => (
              <div key={act.id} className="flex gap-4 items-start relative group">
                {/* Timeline connector line */}
                {index < activities.length - 1 && (
                  <span className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-white/5" />
                )}
                
                {/* Type Indicator Dot */}
                <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                  act.type === "checkin" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" :
                  act.type === "payment" ? "bg-amber-500/10 border-amber-500/40 text-amber-500" :
                  act.type === "renewal" ? "bg-primary/10 border-primary/40 text-primary" :
                  "bg-slate-500/10 border-slate-500/40 text-slate-400"
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                      {act.details}
                    </p>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">
                    Event Log: {act.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biometric Gateway Monitor */}
        <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Gateway Diagnostics
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Live Connection Array
            </p>
          </div>

          <div className="space-y-4 py-2">
            {devices.map(dev => (
              <div key={dev.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{dev.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{dev.ip}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${dev.status === "Online" ? "bg-[#00C853] animate-pulse" : "bg-[#FF5252]"}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {dev.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate("biometrics")}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white border border-white/5 hover:border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <span>Biometric Gateway Panel</span>
            <span>&rarr;</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
