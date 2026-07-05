import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Eye, List, LayoutGrid, MoreVertical, X, Calendar, 
  UserPlus, PhoneCall, Trash2, CheckCircle2, UserCheck, AlertCircle 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { toast } from "sonner";
import { api } from "../../../lib/api";
import AddMemberForm from "../AddMemberForm";

type LeadStatus = "new" | "contacted" | "trial" | "converted" | "lost";

export default function LeadsBoard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [todayFollowUpsCount, setTodayFollowUpsCount] = useState(0);
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    interest: "",
    source: "walk_in",
    follow_up_date: "",
    assigned_to: "",
    notes: "",
  });

  const [detailNotes, setDetailNotes] = useState("");
  const [convertForm, setConvertForm] = useState({
    password: "",
    plan_id: "",
    joining_date: new Date().toISOString().split("T")[0],
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url = filterTodayOnly 
        ? "/api/v1/leads/?follow_up_today=true" 
        : "/api/v1/leads/";
      const res = await api.get<any>(url);
      setLeads(res.leads || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load leads list");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayFollowUpsCount = async () => {
    try {
      const res = await api.get<any>("/api/v1/leads/?follow_up_today=true");
      setTodayFollowUpsCount(res.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get<any>("/api/v1/receptionists/");
      setStaff(res.staff || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filterTodayOnly]);

  useEffect(() => {
    fetchTodayFollowUpsCount();
    fetchStaff();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.full_name || !addForm.phone) {
      toast.error("Name and Phone are required.");
      return;
    }

    try {
      const payload = {
        full_name: addForm.full_name,
        phone: addForm.phone,
        email: addForm.email || null,
        age: addForm.age ? parseInt(addForm.age) : null,
        gender: addForm.gender || null,
        interest: addForm.interest || null,
        source: addForm.source,
        follow_up_date: addForm.follow_up_date || null,
        assigned_to: addForm.assigned_to || null,
        notes: addForm.notes || null,
      };

      await api.post("/api/v1/leads/", payload);
      toast.success("Lead created successfully");
      setIsAddOpen(false);
      // Reset form
      setAddForm({
        full_name: "",
        phone: "",
        email: "",
        age: "",
        gender: "",
        interest: "",
        source: "walk_in",
        follow_up_date: "",
        assigned_to: "",
        notes: "",
      });
      fetchLeads();
      fetchTodayFollowUpsCount();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead");
    }
  };

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setDetailNotes("");
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (status: LeadStatus) => {
    if (!selectedLead) return;
    try {
      const updated = await api.patch(`/api/v1/leads/${selectedLead.id}`, { status });
      toast.success(`Lead status updated to ${status}`);
      setSelectedLead(updated.data);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead status");
    }
  };

  const handleAddNote = async () => {
    if (!selectedLead || !detailNotes.trim()) return;
    try {
      const updated = await api.patch(`/api/v1/leads/${selectedLead.id}`, {
        notes: detailNotes.trim()
      });
      toast.success("Note added successfully");
      setSelectedLead(updated.data);
      setDetailNotes("");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
    }
  };

  const handleUpdateFollowUp = async (dateStr: string) => {
    if (!selectedLead) return;
    try {
      const updated = await api.patch(`/api/v1/leads/${selectedLead.id}`, {
        follow_up_date: dateStr || null
      });
      toast.success("Follow up date updated");
      setSelectedLead(updated.data);
      fetchLeads();
      fetchTodayFollowUpsCount();
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow up date");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/api/v1/leads/${id}`);
      toast.success("Lead deleted successfully");
      setIsDetailOpen(false);
      fetchLeads();
      fetchTodayFollowUpsCount();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
    }
  };

  // Convert lead to member handler
  const handleConvertSuccess = () => {
    setIsConvertOpen(false);
    setIsDetailOpen(false);
    fetchLeads();
  };

  // Filtering leads based on search query
  const filteredLeads = leads.filter(l => 
    l.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery) ||
    (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Grouping leads for Kanban columns
  const getColLeads = (colStatus: LeadStatus | "converted_lost") => {
    return filteredLeads.filter(l => {
      if (colStatus === "converted_lost") {
        return l.status === "converted" || l.status === "lost";
      }
      return l.status === colStatus;
    });
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split("T")[0];
    return dateStr < today;
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Alert / Notification Bar for Today's Follow-ups */}
      {todayFollowUpsCount > 0 && (
        <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 p-3.5 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-[#FF6B00]" size={18} />
            <span className="text-xs font-bold text-white">
              {todayFollowUpsCount} {todayFollowUpsCount === 1 ? "lead needs" : "leads need"} follow-up calls today.
            </span>
          </div>
          <Button
            onClick={() => setFilterTodayOnly(!filterTodayOnly)}
            className={`h-8 rounded-lg text-[10px] font-black uppercase tracking-wider px-3 ${
              filterTodayOnly 
                ? "bg-[#FF6B00] text-white" 
                : "bg-white/5 hover:bg-white/10 text-white"
            }`}
          >
            {filterTodayOnly ? "Show All Leads" : "Filter Today"}
          </Button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white">Leads Pipeline</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Track inquiries, free trials, and member conversion rates
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-white/5 border border-white/5 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "kanban" ? "bg-[#FF6B00] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-[#FF6B00] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <List size={16} />
            </button>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
          >
            <Plus size={16} />
            New Lead
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads..."
          className="h-11 pl-11 pr-4 border-white/5 bg-[#121212] rounded-2xl text-white focus-visible:ring-1 focus-visible:ring-[#FF6B00]"
        />
      </div>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Column NEW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">NEW</span>
              <span className="bg-white/5 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {getColLeads("new").length}
              </span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {getColLeads("new").map(l => (
                <div
                  key={l.id}
                  onClick={() => handleLeadClick(l)}
                  className="p-4 bg-[#171717]/80 hover:bg-[#1c1c1c] border border-white/5 rounded-2xl cursor-pointer shadow-lg space-y-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white leading-tight">{l.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{l.phone}</div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg">
                      {l.source}
                    </span>
                    {l.follow_up_date && (
                      <span className={isOverdue(l.follow_up_date) ? "text-red-500" : "text-slate-500"}>
                        Cal: {l.follow_up_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column CONTACTED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-500">CONTACTED</span>
              <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                {getColLeads("contacted").length}
              </span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {getColLeads("contacted").map(l => (
                <div
                  key={l.id}
                  onClick={() => handleLeadClick(l)}
                  className="p-4 bg-[#171717]/80 hover:bg-[#1c1c1c] border border-white/5 rounded-2xl cursor-pointer shadow-lg space-y-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white leading-tight">{l.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{l.phone}</div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg">
                      {l.source}
                    </span>
                    {l.follow_up_date && (
                      <span className={isOverdue(l.follow_up_date) ? "text-red-500 animate-pulse" : "text-slate-500"}>
                        Cal: {l.follow_up_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column TRIAL */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#FF6B00]">TRIAL</span>
              <span className="bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-black px-2 py-0.5 rounded-full">
                {getColLeads("trial").length}
              </span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {getColLeads("trial").map(l => (
                <div
                  key={l.id}
                  onClick={() => handleLeadClick(l)}
                  className="p-4 bg-[#171717]/80 hover:bg-[#1c1c1c] border border-white/5 rounded-2xl cursor-pointer shadow-lg space-y-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white leading-tight">{l.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{l.phone}</div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-lg">
                      {l.source}
                    </span>
                    {l.follow_up_date && (
                      <span className={isOverdue(l.follow_up_date) ? "text-red-500" : "text-slate-500"}>
                        Cal: {l.follow_up_date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column CONVERTED / LOST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">CONVERTED / LOST</span>
              <span className="bg-white/5 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                {getColLeads("converted_lost").length}
              </span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {getColLeads("converted_lost").map(l => (
                <div
                  key={l.id}
                  onClick={() => handleLeadClick(l)}
                  className="p-4 bg-[#171717]/85 border border-white/5 rounded-2xl cursor-pointer shadow-lg space-y-3 relative group"
                >
                  <div className="space-y-1 opacity-60">
                    <div className="text-xs font-bold text-white leading-tight">{l.full_name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{l.phone}</div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider opacity-60">
                    <span className={`px-2 py-0.5 rounded-lg ${
                      l.status === "converted" 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {l.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-[#121212]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          {leads.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
              No Leads Found
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-white/5 bg-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Source</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Follow-Up Date</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((l) => (
                  <TableRow key={l.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => handleLeadClick(l)}>
                    <TableCell className="text-xs font-bold text-white py-4">{l.full_name}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-300">{l.phone}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-400">{l.email || "N/A"}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-400 uppercase">{l.source}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        l.status === "converted" 
                          ? "bg-green-500/10 text-green-500" 
                          : l.status === "lost"
                          ? "bg-red-500/10 text-red-500"
                          : l.status === "trial"
                          ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                          : "bg-white/5 text-slate-400"
                      }`}>
                        {l.status}
                      </span>
                    </TableCell>
                    <TableCell className={`text-xs font-bold ${isOverdue(l.follow_up_date) ? "text-red-500" : "text-slate-400"}`}>
                      {l.follow_up_date || "Not Scheduled"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleLeadClick(l)}
                        className="w-8 h-8 rounded-lg bg-white/5 p-0 hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <Eye size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* ADD LEAD DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={() => setIsAddOpen(false)}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">New Lead Registration</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">Capture walking visitor details.</DialogDescription>
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone *</label>
                <Input
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="10-digit number"
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</label>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="name@email.com"
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Age</label>
                <Input
                  type="number"
                  value={addForm.age}
                  onChange={(e) => setAddForm({ ...addForm, age: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender</label>
                <Select value={addForm.gender} onValueChange={(val) => setAddForm({ ...addForm, gender: val })}>
                  <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                    <SelectValue placeholder="Gender" />
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fitness Interest</label>
              <Input
                value={addForm.interest}
                onChange={(e) => setAddForm({ ...addForm, interest: e.target.value })}
                placeholder="e.g. Weight Loss, Muscle Gain..."
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Source</label>
                <Select value={addForm.source} onValueChange={(val) => setAddForm({ ...addForm, source: val })}>
                  <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#171717] border border-white/5 text-white">
                    <SelectItem value="walk_in">Walk-in</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Follow-up Date</label>
                <Input
                  type="date"
                  value={addForm.follow_up_date}
                  onChange={(e) => setAddForm({ ...addForm, follow_up_date: e.target.value })}
                  className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Receptionist</label>
              <Select value={addForm.assigned_to} onValueChange={(val) => setAddForm({ ...addForm, assigned_to: val })}>
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] rounded-xl text-white">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent className="bg-[#171717] border border-white/5 text-white">
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.profile?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inquiry Notes</label>
              <Textarea
                value={addForm.notes}
                onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                placeholder="Details of inquiry..."
                className="min-h-16 border-white/5 bg-[#171717] rounded-xl text-white"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" onClick={() => setIsAddOpen(false)} className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold h-10 rounded-xl">
                Save Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* LEAD DETAIL DIALOG */}
      {selectedLead && (
        <Dialog open={isDetailOpen} onOpenChange={() => setIsDetailOpen(false)}>
          <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-3">
              <div>
                <DialogTitle className="text-lg font-black uppercase tracking-wider text-white">
                  {selectedLead.full_name}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  Pipeline Stage: {selectedLead.status}
                </DialogDescription>
              </div>
              <Button
                onClick={() => handleDelete(selectedLead.id)}
                className="w-8 h-8 rounded-lg bg-red-500/10 p-0 hover:bg-red-500/20 text-red-500"
              >
                <Trash2 size={14} />
              </Button>
            </DialogHeader>

            <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Phone</span>
                  <span className="text-xs font-bold text-white">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Email</span>
                  <span className="text-xs font-bold text-white">{selectedLead.email || "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Age</span>
                  <span className="text-xs font-bold text-white">{selectedLead.age || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Gender</span>
                  <span className="text-xs font-bold text-white capitalize">{selectedLead.gender || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Interest</span>
                  <span className="text-xs font-bold text-white">{selectedLead.interest || "General"}</span>
                </div>
              </div>

              {/* Status & follow-up selectors */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Update Stage</span>
                  <Select value={selectedLead.status} onValueChange={(val: LeadStatus) => handleUpdateStatus(val)}>
                    <SelectTrigger className="h-9 border-white/5 bg-[#171717] rounded-xl text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#171717] border border-white/5 text-white">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Follow-up Date</span>
                  <Input
                    type="date"
                    value={selectedLead.follow_up_date || ""}
                    onChange={(e) => handleUpdateFollowUp(e.target.value)}
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Notes log */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Interaction Log</span>
                <div className="bg-black/30 border border-white/5 p-3 rounded-xl max-h-32 overflow-y-auto space-y-2">
                  <p className="text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedLead.notes || "No interaction logged yet."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    placeholder="Append new call summary / follow-up note..."
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                  <Button
                    onClick={handleAddNote}
                    className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {selectedLead.status !== "converted" && (
              <DialogFooter className="pt-4 border-t border-white/5">
                <Button
                  onClick={() => setIsConvertOpen(true)}
                  className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <UserCheck size={16} />
                  Convert to Member
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* CONVERT TO MEMBER FORM DIALOG */}
      {selectedLead && (
        <Dialog open={isConvertOpen} onOpenChange={() => setIsConvertOpen(false)}>
          <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
            <DialogHeader className="border-b border-white/5 pb-2">
              <DialogTitle className="text-lg font-black uppercase tracking-wider text-[#FF6B00]">Convert Lead</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Setup membership subscription and login access credentials.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 max-h-[70vh] overflow-y-auto pr-1">
              <AddMemberForm
                onSuccess={handleConvertSuccess}
                initialData={{
                  fullName: selectedLead.full_name,
                  phone: selectedLead.phone,
                  email: selectedLead.email || undefined,
                  gender: selectedLead.gender || undefined
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
