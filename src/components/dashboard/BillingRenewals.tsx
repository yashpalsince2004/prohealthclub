import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  FileText, 
  ArrowRight, 
  Percent, 
  Calculator,
  UserCheck,
  CheckCircle,
  FileDown
} from "lucide-react";
import { Member } from "./mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface BillingRenewalsProps {
  members: Member[];
  onRenewMember: (memberId: string, amount: number, method: string) => void;
}

export default function BillingRenewals({
  members,
  onRenewMember
}: BillingRenewalsProps) {
  // Compute billing summary metrics
  const paidInvoices = members.flatMap(m => m.invoices.filter(inv => inv.status === "Paid"));
  const pendingInvoices = members.flatMap(m => m.invoices.filter(inv => inv.status === "Pending"));

  const todayCollection = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Expiring memberships (expiry date close to current date)
  const expiringMembers = members.filter(m => m.status === "Active" && new Date(m.expiryDate) < new Date("2026-09-01"));

  // Invoice Generator State
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [billingPlan, setBillingPlan] = useState("Annual Platinum Plan");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "UPI" | "Split">("UPI");
  const [invoicePreview, setInvoicePreview] = useState<any | null>(null);

  // Prices mapper
  const planPrices: Record<string, number> = {
    "Annual Platinum Plan": 18000,
    "3-Month Gold Plan": 4500,
    "Starter Pack Monthly": 1500
  };

  const selectedPlanPrice = planPrices[billingPlan] || 18000;
  const discountAmount = (selectedPlanPrice * discountPercent) / 100;
  const subtotal = selectedPlanPrice - discountAmount;
  const taxAmount = subtotal * 0.18; // 18% GST
  const grandTotal = subtotal + taxAmount;

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error("Please select a member first.");
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const newInvoice = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      memberName: member.name,
      memberId: member.id,
      plan: billingPlan,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total: grandTotal,
      method: paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };

    setInvoicePreview(newInvoice);
    toast.success("Invoice generated! Preview loaded.");
  };

  const handleFinalizeReceipt = () => {
    if (!invoicePreview) return;

    onRenewMember(invoicePreview.memberId, invoicePreview.total, invoicePreview.method);
    toast.success(`Successfully processed payment of ₹${invoicePreview.total.toLocaleString()}!`);
    setInvoicePreview(null);
    setSelectedMemberId("");
  };

  return (
    <div className="space-y-6">
      {/* Billing KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's collection</span>
            <p className="text-3xl font-black text-[#00C853]">₹{todayCollection.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#00C853]/10 flex items-center justify-center text-[#00C853]">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Target Ledger</span>
            <p className="text-3xl font-black text-white">₹1,20,000</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Bills</span>
            <p className="text-3xl font-black text-[#FF5252]">₹{pendingAmount.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#FF5252]/10 flex items-center justify-center text-[#FF5252]">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tax Accrued (GST 18%)</span>
            <p className="text-3xl font-black text-amber-500">₹{(todayCollection * 0.18).toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Calculator size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Invoice Builder Form */}
        <div className="lg:col-span-5 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Invoice Generator</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure client renewal invoice</p>
          </div>

          <form onSubmit={handleGenerateInvoice} className="space-y-4">
            {/* Member */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Member</label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                  <SelectValue placeholder="Choose account" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Category</label>
              <Select value={billingPlan} onValueChange={setBillingPlan}>
                <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  <SelectItem value="Annual Platinum Plan">Annual Platinum Plan (₹18,000)</SelectItem>
                  <SelectItem value="3-Month Gold Plan">3-Month Gold Plan (₹4,500)</SelectItem>
                  <SelectItem value="Starter Pack Monthly">Starter Pack Monthly (₹1,500)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount & Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</label>
                <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                  <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                    <SelectItem value="UPI">UPI Transfer</SelectItem>
                    <SelectItem value="Cash">Cash Ledger</SelectItem>
                    <SelectItem value="Card">Credit/Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg"
            >
              <FileText size={16} />
              <span>Draft Receipt Preview</span>
            </Button>
          </form>
        </div>

        {/* Right Column: Receipt Preview / Renewals Panel */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {invoicePreview ? (
              /* Receipt Invoice Preview Card */
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#FF7A00] uppercase tracking-widest leading-none">PHC RECEIPT</span>
                      <h4 className="text-xs font-mono text-slate-500">{invoicePreview.id}</h4>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">{invoicePreview.date}</span>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Bill To:</span>
                      <span className="text-white font-bold">{invoicePreview.memberName} ({invoicePreview.memberId})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Service Plan:</span>
                      <span className="text-white font-semibold">{invoicePreview.plan}</span>
                    </div>
                    <div className="border-t border-white/5 my-3 pt-3 space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Subtotal:</span>
                        <span>₹{invoicePreview.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Discount:</span>
                        <span className="text-[#FF5252]">- ₹{invoicePreview.discount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Tax Accrued (GST 18%):</span>
                        <span>₹{invoicePreview.tax.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-base font-black border-t border-white/5 pt-3">
                      <span className="text-white">Grand Total:</span>
                      <span className="text-[#00C853]">₹{invoicePreview.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => setInvoicePreview(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white transition-all border border-white/5"
                  >
                    Cancel Draft
                  </button>
                  <Button
                    onClick={handleFinalizeReceipt}
                    className="flex-1 h-11 bg-[#00C853] hover:bg-[#00C853]/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={16} />
                    <span>Process Payment</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Expiring Plan renew warnings */
              <motion.div
                key="renewals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Expiring Roster Accounts
                </h3>
                <div className="bg-[#1D1D1D] border border-white/5 rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/5 hover:bg-transparent">
                        <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Plan</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expiry Date</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiringMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-semibold">
                            No memberships expiring soon.
                          </TableCell>
                        </TableRow>
                      ) : (
                        expiringMembers.map(m => (
                          <TableRow key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                            <TableCell className="text-xs font-black text-white">{m.name}</TableCell>
                            <TableCell className="text-xs text-slate-400">{m.membership}</TableCell>
                            <TableCell className="text-xs text-[#FF5252] font-semibold">{m.expiryDate}</TableCell>
                            <TableCell className="text-right">
                              <button
                                onClick={() => {
                                  setSelectedMemberId(m.id);
                                  setBillingPlan(m.membership);
                                  toast.info(`Configured Invoice Builder for ${m.name}`);
                                }}
                                className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-xs font-bold text-primary hover:bg-primary/20 rounded-xl transition-all"
                              >
                                Select
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
