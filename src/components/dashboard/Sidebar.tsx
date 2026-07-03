import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Fingerprint, 
  CalendarClock, 
  CreditCard, 
  TrendingUp, 
  Package, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export type SidebarTab = 
  | "dashboard" 
  | "members" 
  | "attendance" 
  | "renewals" 
  | "billing" 
  | "biometrics" 
  | "trainers" 
  | "inventory" 
  | "reports" 
  | "settings";

interface SidebarProps {
  currentTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentTab, onChangeTab, isCollapsed, onToggleCollapse }: SidebarProps) {
  const menuGroups = [
    {
      title: "Core",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Front Desk",
      items: [
        { id: "members", label: "Members Directory", icon: Users },
        { id: "attendance", label: "Attendance Control", icon: UserCheck },
        { id: "renewals", label: "Renewal Center", icon: CalendarClock },
        { id: "billing", label: "Billing & Invoices", icon: CreditCard },
        { id: "biometrics", label: "Biometric Center", icon: Fingerprint }
      ]
    },
    {
      title: "Management",
      items: [
        { id: "trainers", label: "Trainers & Schedules", icon: ShieldCheck },
        { id: "inventory", label: "Inventory Stock", icon: Package },
        { id: "reports", label: "Reports & Charts", icon: BarChart3 }
      ]
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings Configuration", icon: Settings }
      ]
    }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-4 top-24 bottom-4 z-40 flex flex-col bg-[#111111] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        {!isCollapsed && (
          <span className="text-xs font-black uppercase tracking-widest text-[#FF7A00] animate-in fade-in duration-200">
            ERP Control
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2 animate-in fade-in duration-200">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeTab(item.id as SidebarTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
                      isActive
                        ? "text-white bg-[#FF7A00]/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Active Tab indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 w-1 h-1/2 rounded-full bg-[#FF7A00]"
                      />
                    )}
                    <Icon 
                      size={20} 
                      className={`flex-shrink-0 transition-colors ${
                        isActive ? "text-[#FF7A00]" : "text-slate-400 group-hover:text-white"
                      }`} 
                    />
                    {!isCollapsed && (
                      <span className="truncate animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}
                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-20 bg-[#1D1D1D] text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/5">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      {!isCollapsed && (
        <div className="p-5 border-t border-white/5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-in fade-in duration-200">
          Powered by Being Strong
        </div>
      )}
    </motion.aside>
  );
}
