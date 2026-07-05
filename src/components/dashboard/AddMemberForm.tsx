import { useState, useEffect } from "react";
import { UserPlus, Save, AlertCircle, Check, Key, ShieldCheck, Printer, CheckCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { PlanResponse, MemberResponse } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

export default function AddMemberForm({ 
  onSuccess, 
  initialData 
}: { 
  onSuccess?: () => void; 
  initialData?: {
    fullName?: string;
    phone?: string;
    email?: string;
    gender?: string;
  };
}) {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdSummary, setCreatedSummary] = useState<any | null>(null);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">((initialData?.gender as any) || "");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  // Step 2: Membership Setup
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [membershipNotes, setMembershipNotes] = useState("");

  // Step 3: Account Setup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, trainersRes] = await Promise.all([
          api.get<PlanResponse[]>("/api/v1/plans/?active_only=true"),
          api.get<any>("/api/v1/trainers/?available_only=true"),
        ]);
        setPlans(plansRes);
        setTrainers(trainersRes.trainers || []);
      } catch (err) {
        console.error("Failed to load plans or trainers lists", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchData();
  }, []);

  const handleGeneratePassword = () => {
    const pin = Math.floor(1000 + Math.random() * 9000);
    const generated = `Prro@${pin}`;
    setPassword(generated);
    setConfirmPassword(generated);
    toast.success(`Generated password: ${generated}`);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!fullName || !phone || !email) {
        toast.error("Please fill in Name, Phone, and Email.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password is required.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create User + Member
      const member = await api.post<MemberResponse>("/api/v1/members/", {
        email,
        password,
        full_name: fullName,
        phone: phone || null,
        date_of_birth: dob || null,
        gender: gender || null,
        address: address || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        notes: medicalNotes || null,
        joining_date: startDate,
      });

      const memberId = member.id;

      // 2. If plan is selected, purchase/assign membership
      if (selectedPlanId) {
        await api.post("/api/v1/memberships/", {
          member_id: memberId,
          plan_id: selectedPlanId,
          start_date: startDate,
          discount_percent: parseFloat(discountPercent) || 0.0,
          auto_renew: false,
          notes: membershipNotes || "Initial membership assigned on registration",
        });
      }

      // 3. If trainer is selected, assign trainer
      if (selectedTrainerId) {
        await api.post(`/api/v1/trainers/${selectedTrainerId}/assign-member`, {
          member_id: memberId
        });
      }

      toast.success(`Successfully registered member: ${fullName}`);

      // Set summary card state
      const selectedPlan = plans.find(p => p.id === selectedPlanId);
      const selectedTrainer = trainers.find(t => t.id === selectedTrainerId);

      setCreatedSummary({
        fullName,
        email,
        phone,
        planName: selectedPlan ? selectedPlan.name : "No Subscription",
        trainerName: selectedTrainer ? selectedTrainer.profile?.full_name : "No Trainer Assigned",
        startDate,
        password,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to register member");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Welcome Card - Prro Health Club</title>
            <style>
              body { font-family: sans-serif; background: #fff; padding: 40px; text-align: center; }
              .card { border: 2px solid #ff6b00; border-radius: 20px; padding: 30px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              h1 { color: #ff6b00; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 1px; font-size: 24px; }
              h2 { font-size: 11px; text-transform: uppercase; color: #666; margin-top: 0; margin-bottom: 20px; }
              .field { margin: 15px 0; text-align: left; border-bottom: 1px solid #eee; padding-bottom: 8px; }
              .label { font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; }
              .value { font-size: 14px; font-weight: bold; color: #111; margin-top: 2px; }
              .footer { margin-top: 30px; font-size: 10px; color: #888; text-transform: uppercase; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Prro Health Club</h1>
              <h2>Welcome to the Club</h2>
              <div class="field">
                <div class="label">Member Name</div>
                <div class="value">${createdSummary.fullName}</div>
              </div>
              <div class="field">
                <div class="label">Registered Email</div>
                <div class="value">${createdSummary.email}</div>
              </div>
              <div class="field">
                <div class="label">Contact Phone</div>
                <div class="value">${createdSummary.phone}</div>
              </div>
              <div class="field">
                <div class="label">Membership Plan</div>
                <div class="value">${createdSummary.planName}</div>
              </div>
              <div class="field">
                <div class="label">Assigned Coach</div>
                <div class="value">${createdSummary.trainerName}</div>
              </div>
              <div class="field">
                <div class="label">Member PIN / Password</div>
                <div class="value">${createdSummary.password}</div>
              </div>
              <div class="footer">Powered by Being Strong</div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleReset = () => {
    setCreatedSummary(null);
    setCurrentStep(1);
    setFullName("");
    setPhone("");
    setEmail("");
    setDob("");
    setGender("");
    setAddress("");
    setEmergencyName("");
    setEmergencyPhone("");
    setMedicalNotes("");
    setSelectedPlanId("");
    setSelectedTrainerId("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setDiscountPercent("0");
    setMembershipNotes("");
    setPassword("");
    setConfirmPassword("");
    if (onSuccess) onSuccess();
  };

  if (createdSummary) {
    return (
      <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 text-center max-w-md mx-auto animate-in fade-in duration-300">
        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={28} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Registration Complete</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Successfully generated member account and subscription.
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-left space-y-3">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Full Name</span>
            <span className="text-xs font-bold text-white">{createdSummary.fullName}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Subscription</span>
              <span className="text-xs font-bold text-[#FF6B00]">{createdSummary.planName}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Coach</span>
              <span className="text-xs font-bold text-white">{createdSummary.trainerName}</span>
            </div>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Generated Login Password</span>
            <span className="text-xs font-mono font-bold text-white">{createdSummary.password}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handlePrint}
            className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Printer size={14} />
            Print Card
          </Button>
          <Button
            onClick={handleReset}
            className="flex-1 h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider"
          >
            New Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <UserPlus size={18} className="text-[#FF6B00]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Add New Member</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Multi-step registration workflow
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
                ${currentStep >= step
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white/5 text-slate-500"}`}>
                {currentStep > step ? <Check size={10} /> : step}
              </div>
              {step < 3 && (
                <div className={`h-0.5 w-8 ${currentStep > step ? "bg-[#FF6B00]" : "bg-white/5"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Name"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</Label>
                <Select value={gender} onValueChange={(val: any) => setGender(val)}>
                  <SelectTrigger className="h-10 border-white/5 bg-black/40 rounded-xl text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171717] border border-white/5 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date of Birth</Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home address"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact Name</Label>
                <Input
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Contact name"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact Phone</Label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Phone number"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Medical Notes / Health Conditions</Label>
              <Textarea
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="List any injuries, chronic conditions, or physical constraints..."
                className="min-h-16 border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Membership Setup */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Membership Plan</Label>
                <Select value={selectedPlanId} onValueChange={(val) => setSelectedPlanId(val)}>
                  <SelectTrigger className="h-10 border-white/5 bg-black/40 rounded-xl text-white">
                    <SelectValue placeholder="Select plan" />
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
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assign Personal Trainer</Label>
                <Select value={selectedTrainerId} onValueChange={(val) => setSelectedTrainerId(val)}>
                  <SelectTrigger className="h-10 border-white/5 bg-black/40 rounded-xl text-white">
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171717] border border-white/5 text-white">
                    <SelectItem value="none">No Trainer / General Coaching</SelectItem>
                    {trainers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.profile?.full_name} ({t.specialization || "General"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subscription Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Discount Override (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Internal Setup Notes</Label>
              <Textarea
                value={membershipNotes}
                onChange={(e) => setMembershipNotes(e.target.value)}
                placeholder="Payment status, initial physical measurements, body fat, etc."
                className="min-h-20 border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Account Credentials */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key size={14} className="text-[#FF6B00]" />
                  Auto-Generate Member PIN
                </span>
                <span className="text-[10px] text-slate-500">Generate a random 4-digit numeric access password</span>
              </div>
              <Button
                type="button"
                onClick={handleGeneratePassword}
                className="h-9 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white text-[10px] font-black uppercase tracking-wider px-3"
              >
                Generate
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password / Access PIN *</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or click auto-generate"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm Password / PIN *</Label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t border-white/5">
          {currentStep > 1 ? (
            <Button
              type="button"
              onClick={handlePrevStep}
              className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider px-4"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4"
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
            >
              <Save size={14} />
              {submitting ? "Registering..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
