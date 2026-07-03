import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Send,
  Plus,
  TrendingUp,
  Download,
  Filter,
  CreditCard,
  UserCheck
} from "lucide-react";
import { PayrollRecord, Staff, Trainer } from "../dashboard/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface StaffPayoutsModuleProps {
  payrollRecords: PayrollRecord[];
  staffList: Staff[];
  trainers: Trainer[];
  onUpdatePayroll: (record: PayrollRecord) => void;
  onAddPayroll: (record: PayrollRecord) => void;
}

export default function StaffPayoutsModule({
  payrollRecords,
  staffList,
  trainers,
  onUpdatePayroll,
  onAddPayroll
}: StaffPayoutsModuleProps) {
  const [filterMonth, setFilterMonth] = useState<string>("June 2026");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Advance Payment Modal states
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceRecipientId, setAdvanceRecipientId] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceMonth, setAdvanceMonth] = useState("July 2026");
  const [advanceMethod, setAdvanceMethod] = useState<"UPI" | "Cash" | "Bank Transfer">("UPI");

  // Calculate Metrics
  const relevantRecords = payrollRecords.filter(r => r.month === filterMonth);
  
  const totalPayroll = relevantRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = relevantRecords.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0);
  const totalPending = relevantRecords.filter(r => r.status === "Pending").reduce((sum, r) => sum + r.amount, 0);
  const totalAdvance = relevantRecords.filter(r => r.status === "Advance Paid").reduce((sum, r) => sum + r.amount, 0);

  // Combine trainers and staff for drop-down recipient list
  const recipients = [
    ...trainers.map(t => ({ id: t.id, name: t.name, role: "Trainer" })),
    ...staffList.map(s => ({ id: s.id, name: s.name, role: s.role }))
  ];

  const handleCreateAdvancePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceRecipientId || !advanceAmount) {
      toast.error("Please select a recipient and enter amount.");
      return;
    }

    const selected = recipients.find(r => r.id === advanceRecipientId);
    if (!selected) return;

    const newRecord: PayrollRecord = {
      id: `PAY-${Date.now().toString().slice(-3)}`,
      recipientId: selected.id,
      recipientName: selected.name,
      role: selected.role,
      amount: parseFloat(advanceAmount),
      status: "Advance Paid",
      month: advanceMonth,
      paymentDate: new Date().toISOString().split("T")[0],
      method: advanceMethod
    };

    onAddPayroll(newRecord);
    toast.success(`Successfully logged advance payment of ₹${parseFloat(advanceAmount).toLocaleString()} to ${selected.name}`);
    setShowAdvanceModal(false);
    setAdvanceRecipientId("");
    setAdvanceAmount("");
  };

  const handleStatusChange = (record: PayrollRecord, newStatus: "Paid" | "Pending" | "Advance Paid") => {
    const updated: PayrollRecord = {
      ...record,
      status: newStatus,
      paymentDate: newStatus !== "Pending" ? new Date().toISOString().split("T")[0] : undefined,
      method: newStatus !== "Pending" ? (record.method || "UPI") : undefined
    };
    onUpdatePayroll(updated);
    toast.success(`Updated status for ${record.recipientName} to ${newStatus}`);
  };

  const filteredRecords = payrollRecords.filter(r => {
    const matchesMonth = r.month === filterMonth;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesMonth && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">Payroll & Payout Ledger</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Audit payouts, resolve pending salaries, and record advance payroll collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAdvanceModal(true)}
            className="bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl h-10 px-4 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Pay Advance Salary</span>
          </Button>
          <button
            onClick={() => toast.success("Payroll details exported to CSV.")}
            className="p-2.5 bg-[#171717] hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Export CSV Ledger"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Monthly Payroll</span>
            <h3 className="text-2xl font-black text-white">₹{totalPayroll.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-[#00C853] uppercase tracking-widest">Paid Out</span>
            <h3 className="text-2xl font-black text-white">₹{totalPaid.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-[#00C853]/10 rounded-xl flex items-center justify-center text-[#00C853]">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-[#FF5252] uppercase tracking-widest">Salaries Pending</span>
            <h3 className="text-2xl font-black text-white">₹{totalPending.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-[#FF5252]/10 rounded-xl flex items-center justify-center text-[#FF5252]">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Paid in Advance</span>
            <h3 className="text-2xl font-black text-white">₹{totalAdvance.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* Monthly Filters */}
      <div className="flex gap-4 bg-[#171717] border border-white/5 p-4 rounded-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-primary" />
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="h-9 border-none bg-white/5 text-xs text-white font-bold rounded-lg w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
              <SelectItem value="June 2026">June 2026</SelectItem>
              <SelectItem value="July 2026">July 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={14} className="text-slate-500" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 border-none bg-white/5 text-xs text-white font-bold rounded-lg w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Advance Paid">Advance Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-[#171717] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#1d1d1d] border-b border-white/5">
            <TableRow>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Recipient</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Position / Role</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Amount</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Pay Month</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Payment Method</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Clearance Date</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Status Indicator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5">
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500 font-semibold">
                  No payroll records found for the selected cycle.
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-white/5 transition-colors">
                  <TableCell className="py-3.5">
                    <p className="text-xs font-bold text-white">{record.recipientName}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{record.recipientId}</p>
                  </TableCell>
                  <TableCell className="py-3.5 text-xs text-slate-300 font-semibold">{record.role}</TableCell>
                  <TableCell className="py-3.5 text-xs font-black text-white">₹{record.amount.toLocaleString()}</TableCell>
                  <TableCell className="py-3.5 text-xs font-bold text-slate-400">{record.month}</TableCell>
                  <TableCell className="py-3.5 text-xs text-slate-300 font-semibold">
                    {record.method || <span className="text-slate-600">—</span>}
                  </TableCell>
                  <TableCell className="py-3.5 text-[10px] font-bold text-slate-400 font-mono">
                    {record.paymentDate || <span className="text-slate-600">—</span>}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Select 
                      value={record.status} 
                      onValueChange={(val: any) => handleStatusChange(record, val)}
                    >
                      <SelectTrigger className={`h-8 border-none text-[10px] font-black uppercase tracking-wider rounded-lg w-32 ${
                        record.status === "Paid" ? "bg-[#00C853]/10 text-[#00C853]" :
                        record.status === "Pending" ? "bg-[#FF5252]/10 text-[#FF5252]" :
                        "bg-blue-500/10 text-blue-500"
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Advance Paid">Advance Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ADVANCE PAYMENT BUILDER MODAL */}
      <AnimatePresence>
        {showAdvanceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#171717] border border-white/5 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-widest">Advance Payment Builder</h3>
                <button 
                  onClick={() => setShowAdvanceModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreateAdvancePayment} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 uppercase tracking-wider">Select Staff / Trainer</Label>
                  <Select value={advanceRecipientId} onValueChange={setAdvanceRecipientId}>
                    <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                      <SelectValue placeholder="Choose recipient" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                      {recipients.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 uppercase tracking-wider">Advance Amount (₹)</Label>
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 15000"
                      value={advanceAmount}
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 uppercase tracking-wider">Payment Method</Label>
                    <Select value={advanceMethod} onValueChange={(val: any) => setAdvanceMethod(val)}>
                      <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="UPI">UPI Transfer</SelectItem>
                        <SelectItem value="Cash">Cash Ledger</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 uppercase tracking-wider">Target Payroll Month</Label>
                  <Select value={advanceMonth} onValueChange={setAdvanceMonth}>
                    <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                      <SelectItem value="June 2026">June 2026</SelectItem>
                      <SelectItem value="July 2026">July 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-wider rounded-xl mt-2"
                >
                  Confirm Advance Payout
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
