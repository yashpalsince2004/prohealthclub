import { useState, useEffect, useMemo } from "react";
import { 
  UserPlus, Check, Key, ShieldCheck, Printer, CheckCircle, Eye, EyeOff, Copy, Clipboard, DollarSign
} from "lucide-react";
import { api } from "../../lib/api";
import { pricingService } from "../../lib/pricingService";
import type { PlanResponse, MemberResponse, PTPlan, LockerPlan, AdditionalService } from "../../lib/types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { formatINR } from "../../lib/format";

export default function AddMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [ptPlans, setPtPlans] = useState<PTPlan[]>([]);
  const [lockerPlans, setLockerPlans] = useState<LockerPlan[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdSummary, setCreatedSummary] = useState<any | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("male");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [password, setPassword] = useState("123456");

  // Billing states
  const [regCategory, setRegCategory] = useState("CrossFit + Weight Training");
  const [regDuration, setRegDuration] = useState(30);
  const [regLocker, setRegLocker] = useState(false);
  const [regPT, setRegPT] = useState(false);
  const [regPTPlanId, setRegPTPlanId] = useState("");
  const [regPTDuration, setRegPTDuration] = useState(1);
  const [regTrainerId, setRegTrainerId] = useState("");
  const [regSelectedServices, setRegSelectedServices] = useState<string[]>([]);
  const [regPaymentMethod, setRegPaymentMethod] = useState<any>("cash");
  const [regAmountPaid, setRegAmountPaid] = useState("");
  const [regNotes, setRegNotes] = useState("");

  // Load configs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainersList, plansList, ptList, lockerList, servicesList] = await Promise.all([
          api.get<any>("/api/v1/trainers/?available_only=true").then(res => res.trainers || res || []),
          pricingService.getMembershipPlans(),
          pricingService.getPTPlans(),
          pricingService.getLockerPlans(),
          pricingService.getAdditionalServices()
        ]);
        setTrainers(trainersList);
        setPlans(plansList);
        setPtPlans(ptList);
        setLockerPlans(lockerList);
        setAdditionalServices(servicesList);
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // POS Invoice calculations
  const billingCalculations = useMemo(() => {
    const resolvedPlan = plans.find(p => p.category === regCategory && p.duration_days === Number(regDuration));
    const baseMembershipCost = resolvedPlan ? Number(resolvedPlan.price) : 0;
    const admissionFee = resolvedPlan ? Number(resolvedPlan.admission_fee) : 0;
    const taxPercent = resolvedPlan ? Number(resolvedPlan.tax) : 0;

    const depositLocker = regLocker && lockerPlans.length > 0 ? Number(lockerPlans[0].deposit) : 0;
    let rentLocker = 0;
    if (regLocker && lockerPlans.length > 0) {
      const lockObj = lockerPlans[0];
      const days = Number(regDuration);
      if (days >= 90) {
        rentLocker = (days / 90) * Number(lockObj.quarterly_rent);
      } else {
        rentLocker = (days / 30) * Number(lockObj.monthly_rent);
      }
    }

    const ptPkg = ptPlans.find(pt => pt.id === regPTPlanId);
    const ptMonthlyPrice = ptPkg ? Number(ptPkg.price) : 0;
    const ptMonths = Number(regPTDuration);
    const ptBaseCost = ptMonthlyPrice * ptMonths;
    const ptDiscountPercent = ptMonths === 3 ? 10 : ptMonths === 6 ? 15 : ptMonths === 12 ? 20 : 0;
    const ptDiscountAmount = ptBaseCost * (ptDiscountPercent / 100);
    const netPTCost = ptBaseCost - ptDiscountAmount;

    let servicesCost = 0;
    regSelectedServices.forEach(srvId => {
      const srv = additionalServices.find(s => s.id === srvId);
      if (srv) {
        servicesCost += Number(srv.price);
      }
    });

    const taxableAmount = baseMembershipCost + rentLocker + netPTCost + servicesCost;
    const gstAmount = taxableAmount * (taxPercent / 100);
    const grandTotal = admissionFee + depositLocker + taxableAmount + gstAmount;

    return {
      resolvedPlanId: resolvedPlan?.id || "",
      resolvedPlan,
      baseMembershipCost,
      admissionFee,
      depositLocker,
      rentLocker,
      ptBaseCost,
      ptDiscountPercent,
      ptDiscountAmount,
      netPTCost,
      servicesCost,
      taxPercent,
      gstAmount,
      grandTotal
    };
  }, [regCategory, regDuration, regLocker, regPTPlanId, regPTDuration, regSelectedServices, plans, ptPlans, lockerPlans, additionalServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Name, Phone, and Email are required.");
      return;
    }
    if (!billingCalculations.resolvedPlanId) {
      toast.error("No valid membership plan resolved for selection.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create member
      const member = await api.post<MemberResponse>("/api/v1/members/", {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        date_of_birth: dob || null,
        gender: gender || null,
        address: address.trim() || null,
        emergency_contact_name: emergencyName.trim() || null,
        emergency_contact_phone: emergencyPhone.trim() || null,
        emergency_relation: emergencyRelation.trim() || null,
        notes: (medicalNotes.trim() || regNotes.trim()) || null,
        joining_date: joiningDate,
        plan_id: billingCalculations.resolvedPlanId,
        trainer_id: regPT && regTrainerId ? regTrainerId : null,
      });

      // 2. Log POS invoice payment
      const activeMemId = member?.active_membership?.id || member?.memberships?.[0]?.id;
      if (activeMemId) {
        const ptPkg = ptPlans.find(pt => pt.id === regPTPlanId);
        const lockerDetails = regLocker && lockerPlans.length > 0 ? {
          name: lockerPlans[0].name,
          deposit: billingCalculations.depositLocker,
          rent: billingCalculations.rentLocker
        } : null;

        const ptDetails = regPT && ptPkg ? {
          package_name: ptPkg.package_name,
          duration_months: Number(regPTDuration),
          price: billingCalculations.netPTCost,
          discount: billingCalculations.ptDiscountAmount
        } : null;

        const servicesDetails = regSelectedServices.map(srvId => {
          const srv = additionalServices.find(s => s.id === srvId);
          return srv ? { name: srv.name, price: Number(srv.price) } : null;
        }).filter(Boolean);

        const billBreakdown = {
          admission_fee: billingCalculations.admissionFee,
          membership_base: billingCalculations.baseMembershipCost,
          locker: lockerDetails,
          pt: ptDetails,
          services: servicesDetails,
          tax_percent: billingCalculations.taxPercent,
          tax_amount: billingCalculations.gstAmount,
          grand_total: billingCalculations.grandTotal
        };

        const paymentAmt = regAmountPaid !== "" ? Number(regAmountPaid) : billingCalculations.grandTotal;

        await api.post("/api/v1/payments/", {
          membership_id: activeMemId,
          member_id: member.id,
          amount_paid: paymentAmt,
          payment_method: regPaymentMethod,
          notes: `Initial registration invoice payment. Paid: ${paymentAmt}, Total: ${billingCalculations.grandTotal}`,
          billing_details: billBreakdown
        });
      }

      toast.success(`${fullName} registered successfully!`);

      setCreatedSummary({
        fullName,
        email,
        phone,
        planName: billingCalculations.resolvedPlan ? billingCalculations.resolvedPlan.name : "No Subscription",
        trainerName: regPT && regTrainerId 
          ? trainers.find(t => t.id === regTrainerId)?.profile?.full_name || "Assigned Coach"
          : "General Coaching",
        joiningDate,
        password,
        displayId: `PHC-${phone.slice(-6)}`,
        grandTotal: billingCalculations.grandTotal,
        amountPaid: regAmountPaid !== "" ? Number(regAmountPaid) : billingCalculations.grandTotal
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to register member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedSummary(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setDob("");
    setGender("male");
    setAddress("");
    setEmergencyName("");
    setEmergencyPhone("");
    setEmergencyRelation("");
    setMedicalNotes("");
    setRegLocker(false);
    setRegPT(false);
    setRegPTPlanId("");
    setRegPTDuration(1);
    setRegTrainerId("");
    setRegSelectedServices([]);
    setRegAmountPaid("");
    setRegNotes("");
    onSuccess?.();
  };

  if (createdSummary) {
    return (
      <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-6 max-w-xl mx-auto text-left animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white">Member Created & Paid</h3>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            POS Settle Invoice Processed Successfully
          </p>
        </div>

        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
          <div className="bg-[#FF6B00]/10 border-b border-white/5 px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Card ID</span>
            <span className="text-sm font-mono font-black text-[#FF6B00] tracking-widest">
              {createdSummary.displayId}
            </span>
          </div>

          <div className="divide-y divide-white/5 text-xs p-4 space-y-2 text-slate-300">
            <div className="flex justify-between py-1.5"><span>Name:</span><span className="text-white font-bold">{createdSummary.fullName}</span></div>
            <div className="flex justify-between py-1.5"><span>Email:</span><span className="text-white font-mono">{createdSummary.email}</span></div>
            <div className="flex justify-between py-1.5"><span>Phone:</span><span className="text-white">{createdSummary.phone}</span></div>
            <div className="flex justify-between py-1.5"><span>Plan:</span><span className="text-[#FF6B00] font-black">{createdSummary.planName}</span></div>
            <div className="flex justify-between py-1.5"><span>Coach:</span><span className="text-white">{createdSummary.trainerName}</span></div>
            <div className="flex justify-between py-1.5"><span>Grand Total:</span><span className="text-green-500 font-mono font-bold">{formatINR(createdSummary.grandTotal)}</span></div>
            <div className="flex justify-between py-1.5"><span>Paid Amount:</span><span className="text-green-500 font-mono font-bold">{formatINR(createdSummary.amountPaid)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleReset} className="h-10 rounded-xl bg-[#FF6B00] text-black font-black uppercase text-xs tracking-wider">
            Add Another Member
          </Button>
          <Button onClick={() => setCreatedSummary(null)} className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase border border-white/5">
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10 text-slate-400 font-semibold animate-pulse text-xs uppercase">
        Loading front-desk catalog definitions...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Left side: form fields (8 cols) */}
      <div className="lg:col-span-7 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2">1. Personal Profile & Credentials</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Full Name *</Label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Legal full name" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Email Address *</Label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="yash@gmail.com" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Phone Number *</Label>
              <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit phone" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Joining Date *</Label>
              <input type="date" required value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Date of Birth</Label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Gender</Label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Portal Password</Label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Occupation</Label>
              <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="Job/Profession" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Height (cm)</Label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Weight (kg)</Label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase">Residential Address</Label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Full home address..." className="w-full bg-black/40 border border-white/10 rounded-xl text-xs text-white p-2.5 h-14 focus:outline-none focus:border-[#FF6B00] resize-none" />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2">2. Emergency & Medical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Contact Name</Label>
              <input type="text" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="Person name" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Contact Phone</Label>
              <input type="text" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="Phone number" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Relation</Label>
              <input type="text" value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} placeholder="e.g. Spouse" className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase">Medical Constraints Notes</Label>
            <textarea value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="Heart risk, joint injuries, asthma..." className="w-full bg-black/40 border border-white/10 rounded-xl text-xs text-white p-2.5 h-14 focus:outline-none focus:border-[#FF6B00] resize-none" />
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2">3. Gym Subscriptions & Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Plan Category *</Label>
              <select value={regCategory} onChange={e => setRegCategory(e.target.value)} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]">
                <option value="CrossFit + Weight Training">CrossFit + Weight Training</option>
                <option value="Only Cardio">Only Cardio</option>
                <option value="Cardio + CrossFit + Weight Training">Cardio + CrossFit + Weight Training</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Plan Period (Duration) *</Label>
              <select value={regDuration} onChange={e => setRegDuration(Number(e.target.value))} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]">
                <option value={30}>1 Month (30 Days)</option>
                <option value={90}>3 Months (90 Days)</option>
                <option value={180}>6 Months (180 Days)</option>
                <option value={365}>1 Year (365 Days)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <Label className="text-xs font-bold text-white block">Standard Locker Facility</Label>
              <span className="text-[10px] text-slate-500 font-semibold block">₹500 Refundable Deposit + Rent (₹250/m or ₹600/qtr)</span>
            </div>
            <input type="checkbox" checked={regLocker} onChange={e => setRegLocker(e.target.checked)} className="w-4 h-4 accent-[#FF6B00] cursor-pointer" />
          </div>

          <div className="border-t border-white/5 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-white block">Assign Personal Trainer (PT)</Label>
                <span className="text-[10px] text-slate-500 font-semibold block">Dedicated certified coach. Multi-month discounts: 3m=10%, 6m=15%, 1y=20%</span>
              </div>
              <input type="checkbox" checked={regPT} onChange={e => setRegPT(e.target.checked)} className="w-4 h-4 accent-[#FF6B00] cursor-pointer" />
            </div>

            {regPT && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase">PT Package</Label>
                  <select value={regPTPlanId} onChange={e => setRegPTPlanId(e.target.value)} className="w-full h-8 bg-[#171717] border border-white/10 rounded-lg text-xs px-2 text-white">
                    <option value="">Select Package...</option>
                    {ptPlans.map(pt => (
                      <option key={pt.id} value={pt.id}>{pt.package_name} - ₹{pt.price}/mo</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase">PT Duration</Label>
                  <select value={regPTDuration} onChange={e => setRegPTDuration(Number(e.target.value))} className="w-full h-8 bg-[#171717] border border-white/10 rounded-lg text-xs px-2 text-white">
                    <option value={1}>1 Month</option>
                    <option value={3}>3 Months (10% Off)</option>
                    <option value={6}>6 Months (15% Off)</option>
                    <option value={12}>1 Year (20% Off)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-400 uppercase">Assign Coach</Label>
                  <select value={regTrainerId} onChange={e => setRegTrainerId(e.target.value)} className="w-full h-8 bg-[#171717] border border-white/10 rounded-lg text-xs px-2 text-white">
                    <option value="">Select Trainer...</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.profile?.full_name || "Trainer"} ({t.specialization || "General"})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-3 space-y-2">
            <Label className="text-[10px] font-bold text-slate-400 uppercase">Select Additional Services</Label>
            <div className="grid grid-cols-2 gap-2">
              {additionalServices.map(srv => {
                const isSelected = regSelectedServices.includes(srv.id);
                return (
                  <button
                    type="button"
                    key={srv.id}
                    onClick={() => {
                      if (isSelected) {
                        setRegSelectedServices(prev => prev.filter(id => id !== srv.id));
                      } else {
                        setRegSelectedServices(prev => [...prev, srv.id]);
                      }
                    }}
                    className={`h-8 px-2.5 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected 
                        ? "bg-[#FF6B00]/10 border-[#FF6B00] text-[#FF6B00]" 
                        : "bg-black/30 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{srv.name}</span>
                    <span className="text-[10px] font-bold opacity-80">₹{srv.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2">4. Payment Settlement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Payment Mode</Label>
              <select value={regPaymentMethod} onChange={e => setRegPaymentMethod(e.target.value)} className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white focus:outline-none focus:border-[#FF6B00]">
                <option value="cash">💵 Cash Payment</option>
                <option value="upi">📱 UPI / QR Scan</option>
                <option value="card">💳 Card Terminal</option>
                <option value="bank_transfer">🏦 Bank Wire Transfer</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase">Amount Paid (₹)</Label>
              <input
                type="number"
                value={regAmountPaid}
                onChange={e => setRegAmountPaid(e.target.value)}
                placeholder={`Default: ₹${billingCalculations.grandTotal}`}
                className="w-full h-9 bg-black/40 border border-white/10 rounded-xl text-xs px-3 text-white font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-black text-slate-400 uppercase">General Registration Notes</Label>
            <textarea value={regNotes} onChange={e => setRegNotes(e.target.value)} placeholder="Special billing agreements..." className="w-full bg-black/40 border border-white/10 rounded-xl text-xs text-white p-2.5 h-14 focus:outline-none focus:border-[#FF6B00] resize-none" />
          </div>
        </div>
      </div>

      {/* Right side: Pos Breakdown panel (5 cols) */}
      <div className="lg:col-span-5">
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 space-y-4 sticky top-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-300">
              <Clipboard size={14} className="text-[#FF6B00]" /> POS Invoice Breakdown
            </div>
            <span className="text-[9px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full font-black uppercase">
              Auto-Calculator
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Admission Entry Fee:</span>
              <span className="font-mono text-white font-bold">{formatINR(billingCalculations.admissionFee)}</span>
            </div>

            <div className="flex justify-between items-start text-slate-400 border-t border-white/5 pt-2">
              <div>
                <span className="block font-semibold text-white">Membership plan:</span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">{regCategory} ({regDuration === 365 ? "1 Year" : `${regDuration / 30} Months`})</span>
              </div>
              <span className="font-mono text-white mt-1 font-bold">{formatINR(billingCalculations.baseMembershipCost)}</span>
            </div>

            {regLocker && (
              <div className="flex justify-between items-start text-slate-400 border-t border-white/5 pt-2">
                <div>
                  <span className="block font-semibold text-white">Locker Rent & Deposit:</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Deposit: {formatINR(billingCalculations.depositLocker)} • Rent: {formatINR(billingCalculations.rentLocker)}</span>
                </div>
                <span className="font-mono text-white mt-1 font-bold">{formatINR(billingCalculations.depositLocker + billingCalculations.rentLocker)}</span>
              </div>
            )}

            {regPT && ptPlans.find(pt => pt.id === regPTPlanId) && (
              <div className="flex justify-between items-start text-slate-400 border-t border-white/5 pt-2">
                <div>
                  <span className="block font-semibold text-white">Personal Training Package:</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    {ptPlans.find(pt => pt.id === regPTPlanId)?.package_name} ({regPTDuration}m) 
                    {billingCalculations.ptDiscountAmount > 0 && ` • -${billingCalculations.ptDiscountPercent}% discount`}
                  </span>
                </div>
                <span className="font-mono text-white mt-1 font-bold">{formatINR(billingCalculations.netPTCost)}</span>
              </div>
            )}

            {regSelectedServices.length > 0 && (
              <div className="flex justify-between items-start text-slate-400 border-t border-white/5 pt-2">
                <div>
                  <span className="block font-semibold text-white">Additional Services:</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    {regSelectedServices.map(srvId => additionalServices.find(s => s.id === srvId)?.name).join(", ")}
                  </span>
                </div>
                <span className="font-mono text-white mt-1 font-bold">{formatINR(billingCalculations.servicesCost)}</span>
              </div>
            )}

            <div className="border-t-2 border-dashed border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-slate-400 font-bold">
                <span>Subtotal (Taxable):</span>
                <span className="font-mono text-white">{formatINR(billingCalculations.baseMembershipCost + billingCalculations.rentLocker + billingCalculations.netPTCost + billingCalculations.servicesCost)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST CGST/SGST ({billingCalculations.taxPercent}%):</span>
                <span className="font-mono text-white font-bold">{formatINR(billingCalculations.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-white font-black text-sm border-t border-white/5 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-[#00C853]">{formatINR(billingCalculations.grandTotal)}</span>
              </div>
            </div>

            <div className="bg-black/45 border border-white/5 rounded-2xl p-3.5 space-y-2 mt-4">
              <div className="flex justify-between text-slate-400 font-bold">
                <span>Amount Received:</span>
                <span className="font-mono text-white">
                  {formatINR(regAmountPaid !== "" ? Number(regAmountPaid) : billingCalculations.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-t border-white/5 pt-2">
                <span>Balance Outstanding:</span>
                {(() => {
                  const paid = regAmountPaid !== "" ? Number(regAmountPaid) : billingCalculations.grandTotal;
                  const outstanding = billingCalculations.grandTotal - paid;
                  return (
                    <span className={`font-mono font-black ${outstanding > 0 ? "text-red-500" : "text-green-500"}`}>
                      {formatINR(outstanding)}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 mt-4 bg-[#FF6B00] hover:bg-[#FF8020] text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-orange-500/10"
          >
            {submitting ? "Processing Settlement..." : "Settle POS & Register"}
          </Button>
        </div>
      </div>
    </form>
  );
}
