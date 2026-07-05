import { useEffect, useState } from "react";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";
import { 
  Users, 
  UserPlus, 
  Fingerprint, 
  CreditCard, 
  Activity, 
  Settings, 
  TrendingUp, 
  FileText,
  Search,
  BookOpen,
  MapPin,
  ClipboardList
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

interface GlobalSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch?: (query: string) => void;
  onNavigate?: (route: string) => void;
  onQuickAction?: (actionName: string) => void;
}

export default function GlobalSearch({
  isOpen,
  onOpenChange,
  onSearch,
  onNavigate,
  onQuickAction
}: GlobalSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onOpenChange]);

  // Debounced search query trigger
  useEffect(() => {
    if (!onSearch) return;
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleNav = (route: string) => {
    onNavigate?.(route);
    onOpenChange(false);
  };

  const handleAction = (action: string) => {
    onQuickAction?.(action);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <div className="bg-[#121212] text-white border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <CommandInput 
          value={query}
          onValueChange={setQuery}
          placeholder="Search members, settings, plans, or type a command..." 
          className="text-white bg-transparent h-12 text-xs border-b border-white/5" 
        />
        <CommandList className="max-h-[320px] overflow-y-auto scrollbar-none p-2 space-y-1">
          <CommandEmpty className="text-xs text-slate-500 py-6 text-center italic">
            No matching items found.
          </CommandEmpty>

          {/* Quick Actions (only for staff roles) */}
          {(user?.role === "admin" || user?.role === "receptionist") && (
            <CommandGroup heading="Quick Actions" className="text-slate-500 font-black uppercase text-[9px] tracking-wider px-2 py-1">
              <CommandItem 
                onSelect={() => handleAction("register-member")}
                className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                <UserPlus size={16} className="text-[#FF6B00]" />
                <span>Register New Member</span>
              </CommandItem>
              <CommandItem 
                onSelect={() => handleAction("check-in")}
                className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                <Fingerprint size={16} className="text-[#FF6B00]" />
                <span>Biometric Check-In Gateway</span>
              </CommandItem>
              <CommandItem 
                onSelect={() => handleAction("collect-payment")}
                className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                <CreditCard size={16} className="text-[#FF6B00]" />
                <span>Process Membership Billing</span>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Navigation links for scalability */}
          <CommandGroup heading="System Navigation" className="text-slate-500 font-black uppercase text-[9px] tracking-wider px-2 py-1">
            {user?.role === "admin" && (
              <>
                <CommandItem 
                  onSelect={() => handleNav("/admin/members")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <Users size={16} className="text-slate-400" />
                  <span>Member Directory</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => handleNav("/admin/trainers")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <Dumbbell size={16} className="text-slate-400" />
                  <span>Trainers & Coaches</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => handleNav("/admin/receptionists")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <Users size={16} className="text-slate-400" />
                  <span>Receptionists Staff</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => handleNav("/admin/reports")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <TrendingUp size={16} className="text-slate-400" />
                  <span>Financial & Audit Reports</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => handleNav("/admin/settings")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <Settings size={16} className="text-slate-400" />
                  <span>Gym System Settings</span>
                </CommandItem>
              </>
            )}

            {user?.role === "trainer" && (
              <>
                <CommandItem 
                  onSelect={() => handleNav("/trainer")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <Activity size={16} className="text-slate-400" />
                  <span>Trainer Dashboard</span>
                </CommandItem>
                <CommandItem 
                  onSelect={() => handleNav("/trainer/profile")}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl text-xs font-semibold text-slate-200"
                >
                  <Users size={16} className="text-slate-400" />
                  <span>My Coach Profile</span>
                </CommandItem>
              </>
            )}
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}
