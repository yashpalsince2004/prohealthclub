import { useEffect } from "react";
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
  FileText 
} from "lucide-react";
import { Member, Trainer } from "./mockData";
import { SidebarTab } from "./Sidebar";

interface GlobalSearchProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  trainers: Trainer[];
  onSelectMember: (memberId: string) => void;
  onNavigateTab: (tab: SidebarTab) => void;
  onTriggerQuickAction: (action: string) => void;
}

export default function GlobalSearch({
  isOpen,
  onOpenChange,
  members,
  trainers,
  onSelectMember,
  onNavigateTab,
  onTriggerQuickAction
}: GlobalSearchProps) {
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

  const handleMemberSelect = (memberId: string) => {
    onSelectMember(memberId);
    onOpenChange(false);
  };

  const handleNavSelect = (tab: SidebarTab) => {
    onNavigateTab(tab);
    onOpenChange(false);
  };

  const handleActionSelect = (action: string) => {
    onTriggerQuickAction(action);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <div className="bg-[#171717] text-white border-white/5">
        <CommandInput placeholder="Type a command or search..." className="text-white bg-transparent" />
        <CommandList className="max-h-[300px] overflow-y-auto scrollbar-none">
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Quick Actions Group */}
          <CommandGroup heading="Quick Actions" className="text-slate-500 font-bold">
            <CommandItem 
              onSelect={() => handleActionSelect("add-member")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <UserPlus size={16} className="text-[#FF7A00]" />
              <span>Register New Member</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleActionSelect("check-in")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <Fingerprint size={16} className="text-[#FF7A00]" />
              <span>Biometric / Manual Check-In</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleActionSelect("collect-payment")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <CreditCard size={16} className="text-[#FF7A00]" />
              <span>Process Pending Bill</span>
            </CommandItem>
          </CommandGroup>

          {/* Members Search Results */}
          <CommandGroup heading="Members" className="text-slate-500 font-bold">
            {members.map(m => (
              <CommandItem
                key={m.id}
                onSelect={() => handleMemberSelect(m.id)}
                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
              >
                <Users size={16} className="text-slate-400" />
                <span>{m.name} ({m.id})</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Navigation Commands Group */}
          <CommandGroup heading="Go To Page" className="text-slate-500 font-bold">
            <CommandItem 
              onSelect={() => handleNavSelect("dashboard")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <Activity size={16} className="text-slate-400" />
              <span>Dashboard Home</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleNavSelect("billing")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <CreditCard size={16} className="text-slate-400" />
              <span>Billing & Collections</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleNavSelect("biometrics")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <Fingerprint size={16} className="text-slate-400" />
              <span>Biometric Gateway</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleNavSelect("reports")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <TrendingUp size={16} className="text-slate-400" />
              <span>Operational Analytics</span>
            </CommandItem>
            <CommandItem 
              onSelect={() => handleNavSelect("settings")}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg text-xs font-semibold text-slate-200"
            >
              <Settings size={16} className="text-slate-400" />
              <span>Settings Configuration</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}
