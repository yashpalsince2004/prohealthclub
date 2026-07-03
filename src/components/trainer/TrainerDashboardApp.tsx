import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { SidebarTab } from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import AssignedMembers from "../dashboard/trainer/AssignedMembers";
import WorkoutPlanBuilder from "../dashboard/trainer/WorkoutPlanBuilder";
import SettingsModule from "../dashboard/SettingsModule";
import { Toaster } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export default function TrainerDashboardApp() {
  const { user, loading: authLoading } = useAuth(["trainer"]);
  const [currentTab, setCurrentTab] = useState<SidebarTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // States to pass to WorkoutPlanBuilder
  const [builderParams, setBuilderParams] = useState<{
    memberId?: string;
    memberName?: string;
    planType?: "workout" | "diet";
  } | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Authenticating coaching gateway...</p>
        </div>
      </div>
    );
  }

  const handleSelectMemberForPlan = (memberId: string, memberName: string, planType: "workout" | "diet") => {
    setBuilderParams({ memberId, memberName, planType });
    setCurrentTab("billing"); // map to the builder page view
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== "billing") setBuilderParams(null);
        }}
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

        {/* Dynamic tabs */}
        <main className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {currentTab === "dashboard" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">Trainer Dashboard</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Manage client rosters, fitness goals, splits, and nutrition schedules
                    </p>
                  </div>
                  <AssignedMembers onSelectMemberForPlan={handleSelectMemberForPlan} />
                </div>
              )}

              {currentTab === "members" && (
                <div className="space-y-6">
                  <AssignedMembers onSelectMemberForPlan={handleSelectMemberForPlan} />
                </div>
              )}

              {/* Billing tab acts as our dynamic Workout/Diet program designer */}
              {currentTab === "billing" && (
                <WorkoutPlanBuilder
                  initialMemberId={builderParams?.memberId}
                  initialMemberName={builderParams?.memberName}
                  initialType={builderParams?.planType}
                  onCancel={() => {
                    setBuilderParams(null);
                    setCurrentTab("dashboard");
                  }}
                />
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
