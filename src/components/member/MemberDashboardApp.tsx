import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { SidebarTab } from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import MembershipCard from "../dashboard/member/MembershipCard";
import AttendanceHistory from "../dashboard/member/AttendanceHistory";
import WorkoutPlanView from "../dashboard/member/WorkoutPlanView";
import DietPlanView from "../dashboard/member/DietPlanView";
import SettingsModule from "../dashboard/SettingsModule";
import PaymentHistory from "../dashboard/member/PaymentHistory";
import { Toaster } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";
import type { MembershipResponse } from "../../lib/types";

export default function MemberDashboardApp() {
  const { user, loading: authLoading } = useAuth(["member"]);
  const [currentTab, setCurrentTab] = useState<SidebarTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMembership, setActiveMembership] = useState<MembershipResponse | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  useEffect(() => {
    const fetchActiveMembership = async () => {
      if (!user) return;
      try {
        const res = await api.get<MembershipResponse>("/api/v1/memberships/active/me");
        setActiveMembership(res);
      } catch (err: any) {
        if (err.status !== 404) {
          console.error("Failed to load active membership", err);
        }
      } finally {
        setLoadingMembership(false);
      }
    };
    fetchActiveMembership();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Authenticating member dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = user?.profile?.full_name || "Club Member";
  const userEmail = user?.email || "";
  const memberId = user?.profile?.member_id || "";

  return (
    <div className="min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Page Layout Wrapper */}
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

        {/* Dynamic page routes */}
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Membership Access Card */}
                  <div className="lg:col-span-4 space-y-6">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">Membership Card</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Use your card at the reception counter
                      </p>
                    </div>
                    {loadingMembership ? (
                      <div className="animate-pulse bg-[#171717] h-64 rounded-2xl border border-white/5"></div>
                    ) : (
                      <MembershipCard
                        membership={activeMembership}
                        memberName={userName}
                        memberEmail={userEmail}
                      />
                    )}
                  </div>

                  {/* Right Column: Workout and Diet Program Highlights */}
                  <div className="lg:col-span-8 space-y-6">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-white">My Workout Prescriptions</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Assigned workout splits and nutrition parameters
                      </p>
                    </div>
                    <WorkoutPlanView />
                    <DietPlanView />
                  </div>
                </div>
              )}

              {currentTab === "members" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Membership Status</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Details of your premium subscription packages
                    </p>
                  </div>
                  <MembershipCard
                    membership={activeMembership}
                    memberName={userName}
                    memberEmail={userEmail}
                  />
                </div>
              )}

              {currentTab === "attendance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Attendance Log History</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Track your gym visit days and duration statistics
                    </p>
                  </div>
                  {memberId && <AttendanceHistory memberId={memberId} />}
                </div>
              )}

              {currentTab === "renewals" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Diet Plan Nutrition</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Nutritional schedules assigned by your nutritionist
                    </p>
                  </div>
                  <DietPlanView />
                </div>
              )}

              {currentTab === "billing" && (
                <div className="space-y-6">
                  {memberId && <PaymentHistory memberId={memberId} />}
                </div>
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
