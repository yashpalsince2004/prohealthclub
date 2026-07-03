import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  Shield,
  Briefcase,
  UserCheck,
  Plus
} from "lucide-react";
import { Staff } from "../dashboard/mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface StaffModuleProps {
  staffList: Staff[];
  onAddStaff: (newStaff: Staff) => void;
  onUpdateStaff: (updatedStaff: Staff) => void;
}

export default function StaffModule({
  staffList,
  onAddStaff,
  onUpdateStaff
}: StaffModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shiftFilter, setShiftFilter] = useState<string>("all");

  // Registration modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<"Receptionist" | "Manager" | "Sales Executive" | "Support">("Receptionist");
  const [newStaffShift, setNewStaffShift] = useState<"Morning" | "Evening" | "Full-time">("Morning");
  const [newStaffSalary, setNewStaffSalary] = useState("20000");

  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPhone) {
      toast.error("Please fill in all required contact details.");
      return;
    }

    const newStaffMember: Staff = {
      id: `ST-${Date.now().toString().slice(-3)}`,
      name: newStaffName,
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop", // placeholder
      role: newStaffRole,
      email: newStaffEmail,
      phone: newStaffPhone,
      status: "Active",
      shift: newStaffShift,
      joiningDate: new Date().toISOString().split("T")[0],
      salary: parseFloat(newStaffSalary) || 20000
    };

    onAddStaff(newStaffMember);
    toast.success(`Successfully registered staff member: ${newStaffName}`);
    setShowAddModal(false);

    // Reset Form
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
    setNewStaffRole("Receptionist");
    setNewStaffShift("Morning");
    setNewStaffSalary("20000");
  };

  const toggleStatus = (staff: Staff) => {
    const updated = {
      ...staff,
      status: (staff.status === "Active" ? "Inactive" : "Active") as "Active" | "Inactive"
    };
    onUpdateStaff(updated);
    toast.success(`Status for ${staff.name} changed to ${updated.status}`);
  };

  const updateShift = (staff: Staff, shift: "Morning" | "Evening" | "Full-time") => {
    const updated = {
      ...staff,
      shift
    };
    onUpdateStaff(updated);
    toast.success(`Shift for ${staff.name} updated to ${shift}`);
  };

  // Filter roster list
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.phone.includes(searchQuery);
    
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesShift = shiftFilter === "all" || s.shift === shiftFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesShift;
  });

  return (
    <div className="space-y-6">
      {/* Header and Quick Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-wider">Staff Directory</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Manage admin credentials, front-desk shifts, and support staff logs
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl h-10 px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus size={14} />
          <span>Add New Staff</span>
        </Button>
      </div>

      {/* Roster Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#171717] border border-white/5 p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-white/5 bg-[#1D1D1D] text-xs font-medium rounded-xl"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-xs text-slate-300 rounded-xl">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Receptionist">Receptionist</SelectItem>
            <SelectItem value="Manager">Manager</SelectItem>
            <SelectItem value="Sales Executive">Sales Executive</SelectItem>
            <SelectItem value="Support">Support Staff</SelectItem>
          </SelectContent>
        </Select>

        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-xs text-slate-300 rounded-xl">
            <SelectValue placeholder="Filter by Shift" />
          </SelectTrigger>
          <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
            <SelectItem value="all">All Shifts</SelectItem>
            <SelectItem value="Morning">Morning</SelectItem>
            <SelectItem value="Evening">Evening</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-xs text-slate-300 rounded-xl">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active Only</SelectItem>
            <SelectItem value="Inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roster Table Grid */}
      <div className="bg-[#171717] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#1d1d1d] border-b border-white/5">
            <TableRow>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Staff Member</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Role</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Shift Alloc</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Base Salary</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Joined</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/5">
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-500 font-semibold">
                  No staff members matched your filter parameters.
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-white/5 transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={staff.photo} 
                        alt={staff.name} 
                        className="h-10 w-10 object-cover rounded-xl border border-white/5"
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{staff.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold font-mono mt-0.5">{staff.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                      <Briefcase size={12} className="text-primary" />
                      <span>{staff.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Select 
                      value={staff.shift} 
                      onValueChange={(val: any) => updateShift(staff, val)}
                    >
                      <SelectTrigger className="h-8 border-none bg-white/5 text-[10px] font-bold text-white rounded-lg w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-xs text-white rounded-xl">
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-white">
                    ₹{staff.salary.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3 text-[10px] font-bold text-slate-400 font-mono">
                    {staff.joiningDate}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      staff.status === "Active" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#FF5252]/10 text-[#FF5252]"
                    }`}>
                      {staff.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <button
                      onClick={() => toggleStatus(staff)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        staff.status === "Active" 
                          ? "border-[#FF5252]/20 hover:bg-[#FF5252]/10 text-[#FF5252]" 
                          : "border-[#00C853]/20 hover:bg-[#00C853]/10 text-[#00C853]"
                      }`}
                    >
                      {staff.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* REGISTER STAFF MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#171717] border border-white/5 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-widest">Register Staff Profile</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleRegisterStaff} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 uppercase tracking-wider">Full Name</Label>
                  <Input
                    required
                    placeholder="Enter Staff Name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 uppercase tracking-wider">Email Address</Label>
                    <Input
                      required
                      type="email"
                      placeholder="name@prrohealth.com"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 uppercase tracking-wider">Phone contact</Label>
                    <Input
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 uppercase tracking-wider">Job Role</Label>
                    <Select value={newStaffRole} onValueChange={(val: any) => setNewStaffRole(val)}>
                      <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="Receptionist">Receptionist</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                        <SelectItem value="Support">Support Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-400 uppercase tracking-wider">Shift Schedule</Label>
                    <Select value={newStaffShift} onValueChange={(val: any) => setNewStaffShift(val)}>
                      <SelectTrigger className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                        <SelectItem value="Morning">Morning Shift</SelectItem>
                        <SelectItem value="Evening">Evening Shift</SelectItem>
                        <SelectItem value="Full-time">Full-time Shift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-slate-400 uppercase tracking-wider">Starting Base Salary (₹ / month)</Label>
                  <Input
                    type="number"
                    value={newStaffSalary}
                    onChange={(e) => setNewStaffSalary(e.target.value)}
                    className="h-10 border-white/5 bg-[#1D1D1D] text-white rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-wider rounded-xl mt-2"
                >
                  Create Profile
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
