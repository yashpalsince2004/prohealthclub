import React, { useState, useEffect } from "react";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { Toaster, toast } from "sonner";
import { Dumbbell, Search, Plus, Edit2, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function TrainerManagement() {
  const { loading: authLoading } = useAuth(["admin"]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // Add Form state
  const [addForm, setAddForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    specialization: "",
    experience_years: "",
    bio: "",
    salary: "",
    joining_staff_date: new Date().toISOString().split("T")[0],
    certifications: [] as string[],
    newCert: "",
  });

  // Edit Form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    experience_years: "",
    bio: "",
    salary: "",
    joining_staff_date: "",
    is_available: true,
    is_active: true,
    certifications: [] as string[],
    newCert: "",
  });

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const url = searchQuery 
        ? `/api/v1/trainers/?search=${encodeURIComponent(searchQuery)}`
        : "/api/v1/trainers/";
      const res = await api.get<any>(url);
      setTrainers(res.trainers || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [searchQuery]);

  // Handle Add form submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email || !addForm.password || !addForm.full_name) {
      toast.error("Please fill in all required fields (*).");
      return;
    }
    if (addForm.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const payload = {
        email: addForm.email,
        password: addForm.password,
        full_name: addForm.full_name,
        phone: addForm.phone || null,
        specialization: addForm.specialization || null,
        experience_years: addForm.experience_years ? parseInt(addForm.experience_years) : null,
        certifications: addForm.certifications,
        bio: addForm.bio || null,
        salary: addForm.salary ? parseFloat(addForm.salary) : null,
        joining_staff_date: addForm.joining_staff_date,
      };

      await api.post("/api/v1/trainers/", payload);
      toast.success("Trainer account created successfully!");
      setIsAddOpen(false);
      // Reset form
      setAddForm({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        phone: "",
        specialization: "",
        experience_years: "",
        bio: "",
        salary: "",
        joining_staff_date: new Date().toISOString().split("T")[0],
        certifications: [],
        newCert: "",
      });
      fetchTrainers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create trainer");
    }
  };

  // Open Edit Modal
  const handleEditClick = (trainer: any) => {
    setSelectedTrainer(trainer);
    setEditForm({
      full_name: trainer.profile?.full_name || "",
      phone: trainer.profile?.phone || "",
      specialization: trainer.specialization || "",
      experience_years: trainer.experience_years ? String(trainer.experience_years) : "",
      bio: trainer.bio || "",
      salary: trainer.profile?.salary ? String(trainer.profile.salary) : "",
      joining_staff_date: trainer.profile?.joining_staff_date || "",
      is_available: trainer.is_available ?? true,
      is_active: trainer.profile?.user?.is_active ?? true,
      certifications: trainer.certifications || [],
      newCert: "",
    });
    setIsEditOpen(true);
  };

  // Handle Edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.full_name) {
      toast.error("Full name is required.");
      return;
    }

    try {
      const payload = {
        full_name: editForm.full_name,
        phone: editForm.phone || null,
        specialization: editForm.specialization || null,
        experience_years: editForm.experience_years ? parseInt(editForm.experience_years) : null,
        certifications: editForm.certifications,
        bio: editForm.bio || null,
        salary: editForm.salary ? parseFloat(editForm.salary) : null,
        joining_staff_date: editForm.joining_staff_date || null,
        is_available: editForm.is_available,
        is_active: editForm.is_active,
      };

      await api.patch(`/api/v1/trainers/${selectedTrainer.id}`, payload);
      toast.success("Trainer account updated successfully!");
      setIsEditOpen(false);
      fetchTrainers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update trainer");
    }
  };

  const addCertTag = (isEdit: boolean) => {
    if (isEdit) {
      if (!editForm.newCert.trim()) return;
      setEditForm({
        ...editForm,
        certifications: [...editForm.certifications, editForm.newCert.trim()],
        newCert: "",
      });
    } else {
      if (!addForm.newCert.trim()) return;
      setAddForm({
        ...addForm,
        certifications: [...addForm.certifications, addForm.newCert.trim()],
        newCert: "",
      });
    }
  };

  const removeCertTag = (idx: number, isEdit: boolean) => {
    if (isEdit) {
      const copy = [...editForm.certifications];
      copy.splice(idx, 1);
      setEditForm({ ...editForm, certifications: copy });
    } else {
      const copy = [...addForm.certifications];
      copy.splice(idx, 1);
      setAddForm({ ...addForm, certifications: copy });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this trainer?")) return;
    try {
      await api.delete(`/api/v1/trainers/${id}`);
      toast.success("Trainer deleted successfully");
      fetchTrainers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete trainer");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Authenticating admin gate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{
          paddingLeft: isSidebarCollapsed ? "104px" : "284px",
          paddingTop: "88px",
          paddingRight: "16px",
          paddingBottom: "16px",
        }}
      >
        <Navbar />

        <main className="flex-1 min-h-0 space-y-6 pt-4">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Trainer Management
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Configure professional gym instructors, payrolls, and certifications
              </p>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Trainer
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trainers..."
              className="h-11 pl-11 pr-4 border-white/5 bg-[#121212] rounded-2xl text-white focus-visible:ring-1 focus-visible:ring-[#FF6B00]"
            />
          </div>

          {/* Table */}
          <div className="bg-[#121212]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 space-y-4">
                <div className="h-6 bg-white/5 animate-pulse rounded-lg w-1/3"></div>
                <div className="h-24 bg-white/5 animate-pulse rounded-xl w-full"></div>
              </div>
            ) : trainers.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mx-auto">
                  <Dumbbell size={24} />
                </div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">No Trainers Found</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-white/5 bg-white/5">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Specialization</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Experience</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Salary</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Availability</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((t) => (
                    <TableRow key={t.id} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell className="py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#FF6B00]/10 flex items-center justify-center border border-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-black flex-shrink-0">
                          {t.profile?.avatar_url ? (
                            <img src={t.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            t.profile?.full_name ? t.profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "TR"
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{t.profile?.full_name || "Unknown"}</div>
                          <div className="text-[10px] text-slate-500">{t.profile?.phone || "No phone"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-300">{t.specialization || "General"}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-400">{t.experience_years ? `${t.experience_years} Years` : "N/A"}</TableCell>
                      <TableCell className="text-xs font-bold text-[#FF6B00]">
                        {t.profile?.salary ? `₹${t.profile.salary.toLocaleString()}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          t.is_available 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {t.is_available ? "Accepting Members" : "Full"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEditClick(t)}
                            className="w-8 h-8 rounded-lg bg-white/5 p-0 hover:bg-white/10 text-slate-400 hover:text-white"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            onClick={() => handleDelete(t.id)}
                            className="w-8 h-8 rounded-lg bg-red-500/10 p-0 hover:bg-red-500/20 text-red-500"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </main>
      </div>

      {/* Add Trainer Modal */}
      <Dialog open={isAddOpen} onOpenChange={() => setIsAddOpen(false)}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">Add Trainer</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Register a new fitness instructor.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
              <Input
                required
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email *</label>
                <Input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</label>
                <Input
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialization</label>
                <Input
                  value={addForm.specialization}
                  onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                  placeholder="e.g. Bodybuilding"
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience (Years)</label>
                <Input
                  type="number"
                  value={addForm.experience_years}
                  onChange={(e) => setAddForm({ ...addForm, experience_years: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Certifications</label>
              <div className="flex gap-2">
                <Input
                  value={addForm.newCert}
                  onChange={(e) => setAddForm({ ...addForm, newCert: e.target.value })}
                  placeholder="e.g. ACE Certified"
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
                <Button
                  type="button"
                  onClick={() => addCertTag(false)}
                  className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {addForm.certifications.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    {c}
                    <button type="button" onClick={() => removeCertTag(i, false)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Biography</label>
              <Textarea
                value={addForm.bio}
                onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                className="min-h-16 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Salary (₹)</label>
                <Input
                  type="number"
                  value={addForm.salary}
                  onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Joining Date</label>
                <Input
                  type="date"
                  value={addForm.joining_staff_date}
                  onChange={(e) => setAddForm({ ...addForm, joining_staff_date: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password *</label>
                <Input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm Password *</label>
                <Input
                  type="password"
                  required
                  value={addForm.confirmPassword}
                  onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" onClick={() => setIsAddOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold h-10 rounded-xl">
                Save Trainer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Trainer Modal */}
      <Dialog open={isEditOpen} onOpenChange={() => setIsEditOpen(false)}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">Edit Trainer</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Modify instructor details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex gap-4">
              <div className="flex-1 flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-white">Accepting Clients</span>
                <Switch checked={editForm.is_available} onCheckedChange={(val) => setEditForm({ ...editForm, is_available: val })} />
              </div>
              <div className="flex-1 flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-white">Active Account</span>
                <Switch checked={editForm.is_active} onCheckedChange={(val) => setEditForm({ ...editForm, is_active: val })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
              <Input
                required
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialization</label>
                <Input
                  value={editForm.specialization}
                  onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience (Years)</label>
                <Input
                  type="number"
                  value={editForm.experience_years}
                  onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Monthly Salary (₹)</label>
                <Input
                  type="number"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Certifications</label>
              <div className="flex gap-2">
                <Input
                  value={editForm.newCert}
                  onChange={(e) => setEditForm({ ...editForm, newCert: e.target.value })}
                  placeholder="e.g. NASM Certified"
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
                <Button
                  type="button"
                  onClick={() => addCertTag(true)}
                  className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {editForm.certifications.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    {c}
                    <button type="button" onClick={() => removeCertTag(i, true)}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Biography</label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="min-h-16 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Joining Date</label>
              <Input
                type="date"
                value={editForm.joining_staff_date}
                onChange={(e) => setEditForm({ ...editForm, joining_staff_date: e.target.value })}
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" onClick={() => setIsEditOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold h-10 rounded-xl">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
