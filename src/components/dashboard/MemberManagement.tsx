import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  UserPlus, 
  Eye, 
  ArrowLeft, 
  Trash2, 
  QrCode, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  Weight,
  BookOpen,
  Calendar,
  DollarSign
} from "lucide-react";
import { Member, Trainer, Invoice, Measurement } from "./mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface MemberManagementProps {
  members: Member[];
  trainers: Trainer[];
  onAddMember: (newMember: Member) => void;
  onUpdateMember: (updatedMember: Member) => void;
  onDeleteMember: (id: string) => void;
  selectedMemberId?: string;
  setSelectedMemberId: (id: string | undefined) => void;
}

export default function MemberManagement({
  members,
  trainers,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  selectedMemberId,
  setSelectedMemberId
}: MemberManagementProps) {
  const [subView, setSubView] = useState<"list" | "profile" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add Member Form multi-step states
  const [formStep, setFormStep] = useState(1);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    membership: "Annual Platinum Plan",
    assignedTrainerId: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    medicalConditions: "",
    amountPaid: "18000",
    paymentMethod: "UPI" as "Cash" | "Card" | "UPI" | "Split"
  });

  // Reset selected member or route back
  const handleBackToList = () => {
    setSelectedMemberId(undefined);
    setSubView("list");
  };

  // Trigger add member subview
  const handleOpenAddForm = () => {
    setFormStep(1);
    setNewMemberForm({
      name: "",
      email: "",
      phone: "",
      photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      membership: "Annual Platinum Plan",
      assignedTrainerId: "",
      emergencyName: "",
      emergencyPhone: "",
      emergencyRelation: "",
      medicalConditions: "",
      amountPaid: "18000",
      paymentMethod: "UPI"
    });
    setSubView("add");
  };

  // Submit Add Member
  const handleRegisterMemberSubmit = () => {
    const freshMember: Member = {
      id: `PHC-${100 + members.length + 1}`,
      name: newMemberForm.name || "Anonymous Member",
      photo: newMemberForm.photo,
      email: newMemberForm.email || "none@phc.com",
      phone: newMemberForm.phone || "+91 00000 00000",
      membership: newMemberForm.membership,
      assignedTrainerId: newMemberForm.assignedTrainerId || undefined,
      attendanceToday: false,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default 1 month out
      status: "Active",
      emergencyContact: {
        name: newMemberForm.emergencyName || "None",
        phone: newMemberForm.emergencyPhone || "None",
        relationship: newMemberForm.emergencyRelation || "None"
      },
      medicalConditions: newMemberForm.medicalConditions ? newMemberForm.medicalConditions.split(",").map(c => c.trim()) : ["None"],
      qrCode: `QR_PHC_${100 + members.length + 1}`,
      workoutPlan: ["General Strength conditioning layout preset"],
      dietPlan: ["Balanced healthy protein core diet plan preset"],
      measurements: [{ weight: 75, bodyFat: 18, muscleMass: 35, date: new Date().toISOString().split('T')[0] }],
      invoices: [{
        id: `INV-2026-0${100 + members.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(newMemberForm.amountPaid) || 18000,
        method: newMemberForm.paymentMethod,
        status: "Paid"
      }],
      activityLogs: [{
        id: `AL-${Date.now()}`,
        type: "payment",
        details: `Registered and paid via ${newMemberForm.paymentMethod}`,
        timestamp: "Just now"
      }],
      notes: ["New member registration log."]
    };

    onAddMember(freshMember);
    toast.success("Successfully registered new member!");
    setSubView("list");
  };

  // Filtering list
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || member.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesMembership = membershipFilter === "all" || member.membership.toLowerCase().includes(membershipFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMembership;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Tab state inside Profile view
  const [profileTab, setProfileTab] = useState<"overview" | "attendance" | "plans" | "billing" | "measurements">("overview");

  return (
    <div className="space-y-6">
      {/* Outer Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider">
            {subView === "list" ? "Members Directory" : subView === "profile" ? "Member Profile" : "Register Member"}
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            {subView === "list" ? "Audit and Search Gym Roster" : subView === "profile" ? "Review Individual Client Record" : "Add New Athlete Account"}
          </p>
        </div>

        {subView === "list" ? (
          <Button 
            onClick={handleOpenAddForm}
            className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg hover:shadow-primary/20 flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>Register Member</span>
          </Button>
        ) : (
          <button 
            onClick={handleBackToList}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/5 bg-[#171717] hover:bg-white/5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Directory</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: MEMBERS DIRECTORY LIST */}
        {subView === "list" && !selectedMemberId && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Filter controls bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by ID, name or phone..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10 h-10 border-white/5 bg-[#171717] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                />
              </div>

              {/* Status Select Filter */}
              <Select 
                value={statusFilter} 
                onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              >
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] text-white rounded-xl">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Plan</SelectItem>
                  <SelectItem value="expired">Expired Plan</SelectItem>
                  <SelectItem value="frozen">Frozen Plan</SelectItem>
                </SelectContent>
              </Select>

              {/* Membership Type Select Filter */}
              <Select 
                value={membershipFilter} 
                onValueChange={(val) => { setMembershipFilter(val); setCurrentPage(1); }}
              >
                <SelectTrigger className="h-10 border-white/5 bg-[#171717] text-white rounded-xl">
                  <SelectValue placeholder="Filter by Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  <SelectItem value="all">All Memberships</SelectItem>
                  <SelectItem value="annual">Annual Plan</SelectItem>
                  <SelectItem value="3-month">3-Month Plan</SelectItem>
                  <SelectItem value="starter">Starter Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Directory Table */}
            <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-b border-white/5">
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trainer</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-slate-500 font-semibold">
                        No members found matching filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentMembers.map((member) => {
                      const trainer = trainers.find(t => t.id === member.assignedTrainerId);
                      return (
                        <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <TableCell className="font-bold flex items-center space-x-3 py-4">
                            <img 
                              src={member.photo} 
                              alt={member.name} 
                              className="h-10 w-10 object-cover rounded-xl border border-white/5"
                            />
                            <div className="flex flex-col">
                              <span className="text-white text-sm font-bold leading-tight">{member.name}</span>
                              <span className="text-[10px] text-slate-500 font-semibold">{member.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-mono text-slate-400">{member.id}</TableCell>
                          <TableCell className="text-sm text-slate-400">{member.phone}</TableCell>
                          <TableCell className="text-sm text-slate-300 font-medium">{member.membership}</TableCell>
                          <TableCell className="text-sm text-slate-400">
                            {trainer ? trainer.name : <span className="text-slate-600 font-bold">Unassigned</span>}
                          </TableCell>
                          <TableCell className="text-sm text-slate-400 font-semibold">{member.expiryDate}</TableCell>
                          <TableCell>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              member.status === "Active" ? "bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20" :
                              member.status === "Frozen" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20"
                            }`}>
                              {member.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => { setSelectedMemberId(member.id); setSubView("profile"); }}
                                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="View Profile"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this member account?")) {
                                    onDeleteMember(member.id);
                                    toast.success("Successfully deleted member record.");
                                  }
                                }}
                                className="p-2 rounded-lg bg-[#FF5252]/10 text-[#FF5252] hover:bg-[#FF5252]/20 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} accounts
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="h-8 w-8 p-0 border-white/5 bg-[#171717] hover:bg-white/5 text-white"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-white px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="h-8 w-8 p-0 border-white/5 bg-[#171717] hover:bg-white/5 text-white"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: MEMBER PROFILE CARD */}
        {subView === "profile" && selectedMember && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Box - Profile Info Card */}
            <div className="lg:col-span-4 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <img 
                    src={selectedMember.photo} 
                    alt={selectedMember.name} 
                    className="h-28 w-28 object-cover rounded-2xl mx-auto border-2 border-primary"
                  />
                  <div>
                    <h2 className="text-lg font-black text-white">{selectedMember.name}</h2>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedMember.id}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedMember.status === "Active" ? "bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20" :
                    selectedMember.status === "Frozen" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20"
                  }`}>
                    {selectedMember.status} Plan
                  </span>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Phone Contact</span>
                    <p className="text-sm font-semibold text-white mt-1">{selectedMember.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Email Address</span>
                    <p className="text-sm font-semibold text-white mt-1 truncate">{selectedMember.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Emergency Contact</span>
                    <p className="text-sm font-semibold text-white mt-1">
                      {selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.relationship})
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{selectedMember.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Medical Disclaimers</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedMember.medicalConditions.map((cond, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                          {cond}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Digital QR Code</span>
                  <p className="text-[11px] text-slate-400 font-medium">Use scanner to audit check-in logs</p>
                </div>
                <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center p-1 cursor-pointer hover:opacity-85 transition-opacity">
                  <QrCode className="h-full w-full text-black" />
                </div>
              </div>
            </div>

            {/* Right Box - Tabbed Content Profile details */}
            <div className="lg:col-span-8 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg flex flex-col justify-between min-h-[500px]">
              <div className="space-y-6">
                {/* Tabs selection bar */}
                <div className="flex items-center space-x-1.5 border-b border-white/5 pb-2 overflow-x-auto scrollbar-none">
                  {[
                    { id: "overview", label: "Overview", icon: BookOpen },
                    { id: "plans", label: "Workout & Diet", icon: FileText },
                    { id: "billing", label: "Invoices Ledger", icon: DollarSign },
                    { id: "measurements", label: "Metrics & Weight", icon: Weight }
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setProfileTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                          profileTab === tab.id
                            ? "bg-primary text-white"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <TabIcon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Panels */}
                <div className="min-h-[300px]">
                  {/* TAB 1: OVERVIEW */}
                  {profileTab === "overview" && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#1D1D1D] p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Plan Type</span>
                          <p className="text-base font-black text-white mt-1">{selectedMember.membership}</p>
                        </div>
                        <div className="bg-[#1D1D1D] p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Membership Expiry</span>
                          <p className="text-base font-black text-white mt-1">{selectedMember.expiryDate}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Roster Log Alerts</h4>
                        <div className="bg-[#1D1D1D] rounded-xl border border-white/5 divide-y divide-white/5">
                          {selectedMember.activityLogs.length === 0 ? (
                            <p className="text-xs text-slate-500 font-semibold p-4 text-center">No logs recorded for this cycle.</p>
                          ) : (
                            selectedMember.activityLogs.map((log) => (
                              <div key={log.id} className="p-3 flex items-center justify-between gap-4">
                                <span className="text-xs font-bold text-slate-200">{log.details}</span>
                                <span className="text-[10px] font-bold text-slate-500">{log.timestamp}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PLANS */}
                  {profileTab === "plans" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-200">
                      {/* Workout routines */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-primary">Workout Routines</h4>
                        <div className="bg-[#1D1D1D] p-4 rounded-xl border border-white/5 space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
                          {selectedMember.workoutPlan.map((w, idx) => (
                            <p key={idx} className="text-xs font-semibold text-slate-300 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
                              {w}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Diet details */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#00C853]">Dietary Profiles</h4>
                        <div className="bg-[#1D1D1D] p-4 rounded-xl border border-white/5 space-y-2 max-h-[300px] overflow-y-auto scrollbar-none">
                          {selectedMember.dietPlan.map((d, idx) => (
                            <p key={idx} className="text-xs font-semibold text-slate-300 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
                              {d}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: BILLING */}
                  {profileTab === "billing" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Invoice History</h4>
                      <div className="bg-[#1D1D1D] border border-white/5 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-white/5 hover:bg-transparent">
                              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invoice ID</TableHead>
                              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</TableHead>
                              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</TableHead>
                              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Method</TableHead>
                              <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedMember.invoices.map((inv) => (
                              <TableRow key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                <TableCell className="text-xs font-mono font-bold text-white">{inv.id}</TableCell>
                                <TableCell className="text-xs text-slate-400">{inv.date}</TableCell>
                                <TableCell className="text-xs font-bold text-white">₹{inv.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-xs text-slate-400 font-semibold">{inv.method}</TableCell>
                                <TableCell className="text-right">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                    inv.status === "Paid" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-amber-500/10 text-amber-500"
                                  }`}>
                                    {inv.status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: MEASUREMENTS */}
                  {profileTab === "measurements" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Measurements Log</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedMember.measurements.map((m, idx) => (
                          <div key={idx} className="bg-[#1D1D1D] p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Record Date</span>
                              <span className="text-xs font-bold text-white">{m.date}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Weight</span>
                                <p className="text-sm font-black text-white mt-0.5">{m.weight} kg</p>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Body Fat</span>
                                <p className="text-sm font-black text-[#FF7A00] mt-0.5">{m.bodyFat}%</p>
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Muscle</span>
                                <p className="text-sm font-black text-emerald-500 mt-0.5">{m.muscleMass} kg</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Options */}
              <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-500">Quick Actions:</span>
                <div className="flex items-center space-x-2">
                  {selectedMember.status === "Active" ? (
                    <Button
                      onClick={() => {
                        const updated = { ...selectedMember, status: "Frozen" as const };
                        onUpdateMember(updated);
                        toast.info("Membership frozen successfully.");
                      }}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-bold h-9 rounded-xl"
                    >
                      Freeze Member
                    </Button>
                  ) : selectedMember.status === "Frozen" ? (
                    <Button
                      onClick={() => {
                        const updated = { ...selectedMember, status: "Active" as const };
                        onUpdateMember(updated);
                        toast.success("Membership resumed successfully.");
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00C853] border border-[#00C853]/20 text-xs font-bold h-9 rounded-xl"
                    >
                      Resume Member
                    </Button>
                  ) : null}
                  <Button
                    onClick={() => {
                      const amount = prompt("Enter billing renewal amount (₹):", "18000");
                      if (amount) {
                        const updated = { 
                          ...selectedMember, 
                          status: "Active" as const,
                          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                          invoices: [
                            ...selectedMember.invoices,
                            {
                              id: `INV-2026-${Date.now().toString().slice(-3)}`,
                              date: new Date().toISOString().split('T')[0],
                              amount: parseFloat(amount),
                              method: "UPI" as const,
                              status: "Paid" as const
                            }
                          ],
                          activityLogs: [
                            ...selectedMember.activityLogs,
                            { id: `AL-${Date.now()}`, type: "renewal" as const, details: `Membership renewed for 1 Year (paid ₹${amount})`, timestamp: "Just now" }
                          ]
                        };
                        onUpdateMember(updated);
                        toast.success("Membership renewed successfully!");
                      }
                    }}
                    className="bg-primary hover:bg-primary/90 text-white text-xs font-bold h-9 rounded-xl"
                  >
                    Renew Plan
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: MULTI STEP REGISTER NEW MEMBER */}
        {subView === "add" && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6"
          >
            {/* Step navigation dots */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Step {formStep} of 4</span>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4].map(s => (
                  <span 
                    key={s} 
                    className={`h-1.5 w-8 rounded-full transition-colors ${s <= formStep ? "bg-primary" : "bg-white/5"}`} 
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: PERSONAL DETAILS */}
            {formStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Personal Information</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">FullName</Label>
                  <Input
                    id="reg-name"
                    placeholder="Enter full name"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="e.g. amit@gmail.com"
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                      className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</Label>
                    <Input
                      id="reg-phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={newMemberForm.phone}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                      className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: MEMBERSHIP & BILLING */}
            {formStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Membership Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-plan" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Plan</Label>
                    <Select
                      value={newMemberForm.membership}
                      onValueChange={(val) => {
                        const priceMap: Record<string, string> = {
                          "Annual Platinum Plan": "18000",
                          "3-Month Gold Plan": "4500",
                          "Starter Pack Monthly": "1500"
                        };
                        setNewMemberForm({
                          ...newMemberForm,
                          membership: val,
                          amountPaid: priceMap[val] || "18000"
                        });
                      }}
                    >
                      <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue placeholder="Choose a membership plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="Annual Platinum Plan">Annual Platinum Plan (₹18,000)</SelectItem>
                        <SelectItem value="3-Month Gold Plan">3-Month Gold Plan (₹4,500)</SelectItem>
                        <SelectItem value="Starter Pack Monthly">Starter Pack Monthly (₹1,500)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-trainer" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assign Trainer</Label>
                    <Select
                      value={newMemberForm.assignedTrainerId}
                      onValueChange={(val) => setNewMemberForm({ ...newMemberForm, assignedTrainerId: val })}
                    >
                      <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue placeholder="Assign a certified trainer (Optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="none">No Trainer</SelectItem>
                        {trainers.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name} ({t.specialization})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EMERGENCY & HEALTH */}
            {formStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Emergency & Health Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-em-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Person</Label>
                    <Input
                      id="reg-em-name"
                      placeholder="Full name of contact"
                      value={newMemberForm.emergencyName}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, emergencyName: e.target.value })}
                      className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-em-rel" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Relationship</Label>
                    <Input
                      id="reg-em-rel"
                      placeholder="e.g. Father, Mother, Spouse"
                      value={newMemberForm.emergencyRelation}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, emergencyRelation: e.target.value })}
                      className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-em-phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Phone</Label>
                  <Input
                    id="reg-em-phone"
                    placeholder="Emergency contact phone number"
                    value={newMemberForm.emergencyPhone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, emergencyPhone: e.target.value })}
                    className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-medical" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Notes (comma separated)</Label>
                  <Input
                    id="reg-medical"
                    placeholder="e.g. Asthma, Knee pain, Hypertension, None"
                    value={newMemberForm.medicalConditions}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, medicalConditions: e.target.value })}
                    className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & REGISTER */}
            {formStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Review & Complete Registration</h3>
                <div className="bg-[#1D1D1D] p-4 rounded-xl border border-white/5 space-y-2.5 divide-y divide-white/5 text-sm">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400 font-semibold">FullName:</span>
                    <span className="text-white font-bold">{newMemberForm.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400 font-semibold">Plan Selected:</span>
                    <span className="text-white font-bold">{newMemberForm.membership}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400 font-semibold">Total Price:</span>
                    <span className="text-[#FF7A00] font-black">₹{parseFloat(newMemberForm.amountPaid).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400 font-semibold">Payment Mode:</span>
                    <span className="text-emerald-500 font-bold">{newMemberForm.paymentMethod}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="reg-pay" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Payment Method</Label>
                  <Select
                    value={newMemberForm.paymentMethod}
                    onValueChange={(val) => setNewMemberForm({ ...newMemberForm, paymentMethod: val as any })}
                  >
                    <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                      <SelectItem value="UPI">UPI Payment</SelectItem>
                      <SelectItem value="Cash">Cash Ledger</SelectItem>
                      <SelectItem value="Card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Footer controls for form steps */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <Button
                disabled={formStep === 1}
                onClick={() => setFormStep(prev => prev - 1)}
                className="bg-white/5 border border-white/5 text-slate-300 hover:text-white rounded-xl font-bold h-10 px-4"
              >
                Previous Step
              </Button>

              {formStep < 4 ? (
                <Button
                  onClick={() => {
                    if (formStep === 1 && !newMemberForm.name) {
                      toast.error("Please enter a name first.");
                      return;
                    }
                    setFormStep(prev => prev + 1);
                  }}
                  className="bg-primary hover:bg-primary/95 text-white rounded-xl font-bold h-10 px-4"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleRegisterMemberSubmit}
                  className="bg-primary hover:bg-primary/95 text-white rounded-xl font-bold h-10 px-4 flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>Register & Save</span>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
