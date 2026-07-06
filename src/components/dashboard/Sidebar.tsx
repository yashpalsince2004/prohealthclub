import React from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Fingerprint, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Package, 
  BarChart2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  UserPlus,
  Dumbbell,
  Salad,
  User,
  AlertTriangle,
  Banknote,
  ShieldCheck,
  FileSpreadsheet,
  LucideIcon
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

type UserRole = "admin" | "receptionist" | "trainer" | "member";

export type SidebarTab =
  | "dashboard"
  | "receptionists"
  | "trainers"
  | "members"
  | "memberships"
  | "attendance"
  | "revenue"
  | "leads"
  | "reports"
  | "analytics"
  | "plans"
  | "exercises"
  | "settings"
  | "profile"
  | "billing"
  | "biometrics"
  | "renewals"
  | "workouts"
  | "diets"
  | "membership"
  | "workout"
  | "diet"
  | "payments"
  | "inventory";

interface NavItem {
  id: SidebarTab;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: number;
  group?: string;
}


const NAV_ITEMS: NavItem[] = [
  // Admin only
  { id: "dashboard",    label: "Dashboard Overview",href: "/admin",              icon: LayoutDashboard, roles: ["admin"], group: "Dashboard" },
  
  { id: "receptionists",label: "Receptionists",  href: "/admin/receptionists", icon: UserCheck,       roles: ["admin"], group: "Management" },
  { id: "trainers",     label: "Trainers",       href: "/admin/trainers",      icon: Dumbbell,        roles: ["admin"], group: "Management" },
  { id: "members",      label: "Members",        href: "/admin/members",       icon: Users,           roles: ["admin"], group: "Management" },
  
  { id: "memberships",  label: "Memberships",    href: "/reception#memberships",icon: CreditCard,     roles: ["admin"], group: "Operations" },
  { id: "attendance",   label: "Attendance",     href: "/reception#attendance",icon: Clock,           roles: ["admin"], group: "Operations" },
  { id: "revenue",      label: "Payments",       href: "/admin/revenue",       icon: Banknote,        roles: ["admin"], group: "Operations" },
  { id: "leads",        label: "Leads",          href: "/admin/leads",         icon: UserPlus,        roles: ["admin"], group: "Operations" },
  
  { id: "reports",      label: "Reports Export", href: "/admin/reports",       icon: FileSpreadsheet, roles: ["admin"], group: "Analytics" },
  { id: "analytics",    label: "Analytics Charts",href: "/admin/analytics",     icon: BarChart2,       roles: ["admin"], group: "Analytics" },
  
  { id: "plans",        label: "Pricing Plans",  href: "/reception#memberships",icon: CreditCard,     roles: ["admin"], group: "Configuration" },
  { id: "exercises",    label: "Exercise Library",href: "/trainer#workouts",    icon: Dumbbell,        roles: ["admin"], group: "Configuration" },
  { id: "settings",     label: "Settings",       href: "/admin/settings",      icon: Settings,        roles: ["admin"], group: "Configuration" },
  
  { id: "profile",      label: "My Profile",     href: "/member/profile",      icon: User,            roles: ["admin"], group: "System" },

  // Receptionist only
  { id: "dashboard",    label: "Front Desk",     href: "/reception",           icon: LayoutDashboard, roles: ["receptionist"], group: "Dashboard" },
  { id: "members",      label: "Members",        href: "/reception#members",   icon: Users,           roles: ["receptionist"], group: "Management" },
  { id: "memberships",  label: "Memberships",    href: "/reception#memberships",icon: CreditCard,     roles: ["receptionist"], group: "Operations" },
  { id: "billing",      label: "Payments",       href: "/reception#payments",  icon: Banknote,        roles: ["receptionist"], group: "Operations" },
  { id: "attendance",   label: "Attendance",     href: "/reception#attendance",icon: Clock,           roles: ["receptionist"], group: "Operations" },
  { id: "biometrics",   label: "Biometric",      href: "/reception#biometric", icon: Fingerprint,     roles: ["receptionist"], group: "Operations" },
  { id: "leads",        label: "Leads",          href: "/reception/leads",     icon: UserPlus,        roles: ["receptionist"], group: "Operations" },
  { id: "renewals",     label: "Expiring Soon",  href: "/reception#expiring",  icon: AlertTriangle,   roles: ["receptionist"], group: "Operations" },

  // Trainer only
  { id: "dashboard",    label: "Dashboard",      href: "/trainer",             icon: LayoutDashboard, roles: ["trainer"], group: "Dashboard" },
  { id: "members",      label: "My Members",     href: "/trainer#members",     icon: Users,           roles: ["trainer"], group: "Management" },
  { id: "workouts",     label: "Workout Plans",  href: "/trainer#workouts",    icon: Dumbbell,        roles: ["trainer"], group: "Operations" },
  { id: "diets",        label: "Diet Plans",     href: "/trainer#diets",       icon: Salad,           roles: ["trainer"], group: "Operations" },
  { id: "attendance",   label: "Attendance",     href: "/trainer#attendance",  icon: Clock,           roles: ["trainer"], group: "Operations" },
  { id: "profile",      label: "My Profile",     href: "/trainer/profile",      icon: User,            roles: ["trainer"], group: "System" },

  // Member only
  { id: "dashboard",    label: "My Dashboard",   href: "/member",              icon: LayoutDashboard, roles: ["member"], group: "Dashboard" },
  { id: "membership",   label: "Membership",     href: "/member#membership",   icon: CreditCard,      roles: ["member"], group: "Operations" },
  { id: "attendance",   label: "Attendance",     href: "/member#attendance",   icon: Clock,           roles: ["member"], group: "Operations" },
  { id: "workout",      label: "Workout Plan",   href: "/member#workout",      icon: Dumbbell,        roles: ["member"], group: "Operations" },
  { id: "diet",         label: "Diet Plan",      href: "/member#diet",         icon: Salad,           roles: ["member"], group: "Operations" },
  { id: "payments",     label: "Payments",       href: "/member#payments",     icon: Banknote,        roles: ["member"], group: "Operations" },
  { id: "profile",      label: "My Profile",     href: "/member/profile",      icon: User,            roles: ["member"], group: "System" },
];

