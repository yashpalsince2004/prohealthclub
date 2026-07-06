import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Users, UserCheck, UserX, AlertTriangle, 
  UserPlus, Upload, Download, MapPin, Phone, Mail, Award, Activity,
  Calendar, DollarSign, Clock, ShieldAlert, RefreshCw, Clipboard, Trash, Edit, Check, Eye, Sliders, Briefcase, GraduationCap
} from "lucide-react";
import { trainerService, TrainerCreatePayload, TrainerUpdatePayload } from "../../lib/trainerService";
import { notify } from "../../lib/notify";
import { api } from "../../lib/api";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { TrainerResponse, MemberResponse } from "../../lib/types";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";

export default function TrainerManagement() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Trainers List State
  const [trainers, setTrainers] = useState<TrainerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_trainers: 0,
    active_trainers: 0,
    inactive_trainers: 0,
    on_leave_trainers: 0,
    total_assigned_members: 0,
    average_rating: 4.8,
    capacity_utilization: 0
  });

  // Query Parameters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("joining_staff_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filters State
  const [filters, setFilters] = useState<Record<string, any>>({
    status: "all",
    shift: "",
    employment_type: "",
    specialization: "",
    experience_min: "",
    experience_max: "",
    show_archived: false
  });

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog Control
  const [activeTrainer, setActiveTrainer] = useState<TrainerResponse | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk dialog triggers
  const [isBulkShiftOpen, setIsBulkShiftOpen] = useState(false);
  const [bulkShiftVal, setBulkShiftVal] = useState("Morning");

  // Roster Allocation Modals
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState("");
  const [membersList, setMembersList] = useState<any[]>([]);

  // Load Trainer Lists & Statistics
  const loadData = async () => {
    setLoading(true);
    try {
      const listParams = {
        page,
        per_page: perPage,
        search,
        status: filters.status,
        shift: filters.shift,
        employment_type: filters.employment_type,
        specialization: filters.specialization,
        experience_min: filters.experience_min ? parseInt(filters.experience_min) : undefined,
        experience_max: filters.experience_max ? parseInt(filters.experience_max) : undefined,
        show_archived: filters.show_archived
      };

      const [listRes, statsRes, membersRes] = await Promise.all([
        trainerService.getTrainers(listParams),
        trainerService.getTrainerStats(),
        trainerService.getMembers()
      ]);

      setTrainers(listRes.data || []);
      setTotalCount(listRes.total || 0);
      setStats(statsRes);
      setMembersList(membersRes || []);
    } catch (err: any) {
      notify.error(err?.message || "Failed to load trainers directory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, search, sortKey, sortDirection, filters]);

  // Prevent Radix UI from locking body clickability after dialogs/sheets close
  useEffect(() => {
    const unlock = () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
    unlock();
    return unlock;
  }, [
    isViewOpen, isCreateOpen, isEditOpen, isArchiveOpen, isRestoreOpen,
    isBulkShiftOpen, isAssignMemberOpen
  ]);

  const specializationOptions = [
    { label: "Strength Training", value: "Strength Training" },
    { label: "Weight Loss", value: "Weight Loss" },
    { label: "Powerlifting", value: "Powerlifting" },
    { label: "Bodybuilding", value: "Bodybuilding" },
    { label: "CrossFit", value: "CrossFit" },
    { label: "HIIT", value: "HIIT" },
    { label: "Yoga", value: "Yoga" },
    { label: "Pilates", value: "Pilates" },
    { label: "Cardio", value: "Cardio" },
    { label: "Nutrition", value: "Nutrition" },
    { label: "Rehabilitation", value: "Rehabilitation" },
    { label: "Functional Training", value: "Functional Training" },
    { label: "Sports Conditioning", value: "Sports Conditioning" }
  ];

  const certificationOptions = [
    { label: "ACE Certified Personal Trainer", value: "ACE Certified" },
    { label: "NASM Certified Personal Trainer", value: "NASM CPT" },
    { label: "ISSA Certified Personal Trainer", value: "ISSA Certified" },
    { label: "CrossFit Level 1 Trainer", value: "CrossFit L1" },
    { label: "RYT 200 Yoga Teacher", value: "RYT 200" },
    { label: "RYT 500 Yoga Teacher", value: "RYT 500" },
    { label: "Precision Nutrition Level 1 Coach", value: "Pn1" },
    { label: "CSCS (Certified Strength & Conditioning Specialist)", value: "CSCS" }
  ];

  const shiftOptions = [
    { label: "Morning Shift", value: "Morning" },
    { label: "Evening Shift", value: "Evening" },
    { label: "Night Shift", value: "Night" },
    { label: "Flexible Schedule", value: "Flexible" }
  ];

  const employmentTypeOptions = [
    { label: "Full Time Staff", value: "Full Time" },
    { label: "Part Time Staff", value: "Part Time" },
    { label: "Contractual Coach", value: "Contract" }
  ];

  // Columns definition mapping for DataTable
  const columns = useMemo(() => [
    {
      key: "avatar",
      header: "Avatar",
      render: (row: TrainerResponse) => {
        const initials = (row.profile?.full_name || "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <div className="w-8 h-8 rounded-full border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center text-[10px] font-black tracking-wider text-slate-400">
            {row.profile?.avatar_url ? (
              <img src={row.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initials || "?"
            )}
          </div>
        );
      }
    },
    {
      key: "employee_id",
      header: "Employee ID",
      render: (row: TrainerResponse) => (
        <span className="font-mono text-[10px] text-slate-400">{row.employee_id || "N/A"}</span>
      )
    },
    {
      key: "full_name",
      header: "Trainer Name",
      sortable: true,
      render: (row: TrainerResponse) => <span className="font-bold text-white">{row.profile?.full_name || "N/A"}</span>
    },
    {
      key: "phone",
      header: "Phone",
      render: (row: TrainerResponse) => <span className="text-slate-400">{row.profile?.phone || "N/A"}</span>
    },
    {
      key: "email",
      header: "Email",
      render: (row: TrainerResponse) => <span className="text-slate-400 font-mono text-[10px]">{row.profile?.email || "N/A"}</span>
    },
    {
      key: "specialization",
      header: "Specialization",
      render: (row: TrainerResponse) => {
        const specs = row.specializations || (row.specialization ? [row.specialization] : []);
        return (
          <span className="text-slate-300 font-medium">
            {specs.length > 0 ? specs.slice(0, 2).join(", ") + (specs.length > 2 ? "..." : "") : "General"}
          </span>
        );
      }
    },
    {
      key: "roster",
      header: "Coaching Roster",
      render: (row: TrainerResponse) => (
        <span className="text-slate-300 font-bold font-mono">
          {row.assigned_member_count} / {row.max_members || 15}
        </span>
      )
    },
    {
      key: "experience",
      header: "Experience",
      render: (row: TrainerResponse) => (
        <span className="text-slate-400 font-mono text-xs">
          {row.experience_years ? `${row.experience_years} yrs` : "0 yrs"}
        </span>
      )
    },
    {
      key: "shift",
      header: "Shift Schedule",
      render: (row: TrainerResponse) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
          {row.shift || "Morning"}
        </span>
      )
    },
    {
      key: "status",
      header: "Trainer Status",
      render: (row: TrainerResponse) => {
        let text = "Active";
        let style = "bg-green-500/10 text-green-500 border border-green-500/20";
        
        if (row.is_active === false) {
          text = "Suspended";
          style = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
        }
        
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${style}`}>
            {text}
          </span>
        );
      }
    }
  ], []);

  // Form Field configs for Create/Edit forms
  const createFields: FormFieldConfig[] = useMemo(() => [
    { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "e.g. Yash Pal" },
    { name: "email", label: "Email Address", type: "email", required: true, placeholder: "e.g. coach@gmail.com" },
    { name: "phone", label: "Phone Number", type: "phone", required: true, placeholder: "9999988888" },
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
    { name: "address", label: "Residential Address", type: "textarea", placeholder: "Full address details..." },
    { name: "employee_id", label: "Employee ID", type: "text", required: true, placeholder: "e.g. EMP-101" },
    { name: "qualification", label: "Qualifications / Degrees", type: "text", placeholder: "e.g. B.Sc. Exercise Science" },
    { name: "bio", label: "Biography", type: "textarea", placeholder: "Core philosophy, training style details..." },
    {
      name: "specialization",
      label: "Primary Specialization",
      type: "select",
      options: specializationOptions,
      required: true
    },
    {
      name: "specializations",
      label: "Multi-Specialties (Hold Ctrl/Cmd to multi-select)",
      type: "multi-select",
      options: specializationOptions
    },
    { name: "experience_years", label: "Coaching Experience (Years)", type: "number", required: true, placeholder: "e.g. 5" },
    {
      name: "certifications",
      label: "Professional Certifications",
      type: "multi-select",
      options: certificationOptions
    },
    {
      name: "employment_type",
      label: "Employment Type",
      type: "select",
      options: employmentTypeOptions,
      required: true
    },
    {
      name: "salary_type",
      label: "Salary Type",
      type: "select",
      options: [
        { label: "Monthly Salary", value: "Monthly" },
        { label: "Hourly Rate", value: "Hourly" }
      ],
      required: true
    },
    { name: "salary", label: "Salary Rate", type: "currency", required: true, placeholder: "e.g. 45000" },
    {
      name: "shift",
      label: "Assigned Shift",
      type: "select",
      options: shiftOptions,
      required: true
    },
    { name: "max_members", label: "Max Coached Members Capacity", type: "number", required: true, placeholder: "e.g. 15" },
    {
      name: "working_days",
      label: "Working Days",
      type: "multi-select",
      options: [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" }
      ]
    },
    { name: "working_hours", label: "Working Hours Range", type: "text", placeholder: "e.g. 06:00 - 14:00" },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text" },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "phone" },
    { name: "emergency_relation", label: "Emergency Contact Relation", type: "text" },
    { name: "joining_staff_date", label: "Joining Staff Date", type: "date", required: true },
    { name: "password", label: "Login Password", type: "password", required: true, placeholder: "Min 8 characters..." }
  ], []);

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
    { name: "employee_id", label: "Employee ID", type: "text", required: true },
    { name: "qualification", label: "Qualifications", type: "text" },
    { name: "bio", label: "Biography", type: "textarea" },
    {
      name: "specialization",
      label: "Primary Specialization",
      type: "select",
      options: specializationOptions,
      required: true
    },
    {
      name: "specializations",
      label: "Multi-Specialties",
      type: "multi-select",
      options: specializationOptions
    },
    { name: "experience_years", label: "Coaching Experience (Years)", type: "number", required: true },
    {
      name: "certifications",
      label: "Professional Certifications",
      type: "multi-select",
      options: certificationOptions
    },
    {
      name: "employment_type",
      label: "Employment Type",
      type: "select",
      options: employmentTypeOptions,
      required: true
    },
    {
      name: "salary_type",
      label: "Salary Type",
      type: "select",
      options: [
        { label: "Monthly Salary", value: "Monthly" },
        { label: "Hourly Rate", value: "Hourly" }
      ],
      required: true
    },
    { name: "salary", label: "Salary Rate", type: "currency", required: true },
    {
      name: "shift",
      label: "Assigned Shift",
      type: "select",
      options: shiftOptions,
      required: true
    },
    { name: "max_members", label: "Max Coached Members Capacity", type: "number", required: true },
    {
      name: "working_days",
      label: "Working Days",
      type: "multi-select",
      options: [
        { label: "Monday", value: "Monday" },
        { label: "Tuesday", value: "Tuesday" },
        { label: "Wednesday", value: "Wednesday" },
        { label: "Thursday", value: "Thursday" },
        { label: "Friday", value: "Friday" },
        { label: "Saturday", value: "Saturday" },
        { label: "Sunday", value: "Sunday" }
      ]
    },
    { name: "working_hours", label: "Working Hours Range", type: "text" },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text" },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "phone" },
    { name: "emergency_relation", label: "Emergency Contact Relation", type: "text" },
    { name: "joining_staff_date", label: "Joining Staff Date", type: "date", required: true }
  ], []);

  const filterConfigs = useMemo(() => [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "All Staff", value: "all" }
      ]
    },
    {
      key: "shift",
      label: "Shift",
      options: shiftOptions
    },
    {
      key: "employment_type",
      label: "Employment",
      options: employmentTypeOptions
    },
    {
      key: "specialization",
      label: "Specialty",
      options: specializationOptions
    }
  ], []);

  // Row Action Handlers
  const handleView = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setIsViewOpen(true);
  };

  const handleEdit = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setIsEditOpen(true);
  };

  const handleArchiveClick = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setIsArchiveOpen(true);
  };

  const handleRestoreClick = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setIsRestoreOpen(true);
  };

  // Submit Operations
  const onCreateSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const payload: TrainerCreatePayload = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        address: data.address || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_relation: data.emergency_relation || null,
        employee_id: data.employee_id || null,
        specialization: data.specialization || null,
        specializations: data.specializations || [],
        experience_years: data.experience_years ? parseInt(data.experience_years) : null,
        qualification: data.qualification || null,
        certifications: data.certifications || [],
        bio: data.bio || null,
        employment_type: data.employment_type || "Full Time",
        salary: data.salary ? parseFloat(data.salary) : null,
        salary_type: data.salary_type || "Monthly",
        shift: data.shift || "Morning",
        joining_staff_date: data.joining_staff_date || null,
        max_members: data.max_members ? parseInt(data.max_members) : 15,
        working_days: data.working_days || [],
        working_hours: data.working_hours || null
      };

      await trainerService.createTrainer(payload);
      notify.success("Trainer profile created successfully.");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to create trainer profile");
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: any) => {
    if (!activeTrainer) return;
    setSubmitting(true);
    try {
      const payload: TrainerUpdatePayload = {
        full_name: data.full_name,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        address: data.address || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_relation: data.emergency_relation || null,
        employee_id: data.employee_id || null,
        specialization: data.specialization || null,
        specializations: data.specializations || [],
        experience_years: data.experience_years ? parseInt(data.experience_years) : null,
        qualification: data.qualification || null,
        certifications: data.certifications || [],
        bio: data.bio || null,
        employment_type: data.employment_type,
        salary: data.salary ? parseFloat(data.salary) : null,
        salary_type: data.salary_type,
        shift: data.shift,
        joining_staff_date: data.joining_staff_date,
        max_members: data.max_members ? parseInt(data.max_members) : undefined,
        working_days: data.working_days,
        working_hours: data.working_hours
      };

      await trainerService.updateTrainer(activeTrainer.id, payload);
      notify.success("Trainer profile details updated successfully.");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to update trainer profile parameters");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!activeTrainer) return;
    setSubmitting(true);
    try {
      await trainerService.archiveTrainer(activeTrainer.id);
      notify.success("Trainer archived (soft-deleted) successfully.");
      setIsArchiveOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to archive trainer profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!activeTrainer) return;
    setSubmitting(true);
    try {
      await trainerService.restoreTrainer(activeTrainer.id);
      notify.success("Trainer restored successfully.");
      setIsRestoreOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to restore trainer profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Actions
  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    try {
      await trainerService.bulkArchive(selectedIds);
      notify.success(`Archived ${selectedIds.length} trainers.`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk archive operation failed");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    try {
      await trainerService.bulkRestore(selectedIds);
      notify.success(`Restored ${selectedIds.length} trainers.`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk restore operation failed");
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await trainerService.bulkActivate(selectedIds);
      notify.success(`Activated ${selectedIds.length} trainer accounts.`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk activation failed");
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await trainerService.bulkDeactivate(selectedIds);
      notify.success(`Suspended ${selectedIds.length} trainer accounts.`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk suspension failed");
    }
  };

  const handleBulkShiftSubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      await trainerService.bulkChangeShift(selectedIds, bulkShiftVal);
      notify.success(`Assigned shift "${bulkShiftVal}" to ${selectedIds.length} trainers.`);
      setIsBulkShiftOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk shift update failed");
    }
  };

  // Single Trainer Quick Actions inside Drawer
  const handleToggleActiveState = async () => {
    if (!activeTrainer) return;
    try {
      await trainerService.updateTrainer(activeTrainer.id, { is_active: !activeTrainer.is_active });
      notify.success(activeTrainer.is_active ? "Trainer account suspended." : "Trainer account activated.");
      // Refresh sheet detail
      const updated = await trainerService.getTrainerById(activeTrainer.id);
      setActiveTrainer(updated);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to toggle portal access state");
    }
  };

  // Member Assignment
  const handleAssignMemberSubmit = async () => {
    if (!activeTrainer || !assignMemberId) return;
    try {
      await trainerService.assignMember(activeTrainer.id, assignMemberId);
      notify.success("Member successfully assigned to coach roster.");
      setIsAssignMemberOpen(false);
      setAssignMemberId("");
      const updated = await trainerService.getTrainerById(activeTrainer.id);
      setActiveTrainer(updated);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to assign member to trainer roster");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeTrainer) return;
    try {
      await trainerService.unassignMember(activeTrainer.id, memberId);
      notify.success("Member successfully removed from coach roster.");
      const updated = await trainerService.getTrainerById(activeTrainer.id);
      setActiveTrainer(updated);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to unassign member from roster");
    }
  };

  // CSV Export Functionality
  const handleExport = (idsToExport?: string[]) => {
    const list = idsToExport 
      ? trainers.filter((t) => idsToExport.includes(t.id)) 
      : trainers;

    if (list.length === 0) {
      notify.error("No trainer records available to export");
      return;
    }

    const headers = ["Employee ID", "Full Name", "Email", "Phone", "Specialization", "Experience", "Salary", "Salary Type", "Shift", "Status"];
    const rows = list.map((t) => [
      t.employee_id || "",
      t.profile?.full_name || "",
      t.profile?.email || "",
      t.profile?.phone || "",
      t.specialization || "",
      t.experience_years ? `${t.experience_years} years` : "0",
      t.salary || "",
      t.salary_type || "",
      t.shift || "",
      t.is_active ? "Active" : "Suspended"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trainers_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success(`Exported ${list.length} records successfully.`);
  };

  const rowActionsList = useMemo(() => {
    const list: {
      label: string;
      action: (trainer: TrainerResponse) => void;
      className?: string;
    }[] = [
      { label: "View Profile", action: handleView }
    ];

    if (filters.show_archived) {
      list.push({ label: "Restore Account", action: handleRestoreClick, className: "text-blue-500" });
    } else {
      list.push({ label: "Edit Parameters", action: handleEdit });
      list.push({ label: "Archive Trainer", action: handleArchiveClick, className: "text-red-500" });
    }

    return list;
  }, [filters.show_archived]);

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
          width: "100%"
        }}
      >
        <Navbar />

        <main className="flex-1 min-h-0 space-y-6 pt-4">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Trainer & Staff Management
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Configure professional gym instructors, payrolls, shifts and roster capacities
              </p>
            </div>
            
            <Permission allowedRoles={["admin"]}>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
              >
                <UserPlus size={16} />
                Register Trainer
              </Button>
            </Permission>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Trainers" value={stats.total_trainers} icon={Users} color="#FF6B00" />
            <StatCard title="Active Coaches" value={stats.active_trainers} icon={UserCheck} color="#10B981" />
            <StatCard title="Suspended Roster" value={stats.inactive_trainers} icon={UserX} color="#F59E0B" />
            <StatCard title="Coached Clients" value={stats.total_assigned_members} icon={Activity} color="#EF4444" />
          </div>

          {/* Table Container */}
          <div className="bg-[#121212]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            {/* Filter Bar & Export */}
            <div className="space-y-4 p-4">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <div className="flex-1 w-full">
                  <FilterBar
                    searchQuery={search}
                    onSearchChange={setSearch}
                    filters={filterConfigs}
                    filterValues={filters}
                    onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
                    onClearFilters={() => setFilters({
                      status: "all",
                      shift: "",
                      employment_type: "",
                      specialization: "",
                      experience_min: "",
                      experience_max: "",
                      show_archived: false
                    })}
                  />
                </div>
                <Button
                  onClick={() => handleExport()}
                  variant="outline"
                  className="h-11 rounded-2xl border-white/5 bg-[#121212] hover:bg-[#171717] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-4 shadow-lg w-full md:w-auto shrink-0"
                >
                  <Download size={14} />
                  Export CSV
                </Button>
              </div>

              {/* Selected rows operations */}
              {selectedIds.length > 0 && (
                <div className="bg-[#171717] border border-white/5 p-3 rounded-2xl flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 mx-4">
                  <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider pl-2">
                    {selectedIds.length} Selected:
                  </span>
                  <Button
                    onClick={() => setIsBulkShiftOpen(true)}
                    className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white"
                  >
                    Change Shift
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
                    Suspend Login
                  </Button>
                  {filters.show_archived ? (
                    <Button
                      onClick={handleBulkRestore}
                      className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-blue-500"
                    >
                      Restore Selected
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBulkArchive}
                      className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-red-500"
                    >
                      Archive Selected
                    </Button>
                  )}
                  <Button
                    onClick={() => handleExport(selectedIds)}
                    className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white ml-auto"
                  >
                    Export Selected
                  </Button>
                </div>
              )}

              {/* DataTable */}
              <DataTable
                data={trainers}
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
                    title="No Trainers Found"
                    description="Verify your filter rules or search queries, or register a trainer to start."
                    actionLabel="Register Trainer"
                    onAction={() => setIsCreateOpen(true)}
                  />
                }
              />
            </div>
          </div>
        </main>
      </div>

      {/* DIALOG 1: VIEW DETAILS SHEET */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-xl bg-[#0e0e0e] border-l border-white/5 text-white p-6 overflow-y-auto">
          {activeTrainer && (
            <div className="space-y-6">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center text-lg font-black text-[#FF6B00]">
                    {activeTrainer.profile?.avatar_url ? (
                      <img src={activeTrainer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      activeTrainer.profile?.full_name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <SheetTitle className="text-base font-black text-white">{activeTrainer.profile?.full_name}</SheetTitle>
                    <SheetDescription className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {activeTrainer.employee_id || "No Employee ID"} • {activeTrainer.employment_type || "Full Time"}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <Activity size={10} className="text-[#FF6B00]" /> Primary Specialty
                  </span>
                  <span className="text-xs font-bold text-white block">{activeTrainer.specialization || "General Coaching"}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <Briefcase size={10} className="text-[#FF6B00]" /> Roster Capacity
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {activeTrainer.assigned_member_count} / {activeTrainer.max_members || 15} clients
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <Clock size={10} className="text-[#FF6B00]" /> Shift & Hours
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {activeTrainer.shift || "Morning"} ({activeTrainer.working_hours || "Flexible"})
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <DollarSign size={10} className="text-[#FF6B00]" /> Salary Rate
                  </span>
                  <span className="text-xs font-bold text-white block">
                    ₹{activeTrainer.salary?.toLocaleString() || "0"} / {activeTrainer.salary_type || "Monthly"}
                  </span>
                </div>
              </div>

              {/* Bio & Details tabs */}
              <div className="space-y-4 text-left">
                <div className="space-y-1.5 border-b border-white/5 pb-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <GraduationCap size={12} className="text-slate-500" /> Qualifications & Biography
                  </h4>
                  <p className="text-xs font-medium text-slate-300 leading-relaxed">{activeTrainer.qualification || "No formal degrees listed."}</p>
                  <p className="text-xs text-slate-400 leading-relaxed italic mt-2">"{activeTrainer.bio || "No biography provided."}"</p>
                </div>

                <div className="space-y-1.5 border-b border-white/5 pb-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                    <Award size={12} className="text-slate-500" /> Certifications & Credentials
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeTrainer.certifications?.length > 0 ? (
                      activeTrainer.certifications.map((c, i) => (
                        <span key={i} className="inline-flex items-center bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No certifications listed.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-b border-white/5 pb-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <Users size={12} className="text-slate-500" /> Coached Clients ({activeTrainer.assigned_member_count})
                    </h4>
                    <Permission allowedRoles={["admin", "receptionist"]}>
                      <Button
                        size="sm"
                        onClick={() => setIsAssignMemberOpen(true)}
                        className="h-7 rounded-lg bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 border border-[#FF6B00]/20 text-[#FF6B00] font-bold text-[9px] uppercase tracking-wider px-2.5"
                      >
                        Assign Member
                      </Button>
                    </Permission>
                  </div>
                  
                  <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                    {activeTrainer.assigned_members && activeTrainer.assigned_members.length > 0 ? (
                      activeTrainer.assigned_members.map((m) => (
                        <div key={m.id} className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-white block">{m.profile?.full_name}</span>
                            <span className="text-[9px] text-slate-500 font-medium">{m.profile?.phone || "No phone"}</span>
                          </div>
                          <Permission allowedRoles={["admin", "receptionist"]}>
                            <Button
                              size="sm"
                              onClick={() => handleRemoveMember(m.id)}
                              className="h-6 w-6 p-0 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center"
                            >
                              <Trash size={10} />
                            </Button>
                          </Permission>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic block py-2">No active coached members allocated.</span>
                    )}
                  </div>
                </div>

                {/* Audit and Quick Action triggers */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Quick Admin Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Permission allowedRoles={["admin"]}>
                      <Button
                        onClick={() => {
                          setIsViewOpen(false);
                          setIsEditOpen(true);
                        }}
                        className="h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-wider px-3"
                      >
                        Edit Profile
                      </Button>
                      <Button
                        onClick={handleToggleActiveState}
                        className="h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-wider px-3"
                      >
                        {activeTrainer.is_active ? "Suspend Portal" : "Activate Portal"}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsViewOpen(false);
                          setIsArchiveOpen(true);
                        }}
                        className="h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold text-[10px] uppercase tracking-wider px-3"
                      >
                        Archive Trainer
                      </Button>
                    </Permission>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* DIALOG 2: CREATE TRAINER */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Register Gym Trainer</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Fill in all personal, professional, payroll, and shift assignment details.
            </DialogDescription>
          </DialogHeader>

          <CrudForm
            fields={createFields}
            onSubmit={onCreateSubmit}
            submitLabel="Register Trainer"
            loading={submitting}
            defaultValues={{
              joining_staff_date: new Date().toISOString().split("T")[0],
              employment_type: "Full Time",
              salary_type: "Monthly",
              shift: "Morning",
              max_members: 15
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: EDIT TRAINER */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Modify Trainer Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Update personal information, emergency contacts, qualifications, salary parameters, or shift configurations.
            </DialogDescription>
          </DialogHeader>

          {activeTrainer && (
            <CrudForm
              fields={editFields}
              onSubmit={onEditSubmit}
              submitLabel="Save Changes"
              loading={submitting}
              defaultValues={{
                full_name: activeTrainer.profile?.full_name || "",
                phone: activeTrainer.profile?.phone || "",
                date_of_birth: activeTrainer.profile?.date_of_birth || "",
                gender: activeTrainer.profile?.gender || "",
                address: activeTrainer.profile?.address || "",
                employee_id: activeTrainer.employee_id || "",
                qualification: activeTrainer.qualification || "",
                bio: activeTrainer.bio || "",
                specialization: activeTrainer.specialization || "",
                specializations: activeTrainer.specializations || [],
                experience_years: activeTrainer.experience_years || 0,
                certifications: activeTrainer.certifications || [],
                employment_type: activeTrainer.employment_type || "Full Time",
                salary_type: activeTrainer.salary_type || "Monthly",
                salary: activeTrainer.salary || 0,
                shift: activeTrainer.shift || "Morning",
                max_members: activeTrainer.max_members || 15,
                working_days: activeTrainer.working_days || [],
                working_hours: activeTrainer.working_hours || "",
                emergency_contact_name: activeTrainer.profile?.emergency_contact_name || "",
                emergency_contact_phone: activeTrainer.profile?.emergency_contact_phone || "",
                emergency_relation: activeTrainer.profile?.emergency_relation || "",
                joining_staff_date: activeTrainer.joining_staff_date || ""
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: CONFIRM ARCHIVE */}
      <ArchiveConfirmDialog
        isOpen={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        onConfirm={handleConfirmArchive}
        loading={submitting}
        itemName={activeTrainer?.profile?.full_name}
      />

      {/* DIALOG 5: CONFIRM RESTORE */}
      <RestoreConfirmDialog
        isOpen={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        onConfirm={handleConfirmRestore}
        loading={submitting}
        itemName={activeTrainer?.profile?.full_name}
      />

      {/* DIALOG 6: BULK CHANGE SHIFT */}
      <Dialog open={isBulkShiftOpen} onOpenChange={setIsBulkShiftOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-[#FF6B00]" /> Bulk Shift Re-Assignment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Batch allocate selected trainers to a new work schedule shift.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select New Shift</Label>
            <select
              value={bulkShiftVal}
              onChange={(e) => setBulkShiftVal(e.target.value)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
            >
              {shiftOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsBulkShiftOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkShiftSubmit}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Apply Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 7: ROSTER CLIENT ALLOCATION */}
      <Dialog open={isAssignMemberOpen} onOpenChange={setIsAssignMemberOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-[#FF6B00]" /> Client Allocation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Assign a gym member to this trainer's coached clients roster.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Gym Member</Label>
            <select
              value={assignMemberId}
              onChange={(e) => setAssignMemberId(e.target.value)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="">Choose member...</option>
              {membersList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.profile?.full_name} ({m.profile?.phone || "No phone"})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsAssignMemberOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignMemberSubmit}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Allocate Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
