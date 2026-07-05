import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { api } from "../../lib/api";

interface AddReceptionistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddReceptionistModal({ isOpen, onClose, onSuccess }: AddReceptionistModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    gender: "",
    address: "",
    date_of_birth: "",
    salary: "",
    shift: "morning",
    joining_staff_date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error("Please fill in all required fields (*).");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(false);
    try {
      setLoading(true);
      const payload = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || null,
        gender: formData.gender || null,
        address: formData.address || null,
        date_of_birth: formData.date_of_birth || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        shift: formData.shift || null,
        joining_staff_date: formData.joining_staff_date,
      };

      await api.post("/api/v1/receptionists/", payload);
      toast.success("Receptionist account created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create receptionist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">
            Add Receptionist
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Create a new front desk staff account and profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
            <Input
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email *</label>
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rahul@gym.com"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</label>
              <Select value={formData.gender} onValueChange={(val) => handleSelectChange("gender", val)}>
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date of Birth</label>
              <Input
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Residential address"
              className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Shift</label>
              <Select value={formData.shift} onValueChange={(val) => handleSelectChange("shift", val)}>
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border border-white/5 text-white">
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="full-day">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Salary (₹)</label>
              <Input
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. 25000"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Joining Date</label>
            <Input
              name="joining_staff_date"
              type="date"
              value={formData.joining_staff_date}
              onChange={handleChange}
              className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password *</label>
              <Input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm Password *</label>
              <Input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-600"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold"
            >
              {loading ? "Creating..." : "Save Receptionist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
