import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Key, Edit3, Save, X, Activity, Award, Briefcase } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { toast } from "sonner";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import AvatarUpload from "../../common/AvatarUpload";

export default function TrainerProfilePage() {
  const { user } = useAuth();
  const [trainer, setTrainer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields state
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [newCert, setNewCert] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchTrainer = async () => {
    setLoading(true);
    try {
      // 1. Get user profile details
      const res = await api.get<any>("/api/v1/auth/me");
      if (res.trainer_id) {
        // 2. Fetch trainer details using trainer_id
        const tRes = await api.get<any>(`/api/v1/trainers/${res.trainer_id}`);
        setTrainer({
          ...tRes,
          user_id: res.id,
          email: res.email,
          avatar_url: res.profile?.avatar_url || null
        });
        
        setPhone(tRes.profile?.phone || "");
        setSpecialization(tRes.specialization || "");
        setExperienceYears(tRes.experience_years ? String(tRes.experience_years) : "");
        setBio(tRes.bio || "");
        setCertifications(tRes.certifications || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load trainer profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainer();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Phone number is required.");
      return;
    }

    try {
      await api.patch(`/api/v1/trainers/${trainer.id}`, {
        full_name: trainer.profile?.full_name,
        phone,
        specialization: specialization || null,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        certifications,
        bio: bio || null,
      });
      toast.success("Trainer profile updated successfully!");
      setIsEditing(false);
      fetchTrainer();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handleAddCert = () => {
    if (!newCert.trim()) return;
    setCertifications([...certifications, newCert.trim()]);
    setNewCert("");
  };

  const handleRemoveCert = (idx: number) => {
    const copy = [...certifications];
    copy.splice(idx, 1);
    setCertifications(copy);
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

  if (!trainer) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
        Trainer Context Error
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4">
      {/* Profile Header Banner */}
      <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
        <AvatarUpload
          userId={trainer.user_id}
          idToUpdate={trainer.id}
          role="trainer"
          currentAvatarUrl={trainer.avatar_url}
          name={trainer.profile?.full_name || ""}
          onUploadSuccess={(url) => {
            setTrainer((prev: any) => prev ? { ...prev, avatar_url: url } : null);
          }}
        />
        <div className="text-center md:text-left flex-1 space-y-1">
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            {trainer.profile?.full_name}
          </h2>
          <p className="text-xs text-slate-400 font-medium capitalize">
            Certified Instructor &bull; {trainer.specialization || "General Coaching"}
          </p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#FF6B00]/10 text-[#FF6B00] mt-1">
            <Activity size={10} />
            Coaching Active
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
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Trainer Biography & Qualifications</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Public display profile
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialization</Label>
                  <Input
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience (Years)</Label>
                  <Input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="e.g. CrossFit Level 1"
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCert}
                    className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {certifications.map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      {c}
                      <button type="button" onClick={() => handleRemoveCert(i)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Biography</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-20 border-white/5 bg-[#171717] rounded-xl text-white"
                />
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
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Coaching Speciality</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award size={12} className="text-[#FF6B00]" />
                    {trainer.specialization || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Experience</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Briefcase size={12} className="text-[#FF6B00]" />
                    {trainer.experience_years ? `${trainer.experience_years} Years` : "N/A"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Phone Number</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Phone size={12} className="text-[#FF6B00]" />
                  {trainer.profile?.phone || "No phone"}
                </span>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Certifications</span>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {certifications.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No certifications listed</span>
                  ) : (
                    certifications.map((c, i) => (
                      <span key={i} className="bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-slate-300">
                        {c}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Biography</span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap pt-1">
                  {trainer.bio || "No biography added yet."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Change Account Password</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Secure your access credentials
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
