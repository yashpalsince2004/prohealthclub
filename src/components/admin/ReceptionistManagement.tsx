import React, { useState, useEffect } from "react";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { UserCheck, Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { api } from "../../lib/api";
import AddReceptionistModal from "./AddReceptionistModal";
import EditReceptionistModal from "./EditReceptionistModal";
import { useAuth } from "../../hooks/useAuth";

export default function ReceptionistManagement() {
  const { loading: authLoading } = useAuth(["admin"]);
  const [receptionists, setReceptionists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState<any>(null);

  const fetchReceptionists = async () => {
    setLoading(true);
    try {
      const url = searchQuery 
        ? `/api/v1/receptionists/?search=${encodeURIComponent(searchQuery)}`
        : "/api/v1/receptionists/";
      const res = await api.get<any>(url);
      setReceptionists(res.staff || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load receptionists list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (receptionist: any) => {
    setSelectedReceptionist(receptionist);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this receptionist account?")) return;
    try {
      await api.delete(`/api/v1/receptionists/${id}`);
      toast.success("Receptionist account deleted successfully");
      fetchReceptionists();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete receptionist");
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
                Receptionist Management
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Configure front desk staff credentials, shifts, and salaries
              </p>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Receptionist
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name, email, or phone..."
              className="h-11 pl-11 pr-4 border-white/5 bg-[#121212] rounded-2xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-[#FF6B00]"
            />
          </div>

          {/* Table Container */}
          <div className="bg-[#121212]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 space-y-4">
                <div className="h-6 bg-white/5 animate-pulse rounded-lg w-1/3"></div>
                <div className="h-24 bg-white/5 animate-pulse rounded-xl w-full"></div>
              </div>
            ) : receptionists.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mx-auto">
                  <UserCheck size={24} />
                </div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">No Receptionists Found</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="border-b border-white/5 bg-white/5">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Phone</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Shift</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Salary</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase text-slate-400 tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receptionists.map((rec) => (
                    <TableRow key={rec.id} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell className="text-xs font-bold text-white py-4">
                        {rec.profile?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-300">{rec.email}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-400">{rec.profile?.phone || "N/A"}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-400 capitalize">
                        {rec.profile?.shift || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-[#FF6B00]">
                        {rec.profile?.salary ? `₹${rec.profile.salary.toLocaleString()}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          rec.is_active 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {rec.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(rec)}
                            className="w-8 h-8 rounded-lg bg-white/5 p-0 hover:bg-white/10 text-slate-400 hover:text-white"
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            onClick={() => handleDelete(rec.id)}
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

      <AddReceptionistModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchReceptionists}
      />

      <EditReceptionistModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedReceptionist(null);
        }}
        onSuccess={fetchReceptionists}
        receptionist={selectedReceptionist}
      />

      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
