import { useState, useEffect } from "react";
import { UserPlus, Save, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { PlanResponse, MemberResponse } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

export default function AddMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [address, setAddress] = useState("");
  const [planId, setPlanId] = useState("");
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get<PlanResponse[]>("/api/v1/plans/?active_only=true");
        setPlans(res);
      } catch (err) {
        console.error("Failed to load membership plans catalog", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setDob("");
    setGender("");
    setAddress("");
    setPlanId("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields (Name, Email, Password)");
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
        joining_date: joiningDate,
      });

      // 2. If plan is selected, purchase/assign membership
      if (planId) {
        await api.post("/api/v1/memberships/", {
          member_id: member.id,
          plan_id: planId,
          start_date: joiningDate,
          discount_percent: 0.0,
          auto_renew: false,
          notes: "Initial membership assigned on registration",
        });
      }

      toast.success(`Successfully registered member: ${fullName}`);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to register member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <UserPlus size={18} className="text-primary" />
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Register New Member</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Add profile details and assign initial membership packages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-white">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Full Name <span className="text-primary">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Email Address <span className="text-primary">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Password <span className="text-primary">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Phone Number
          </Label>
          <Input
            id="phone"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <Label htmlFor="dob" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Date of Birth
          </Label>
          <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label htmlFor="gender" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Gender
          </Label>
          <Select value={gender} onValueChange={(val: any) => setGender(val)}>
            <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Joining Date */}
        <div className="space-y-1.5">
          <Label htmlFor="joiningDate" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Joining Date
          </Label>
          <Input
            id="joiningDate"
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Membership Plan Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="plan" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Assign Membership Plan
          </Label>
          <Select value={planId} onValueChange={setPlanId}>
            <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white">
              <SelectValue placeholder={loadingPlans ? "Loading plans..." : "Select Membership Plan (Optional)"} />
            </SelectTrigger>
            <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} - {p.duration_days} days (₹{p.price})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="address" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Home Address
          </Label>
          <Input
            id="address"
            placeholder="Enter home/residential address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
        <Button
          type="button"
          onClick={resetForm}
          variant="ghost"
          className="hover:bg-white/5 text-slate-400 hover:text-white rounded-xl"
          disabled={submitting}
        >
          Reset
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-1.5"
          disabled={submitting}
        >
          <Save size={16} />
          <span>{submitting ? "Registering..." : "Register Member"}</span>
        </Button>
      </div>
    </form>
  );
}
