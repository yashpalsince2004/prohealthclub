import React from "react";
import { 
  Users, Dumbbell, UserCheck, ScrollText, 
  CreditCard, BarChart2, Plus, RefreshCw, LucideIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export function BaseEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Users
}: EmptyStateProps) {
  return (
    <div className="bg-[#121212]/60 border border-white/5 p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto shadow-xl animate-in fade-in duration-200">
      <div className="w-16 h-16 bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl flex items-center justify-center text-[#FF6B00] mb-2 shadow-[0_0_20px_rgba(255,107,0,0.05)]">
        <Icon size={28} />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-sm font-black uppercase tracking-wider text-white">
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="h-10 px-5 bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF6B00]/10 transition-all active:scale-95"
        >
          <Plus size={14} />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// 1. No Members
export function NoMembersState({ onAction }: { onAction?: () => void }) {
  return (
    <BaseEmptyState
      title="No Members Registered"
      description="Start checking in active health club participants by registering them into the member roster."
      actionLabel="Register Member"
      onAction={onAction}
      icon={Users}
    />
  );
}

// 2. No Trainers
export function NoTrainersState({ onAction }: { onAction?: () => void }) {
  return (
    <BaseEmptyState
      title="No Instructors Found"
      description="Configure certified trainers, specialty fitness splits, and availabilities."
      actionLabel="Add Trainer"
      onAction={onAction}
      icon={Dumbbell}
    />
  );
}

// 3. No Receptionists
export function NoReceptionistsState({ onAction }: { onAction?: () => void }) {
  return (
    <BaseEmptyState
      title="No Front Desk Staff"
      description="Create receptionist accounts to manage daily registrations, attendance, and invoice checkouts."
      actionLabel="Add Receptionist"
      onAction={onAction}
      icon={UserCheck}
    />
  );
}

// 4. No Plans
export function NoPlansState({ onAction }: { onAction?: () => void }) {
  return (
    <BaseEmptyState
      title="No Membership Plans"
      description="Create pricing packages (monthly, annual, personal training) for sales checkouts."
      actionLabel="Create Plan"
      onAction={onAction}
      icon={ScrollText}
    />
  );
}

// 5. No Payments
export function NoPaymentsState({ onAction }: { onAction?: () => void }) {
  return (
    <BaseEmptyState
      title="No Revenue Invoices"
      description="Payments catalog will populate once checkout sales or package updates are processed."
      actionLabel="Process Bill"
      onAction={onAction}
      icon={CreditCard}
    />
  );
}

// 6. No Reports
export function NoReportsState({ onAction }: { onAction?: () => void }) {
  return (
    <BaseEmptyState
      title="No Analytics Reports"
      description="Generate or configure reporting parameters to export structured Excel workbooks."
      actionLabel="Configure Reports"
      onAction={onAction}
      icon={BarChart2}
    />
  );
}
