import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, UserCheck, UserX, AlertTriangle, 
  UserPlus, Upload, MapPin, Phone, Mail, Award, Activity
} from "lucide-react";
import { memberService, Member } from "../../lib/memberService";
import { notify } from "../../lib/notify";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import Permission from "../common/Permission";
import StatCard from "./crud/StatCard";
import DataTable from "./crud/DataTable";
import ActionToolbar from "./crud/ActionToolbar";
import FilterBar from "./crud/FilterBar";
import CrudForm, { FormFieldConfig } from "./crud/CrudForm";
import AuditInfo from "./crud/AuditInfo";
import { BaseEmptyState } from "./crud/EmptyStates";
import { ArchiveConfirmDialog, RestoreConfirmDialog } from "./crud/CrudDialogs";

export default function MemberManagement() {
  // Members List State
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_members: 0,
    active_members: 0,
    inactive_members: 0,
    expired_memberships: 0
  });

  // Query Parameters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("joining_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filters State
  const [filters, setFilters] = useState<Record<string, any>>({
    status: "all",
    gender: "",
    plan_id: "",
    trainer_id: "",
    join_from: "",
    join_to: "",
    is_active: "",
    show_archived: false
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog Control
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  // Bulk dialog triggers
  const [isBulkTrainerOpen, setIsBulkTrainerOpen] = useState(false);
  const [isBulkPlanOpen, setIsBulkPlanOpen] = useState(false);
  const [bulkTrainerId, setBulkTrainerId] = useState("");
  const [bulkPlanId, setBulkPlanId] = useState("");

  // Options cache
  const [trainers, setTrainers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  // Import / Export State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Fetch Member Lists & Statistics
  const loadData = async () => {
    setLoading(true);
    try {
      // Map parameters
      const listParams = {
        page,
        per_page: perPage,
        search,
        status: filters.status,
        gender: filters.gender,
        plan_id: filters.plan_id,
        trainer_id: filters.trainer_id,
        join_from: filters.join_from,
        join_to: filters.join_to,
        is_active: filters.is_active === "" ? undefined : filters.is_active === "true",
        show_archived: filters.show_archived
      };

      const [listRes, statsRes] = await Promise.all([
        memberService.getMembers(listParams),
        memberService.getMemberStats()
      ]);

      setMembers(listRes.data || []);
      setTotalCount(listRes.total || 0);
      setStats(statsRes);
    } catch (err: any) {
      notify.error(err?.message || "Failed to load members catalog data");
    } finally {
      setLoading(false);
    }
  };

  // Load configuration options (trainers and plans list)
  const loadOptions = async () => {
    try {
      const [trainersList, plansList] = await Promise.all([
        memberService.getTrainers(),
        memberService.getPlans()
      ]);
      setTrainers(trainersList);
      setPlans(plansList);
    } catch (err: any) {
      console.error("Failed to load options:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, search, sortKey, sortDirection, filters]);

  useEffect(() => {
    loadOptions();
  }, []);

  // Columns definition mapping for DataTable
  const columns = useMemo(() => [
    {
      key: "avatar",
      header: "Avatar",
      render: (row: Member) => {
        const initials = row.profile.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <div className="w-8 h-8 rounded-full border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center text-[10px] font-black tracking-wider text-slate-400">
            {row.profile.avatar_url ? (
              <img src={row.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        );
      }
    },
    {
      key: "id",
      header: "Member ID",
      render: (row: Member) => (
        <span className="font-mono text-[10px] text-slate-500">{row.id.substring(0, 8)}...</span>
      )
    },
    {
      key: "full_name",
      header: "Full Name",
      sortable: true,
      render: (row: Member) => <span className="font-bold text-white">{row.profile.full_name}</span>
    },
    {
      key: "phone",
      header: "Phone",
      render: (row: Member) => <span className="text-slate-400">{row.profile.phone || "N/A"}</span>
    },
    {
      key: "email",
      header: "Email",
      render: (row: Member) => <span className="text-slate-400">{row.profile.email || "N/A"}</span>
    },
    {
      key: "plan",
      header: "Plan",
      render: (row: Member) => (
        <span className="text-slate-300 font-medium">
          {row.active_membership?.plan_name || "No Plan"}
        </span>
      )
    },
    {
      key: "trainer",
      header: "Trainer",
      render: (row: Member) => (
        <span className="text-slate-300 font-medium">
          {row.assigned_trainer?.full_name || "Unassigned"}
        </span>
      )
    },
    {
      key: "status",
      header: "Membership Status",
      render: (row: Member) => {
        const isActive = row.active_membership?.status === "active";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}>
            {row.active_membership?.status || "Inactive"}
          </span>
        );
      }
    },
    {
      key: "joining_date",
      header: "Join Date",
      sortable: true,
      render: (row: Member) => <span className="text-slate-400">{row.joining_date}</span>
    },
    {
      key: "last_visit",
      header: "Last Visit",
      render: (row: Member) => (
        <span className="text-slate-500 font-mono text-[10px]">
          {row.last_visit ? row.last_visit : "Never"}
        </span>
      )
    }
  ], []);

  // Form field configs
  const createFields: FormFieldConfig[] = useMemo(() => [
    { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Yash Pal" },
    { name: "email", label: "Email Address", type: "email", required: true, placeholder: "e.g. user@gmail.com" },
    { name: "phone", label: "Phone Number", type: "phone", required: true, placeholder: "9999988888" },
    { name: "date_of_birth", label: "Date of Birth", type: "date", placeholder: "YYYY-MM-DD" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" }
      ]
    },
    { name: "address", label: "Residential Address", type: "textarea", placeholder: "Full address details..." },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", placeholder: "Contact Person" },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "phone", placeholder: "Phone Number" },
    { name: "joining_date", label: "Gym Joining Date", type: "date", required: true },
    {
      name: "plan_id",
      label: "Assign Membership Plan (Disables Save if Empty)",
      type: "select",
      options: plans.map((p) => ({ label: `${p.name} - ₹${p.price}`, value: p.id })),
      required: true
    },
    {
      name: "trainer_id",
      label: "Assign Trainer (Optional)",
      type: "select",
      options: trainers.map((t) => ({ label: `${t.profile.full_name} (${t.specialization || "General"})`, value: t.id }))
    },
    { name: "notes", label: "General Administrative Notes", type: "textarea", placeholder: "Health risks, dietary notes..." }
  ], [plans, trainers]);

  const editFields: FormFieldConfig[] = useMemo(() => [
    { name: "full_name", label: "Full Name", type: "text", required: true },
    { name: "phone", label: "Phone Number", type: "phone", required: true },
    { name: "date_of_birth", label: "Date of Birth", type: "date" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" }
      ]
    },
    { name: "address", label: "Residential Address", type: "textarea" },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text" },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "phone" },
    {
      name: "plan_id",
      label: "Modify Membership Plan",
      type: "select",
      options: plans.map((p) => ({ label: `${p.name} - ₹${p.price}`, value: p.id }))
    },
    {
      name: "trainer_id",
      label: "Modify Trainer Assignment",
      type: "select",
      options: trainers.map((t) => ({ label: t.profile.full_name, value: t.id }))
    },
    { name: "notes", label: "General Notes", type: "textarea" }
  ], [plans, trainers]);

  // Actions row handlers
  const handleView = (member: Member) => {
    setActiveMember(member);
    setIsViewOpen(true);
  };

  const handleEdit = (member: Member) => {
    setActiveMember(member);
    setIsEditOpen(true);
  };

  const handleArchiveClick = (member: Member) => {
    setActiveMember(member);
    setIsArchiveOpen(true);
  };

  const handleRestoreClick = (member: Member) => {
    setActiveMember(member);
    setIsRestoreOpen(true);
  };

  // Submit handlings
  const onCreateSubmit = async (data: any) => {
    if (!data.plan_id) {
      notify.error("Membership Plan assignment is required to save new members.");
      return;
    }

    try {
      await memberService.createMember(data);
      notify.success("New member added successfully");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to create new member record");
    }
  };

  const onEditSubmit = async (data: any) => {
    if (!activeMember) return;
    try {
      await memberService.updateMember(activeMember.id, data);
      notify.success("Member record updated successfully");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to edit member profile");
    }
  };

  const onArchiveConfirm = async () => {
    if (!activeMember) return;
    try {
      await memberService.archiveMember(activeMember.id);
      notify.success("Member archived successfully");
      setIsArchiveOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to archive member account");
    }
  };

  const onRestoreConfirm = async () => {
    if (!activeMember) return;
    try {
      await memberService.restoreMember(activeMember.id);
      notify.success("Member restored successfully");
      setIsRestoreOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to restore member");
    }
  };

  // Bulk Operations Actions
  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    try {
      await memberService.bulkArchive(selectedIds);
      notify.success(`Archived ${selectedIds.length} members successfully`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to execute bulk archive");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      await memberService.bulkRestore(selectedIds);
      notify.success(`Restored ${selectedIds.length} members successfully`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to execute bulk restore");
    }
  };

  const handleBulkTrainer = async () => {
    if (!bulkTrainerId) return;
    try {
      await memberService.bulkAssignTrainer(selectedIds, bulkTrainerId);
      notify.success("Trainer assigned to selected members successfully");
      setIsBulkTrainerOpen(false);
      setBulkTrainerId("");
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk trainer allocation failed");
    }
  };

  const handleBulkPlan = async () => {
    if (!bulkPlanId) return;
    try {
      await memberService.bulkChangePlan(selectedIds, bulkPlanId);
      notify.success("Plan updated for selected members successfully");
      setIsBulkPlanOpen(false);
      setBulkPlanId("");
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk plan assignment failed");
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await memberService.bulkActivate(selectedIds);
      notify.success("Activated accounts of selected members");
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk activation failed");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await memberService.bulkDeactivate(selectedIds);
      notify.success("Deactivated accounts of selected members");
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk deactivation failed");
    }
  };

  // CSV Import handling
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      const previewRows: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < Math.min(6, lines.length); i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(",");
        const rowObj: any = {};
        headers.forEach((h, index) => {
          rowObj[h.trim()] = cols[index]?.trim();
        });
        
        // Simple validations
        if (!rowObj.full_name) errors.push(`Row ${i}: Name is required`);
        if (!rowObj.email) errors.push(`Row ${i}: Email is required`);

        previewRows.push(rowObj);
      }
      setImportPreview(previewRows);
      setImportErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (!csvFile || importErrors.length > 0) return;
    try {
      // Simulate bulk file upload to backend parser, or create items one by one
      // (For this blueprint, we parse the preview and upload objects sequentially to backend)
      for (const row of importPreview) {
        await memberService.createMember({
          full_name: row.full_name,
          email: row.email,
          phone: row.phone || "9999911111",
          joining_date: row.joining_date || new Date().toISOString().split("T")[0],
          plan_id: plans[0]?.id // Default first plan
        });
      }
      notify.success("Import complete successfully!");
      setIsImportOpen(false);
      setCsvFile(null);
      setImportPreview([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Error occurred during CSV upload parsing");
    }
  };

  // Excel/CSV Export
  const handleExport = (format: "csv" | "excel") => {
    if (members.length === 0) return;
    const headers = ["Member ID", "Full Name", "Phone", "Email", "Plan", "Trainer", "Joining Date", "Status"];
    const rows = members.map((m) => [
      m.id,
      m.profile.full_name,
      m.profile.phone || "N/A",
      m.profile.email || "N/A",
      m.active_membership?.plan_name || "N/A",
      m.assigned_trainer?.full_name || "N/A",
      m.joining_date,
      m.active_membership?.status || "inactive"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Member_Export_${new Date().toISOString().split("T")[0]}.${format === "csv" ? "csv" : "xlsx"}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success(`Exported members list as ${format.toUpperCase()}`);
  };

  // Row action context logic
  const rowActionsList = useMemo(() => {
    const list = [
      { label: "View Details", action: handleView },
      { label: "Edit Profile", action: handleEdit }
    ];

    if (filters.show_archived) {
      list.push({ label: "Restore Account", action: handleRestoreClick, className: "text-blue-500" });
    } else {
      list.push({ label: "Archive Member", action: handleArchiveClick, className: "text-red-500" });
    }

    return list;
  }, [filters.show_archived]);

  return (
    <div className="space-y-6 bg-[#090909] text-white p-6 min-h-screen">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">Members</h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage all gym members, memberships, and profile information.
          </p>
        </div>

        <Permission allowedRoles={["admin", "receptionist"]}>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsImportOpen(true)}
              variant="outline"
              className="h-10 px-4 rounded-xl border-white/5 bg-[#121212] hover:bg-[#171717] text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Upload size={14} />
              Import CSV
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="h-10 px-5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-xs font-black uppercase tracking-wider flex items-center gap-2"
            >
              <UserPlus size={14} />
              Add Member
            </Button>
          </div>
        </Permission>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Members" value={stats.total_members} icon={Users} color="#FF6B00" />
        <StatCard title="Active Members" value={stats.active_members} icon={UserCheck} color="#10B981" />
        <StatCard title="Inactive Members" value={stats.inactive_members} icon={UserX} color="#F59E0B" />
        <StatCard title="Expired Memberships" value={stats.expired_memberships} icon={AlertTriangle} color="#EF4444" />
      </div>

      {/* Query Filter and Actions */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <FilterBar
            filters={filters}
            onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
            filterOptions={{
              status: [
                { label: "Active Subs", value: "active" },
                { label: "Expired Subs", value: "expired" },
                { label: "All Members", value: "all" }
              ],
              gender: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" }
              ],
              plans: plans.map((p) => ({ label: p.name, value: p.id })),
              trainers: trainers.map((t) => ({ label: t.profile.full_name, value: t.id })),
              is_active: [
                { label: "Login Enabled", value: "true" },
                { label: "Login Disabled", value: "false" }
              ]
            }}
          />

          <ActionToolbar
            onSearch={setSearch}
            onExportCsv={() => handleExport("csv")}
            onExportExcel={() => handleExport("excel")}
          />
        </div>

        {/* Selected rows operations */}
        {selectedIds.length > 0 && (
          <div className="bg-[#171717] border border-white/5 p-3 rounded-2xl flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2">
            <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider pl-2">
              {selectedIds.length} Selected:
            </span>
            <Button
              onClick={() => setIsBulkTrainerOpen(true)}
              className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white"
            >
              Assign Trainer
            </Button>
            <Button
              onClick={() => setIsBulkPlanOpen(true)}
              className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white"
            >
              Change Plan
            </Button>
            <Button
              onClick={handleBulkActivate}
              className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-green-500"
            >
              Activate Login
            </Button>
            <Button
              onClick={handleBulkDeactivate}
              className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-yellow-500"
            >
              Deactivate Login
            </Button>
            <Permission allowedRoles={["admin"]}>
              {filters.show_archived ? (
                <Button
                  onClick={handleBulkRestore}
                  className="h-8 px-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-500"
                >
                  Restore Selected
                </Button>
              ) : (
                <Button
                  onClick={handleBulkArchive}
                  className="h-8 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-500"
                >
                  Archive Selected
                </Button>
              )}
            </Permission>
          </div>
        )}

        {/* Data list Table */}
        <DataTable
          data={members}
          columns={columns}
          loading={loading}
          page={page}
          perPage={perPage}
          totalCount={totalCount}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
          onSelectionChange={setSelectedIds}
          rowActions={rowActionsList}
          onRefresh={loadData}
          emptyState={
            <BaseEmptyState
              title="No Members Found"
              description="Verify your filter rules or search queries, or add a member record to start."
              actionLabel="Add Member"
              onAction={() => setIsCreateOpen(true)}
            />
          }
        />
      </div>

      {/* DIALOG 1: VIEW DETAILS */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          {activeMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div className="w-14 h-14 rounded-full border border-[#FF6B00]/20 bg-black/40 flex items-center justify-center text-lg font-black text-slate-400">
                  {activeMember.profile.avatar_url ? (
                    <img src={activeMember.profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    activeMember.profile.full_name[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-md font-black uppercase text-white">{activeMember.profile.full_name}</h3>
                  <span className="font-mono text-[9px] text-[#FF6B00] uppercase tracking-wider">
                    Member ID: {activeMember.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Personal */}
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1">
                    Personal Details
                  </h4>
                  <div className="text-xs space-y-1.5 font-semibold text-slate-300">
                    <p>Gender: <span className="text-white capitalize">{activeMember.profile.gender || "N/A"}</span></p>
                    <p>DOB: <span className="text-white">{activeMember.profile.date_of_birth || "N/A"}</span></p>
                    <p>Join Date: <span className="text-white">{activeMember.joining_date}</span></p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1">
                    Contact Information
                  </h4>
                  <div className="text-xs space-y-1.5 font-semibold text-slate-300">
                    <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-500" /> {activeMember.profile.email || "N/A"}</p>
                    <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-500" /> {activeMember.profile.phone || "N/A"}</p>
                    <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500" /> {activeMember.profile.address || "N/A"}</p>
                  </div>
                </div>

                {/* Emergency */}
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1">
                    Emergency Contact
                  </h4>
                  <div className="text-xs space-y-1.5 font-semibold text-slate-300">
                    <p>Name: <span className="text-white">{activeMember.profile.emergency_contact_name || "N/A"}</span></p>
                    <p>Phone: <span className="text-white">{activeMember.profile.emergency_contact_phone || "N/A"}</span></p>
                  </div>
                </div>

                {/* Membership plan */}
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1">
                    Membership Plan
                  </h4>
                  <div className="text-xs space-y-1.5 font-semibold text-slate-300">
                    <p>Plan Name: <span className="text-[#FF6B00]">{activeMember.active_membership?.plan_name || "No Plan"}</span></p>
                    <p>Duration: <span className="text-white">{activeMember.active_membership?.start_date} to {activeMember.active_membership?.end_date}</span></p>
                    <p>Days Remaining: <span className="text-white font-mono">{activeMember.active_membership?.days_remaining ?? 0} Days</span></p>
                  </div>
                </div>
              </div>

              {/* Assigned Trainer */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <Award size={12} className="text-[#FF6B00]" /> Assigned Fitness Coach
                </h4>
                {activeMember.assigned_trainer ? (
                  <div className="text-xs font-semibold text-slate-300 flex justify-between items-center">
                    <div>
                      <p className="text-white">{activeMember.assigned_trainer.full_name}</p>
                      <p className="text-[10px] text-slate-500">{activeMember.assigned_trainer.specialization || "General Training Specialist"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No trainer assigned to this member.</p>
                )}
              </div>

              {/* Member Event Timeline */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <Activity size={12} className="text-blue-500" /> Member Activity Timeline
                </h4>
                <div className="space-y-3 pl-2 border-l border-white/5 text-[11px] font-semibold text-slate-400">
                  <div className="relative pl-4">
                    <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                    <p className="text-white">Account Created & Initial Registration</p>
                    <span className="text-[9px] text-slate-600 font-mono">Join Date: {activeMember.joining_date}</span>
                  </div>
                  {activeMember.active_membership && (
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500" />
                      <p className="text-white">Plan Subscribed: {activeMember.active_membership.plan_name}</p>
                      <span className="text-[9px] text-slate-600 font-mono">Valid until {activeMember.active_membership.end_date}</span>
                    </div>
                  )}
                  {activeMember.last_visit && (
                    <div className="relative pl-4">
                      <div className="absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <p className="text-white">Most Recent Attendance Check-in</p>
                      <span className="text-[9px] text-slate-600 font-mono">{activeMember.last_visit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Meta logs */}
              <AuditInfo createdAt={activeMember.joining_date} createdBy="Staff" />

              <DialogFooter>
                <Button
                  onClick={() => setIsViewOpen(false)}
                  className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-white/10"
                >
                  Close View
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: CREATE MEMBER */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Add Gym Member</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Fill in all profile, account credentials, and membership assignment details.
            </DialogDescription>
          </DialogHeader>

          <CrudForm
            fields={createFields}
            onSubmit={onCreateSubmit}
            submitLabel="Create Member"
            defaultValues={{
              joining_date: new Date().toISOString().split("T")[0]
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: EDIT MEMBER */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Modify Member</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Update member profile parameters, emergency contact details, plan adjustments, or notes.
            </DialogDescription>
          </DialogHeader>

          {activeMember && (
            <CrudForm
              fields={editFields}
              onSubmit={onEditSubmit}
              submitLabel="Save Changes"
              defaultValues={{
                full_name: activeMember.profile.full_name,
                phone: activeMember.profile.phone,
                date_of_birth: activeMember.profile.date_of_birth,
                gender: activeMember.profile.gender,
                address: activeMember.profile.address,
                emergency_contact_name: activeMember.profile.emergency_contact_name,
                emergency_contact_phone: activeMember.profile.emergency_contact_phone,
                plan_id: activeMember.active_membership?.id,
                trainer_id: activeMember.assigned_trainer?.id,
                notes: activeMember.notes
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMS */}
      <ArchiveConfirmDialog
        isOpen={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        onConfirm={onArchiveConfirm}
        itemName={activeMember?.profile.full_name}
      />

      <RestoreConfirmDialog
        isOpen={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        onConfirm={onRestoreConfirm}
        itemName={activeMember?.profile.full_name}
      />

      {/* BULK ACTIONS PICKERS */}
      {/* 1. Bulk Trainer Allocation */}
      <Dialog open={isBulkTrainerOpen} onOpenChange={setIsBulkTrainerOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6 text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] mb-2">
              <Users size={24} />
            </div>
            <DialogTitle className="text-xs font-black uppercase tracking-wider">Allocate Coach</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              Select trainer to allocate to {selectedIds.length} members.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose Trainer</Label>
            <select
              value={bulkTrainerId}
              onChange={(e) => setBulkTrainerId(e.target.value)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">Select Trainer...</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.profile.full_name} ({t.specialization || "General"})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full mt-2">
            <Button
              type="button"
              onClick={() => setIsBulkTrainerOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkTrainer}
              disabled={!bulkTrainerId}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Bulk Plan Assignment */}
      <Dialog open={isBulkPlanOpen} onOpenChange={setIsBulkPlanOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6 text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] mb-2">
              <Award size={24} />
            </div>
            <DialogTitle className="text-xs font-black uppercase tracking-wider">Batch Plan Migration</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              Select membership plan to assign to {selectedIds.length} members.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose Plan</Label>
            <select
              value={bulkPlanId}
              onChange={(e) => setBulkPlanId(e.target.value)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">Select Plan...</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₹{p.price}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full mt-2">
            <Button
              type="button"
              onClick={() => setIsBulkPlanOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkPlan}
              disabled={!bulkPlanId}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40"
            >
              Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV IMPORT DIALOG */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">CSV Data Import</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Select CSV spreadsheet to import gym members records.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#FF6B00]/40 transition-colors">
              <Upload size={24} className="text-slate-500 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleCsvChange} className="hidden" id="csv-upload-input" />
              <label htmlFor="csv-upload-input" className="mt-2 text-[10px] text-slate-500 hover:text-white cursor-pointer font-bold border border-white/5 bg-[#171717] px-3 py-1.5 rounded-lg">
                Browse Files
              </label>
              {csvFile && <span className="text-xs text-green-500 font-bold mt-2">{csvFile.name}</span>}
            </div>

            {/* Error notifications */}
            {importErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-[10px] font-semibold text-red-500 space-y-1">
                <p className="font-bold">Errors Detected:</p>
                {importErrors.map((err, i) => <p key={i}>• {err}</p>)}
              </div>
            )}

            {/* CSV Preview */}
            {importPreview.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parsed Rows Preview</span>
                <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden text-[10px] font-mono text-slate-300">
                  <table className="w-full text-left">
                    <thead className="bg-[#171717] text-slate-500 border-b border-white/5">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-none">
                          <td className="p-2 truncate max-w-[120px]">{row.full_name}</td>
                          <td className="p-2 truncate max-w-[120px]">{row.email}</td>
                          <td className="p-2">{row.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => {
                setIsImportOpen(false);
                setCsvFile(null);
                setImportPreview([]);
              }}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImportSubmit}
              disabled={!csvFile || importErrors.length > 0}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40"
            >
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
