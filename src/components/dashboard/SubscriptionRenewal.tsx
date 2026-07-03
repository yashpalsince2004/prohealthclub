import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Sparkles, 
  Gift, 
  QrCode, 
  Percent, 
  Calculator, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Clock, 
  FileSpreadsheet, 
  Download,
  AlertTriangle,
  Award,
  BookOpen,
  History,
  CheckCircle,
  XCircle,
  Share2,
  Printer,
  ChevronRight,
  RefreshCw,
  Sliders,
  BellRing,
  Fingerprint
} from "lucide-react";
import { Member, Trainer } from "./mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface SubscriptionRenewalProps {
  members: Member[];
  trainers: Trainer[];
  onRenewMember: (memberId: string, amount: number, method: string) => void;
}

export default function SubscriptionRenewal({
  members,
  trainers,
  onRenewMember
}: SubscriptionRenewalProps) {
  // Roster selections
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  // Success dialog state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRenewedDetails, setLastRenewedDetails] = useState<any>(null);

  // Hotkeys and inputs search reference
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active loaded member
  const activeMember = members.find(m => m.id === activeMemberId);

  // Setup form defaults when member loads
  const [billingPlan, setBillingPlan] = useState("Annual Platinum Plan");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Card" | "UPI" | "Split">("UPI");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [txId, setTxId] = useState("");
  const [notes, setNotes] = useState("");

  // Additional Upsells
  const [upsells, setUpsells] = useState({
    locker: false,
    protein: false,
    diet: false,
    analysis: false
  });

  // Plan Pricing
  const planPrices: Record<string, number> = {
    "Starter Pack Monthly": 1500,
    "3-Month Gold Plan": 4500,
    "Annual Platinum Plan": 18000
  };

  const planDurations: Record<string, number> = {
    "Starter Pack Monthly": 30, // days
    "3-Month Gold Plan": 90,
    "Annual Platinum Plan": 365
  };

  const selectedBasePrice = planPrices[billingPlan] || 1500;
  const selectedDuration = planDurations[billingPlan] || 30;

  // Auto-calculated Expiry Date based on Start Date + Selected Duration
  const calculatedExpiryDate = new Date(new Date(startDate).getTime() + selectedDuration * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Additional Upsells pricing
  const lockerPrice = upsells.locker ? 1000 : 0;
  const proteinPrice = upsells.protein ? 2500 : 0;
  const dietPrice = upsells.diet ? 1500 : 0;
  const analysisPrice = upsells.analysis ? 500 : 0;

  const totalAdditional = lockerPrice + proteinPrice + dietPrice + analysisPrice;

  // Discount calculation
  const discountAmount = discountType === "percent" 
    ? (selectedBasePrice * discountVal) / 100 
    : discountVal;

  const subtotal = selectedBasePrice - discountAmount + totalAdditional;
  const gstAmount = subtotal * 0.18; // 18% GST standard
  const grandTotal = subtotal + gstAmount;

  // Hotkey hook listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + F -> Search
      if (e.key === "f" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        toast.info("Search focused. Type to find member.");
      }
      // Ctrl + S -> Save/Renew
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (activeMemberId) {
          handleRenewalSubmit();
        } else {
          toast.warning("No member selected to renew.");
        }
      }
      // Ctrl + P -> Print Preview
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (activeMemberId) {
          toast.info("Triggering print preview mockup...");
        }
      }
      // Esc -> Close Dialog
      if (e.key === "Escape") {
        setShowSuccessModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMemberId, billingPlan, discountType, discountVal, grandTotal, paymentMode]);

  // Initialize Amount Paid automatically to match Grand Total on member change
  useEffect(() => {
    setAmountPaid(parseFloat(grandTotal.toFixed(2)));
  }, [grandTotal]);

  // Auto-load promo code logic
  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "PHCFIT20") {
      setDiscountType("percent");
      setDiscountVal(20);
      toast.success("Promo code 'PHCFIT20' applied! 20% discount added.");
    } else {
      toast.error("Invalid promo code.");
    }
  };

  // Process Renewal
  const handleRenewalSubmit = () => {
    if (!activeMemberId || !activeMember) return;
    
    if (discountAmount < 0 || discountVal < 0) {
      toast.error("Invalid discount configuration.");
      return;
    }

    if (amountPaid < 0) {
      toast.error("Invalid amount paid.");
      return;
    }

    const receiptNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const details = {
      memberName: activeMember.name,
      newExpiry: calculatedExpiryDate,
      invoiceId: receiptNo,
      totalPaid: amountPaid,
      method: paymentMode
    };

    onRenewMember(activeMember.id, amountPaid, paymentMode);
    setLastRenewedDetails(details);
    setShowSuccessModal(true);
    
    // Reset Form upsells
    setUpsells({
      locker: false,
      protein: false,
      diet: false,
      analysis: false
    });
    setDiscountVal(0);
    setPromoCode("");
  };

  // Suggestions search list matching
  const suggestions = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  // SVG Progress Ring calculations
  const calculateProgress = () => {
    if (!activeMember) return 0;
    // Mock days calculations (Starter pack vs Annual plan)
    if (activeMember.status === "Active") return 85;
    if (activeMember.status === "Frozen") return 50;
    if (activeMember.status === "Expired") return 0;
    return 95;
  };

  return (
    <div className="space-y-6 select-text">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider">
            Membership Renewal Center
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Renew subscription plans, configure upsell packages, and collect UPI/Cash collections
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              toast.success("Flushed billing and cache data.");
            }}
            className="p-2.5 rounded-xl bg-[#171717] hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors"
            title="Refresh cache"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => toast.info("History exported successfully.")}
            className="px-4 py-2.5 bg-[#171717] hover:bg-white/5 border border-white/5 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download size={14} className="text-primary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Global Member Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
          <Input
            ref={searchInputRef}
            placeholder="Search member by Name, Phone, ID or barcode... (Press ⌘F to focus)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-12 h-12 border-white/5 bg-[#171717] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10 text-sm shadow-xl font-medium"
          />
        </div>

        {/* Suggestion Dropdown List */}
        {showSuggestions && searchQuery && (
          <div className="absolute top-14 left-0 right-0 z-50 bg-[#1D1D1D] border border-white/5 rounded-2xl shadow-2xl p-2 max-h-72 overflow-y-auto scrollbar-none divide-y divide-white/5 animate-in fade-in duration-150">
            {suggestions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                No member profiles found.
              </div>
            ) : (
              suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveMemberId(s.id);
                    setSearchQuery("");
                    setShowSuggestions(false);
                    // Autofill plan matching current
                    setBillingPlan(s.membership.includes("Starter") ? "Starter Pack Monthly" : s.membership.includes("Gold") ? "3-Month Gold Plan" : "Annual Platinum Plan");
                    toast.success(`Loaded profile for ${s.name}`);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={s.photo} 
                      alt={s.name} 
                      className="h-10 w-10 object-cover rounded-lg border border-white/5"
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold font-mono mt-0.5">{s.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400">{s.membership}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      s.status === "Active" ? "bg-[#00C853]/10 text-[#00C853]" :
                      s.status === "Frozen" ? "bg-amber-500/10 text-amber-500" :
                      "bg-[#FF5252]/10 text-[#FF5252]"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeMember ? (
          /* EMPTY STATE */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#171717] border border-white/5 rounded-2xl p-16 text-center shadow-xl space-y-4 max-w-lg mx-auto mt-8"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <Fingerprint size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-white tracking-widest">Renewal Gateway</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Search and select an active, frozen, or expired member above to initiate a subscription renewal checkout.
              </p>
            </div>
          </motion.div>
        ) : (
          /* WORKSPACE TWO COLUMN */
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Member Info, stats and upsells */}
            <div className="lg:col-span-5 space-y-6">
              {/* Member Summary Card */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5">
                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                  <img 
                    src={activeMember.photo} 
                    alt={activeMember.name} 
                    className="h-16 w-16 object-cover rounded-xl border border-white/5"
                  />
                  <div>
                    <h3 className="text-sm font-black text-white">{activeMember.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold font-mono mt-0.5">{activeMember.id}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-1.5 ${
                      activeMember.status === "Active" ? "bg-[#00C853]/10 text-[#00C853]" :
                      activeMember.status === "Frozen" ? "bg-amber-500/10 text-amber-500" :
                      "bg-[#FF5252]/10 text-[#FF5252]"
                    }`}>
                      {activeMember.status} Plan
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs font-semibold">
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Phone Contact</span>
                    <span className="text-white mt-1 block">{activeMember.phone}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Email Address</span>
                    <span className="text-white mt-1 block truncate">{activeMember.email}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Emergency Contact</span>
                    <span className="text-white mt-1 block truncate">
                      {activeMember.emergencyContact.name} ({activeMember.emergencyContact.relationship})
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Medical Disclaimers</span>
                    <span className="text-white mt-1 block truncate text-[#FF5252]">
                      {activeMember.medicalConditions.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Membership Status Progress and Timeline */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Subscription Status</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{activeMember.membership}</p>
                  </div>

                  {/* SVG progress ring indicator */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <svg height="48" width="48" className="transform -rotate-90">
                        <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth="4" r="18" cx="24" cy="24" />
                        <circle 
                          stroke={activeMember.status === "Active" ? "#00C853" : activeMember.status === "Frozen" ? "#FFC107" : "#FF5252"} 
                          fill="transparent" 
                          strokeWidth="4" 
                          strokeDasharray={`${2 * Math.PI * 18}`}
                          strokeDashoffset={`${2 * Math.PI * 18 * (1 - calculateProgress() / 100)}`}
                          r="18" 
                          cx="24" 
                          cy="24" 
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-white">{calculateProgress()}%</span>
                    </div>
                  </div>
                </div>

                {/* Date values */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-3 text-xs font-semibold text-slate-400">
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Last Renewal</span>
                    <span className="text-white mt-1 block">2026-06-04</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block leading-none">Expiry Date</span>
                    <span className="text-white mt-1 block">{activeMember.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Attendance quick analysis card */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Attendance summary</h4>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">July cycle</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block">This Month</span>
                    <span className="text-white font-black text-sm mt-0.5 block">14 visits</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block">Last Month</span>
                    <span className="text-white font-black text-sm mt-0.5 block">22 visits</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase block">Max Streak</span>
                    <span className="text-[#00C853] font-black text-sm mt-0.5 block">8 days</span>
                  </div>
                </div>
              </div>

              {/* Upsell Additional Services toggles */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Club Upsell Packages</h4>
                <div className="space-y-3.5">
                  {[
                    { id: "locker", label: "Locker Facility (₹1,000 / month)", state: upsells.locker },
                    { id: "protein", label: "Monthly Protein shake package (₹2,500)", state: upsells.protein },
                    { id: "diet", label: "Custom Nutrition Diet chart (₹1,500)", state: upsells.diet },
                    { id: "analysis", label: "InBody Composition analysis (₹500)", state: upsells.analysis }
                  ].map(up => (
                    <div key={up.id} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-xs font-semibold text-slate-300">{up.label}</span>
                      <Switch
                        checked={up.state}
                        onCheckedChange={(checked) => setUpsells(prev => ({ ...prev, [up.id]: checked }))}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Renewal Form and Invoice Checkout */}
            <div className="lg:col-span-7 space-y-6">
              {/* Renewal Configuration panel */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Renewal Configuration</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select subscription plan parameters</p>
                </div>

                <div className="space-y-4 py-1">
                  {/* Select Plan */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Category</label>
                    <Select value={billingPlan} onValueChange={setBillingPlan}>
                      <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue placeholder="Choose plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="Starter Pack Monthly">Starter Pack Monthly (₹1,500)</SelectItem>
                        <SelectItem value="3-Month Gold Plan">3-Month Gold Plan (₹4,500)</SelectItem>
                        <SelectItem value="Annual Platinum Plan">Annual Platinum Plan (₹18,000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dates Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto calculated Expiry</label>
                      <div className="h-11 border border-white/5 bg-white/5 text-slate-300 font-mono flex items-center px-3.5 rounded-xl text-xs font-bold select-none">
                        {calculatedExpiryDate}
                      </div>
                    </div>
                  </div>

                  {/* Discount options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Mode</label>
                      <Select value={discountType} onValueChange={(val: any) => { setDiscountType(val); setDiscountVal(0); }}>
                        <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                          <SelectValue placeholder="Discount Mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                          <SelectItem value="percent">Percentage (%)</SelectItem>
                          <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value</label>
                      <Input
                        type="number"
                        min="0"
                        value={discountVal}
                        onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apply Promo Code</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. PHCFIT20"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-600 uppercase font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-xs"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary Invoice layout */}
              <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Invoice details</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time ledger breakdown</p>
                  </div>
                  <div className="h-7 w-7 rounded bg-white flex items-center justify-center p-0.5">
                    <QrCode className="h-full w-full text-black" />
                  </div>
                </div>

                {/* Ledger calculations breakdown */}
                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Base Plan Price:</span>
                    <span className="text-white">₹{selectedBasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Additional Services Upsell:</span>
                    <span className="text-white">₹{totalAdditional.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Special Discount Deducted:</span>
                    <span className="text-[#FF5252]">- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">GST (18% Service Tax):</span>
                    <span className="text-white">₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-black border-t border-white/5 pt-3">
                    <span className="text-white">Grand Total Collection:</span>
                    <span className="text-[#00C853]">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Payment details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</label>
                    <Select value={paymentMode} onValueChange={(val: any) => setPaymentMode(val)}>
                      <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="UPI">UPI Transfer</SelectItem>
                        <SelectItem value="Cash">Cash Ledger</SelectItem>
                        <SelectItem value="Card">Credit/Debit Card</SelectItem>
                        <SelectItem value="Split">Split payment mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ref ID / TX ID</label>
                    <Input
                      placeholder="TX-XXXX-XXXX"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRenewalSubmit}
                  className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-wider rounded-xl shadow-lg hover:shadow-primary/15 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  <span>Renew Subscription (Ctrl + S)</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENEWAL SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && lastRenewedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#171717] border border-white/5 max-w-md w-full rounded-2xl p-6 shadow-2xl text-center space-y-6"
            >
              <div className="h-16 w-16 bg-[#00C853]/10 text-[#00C853] rounded-full flex items-center justify-center mx-auto border border-[#00C853]/20">
                <CheckCircle size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black uppercase text-white tracking-widest">Renewal Success</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Membership for <span className="text-white font-bold">{lastRenewedDetails.memberName}</span> has been renewed.
                </p>
              </div>

              <div className="bg-[#1D1D1D] border border-white/5 p-4 rounded-xl text-left text-xs font-semibold space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice ID:</span>
                  <span className="text-white font-mono">{lastRenewedDetails.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New Expiry:</span>
                  <span className="text-[#00C853] font-bold">{lastRenewedDetails.newExpiry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Collected:</span>
                  <span className="text-white font-bold">₹{lastRenewedDetails.totalPaid.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toast.success("Sending receipt via WhatsApp...");
                  }}
                  className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-[#00C853] font-bold text-xs rounded-xl transition-all"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    toast.success("Printing invoice layout...");
                  }}
                  className="flex-1 py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all"
                >
                  Print Invoice
                </button>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#1D1D1D] hover:bg-white/5 text-white border border-white/5 font-bold rounded-xl h-10"
              >
                Close (Esc)
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
