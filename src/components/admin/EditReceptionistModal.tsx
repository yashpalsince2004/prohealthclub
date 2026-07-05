import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { api } from "../../lib/api";

interface EditReceptionistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  receptionist: any;
}

export default function EditReceptionistModal({ isOpen, onClose, onSuccess, receptionist }: EditReceptionistModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    gender: "",
    address: "",
    salary: "",
    shift: "morning",
    is_active: true,
  });

  useEffect(() => {
    if (receptionist) {
      setFormData({
        full_name: receptionist.profile?.full_name || "",
        phone: receptionist.profile?.phone || "",
        gender: receptionist.profile?.gender || "",
        address: receptionist.profile?.address || "",
        salary: receptionist.profile?.salary ? String(receptionist.profile.salary) : "",
        shift: receptionist.profile?.shift || "morning",
        is_active: receptionist.is_active ?? true,
      });
    }
  }, [receptionist]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) {
      toast.error("Full name is required.");
      return;
    }

    setLoading(false);
    try {
      setLoading(true);
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        gender: formData.gender || null,
        address: formData.address || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        shift: formData.shift || null,
        is_active: formData.is_active,
      };

      await api.patch(`/api/v1/receptionists/${receptionist.id}`, payload);
      toast.success("Receptionist account updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update receptionist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">
            Edit Receptionist
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Modify profile and active status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Active status switch */}
          <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Active Status</span>
              <span className="text-[10px] text-slate-500">Deactivated staff cannot login</span>
            </div>
            <Switch checked={formData.is_active} onCheckedChange={handleSwitchChange} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
            <Input
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>
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
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Residential address"
              className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
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
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
