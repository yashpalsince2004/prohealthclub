import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar, { AdminSidebarTab } from "./AdminSidebar";
import Navbar from "../dashboard/Navbar";
import DashboardHome from "../dashboard/DashboardHome";
import MemberManagement from "./MemberManagement";
import AdminCharts from "../dashboard/AdminCharts";
import AttendanceModule from "../dashboard/AttendanceModule";
import BiometricCenter from "../dashboard/BiometricCenter";
import TrainerManagement from "./TrainerManagement";
import ReceptionistManagement from "./ReceptionistManagement";
import PricingManagement from "./PricingManagement";
import InventoryModule from "../dashboard/InventoryModule";
import ReportsModule from "../dashboard/ReportsModule";
import SettingsModule from "../dashboard/SettingsModule";
import StaffModule from "./StaffModule";
import StaffPayoutsModule from "./StaffPayoutsModule";
import { Toaster } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import { formatINR } from "../../lib/format";
import type { DashboardSummary } from "../../lib/types";
import {
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  Fingerprint,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardApp() {
  const { user, loading: authLoading } = useAuth(["admin"]);
  const [currentTab, setCurrentTab] = useState<AdminSidebarTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Database / mock state fallbacks
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await api.get<DashboardSummary>("/api/v1/analytics/dashboard-summary");
      setSummary(res);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSummary();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Authenticating admin gateway...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Members",
      value: summary?.total_members ?? 0,
      subtext: `${summary?.active_members ?? 0} Active Members`,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Subscriptions",
      value: summary?.active_members ?? 0,
      subtext: "Live active package rosters",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Today Attendance",
      value: summary?.today_attendance ?? 0,
      subtext: "Total biometric check-ins",
      icon: Activity,
      color: "text-[#FF7A00]",
      bg: "bg-[#FF7A00]/10",
    },
    {
      title: "This Month Revenue",
      value: summary ? formatINR(summary.this_month_revenue) : "₹0",
      subtext: `${summary?.revenue_growth_percent ?? 0}% growth from last month`,
      icon: CreditCard,
      color: "text-[#00C853]",
      bg: "bg-[#00C853]/10",
    },
    {
      title: "Expiring Memberships",
      value: summary?.expiring_memberships_7_days ?? 0,
      subtext: "Expiring in next 7 days",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Unresolved Scans",
      value: summary?.unresolved_biometric_scans ?? 0,
      subtext: "Requires registration sync",
      icon: Fingerprint,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans">
      <AdminSidebar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== "members") setSelectedMemberId(undefined);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{
          paddingLeft: isSidebarCollapsed ? "104px" : "284px",
          paddingTop: "88px",
          paddingRight: "16px",
          paddingBottom: "16px",
        }}
      >
        <Navbar />

        <main className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full space-y-6"
            >
              {currentTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loadingSummary
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="animate-pulse rounded-xl bg-[#171717] p-5 h-28 flex flex-col justify-between">
                            <div className="h-4 bg-[#1f1f1f] w-1/3 rounded"></div>
                            <div className="h-8 bg-[#1f1f1f] w-1/2 rounded"></div>
                          </div>
                        ))
                      : statCards.map((card, idx) => (
                          <div
                            key={idx}
                            className="bg-[#171717] border border-white/5 p-5 rounded-2xl shadow-lg flex items-center justify-between hover:border-white/10 transition-all"
                          >
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                {card.title}
                              </span>
                              <h3 className="text-2xl font-black text-white">{card.value}</h3>
                              <span className="text-[10px] font-bold text-slate-400 block">
                                {card.subtext}
                              </span>
                            </div>
                            <div className={`p-3.5 rounded-xl ${card.bg} ${card.color}`}>
                              <card.icon size={22} />
                            </div>
                          </div>
                        ))}
                  </div>

                  {/* Dynamic Charts (Real API backend) */}
                  <AdminCharts />
                </div>
              )}

              {currentTab === "members" && (
                <MemberManagement />
              )}

              {currentTab === "staff" && (
                <div className="p-4 bg-[#171717] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Staff Portal</h3>
                  <p className="text-xs text-slate-500 mt-2">Staff payouts and user roles configuration portal.</p>
                </div>
              )}

              {currentTab === "payroll" && (
                <div className="p-4 bg-[#171717] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Payroll Ledger</h3>
                  <p className="text-xs text-slate-500 mt-2">Payroll scheduling and commission payouts registry.</p>
                </div>
              )}

              {currentTab === "attendance" && (
                <div className="p-4 bg-[#171717] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Attendance Log</h3>
                  <p className="text-xs text-slate-500 mt-2">Live biometric checks and attendance records stream.</p>
                </div>
              )}

              {currentTab === "biometrics" && (
                <div className="p-4 bg-[#171717] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Biometrics Integration</h3>
                  <p className="text-xs text-slate-500 mt-2">Manage fingerprint and facial recognition attendance terminals.</p>
                </div>
              )}

              {currentTab === "trainers" && (
                <TrainerManagement />
              )}

              {currentTab === "receptionists" && (
                <ReceptionistManagement />
              )}

              {currentTab === "pricing" && (
                <PricingManagement />
              )}

              {currentTab === "inventory" && (
                <div className="p-4 bg-[#171717] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Stock Inventory</h3>
                  <p className="text-xs text-slate-500 mt-2">Gym supplements, products, and equipment stock ledger.</p>
                </div>
              )}

              {currentTab === "reports" && (
                <ReportsModule />
              )}

              {currentTab === "settings" && (
                <SettingsModule />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
