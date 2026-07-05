import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, ShieldAlert, Key, Edit3, Save, X, Activity } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { toast } from "sonner";
import { api } from "../../../lib/api";

export default function MemberProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields state
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/api/v1/auth/me");
      setProfile(res.profile || null);
      if (res.profile) {
        setPhone(res.profile.phone || "");
        setAddress(res.profile.address || "");
        setEmergencyName(res.profile.emergency_contact_name || "");
        setEmergencyPhone(res.profile.emergency_contact_phone || "");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Phone number is required.");
      return;
    }

    try {
      await api.patch(`/api/v1/members/${profile.member_id}`, {
        phone,
        address: address || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
      });
      toast.success("Profile details updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/api/v1/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 bg-white/5 animate-pulse rounded-lg w-1/3"></div>
        <div className="h-48 bg-white/5 animate-pulse rounded-xl w-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
        Profile Context Error
      </div>
    );
  }

  // Get initials
  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4">
      {/* Profile Header Banner */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-[#FF6B00]/10 border-2 border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] text-2xl font-black">
          {initials}
        </div>
        <div className="text-center md:text-left flex-1 space-y-1">
          <h2 className="text-lg font-black uppercase tracking-wider text-white">{profile.full_name}</h2>
          <p className="text-xs text-slate-400 font-medium">Active Member ID: {profile.member_id}</p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 mt-1">
            <Activity size={10} />
            Verified Member
          </span>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
          >
            <Edit3 size={14} />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile details or Edit Form */}
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Contact & Personal Details</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              General check-in information
            </p>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone *</Label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Name</Label>
                  <Input
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Emergency Phone</Label>
                  <Input
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Gender</span>
                  <span className="text-xs font-bold text-white capitalize">{profile.gender || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Date of Birth</span>
                  <span className="text-xs font-bold text-white">{profile.date_of_birth || "Not specified"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Phone Number</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Phone size={12} className="text-[#FF6B00]" />
                    {profile.phone || "No number"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Address</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#FF6B00]" />
                    {profile.address || "No address"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Emergency Contact</span>
                  <span className="text-xs font-bold text-white">{profile.emergency_contact_name || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Emergency Phone</span>
                  <span className="text-xs font-bold text-white">{profile.emergency_contact_phone || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Change Account Password</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Secure your access PIN/credentials
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Password</Label>
              <Input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Password</Label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm New Password</Label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white placeholder:text-slate-700"
              />
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Key size={14} />
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
