import React, { useState, useEffect } from "react";
import { CreditCard, Power, Plus, ShieldAlert, X } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { api } from "../../lib/api";
import type { PlanResponse } from "../../lib/types";

interface MembershipActionsProps {
  membership: any;
  onUpdate: () => void;
}

export default function MembershipActions({ membership, onUpdate }: MembershipActionsProps) {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals visibility
  const [isFreezeOpen, setIsFreezeOpen] = useState(false);
  const [isUnfreezeOpen, setIsUnfreezeOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Modal form states
  const [freezeNotes, setFreezeNotes] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [upgradeNotes, setUpgradeNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("Moved away");
  const [customReason, setCustomReason] = useState("");

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get<PlanResponse[]>("/api/v1/plans/?active_only=true");
      setPlans(res || []);
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (isUpgradeOpen) {
      fetchPlans();
    }
  }, [isUpgradeOpen]);

  const handleFreeze = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/v1/memberships/${membership.id}/freeze`, {
        notes: freezeNotes
      });
      toast.success("Membership successfully paused/frozen.");
      setIsFreezeOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to freeze membership");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnfreeze = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/v1/memberships/${membership.id}/unfreeze`);
      toast.success("Membership successfully resumed/unfrozen.");
      setIsUnfreezeOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to unfreeze membership");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a new membership plan.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/v1/memberships/${membership.id}/upgrade`, {
        new_plan_id: selectedPlanId,
        notes: upgradeNotes
      });
      toast.success("Membership successfully upgraded to the new plan!");
      setIsUpgradeOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to upgrade membership");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const finalReason = cancelReason === "Other" ? customReason : cancelReason;
    if (cancelReason === "Other" && !customReason) {
      toast.error("Please specify a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/api/v1/memberships/${membership.id}/status`, {
        status: "cancelled",
        notes: finalReason
      });
      toast.success("Membership successfully cancelled.");
      setIsCancelOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel membership");
    } finally {
      setSubmitting(false);
    }
  };

  const status = membership.status;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status === "active" && (
        <>
          <Button
            onClick={() => setIsFreezeOpen(true)}
            className="h-8 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-wider px-2.5"
          >
            Freeze
          </Button>
          <Button
            onClick={() => setIsUpgradeOpen(true)}
            className="h-8 rounded-lg bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-black uppercase tracking-wider px-2.5"
          >
            Upgrade
          </Button>
          <Button
            onClick={() => setIsCancelOpen(true)}
            className="h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider px-2.5"
          >
            Cancel
          </Button>
        </>
      )}

      {status === "paused" && (
        <>
          <Button
            onClick={() => setIsUnfreezeOpen(true)}
            className="h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-wider px-2.5"
          >
            Unfreeze
          </Button>
          <Button
            onClick={() => setIsCancelOpen(true)}
            className="h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider px-2.5"
          >
            Cancel
          </Button>
        </>
      )}

      {status === "expired" && (
        <Button
          onClick={() => setIsUpgradeOpen(true)} // reuse upgrade modal as a renewal modal
          className="h-8 rounded-lg bg-[#FF6B00] hover:bg-[#FF8020] text-white text-[10px] font-black uppercase tracking-wider px-2.5"
        >
          Renew
        </Button>
      )}

      {status === "cancelled" && (
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pr-2">
          No Actions
        </span>
      )}

      {/* FREEZE MODAL */}
      <Dialog open={isFreezeOpen} onOpenChange={() => setIsFreezeOpen(false)}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-[#FF6B00]">
              Freeze Membership
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Temporarily pause this membership. It can be resumed at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason / Notes</label>
              <Input
                value={freezeNotes}
                onChange={(e) => setFreezeNotes(e.target.value)}
                placeholder="e.g. Medical leave, traveling..."
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button onClick={() => setIsFreezeOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleFreeze} disabled={submitting} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-10 rounded-xl">
              Pause Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UNFREEZE MODAL */}
      <Dialog open={isUnfreezeOpen} onOpenChange={() => setIsUnfreezeOpen(false)}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-[#FF6B00]">
              Resume Membership
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Resume active member check-in privileges immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button onClick={() => setIsUnfreezeOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleUnfreeze} disabled={submitting} className="bg-green-500 hover:bg-green-600 text-white font-bold h-10 rounded-xl">
              Resume Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* UPGRADE / RENEW MODAL */}
      <Dialog open={isUpgradeOpen} onOpenChange={() => setIsUpgradeOpen(false)}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-[#FF6B00]">
              {status === "expired" ? "Renew Membership" : "Upgrade Membership"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {status === "expired" 
                ? "Re-subscribe this member to a catalog plan." 
                : "Cancel current active subscription and migrate to a new plan starting today."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Current Plan</span>
              <span className="text-xs font-bold text-white">{membership.plan?.name || "None"}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select New Plan</label>
              <Select value={selectedPlanId} onValueChange={(val) => setSelectedPlanId(val)}>
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border border-white/5 text-white">
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} (₹{p.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upgrade Notes</label>
              <Input
                value={upgradeNotes}
                onChange={(e) => setUpgradeNotes(e.target.value)}
                placeholder="Billing notes or adjustments..."
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button onClick={() => setIsUpgradeOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={submitting} className="bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold h-10 rounded-xl">
              Confirm Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CANCEL MODAL */}
      <Dialog open={isCancelOpen} onOpenChange={() => setIsCancelOpen(false)}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center gap-2">
              <ShieldAlert size={18} />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure? This action is immediate and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reason for Cancellation</label>
              <Select value={cancelReason} onValueChange={(val) => setCancelReason(val)}>
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border border-white/5 text-white">
                  <SelectItem value="Moved away">Moved away</SelectItem>
                  <SelectItem value="Financial reasons">Financial reasons</SelectItem>
                  <SelectItem value="Dissatisfied">Dissatisfied with services</SelectItem>
                  <SelectItem value="Other">Other (specify below)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cancelReason === "Other" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specify Reason</label>
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Reason..."
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button onClick={() => setIsCancelOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
              Abort
            </Button>
            <Button onClick={handleCancel} disabled={submitting} className="bg-red-500 hover:bg-red-600 text-white font-bold h-10 rounded-xl">
              Confirm Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
