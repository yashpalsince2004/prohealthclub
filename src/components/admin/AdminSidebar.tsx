import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Fingerprint, 
  CreditCard, 
  Package, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Users2,
  Coins
} from "lucide-react";

export type AdminSidebarTab = 
  | "dashboard" 
  | "staff"
  | "payroll"
  | "members" 
  | "attendance" 
  | "biometrics" 
  | "trainers" 
  | "receptionists"
  | "pricing"
  | "inventory" 
  | "reports" 
  | "settings";

interface AdminSidebarProps {
  currentTab: AdminSidebarTab;
  onChangeTab: (tab: AdminSidebarTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ currentTab, onChangeTab, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const menuGroups = [
    {
      title: "Core",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Admin Control",
      items: [
        { id: "staff", label: "Staff Directory", icon: Users2 },
        { id: "payroll", label: "Payroll & Payouts", icon: Coins }
      ]
    },
    {
      title: "Gym Operations",
      items: [
        { id: "members", label: "Members Directory", icon: Users },
        { id: "attendance", label: "Attendance Control", icon: UserCheck },
        { id: "biometrics", label: "Biometric Center", icon: Fingerprint }
      ]
    },
    {
      title: "Management",
      items: [
        { id: "trainers", label: "🏋 Trainers", icon: ShieldCheck },
        { id: "receptionists", label: "👩‍💼 Receptionists", icon: UserCheck },
        { id: "pricing", label: "💰 Pricing Master", icon: CreditCard },
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
            Admin Ledger
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
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeTab(item.id as AdminSidebarTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative group ${
                      isActive 
                        ? "bg-[#FF7A00]/10 text-white font-bold" 
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#FF7A00]" : "text-slate-400 group-hover:text-white"} />
                    {!isCollapsed && (
                      <span className="text-xs tracking-wide animate-in fade-in duration-200">{item.label}</span>
                    )}

                    {/* Active Line indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeAdminTabIndicator"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF7A00] rounded-r"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile metadata */}
      <div className="p-4 border-t border-white/5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] font-black text-sm border border-[#FF7A00]/20 select-none">
          AD
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1 animate-in fade-in duration-200">
            <p className="text-xs font-black text-white leading-tight truncate">Administrator</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Full System Access</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
