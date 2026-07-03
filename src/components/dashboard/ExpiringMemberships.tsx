import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { MembershipResponse, PlanResponse } from "../../lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ExpiringMemberships() {
  const [expiring, setExpiring] = useState<MembershipResponse[]>([]);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Renewal modal state
  const [renewingMembership, setRenewingMembership] = useState<MembershipResponse | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [expiringRes, plansRes] = await Promise.all([
        api.get<MembershipResponse[]>("/api/v1/memberships/expiring-soon"),
        api.get<PlanResponse[]>("/api/v1/plans/?active_only=true"),
      ]);
      setExpiring(expiringRes);
      setPlans(plansRes);
    } catch (err) {
      console.error("Failed to load expiring memberships", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenewSubmit = async () => {
    if (!renewingMembership || !selectedPlanId) {
      toast.error("Please select a plan to renew");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/v1/memberships/${renewingMembership.id}/renew`, {
        plan_id: selectedPlanId,
        discount_percent: parseFloat(discount) || 0.0,
        auto_renew: false,
      });
      toast.success("Membership renewed successfully!");
      setRenewingMembership(null);
      setSelectedPlanId("");
      setDiscount("0");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to renew membership");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl shadow-lg space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Expiring Subscriptions</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Active memberships expiring within the next 7 days
            </p>
          </div>
        </div>
        <Button
          onClick={fetchData}
          size="sm"
          className="bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg gap-1.5"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 font-semibold animate-pulse">
            Fetching expiring accounts...
          </div>
        ) : expiring.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-semibold border border-dashed border-white/5 rounded-xl">
            No memberships expiring soon. Excellent retention!
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b border-white/5">
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">End Date</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Left</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiring.map((m) => (
                <TableRow key={m.id} className="border-b border-white/5 hover:bg-white/5">
                  <TableCell className="text-xs font-bold text-white">Member (ID: {m.member_id.substring(0, 8)})</TableCell>
                  <TableCell className="text-xs text-slate-300 font-medium">{m.plan.name}</TableCell>
                  <TableCell className="text-xs text-slate-400">{formatDate(m.end_date)}</TableCell>
                  <TableCell className="text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-black font-mono">
                      {m.days_remaining} days
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        setRenewingMembership(m);
                        setSelectedPlanId(m.plan.id);
                      }}
                      className="h-8 px-3 text-[10px] font-bold bg-primary hover:bg-primary/95 text-white rounded-lg flex items-center gap-1 ml-auto"
                    >
                      <RefreshCw size={10} />
                      <span>Renew</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Renewal Dialog Modal */}
      <Dialog open={!!renewingMembership} onOpenChange={(open) => !open && setRenewingMembership(null)}>
        <DialogContent className="bg-[#1D1D1D] border-white/5 text-white rounded-2xl max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5">
              <Sparkles className="text-primary" size={18} />
              <span>Renew Membership</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Set up a new subscription period for this member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-3 text-slate-300">
            {/* Plan Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Select Subscription Plan
              </label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.duration_days} days - ₹{p.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Discount Percent (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setRenewingMembership(null)}
              variant="ghost"
              className="hover:bg-white/5 text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenewSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary/95 text-white rounded-xl font-bold"
            >
              Confirm Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
