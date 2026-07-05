import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { SidebarTab } from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import MemberManagement from "../admin/MemberManagement";
import BiometricPanel from "../dashboard/BiometricPanel";
import AddMemberForm from "../dashboard/AddMemberForm";
import ExpiringMemberships from "../dashboard/ExpiringMemberships";
import InventoryModule from "../dashboard/InventoryModule";
import SettingsModule from "../dashboard/SettingsModule";
import { Toaster } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export default function ReceptionDashboardApp() {
  const { user, loading: authLoading } = useAuth(["receptionist"]);
  const [currentTab, setCurrentTab] = useState<SidebarTab>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>(undefined);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Authenticating front desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== "members") setSelectedMemberId(undefined);
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
                <div className="grid grid-cols-1 gap-6">
                  {/* Summary Alert Widget */}
                  <ExpiringMemberships />
                  {/* Today checkins & unresolved terminal scans */}
                  <BiometricPanel />
                </div>
              )}

              {currentTab === "members" && (
                <MemberManagement />
              )}

              {currentTab === "attendance" && (
                <BiometricPanel />
              )}

              {currentTab === "biometrics" && (
                <BiometricPanel />
              )}

              {currentTab === "renewals" && (
                <ExpiringMemberships />
              )}

              {currentTab === "billing" && (
                <div className="grid grid-cols-1 gap-6">
                  <AddMemberForm />
                </div>
              )}

              {currentTab === "inventory" && (
                <div className="p-4 bg-[#171717] border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Inventory Module</h3>
                  <p className="text-xs text-slate-500 mt-2">Manage gym stock, supplements, and merchandise.</p>
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