interface SidebarProps {
  currentTab?: SidebarTab;
  onChangeTab?: (tab: SidebarTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ currentTab, onChangeTab, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  
  if (!user) return null;

  const userRole = user.role as UserRole;
  
  // Filter navigation links entirely from the DOM based on user role
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (onChangeTab) {
      // If we are in a tab-based dashboard app, intercept and switch tabs locally
      e.preventDefault();
      onChangeTab(item.id);
    }
  };

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
          <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00] animate-in fade-in duration-200">
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

      {/* Navigation Group */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 scrollbar-none">
        {(() => {
          let lastGroup = "";
          return visibleItems.map((item) => {
            const showGroupHeader = !isCollapsed && item.group && item.group !== lastGroup;
            if (item.group) lastGroup = item.group;
            
            // Check if link is active
            const isActive = onChangeTab
              ? currentTab === item.id
              : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              
            const Icon = item.icon;
            
            return (
              <React.Fragment key={item.label}>
                {showGroupHeader && (
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-600 px-3 pt-3 pb-1 animate-in fade-in duration-200">
                    {item.group}
                  </div>
                )}
                <a
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
                    isActive
                      ? "text-white bg-[#FF6B00]/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
              {/* Active Tab indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute left-0 w-1 h-1/2 rounded-full bg-[#FF6B00]"
                />
              )}
              <Icon 
                size={20} 
                className={`flex-shrink-0 transition-colors ${
                  isActive ? "text-[#FF6B00]" : "text-slate-400 group-hover:text-white"
                }`} 
              />
              {!isCollapsed && (
                <span className="truncate animate-in fade-in duration-200">
                  {item.label}
                </span>
              )}
              {/* Optional count badge */}
              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-20 bg-[#1D1D1D] text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-white/5">
                  {item.label}
                </div>
              )}
            </a>
          </React.Fragment>
        );
      });
    })()}
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
