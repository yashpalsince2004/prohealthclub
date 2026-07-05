import { useState, useEffect } from "react";
import {
  UserPlus, Save, Check, Key, ShieldCheck,
  Printer, CheckCircle, Eye, EyeOff, Copy,
} from "lucide-react";
import { api } from "../../lib/api";
import type { PlanResponse, MemberResponse } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../ui/select";
import { toast } from "sonner";

export default function AddMemberForm({
  onSuccess,
  initialData,
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
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(
    (initialData?.gender as any) || ""
  );
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  // Step 2: Membership Setup
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [membershipNotes, setMembershipNotes] = useState("");

  // Step 3: Portal Credentials
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // ── Password helpers ─────────────────────────────────────────
  const handleGeneratePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const pin = Math.floor(100 + Math.random() * 900);
    const rand = Array.from({ length: 5 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    const generated = `Prro${pin}${rand}`;
    setPassword(generated);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (!pw) return { label: "", color: "", width: "w-0" };
    const score = [
      pw.length >= 8,
      /[A-Z]/.test(pw),
      /[a-z]/.test(pw),
      /[0-9]/.test(pw),
      /[^A-Za-z0-9]/.test(pw),
    ].filter(Boolean).length;
    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 3) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
    if (score === 4) return { label: "Good", color: "bg-emerald-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = passwordStrength(password);

  // ── Step navigation ──────────────────────────────────────────
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!fullName.trim() || !phone.trim() || !email.trim()) {
        toast.error("Name, Phone, and Email are required.");
        return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        toast.error("Please enter a valid email address.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // ── Submit: single atomic POST ───────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Password is required. Use the Generate button.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number.");
      return;
    }

    setSubmitting(true);
    try {
      /**
       * Single atomic request.
       * The backend handles User + Profile + Member + Membership + Trainer
       * in ONE transaction. Do NOT make separate calls for memberships or
       * trainer assignment — that causes partial failures.
       */
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
        notes: (medicalNotes.trim() || membershipNotes.trim()) || null,
        joining_date: startDate,
        // Plan and trainer are handled atomically by the backend
        plan_id: selectedPlanId || null,
        trainer_id:
          selectedTrainerId && selectedTrainerId !== "none"
            ? selectedTrainerId
            : null,
      });

      toast.success(`${fullName} registered successfully!`);

      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      const selectedTrainer = trainers.find((t) => t.id === selectedTrainerId);

      setCreatedSummary({
        fullName,
        email,
        phone,
        planName: selectedPlan ? selectedPlan.name : "No Subscription",
        trainerName: selectedTrainer
          ? selectedTrainer.profile?.full_name
          : "General Coaching",
        startDate,
        password,
        memberId: member.id,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to register member");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Print welcome card ───────────────────────────────────────
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && createdSummary) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Welcome Card — Prro Health Club</title>
            <style>
              body { font-family: sans-serif; background: #fff; padding: 40px; text-align: center; }
              .card { border: 2px solid #ff6b00; border-radius: 20px; padding: 30px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              h1 { color: #ff6b00; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 1px; font-size: 24px; }
              h2 { font-size: 11px; text-transform: uppercase; color: #666; margin-top: 0; margin-bottom: 20px; }
              .field { margin: 15px 0; text-align: left; border-bottom: 1px solid #eee; padding-bottom: 8px; }
              .label { font-size: 10px; text-transform: uppercase; color: #888; font-weight: bold; }
              .value { font-size: 14px; font-weight: bold; color: #111; margin-top: 2px; }
              .footer { margin-top: 30px; font-size: 10px; color: #888; text-transform: uppercase; font-weight: bold; }
              .pw { font-family: monospace; background: #f5f5f5; padding: 6px 10px; border-radius: 6px; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Prro Health Club</h1>
              <h2>Welcome to the Club!</h2>
              <div class="field"><div class="label">Member Name</div><div class="value">${createdSummary.fullName}</div></div>
              <div class="field"><div class="label">Email (Login ID)</div><div class="value">${createdSummary.email}</div></div>
              <div class="field"><div class="label">Contact Phone</div><div class="value">${createdSummary.phone}</div></div>
              <div class="field"><div class="label">Membership Plan</div><div class="value">${createdSummary.planName}</div></div>
              <div class="field"><div class="label">Assigned Coach</div><div class="value">${createdSummary.trainerName}</div></div>
              <div class="field"><div class="label">Portal Password</div><div class="value"><span class="pw">${createdSummary.password}</span></div></div>
              <div class="footer">Powered by Prro Health Club</div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
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
    setMembershipNotes("");
    setPassword("");
    setShowPassword(false);
    if (onSuccess) onSuccess();
  };

  // ── Success card ─────────────────────────────────────────────
  const handleCopyCredentials = () => {
    if (!createdSummary) return;
    const text = [
      `Prro Health Club — Member Credentials`,
      `──────────────────────────────`,
      `Name     : ${createdSummary.fullName}`,
      `Member ID: ${createdSummary.memberId}`,
      `Email    : ${createdSummary.email}`,
      `Password : ${createdSummary.password}`,
      `Plan     : ${createdSummary.planName}`,
      `Trainer  : ${createdSummary.trainerName}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard");
  };

  if (createdSummary) {
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        {/* Status header */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white">Member Created Successfully</h3>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Account, membership &amp; trainer assigned
          </p>
        </div>

        {/* Credentials card */}
        <div className="border border-white/8 rounded-2xl overflow-hidden">
          {/* Member ID banner */}
          <div className="bg-[#FF6B00]/8 border-b border-white/5 px-5 py-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Member ID</span>
            <span className="text-[11px] font-mono font-black text-[#FF6B00]">
              {createdSummary.memberId?.substring(0, 8).toUpperCase()}
            </span>
          </div>

          {/* Fields */}
          <div className="divide-y divide-white/5">
            <CredRow icon="👤" label="Name"     value={createdSummary.fullName} />
            <CredRow icon="✉️" label="Email"    value={createdSummary.email} />
            <CredRow icon="📞" label="Phone"    value={createdSummary.phone || "—"} />
            <CredRow icon="🏅" label="Plan"     value={createdSummary.planName} accent />
            <CredRow icon="🏋️" label="Trainer"  value={createdSummary.trainerName} />
          </div>

          {/* Password row — special treatment */}
          <div className="px-5 py-3.5 bg-black/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Portal Password</p>
              <p className="text-sm font-mono font-black text-white mt-0.5">{createdSummary.password}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdSummary.password);
                toast.success("Password copied");
              }}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-bold transition-all border border-white/5"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCopyCredentials}
            className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/5"
          >
            <Copy size={13} /> Copy All
          </Button>
          <Button
            onClick={handlePrint}
            className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/5"
          >
            <Printer size={13} /> Print Card
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleReset}
            className="h-10 rounded-xl border border-[#FF6B00]/40 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <UserPlus size={13} /> Add Another
          </Button>
          <Button
            onClick={() => onSuccess?.()}
            className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────
  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6">
      {/* Header + step indicator */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <UserPlus size={16} className="text-[#FF6B00]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {currentStep === 1
                ? "Personal Details"
                : currentStep === 2
                ? "Membership Setup"
                : "Portal Credentials"}
            </h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Step {currentStep} of 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  currentStep > step
                    ? "bg-emerald-500 text-white"
                    : currentStep === step
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                {currentStep > step ? <Check size={10} /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`h-0.5 w-8 transition-all ${
                    currentStep > step ? "bg-emerald-500" : "bg-white/5"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── STEP 1: Personal Details ──────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Field label="Full Name *">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Legal full name"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone *">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </Field>
              <Field label="Email *">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender">
                <Select
                  value={gender}
                  onValueChange={(val: any) => setGender(val)}
                >
                  <SelectTrigger className="h-10 border-white/5 bg-black/40 rounded-xl text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border border-white/5 text-white">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date of Birth">
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </Field>
            </div>
            <Field label="Address">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Home address"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Emergency Contact Name">
                <Input
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Contact name"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </Field>
              <Field label="Emergency Contact Phone">
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Phone number"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </Field>
            </div>
            <Field label="Medical Notes / Health Conditions">
              <Textarea
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Injuries, chronic conditions, physical constraints…"
                className="min-h-16 border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600"
              />
            </Field>
          </div>
        )}

        {/* ── STEP 2: Membership Setup ──────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {loadingDropdowns ? (
              <div className="py-6 text-center text-xs text-slate-500 font-semibold animate-pulse">
                Loading plans and trainers…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Membership Plan">
                    <Select
                      value={selectedPlanId}
                      onValueChange={setSelectedPlanId}
                    >
                      <SelectTrigger className="h-10 border-white/5 bg-black/40 rounded-xl text-white">
                        <SelectValue placeholder="No plan (skip)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border border-white/5 text-white">
                        <SelectItem value="">No Subscription</SelectItem>
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — ₹{p.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Assign Personal Trainer">
                    <Select
                      value={selectedTrainerId}
                      onValueChange={setSelectedTrainerId}
                    >
                      <SelectTrigger className="h-10 border-white/5 bg-black/40 rounded-xl text-white">
                        <SelectValue placeholder="No trainer" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border border-white/5 text-white">
                        <SelectItem value="none">General Coaching</SelectItem>
                        {trainers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.profile?.full_name} ({t.specialization || "General"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Subscription Start Date">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                  />
                </Field>
                <Field label="Internal Notes (optional)">
                  <Textarea
                    value={membershipNotes}
                    onChange={(e) => setMembershipNotes(e.target.value)}
                    placeholder="Payment status, body composition measurements, referral source…"
                    className="min-h-20 border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600"
                  />
                </Field>

                {/* Tip if no plans loaded */}
                {plans.length === 0 && (
                  <p className="text-[10px] text-amber-400/80 bg-amber-400/5 border border-amber-400/10 px-3 py-2 rounded-lg">
                    No active plans found. Member will be registered without a subscription.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: Portal Credentials ────────────────────── */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Context header */}
            <div className="flex items-start gap-3 p-4 bg-white/3 border border-white/5 rounded-xl">
              <ShieldCheck size={18} className="text-[#FF6B00] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white leading-tight">Portal Access Credentials</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Set the password the member will use to log in to the member portal.
                  The login email is <span className="text-white font-semibold">{email}</span>.
                </p>
              </div>
            </div>

            {/* Generate button */}
            <div className="flex items-center justify-between bg-[#FF6B00]/5 border border-[#FF6B00]/15 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key size={13} className="text-[#FF6B00]" />
                  Auto-Generate Password
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Creates a strong, secure password instantly
                </p>
              </div>
              <Button
                type="button"
                onClick={handleGeneratePassword}
                className="h-9 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white text-[10px] font-black uppercase tracking-wider px-3 flex items-center gap-1.5"
              >
                <Key size={12} />
                Generate
              </Button>
            </div>

            {/* Password field */}
            <Field label="Password *">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars · uppercase · lowercase · number"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {strength.label}
                  </span>
                  {password && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="text-slate-500 hover:text-white transition-colors"
                      title="Copy password"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                </div>
              )}
            </Field>

            {/* Password rules reminder */}
            <p className="text-[10px] text-slate-600 font-semibold">
              Requirements: min 8 characters · 1 uppercase · 1 lowercase · 1 number
            </p>
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
              Next Step →
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={14} />
              {submitting ? "Registering…" : "Complete Registration"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
        {label}
      </span>
      <span
        className={`text-xs font-bold ${accent ? "text-[#FF6B00]" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function CredRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-base leading-none flex-shrink-0">{icon}</span>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex-shrink-0">
          {label}
        </span>
      </div>
      <span
        className={`text-xs font-bold truncate text-right ${
          accent ? "text-[#FF6B00]" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
