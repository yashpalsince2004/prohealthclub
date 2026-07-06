import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Eye, Archive, RefreshCw, UserPlus, Download,
  MoreHorizontal, Users, CheckCircle, XCircle, X,
  ChevronLeft, ChevronRight, Filter, User, ShieldAlert,
  Award, Clock, DollarSign, Activity, Trash, Calendar, Sliders
} from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { MemberResponse } from "../../lib/types";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { toast } from "sonner";
import AddMemberForm from "./AddMemberForm";
import { memberService } from "../../lib/memberService";
import Permission from "../common/Permission";
import { notify } from "../../lib/notify";

interface MembersTableProps {
  onSelectMember?: (id: string) => void;
}

// ──────────────────────────────────────────────────────────────
// Status badge helper
// ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
        cfg[status] ?? cfg.expired
      }`}
    >
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// View Member slide-over panel
// ──────────────────────────────────────────────────────────────
function ViewMemberPanel({
  member,
  onClose,
  onRefreshList,
}: {
  member: MemberResponse;
  onClose: () => void;
  onRefreshList?: () => void;
}) {
  const [currentMember, setCurrentMember] = useState<MemberResponse>(member);
  const [membershipHistory, setMembershipHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);

  // Dialog open states
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isFreezeConfirmOpen, setIsFreezeConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isTrainerAssignOpen, setIsTrainerAssignOpen] = useState(false);

  // Dialog input states
  const [extendDays, setExtendDays] = useState(30);
  const [extendNotes, setExtendNotes] = useState("");
  const [renewPlanId, setRenewPlanId] = useState("");
  const [renewStartFromExpiry, setRenewStartFromExpiry] = useState(true);
  const [renewNotes, setRenewNotes] = useState("");
  const [upgradePlanId, setUpgradePlanId] = useState("");
  const [upgradeNotes, setUpgradeNotes] = useState("");
  const [freezeNotes, setFreezeNotes] = useState("");
  const [cancelNotes, setCancelNotes] = useState("");
  const [assignTrainerId, setAssignTrainerId] = useState("");

  const loadMemberDetails = async () => {
    try {
      const m = await memberService.getMemberById(currentMember.id);
      setCurrentMember(m as unknown as MemberResponse);
      
      const [history, payments, attendance] = await Promise.all([
        memberService.getMembershipHistory(currentMember.id),
        memberService.getPaymentHistory(currentMember.id),
        memberService.getAttendanceHistory(currentMember.id),
      ]);
      setMembershipHistory(history);
      setPaymentHistory(payments);
      setAttendanceHistory(attendance);
    } catch (err) {
      console.error("Failed to load member details in panel", err);
    }
  };

  useEffect(() => {
    loadMemberDetails();
  }, [currentMember.id]);

  useEffect(() => {
    const fetchGlobals = async () => {
      try {
        const [pList, tList] = await Promise.all([
          api.get<any[]>("/api/v1/plans"),
          api.get<any[]>("/api/v1/trainers"),
        ]);
        setPlans(pList);
        setTrainers(tList);
      } catch (err) {
        console.error("Failed to load plans or trainers", err);
      }
    };
    fetchGlobals();
  }, []);

  const handleExtendSubmit = async () => {
    if (!currentMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.extendMembership(currentMember.active_membership.id, extendDays, extendNotes);
      notify.success("Membership extended successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to extend membership");
    } finally {
      setIsExtendOpen(false);
      setExtendNotes("");
    }
  };

  const handleRenewSubmit = async () => {
    if (!currentMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.renewMembership(currentMember.active_membership.id, {
        plan_id: renewPlanId,
        start_from_expiry: renewStartFromExpiry,
        notes: renewNotes
      });
      notify.success("Membership renewed successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to renew membership");
    } finally {
      setIsRenewOpen(false);
      setRenewNotes("");
    }
  };

  const handleUpgradeSubmit = async () => {
    if (!currentMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.upgradeMembership(currentMember.active_membership.id, upgradePlanId, upgradeNotes);
      notify.success("Plan changed successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to change membership plan");
    } finally {
      setIsUpgradeOpen(false);
      setUpgradeNotes("");
    }
  };

  const handleFreezeSubmit = async () => {
    if (!currentMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.freezeMembership(currentMember.active_membership.id, freezeNotes);
      notify.success("Membership frozen successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to freeze membership");
    } finally {
      setIsFreezeConfirmOpen(false);
      setFreezeNotes("");
    }
  };

  const handleUnfreezeSubmit = async () => {
    if (!currentMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.unfreezeMembership(currentMember.active_membership.id);
      notify.success("Membership resumed successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to resume membership");
    }
  };

  const handleCancelSubmit = async () => {
    if (!currentMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.cancelMembership(currentMember.active_membership.id, cancelNotes);
      notify.success("Membership cancelled successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to cancel membership");
    } finally {
      setIsCancelConfirmOpen(false);
      setCancelNotes("");
    }
  };

  const handleAssignTrainerSubmit = async () => {
    try {
      await memberService.updateMember(currentMember.id, { trainer_id: assignTrainerId || undefined });
      notify.success("Trainer assignment updated successfully");
      loadMemberDetails();
      onRefreshList?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to update trainer assignment");
    } finally {
      setIsTrainerAssignOpen(false);
    }
  };

  const p = currentMember.profile;
  const am = currentMember.active_membership;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full bg-[#090909] border-l border-white/5 overflow-y-auto shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#090909] z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] font-black text-sm">
              {p.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{p.full_name}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Member ID: {currentMember.id.substring(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Membership card with Action Buttons */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Award size={14} /> Membership Subscription
            </h4>
            {am ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4 text-slate-300">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Current Plan</p>
                    <p className="text-[#FF6B00] font-black mt-0.5">{am.plan_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Days Remaining</p>
                    <p className="text-white font-mono mt-0.5">{am.days_remaining} Days</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Valid Duration</p>
                    <p className="text-white mt-0.5">{am.start_date} to {am.end_date}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Status</p>
                    <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      am.status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                      {am.status}
                    </span>
                  </div>
                </div>

                {/* Control buttons */}
                <Permission allowedRoles={["admin", "receptionist"]}>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <Button
                      onClick={() => {
                        setUpgradePlanId("");
                        setIsUpgradeOpen(true);
                      }}
                      className="h-8 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                    >
                      Change Plan
                    </Button>
                    <Button
                      onClick={() => setIsExtendOpen(true)}
                      className="h-8 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                    >
                      Extend
                    </Button>
                    <Button
                      onClick={() => {
                        setRenewPlanId("");
                        setIsRenewOpen(true);
                      }}
                      className="h-8 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                    >
                      Renew Plan
                    </Button>
                    {am.status === "active" ? (
                      <Button
                        onClick={() => setIsFreezeConfirmOpen(true)}
                        className="h-8 bg-black hover:bg-slate-900 border border-[#F59E0B]/20 text-[10px] font-bold uppercase tracking-wider text-yellow-500 rounded-xl"
                      >
                        Freeze
                      </Button>
                    ) : am.status === "paused" ? (
                      <Button
                        onClick={handleUnfreezeSubmit}
                        className="h-8 bg-black hover:bg-slate-900 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider text-green-500 rounded-xl"
                      >
                        Resume
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="h-8 bg-black hover:bg-slate-900 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-500 rounded-xl col-span-2"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </Permission>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 italic">No active membership subscription found.</p>
                <Permission allowedRoles={["admin", "receptionist"]}>
                  <Button
                    onClick={() => {
                      if (plans.length > 0) {
                        setRenewPlanId(plans[0].id);
                        setIsRenewOpen(true);
                      } else {
                        notify.error("No plans configured");
                      }
                    }}
                    className="mt-2 h-8 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-[10px] font-bold uppercase tracking-wider"
                  >
                    Subscribe Member
                  </Button>
                </Permission>
              </div>
            )}
          </div>

          {/* Personal info */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
              <User size={14} /> Personal Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Gender</p>
                <p className="text-white capitalize mt-0.5">{p.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Date of Birth</p>
                <p className="text-white mt-0.5">{p.date_of_birth ? formatDate(p.date_of_birth) : "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Email Address</p>
                <p className="text-white mt-0.5 truncate">{p.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Phone Number</p>
                <p className="text-white mt-0.5">{p.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Occupation</p>
                <p className="text-white mt-0.5 capitalize">{p.occupation || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase">Height & Weight</p>
                <p className="text-white mt-0.5">
                  {p.height ? `${p.height} cm` : "N/A"} / {p.weight ? `${p.weight} kg` : "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-[10px] uppercase">Residential Address</p>
                <p className="text-white mt-0.5">{p.address || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
              <ShieldAlert size={14} /> Medical & Emergency Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold text-[#FF6B00]">Emergency Contact Name</p>
                <p className="text-white mt-0.5">{p.emergency_contact_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold text-[#FF6B00]">Emergency Relation & Phone</p>
                <p className="text-white mt-0.5">
                  {p.emergency_contact_phone || "N/A"}{" "}
                  {p.emergency_relation && `(${p.emergency_relation})`}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-[10px] uppercase font-bold text-red-400">Medical Notes / Constraints</p>
                <p className="text-white mt-0.5 bg-black/40 border border-white/5 p-2 rounded-xl text-[11px] whitespace-pre-line">
                  {p.medical_notes || "No reported medical conditions or physical constraints."}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Coach */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Users size={14} /> Assigned Coach</span>
              <Permission allowedRoles={["admin", "receptionist"]}>
                <Button
                  onClick={() => {
                    setAssignTrainerId(currentMember.assigned_trainer?.id || "");
                    setIsTrainerAssignOpen(true);
                  }}
                  className="h-6 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider text-slate-300"
                >
                  {currentMember.assigned_trainer ? "Change Trainer" : "Assign Trainer"}
                </Button>
              </Permission>
            </h4>
            {currentMember.assigned_trainer ? (
              <div className="text-xs font-semibold text-slate-300">
                <p className="text-white">{currentMember.assigned_trainer.full_name}</p>
                <p className="text-[10px] text-slate-500">{currentMember.assigned_trainer.specialization || "General Coaching Specialist"}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No personal trainer assigned.</p>
            )}
          </div>

          {/* Membership history timeline */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Clock size={14} /> Membership Timeline
            </h4>
            {membershipHistory.length > 0 ? (
              <div className="space-y-4 pl-2 border-l border-white/5 text-[11px] font-semibold text-slate-400">
                {membershipHistory.map((m: any, index: number) => {
                  const isCurrent = currentMember.active_membership?.id === m.id;
                  return (
                    <div key={m.id || index} className="relative pl-4">
                      <div className={`absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full ${
                        isCurrent ? "bg-[#FF6B00]" : m.status === "active" ? "bg-green-500" : "bg-slate-700"
                      }`} />
                      <p className="text-white flex items-center gap-2">
                        {m.plan?.name || m.plan_name || "Membership Plan"}{" "}
                        {isCurrent && <span className="text-[8px] bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] px-1 py-0.5 rounded-md font-bold uppercase">Current</span>}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        {m.start_date} to {m.end_date} • <span className="capitalize">{m.status}</span>
                      </p>
                      {m.notes && <p className="text-[10px] text-slate-600 italic mt-0.5">Note: {m.notes}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No membership subscription timeline records found.</p>
            )}
          </div>

          {/* Payments list */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
              <DollarSign size={14} /> Payments History
            </h4>
            {paymentHistory.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {paymentHistory.map((p: any, index: number) => (
                  <div key={p.id || index} className="bg-black/40 border border-white/5 p-2.5 rounded-2xl flex justify-between items-center text-xs font-semibold">
                    <div>
                      <p className="text-white">₹{p.amount_paid} • <span className="capitalize text-slate-400">{p.payment_method}</span></p>
                      <p className="text-[10px] text-slate-500">{p.payment_date} • Ref: {p.transaction_reference || "N/A"}</p>
                    </div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                      p.payment_status === "completed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {p.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No payment transactions registered.</p>
            )}
          </div>

          {/* Attendance history */}
          <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Activity size={14} /> Attendance History (Recent Visit Logs)
            </h4>
            {attendanceHistory.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {attendanceHistory.slice(0, 10).map((a: any, index: number) => {
                  const checkInDate = new Date(a.check_in).toLocaleString();
                  const checkOutDate = a.check_out ? new Date(a.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "In Gym";
                  return (
                    <div key={a.id || index} className="bg-black/40 border border-white/5 p-2.5 rounded-2xl flex justify-between items-center text-xs font-semibold">
                      <div>
                        <p className="text-white">{checkInDate}</p>
                        <p className="text-[10px] text-slate-500">Source: <span className="capitalize">{a.source}</span> {a.duration_minutes && `• Duration: ${a.duration_minutes}m`}</p>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        a.check_out ? "bg-slate-500/10 text-slate-400" : "bg-green-500/10 text-green-500"
                      }`}>
                        {a.check_out ? `Out ${checkOutDate}` : "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No attendance scans or manual visit logs.</p>
            )}
          </div>

          {/* Notes */}
          {currentMember.notes && (
            <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1">
                Notes
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{currentMember.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-4">
          <Button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider hover:bg-white/10 text-white"
          >
            Close Panel
          </Button>
        </div>
      </div>

      {/* SUB-MODALS FOR MEMBERSHIP CONTROLS */}
      {/* 1. EXTEND MEMBERSHIP */}
      <Dialog open={isExtendOpen} onOpenChange={setIsExtendOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Calendar size={14} className="text-[#FF6B00]" /> Extend Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Extend the member's current active plan expiration date.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Number of Days</Label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
                min="1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes / Reason</Label>
              <textarea
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
                placeholder="Reason for extension..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsExtendOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExtendSubmit}
              disabled={extendDays <= 0}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-45"
            >
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. RENEW MEMBERSHIP */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><RefreshCw size={14} className="text-[#FF6B00]" /> Renew Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Subscribe or extend membership with a chosen plan period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Renewal Plan</Label>
              <select
                value={renewPlanId}
                onChange={(e) => setRenewPlanId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                ))}
              </select>
            </div>
            {am && (
              <div className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400">Start from Expiry Date?</span>
                <input
                  type="checkbox"
                  checked={renewStartFromExpiry}
                  onChange={(e) => setRenewStartFromExpiry(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes / Comments</Label>
              <textarea
                value={renewNotes}
                onChange={(e) => setRenewNotes(e.target.value)}
                className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
                placeholder="Payment terms, special discounts..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsRenewOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRenewSubmit}
              disabled={!renewPlanId}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-45"
            >
              Renew
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. CHANGE / UPGRADE PLAN */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Sliders size={14} className="text-[#FF6B00]" /> Migrate/Change Plan</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Instantly cancel the current plan and switch to a new plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select New Plan</Label>
              <select
                value={upgradePlanId}
                onChange={(e) => setUpgradePlanId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes / Reason</Label>
              <textarea
                value={upgradeNotes}
                onChange={(e) => setUpgradeNotes(e.target.value)}
                className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
                placeholder="Reason for migration..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsUpgradeOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpgradeSubmit}
              disabled={!upgradePlanId}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-45"
            >
              Migrate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. FREEZE MEMBERSHIP */}
      <Dialog open={isFreezeConfirmOpen} onOpenChange={setIsFreezeConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Clock size={14} className="text-yellow-500" /> Pause / Freeze Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Are you sure you want to pause/freeze this membership?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-left space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pause Notes / Reason</Label>
            <textarea
              value={freezeNotes}
              onChange={(e) => setFreezeNotes(e.target.value)}
              className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
              placeholder="e.g., Medical leave, traveling..."
            />
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full mt-2">
            <Button
              type="button"
              onClick={() => setIsFreezeConfirmOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFreezeSubmit}
              className="h-10 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Freeze Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. CANCEL MEMBERSHIP */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Trash size={14} className="text-red-500" /> Cancel Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              This will immediately deactivate and terminate the subscription. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-left space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Reason</Label>
            <textarea
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
              placeholder="Reason for cancel..."
            />
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full mt-2">
            <Button
              type="button"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCancelSubmit}
              className="h-10 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. TRAINER ASSIGNMENT */}
      <Dialog open={isTrainerAssignOpen} onOpenChange={setIsTrainerAssignOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Users size={14} className="text-[#FF6B00]" /> Coach Allocation</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Assign or change the fitness coach for this member.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Fitness Coach</Label>
              <select
                value={assignTrainerId}
                onChange={(e) => setAssignTrainerId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">No Coach / Unassigned</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>{t.profile.full_name} ({t.specialization || "General"})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsTrainerAssignOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignTrainerSubmit}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function MembersTable({ onSelectMember }: MembersTableProps) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewMember, setViewMember] = useState<MemberResponse | null>(null);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [search]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEnvelope<MemberResponse[]>(
        `/api/v1/members/?page=${page}&per_page=20&search=${encodeURIComponent(debouncedSearch)}`
      );
      setMembers(res.data || []);
      setTotal(res.meta?.total ?? 0);
    } catch (err: any) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? They can be restored later.`)) return;
    try {
      await api.delete(`/api/v1/members/${id}`);
      toast.success(`${name} archived successfully`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Archive failed");
    }
  };

  const handleExport = () => {
    const rows = [
      ["Member ID", "Full Name", "Email", "Phone", "Plan", "Status", "Joined"],
      ...members.map((m) => [
        m.id,
        m.profile.full_name,
        m.profile.email ?? "",
        m.profile.phone ?? "",
        m.active_membership?.plan_name ?? "None",
        m.active_membership?.status ?? "expired",
        m.joining_date,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Members exported to CSV");
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      {/* ── Action Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Primary action */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20 transition-all"
          >
            <UserPlus size={14} />
            Add Member
          </Button>
          <Button
            onClick={handleExport}
            disabled={members.length === 0}
            className="h-9 px-3 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <Download size={13} />
            Export
          </Button>
          <Button
            onClick={fetchMembers}
            disabled={loading}
            className="h-9 w-9 p-0 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Right: Search + stats */}
        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white/3 border border-white/5 rounded-xl px-3 py-1.5">
              <Users size={11} className="text-[#FF6B00]" />
              <span className="text-white">{total}</span> members
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 w-64 border-white/5 bg-[#1a1a1a] text-white text-xs placeholder:text-slate-600 focus-visible:ring-[#FF6B00]/30 focus-visible:border-[#FF6B00]/30 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {error ? (
          <div className="p-12 text-center space-y-3">
            <XCircle size={32} className="mx-auto text-red-500/60" />
            <p className="text-xs text-red-400 font-semibold">{error}</p>
            <button
              onClick={fetchMembers}
              className="text-xs text-[#FF6B00] hover:underline font-bold"
            >
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/3">
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                {["Member", "ID", "Phone", "Active Plan", "Expiry", "Status", "Actions"].map((h) => (
                  <TableHead
                    key={h}
                    className={`text-[10px] font-black text-slate-500 uppercase tracking-wider py-3 ${
                      h === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5 animate-pulse">
                    {[144, 80, 80, 120, 80, 70, 60].map((w, j) => (
                      <TableCell key={j} className="py-4">
                        {j === 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-white/5 rounded-xl" />
                            <div className="space-y-1.5">
                              <div className="h-3 bg-white/5 rounded w-28" />
                              <div className="h-2.5 bg-white/5 rounded w-36" />
                            </div>
                          </div>
                        ) : (
                          <div className={`h-3 bg-white/5 rounded`} style={{ width: w }} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="space-y-3">
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
                        <Users size={22} className="text-slate-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-500">
                        {debouncedSearch ? "No members match your search" : "No members registered yet"}
                      </p>
                      {!debouncedSearch && (
                        <Button
                          onClick={() => setIsAddOpen(true)}
                          className="h-8 px-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-bold rounded-xl"
                        >
                          <UserPlus size={12} className="mr-1.5" /> Add First Member
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => {
                  const am = m.active_membership;
                  const status = am?.status ?? "expired";
                  return (
                    <TableRow
                      key={m.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                    >
                      {/* Member */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] font-black text-xs flex-shrink-0">
                            {m.profile.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate leading-tight">
                              {m.profile.full_name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {m.profile.email ?? m.profile.phone ?? "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* ID */}
                      <TableCell className="font-mono text-[10px] text-slate-500">
                        {m.id.substring(0, 8)}…
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-xs text-slate-400">
                        {m.profile.phone || "—"}
                      </TableCell>

                      {/* Plan */}
                      <TableCell className="text-xs text-slate-300 font-medium">
                        {am ? am.plan_name : <span className="text-slate-600">No Plan</span>}
                      </TableCell>

                      {/* Expiry */}
                      <TableCell className="text-xs text-slate-400">
                        {am ? formatDate(am.end_date) : "—"}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => {
                              setViewMember(m);
                              onSelectMember?.(m.id);
                            }}
                            className="h-7 px-2.5 text-[10px] font-bold text-slate-300 hover:text-white border border-white/5 bg-white/3 hover:bg-white/8 rounded-lg transition-all flex items-center gap-1"
                            title="View details"
                          >
                            <Eye size={11} />
                            View
                          </Button>
                          <Button
                            onClick={() => handleArchive(m.id, m.profile.full_name)}
                            className="h-7 w-7 p-0 text-red-500/70 hover:text-red-400 border border-red-500/10 bg-red-500/3 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center"
                            title="Archive member"
                          >
                            <Archive size={11} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────── */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-500 font-semibold">
            Showing{" "}
            <span className="text-white font-bold">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, total)}
            </span>{" "}
            of <span className="text-white font-bold">{total}</span> members
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-8 px-3 bg-white/3 border border-white/5 hover:bg-white/8 text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={12} /> Prev
            </Button>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-white font-bold text-[10px]">
              {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="h-8 px-3 bg-white/3 border border-white/5 hover:bg-white/8 text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Add Member Dialog ──────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl bg-[#0f0f0f] border border-white/5 text-white rounded-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center">
                  <UserPlus size={16} className="text-[#FF6B00]" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-black text-white">Register New Member</DialogTitle>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Complete all 3 steps to register a member
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <AddMemberForm
              onSuccess={() => {
                setIsAddOpen(false);
                fetchMembers();
                toast.success("Member registered and table refreshed!");
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Member Slide-Over ─────────────────────────── */}
      {viewMember && (
        <ViewMemberPanel
          member={viewMember}
          onClose={() => setViewMember(null)}
          onRefreshList={fetchMembers}
        />
      )}
    </div>
  );
}
