import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Users, UserCheck, UserX, AlertTriangle, 
  UserPlus, Upload, Download, MapPin, Phone, Mail, Award, Activity,
  Calendar, DollarSign, Clock, ShieldAlert, RefreshCw, Clipboard, Trash, Edit, Check, Eye, Sliders, Briefcase, GraduationCap,
  Star, ChevronLeft, ChevronRight, X, Printer, Plus, Minus, ArrowLeftRight, CheckCircle2, AlertCircle, Lock, ShieldCheck, Key, Search
} from "lucide-react";
import { receptionistService } from "../../lib/receptionistService";
import { notify } from "../../lib/notify";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import Permission from "../common/Permission";
import StatCard from "./crud/StatCard";
import DataTable from "./crud/DataTable";
import ActionToolbar from "./crud/ActionToolbar";
import FilterBar from "./crud/FilterBar";
import CrudForm, { FormFieldConfig } from "./crud/CrudForm";
import AuditInfo from "./crud/AuditInfo";
import { BaseEmptyState } from "./crud/EmptyStates";
import { ArchiveConfirmDialog, RestoreConfirmDialog } from "./crud/CrudDialogs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "../ui/sheet";
import { ReceptionistResponse } from "../../lib/types";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { useAuth } from "../../hooks/useAuth";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES & HELPER FUNCTIONS FOR EXTRA FIELDS (SERIALIZATION INTO Profile.medical_notes)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExpandedReceptionistNotes {
  employee_id: string;
  blood_group?: string;
  nationality?: string;
  employment_type?: string;
  working_days?: string[];
  working_hours?: string;
  salary_type?: string;
  department?: string;
  designation?: string;
  mfa_enabled?: boolean;
  notes?: string;
  aadhaar?: string;
  pan?: string;
  bank_details?: {
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
  };
  salary_account?: string;
  upi_id?: string;
  permissions?: string[];
  attendance_pct?: number;
}

const parseReceptionistNotes = (notesStr: string | null): ExpandedReceptionistNotes => {
  if (!notesStr) return { employee_id: "" };
  try {
    const trimmed = notesStr.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return {
        employee_id: "",
        blood_group: "",
        nationality: "",
        employment_type: "Full Time",
        working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        working_hours: "09:00 - 17:00",
        salary_type: "Monthly",
        department: "Front Desk",
        designation: "Receptionist Officer",
        mfa_enabled: false,
        notes: "",
        aadhaar: "",
        pan: "",
        bank_details: { account_number: "", ifsc_code: "", bank_name: "" },
        salary_account: "",
        upi_id: "",
        permissions: ["member_crud", "trainer_read", "pricing_read"],
        attendance_pct: 95,
        ...JSON.parse(trimmed)
      };
    }
  } catch (e) {
    // Treat as legacy text
  }
  return { employee_id: "REC-" + Math.floor(1000 + Math.random() * 9000), notes: notesStr };
};

const serializeReceptionistNotes = (data: ExpandedReceptionistNotes): string => {
  return JSON.stringify(data);
};

// ─────────────────────────────────────────────────────────────────────────────
// RECEPTIONIST ATTENDANCE, LEAVES, PAYSLIPS, AND LOGS IN LOCALSTORAGE
// ─────────────────────────────────────────────────────────────────────────────

export interface ReceptionistAttendance {
  id: string;
  receptionist_id: string;
  date: string;
  check_in: string;
  check_out?: string;
  status: "Present" | "Absent" | "Late" | "Early Leave" | "Half Day" | "Leave";
  working_hours?: number;
  notes?: string;
}

export interface ReceptionistLeave {
  id: string;
  receptionist_id: string;
  receptionist_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  attachment?: string;
  applied_on: string;
}

export interface ReceptionistPayslip {
  id: string;
  receptionist_id: string;
  month: string;
  basic_salary: number;
  allowance: number;
  bonus: number;
  deduction: number;
  pf: number;
  esic: number;
  net_salary: number;
  generated_at: string;
}

export interface ReceptionistLog {
  id: string;
  receptionist_id: string;
  action: string;
  timestamp: string;
  byName: string;
  details?: string;
}

const getReceptionistAttendance = (): ReceptionistAttendance[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_receptionist_attendance");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveReceptionistAttendance = (list: ReceptionistAttendance[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_receptionist_attendance", JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

const getReceptionistLeaves = (): ReceptionistLeave[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_receptionist_leaves");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveReceptionistLeaves = (list: ReceptionistLeave[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_receptionist_leaves", JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

const getReceptionistPayslips = (): ReceptionistPayslip[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_receptionist_payslips");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveReceptionistPayslips = (list: ReceptionistPayslip[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_receptionist_payslips", JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

const getReceptionistLogs = (): ReceptionistLog[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_receptionist_logs");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveReceptionistLogs = (list: ReceptionistLog[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_receptionist_logs", JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const shiftOptions = [
  { label: "Morning Shift (06:00 - 14:00)", value: "morning" },
  { label: "Evening Shift (14:00 - 22:00)", value: "evening" },
  { label: "Full Day (09:00 - 18:00)", value: "full-day" },
  { label: "Split Shift (07:00-11:00, 17:00-21:00)", value: "split" }
];

const employmentTypeOptions = [
  { label: "Full Time Staff", value: "Full Time" },
  { label: "Part Time Staff", value: "Part Time" },
  { label: "Contractual Staff", value: "Contract" }
];

const permissionOptions = [
  { label: "Member CRUD", value: "member_crud" },
  { label: "Trainer Read", value: "trainer_read" },
  { label: "Payment Management", value: "payment" },
  { label: "Inventory Management", value: "inventory" },
  { label: "Reports & Charts", value: "reports" },
  { label: "Pricing configuration", value: "pricing" },
  { label: "Attendance Control", value: "attendance" },
  { label: "Settings Access", value: "settings" }
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODULE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ReceptionistManagement() {
  const { user } = useAuth(["admin"]);
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // List & stats states
  const [receptionists, setReceptionists] = useState<ReceptionistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_receptionists: 0,
    active_receptionists: 0,
    inactive_receptionists: 0,
    on_leave_receptionists: 0,
    today_attendance: 0,
    pending_leave_requests: 0,
    average_rating: 4.9,
    monthly_salary_cost: 0
  });

  // Query parameters state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [filters, setFilters] = useState<Record<string, any>>({
    status: "active",
    shift: "",
    employment_type: "",
    show_archived: false
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog Controls
  const [activeReceptionist, setActiveReceptionist] = useState<ReceptionistResponse | null>(null);
  const [activeNotes, setActiveNotes] = useState<ExpandedReceptionistNotes>({ employee_id: "" });
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Advanced Operations Modals
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isBulkShiftOpen, setIsBulkShiftOpen] = useState(false);
  const [bulkShiftVal, setBulkShiftVal] = useState("morning");

  // Attendance Form states
  const [attTimeIn, setAttTimeIn] = useState("09:00");
  const [attTimeOut, setAttTimeOut] = useState("17:00");
  const [attStatus, setAttStatus] = useState<"Present" | "Absent" | "Late" | "Early Leave" | "Half Day" | "Leave">("Present");
  const [attNotes, setAttNotes] = useState("");

  // Leave Form states
  const [leaveStart, setLeaveStart] = useState(todayStr);
  const [leaveEnd, setLeaveEnd] = useState(todayStr);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveAttachment, setLeaveAttachment] = useState("");

  // Salary Form states
  const [salBasic, setSalBasic] = useState("25000");
  const [salAllowance, setSalAllowance] = useState("2000");
  const [salBonus, setSalBonus] = useState("0");
  const [salDeduction, setSalDeduction] = useState("0");
  const [salPF, setSalPF] = useState("1800");
  const [salESIC, setSalESIC] = useState("250");

  // Stepper state for Add Receptionist Form
  const [createStep, setCreateStep] = useState(1);
  const [createFormValues, setCreateFormValues] = useState<Record<string, any>>({
    full_name: "",
    email: "",
    phone: "",
    gender: "male",
    date_of_birth: "",
    address: "",
    blood_group: "",
    nationality: "Indian",
    employee_id: "",
    joining_staff_date: todayStr,
    employment_type: "Full Time",
    shift: "morning",
    working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    working_hours: "09:00 - 17:00",
    salary: "25000",
    salary_type: "Monthly",
    department: "Front Desk",
    designation: "Front Desk Officer",
    password: "",
    confirmPassword: "",
    permissions: ["member_crud", "trainer_read", "pricing_read"],
    portal_enabled: true,
    mfa_enabled: false,
    notes: "",
    aadhaar: "",
    pan: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    salary_account: "",
    upi_id: ""
  });

  const [drawerTab, setDrawerTab] = useState<
    "overview" | "personal" | "employment" | "salary" | "attendance" | "leave" | "documents" | "permissions" | "logs"
  >("overview");

  // Generate unique employee ID helper
  useEffect(() => {
    if (isCreateOpen && !createFormValues.employee_id) {
      setCreateFormValues(prev => ({
        ...prev,
        employee_id: "REC-" + Math.floor(100000 + Math.random() * 900000)
      }));
    }
  }, [isCreateOpen]);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const kpis = await receptionistService.getReceptionistStats();
      
      // 2. Fetch Directory List
      const response = await receptionistService.getReceptionists({
        page,
        per_page: perPage,
        search: search || undefined,
        is_active: filters.status === "active" ? true : filters.status === "suspended" ? false : undefined,
        show_archived: filters.show_archived
      });

      setReceptionists(response.data || []);
      setTotalCount(response.total || 0);

      // 3. Sync stats with LocalStorage leaves/attendance
      const leaves = getReceptionistLeaves();
      const attendance = getReceptionistAttendance();
      const pendingLeaves = leaves.filter(l => l.status === "pending").length;
      const todayAtt = attendance.filter(a => a.date === todayStr && a.status === "Present").length;
      const onLeaveCount = attendance.filter(a => a.date === todayStr && a.status === "Leave").length;

      setStats({
        total_receptionists: kpis.total_receptionists || 0,
        active_receptionists: kpis.active_receptionists || 0,
        inactive_receptionists: kpis.inactive_receptionists || 0,
        on_leave_receptionists: onLeaveCount,
        today_attendance: todayAtt,
        pending_leave_requests: pendingLeaves,
        average_rating: 4.9,
        monthly_salary_cost: kpis.monthly_salary_cost || 0
      });
    } catch (e: any) {
      notify.error(e.message || "Failed to load receptionist data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, search, filters]);

  // Active Receptionist note parsing
  useEffect(() => {
    if (activeReceptionist) {
      setActiveNotes(parseReceptionistNotes(activeReceptionist.profile?.medical_notes));
    }
  }, [activeReceptionist]);

  // Columns visibility toggles config
  const columns = useMemo(() => [
    {
      key: "avatar",
      header: "Avatar",
      render: (row: ReceptionistResponse) => {
        const initials = (row.profile?.full_name || "")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        return (
          <div className="w-8 h-8 rounded-full border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center text-[10px] font-black tracking-wider text-slate-400">
            {row.profile?.avatar_url ? (
              <img src={row.profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
      render: (row: ReceptionistResponse) => {
        const extra = parseReceptionistNotes(row.profile?.medical_notes);
        return <span className="font-mono text-[10px] text-slate-400">{extra.employee_id || "N/A"}</span>;
      }
    },
    {
      key: "full_name",
      header: "Full Name",
      sortable: true,
      render: (row: ReceptionistResponse) => <span className="font-bold text-white">{row.profile?.full_name || "N/A"}</span>
    },
    {
      key: "email",
      header: "Email",
      defaultHidden: true,
      render: (row: ReceptionistResponse) => <span className="text-slate-400 font-mono text-[10px]">{row.email}</span>
    },
    {
      key: "phone",
      header: "Phone",
      render: (row: ReceptionistResponse) => <span className="text-slate-400">{row.profile?.phone || "N/A"}</span>
    },
    {
      key: "gender",
      header: "Gender",
      defaultHidden: true,
      render: (row: ReceptionistResponse) => <span className="text-slate-400 capitalize">{row.profile?.gender || "N/A"}</span>
    },
    {
      key: "shift",
      header: "Shift",
      render: (row: ReceptionistResponse) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
          {row.profile?.shift || "Morning"}
        </span>
      )
    },
    {
      key: "employment_type",
      header: "Employment Type",
      defaultHidden: true,
      render: (row: ReceptionistResponse) => {
        const extra = parseReceptionistNotes(row.profile?.medical_notes);
        return <span className="text-slate-300">{extra.employment_type || "Full Time"}</span>;
      }
    },
    {
      key: "joining_date",
      header: "Joining Date",
      defaultHidden: true,
      render: (row: ReceptionistResponse) => <span className="text-slate-400 font-mono text-xs">{row.profile?.joining_staff_date || "N/A"}</span>
    },
    {
      key: "attendance_pct",
      header: "Attendance %",
      render: (row: ReceptionistResponse) => {
        const extra = parseReceptionistNotes(row.profile?.medical_notes);
        return <span className="text-green-500 font-bold font-mono text-xs">{extra.attendance_pct || 100}%</span>;
      }
    },
    {
      key: "salary",
      header: "Salary",
      render: (row: ReceptionistResponse) => (
        <span className="text-[#FF6B00] font-black font-mono">
          {row.profile?.salary ? `₹${Number(row.profile.salary).toLocaleString("en-IN")}` : "N/A"}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: ReceptionistResponse) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
          row.is_active ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        }`}>
          {row.is_active ? "Active" : "Suspended"}
        </span>
      )
    },
    {
      key: "portal_access",
      header: "Portal Access",
      defaultHidden: true,
      render: (row: ReceptionistResponse) => (
        <span className="text-slate-400 text-xs">
          {row.is_active ? "Enabled" : "Disabled"}
        </span>
      )
    },
    {
      key: "last_login",
      header: "Last Login",
      defaultHidden: true,
      render: (row: ReceptionistResponse) => (
        <span className="text-slate-500 font-mono text-[10px]">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : "Never"}
        </span>
      )
    }
  ], []);

  const filterConfigs = useMemo(() => [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "All Staff", value: "all" }
      ]
    },
    { key: "shift", label: "Shift", options: shiftOptions },
    { key: "employment_type", label: "Employment", options: employmentTypeOptions }
  ], []);

  // Row Action Handlers
  const handleView = (receptionist: ReceptionistResponse) => {
    setActiveReceptionist(receptionist);
    setDrawerTab("overview");
    setIsViewOpen(true);
  };

  const handleEdit = (receptionist: ReceptionistResponse) => {
    setActiveReceptionist(receptionist);
    setIsEditOpen(true);
  };

  const handleArchiveClick = (receptionist: ReceptionistResponse) => {
    setActiveReceptionist(receptionist);
    // Deletion validations
    if (receptionist.email === "receptionist@prrohealth.com" || receptionist.email === "admin@prrohealth.com") {
      notify.error("Cannot archive default system administrator or receptionist.");
      return;
    }
    const attendance = getReceptionistAttendance();
    const activeShift = attendance.some(a => a.receptionist_id === receptionist.id && a.date === todayStr && !a.check_out);
    if (activeShift) {
      notify.error("Cannot archive receptionist while they have an active shift clocked in.");
      return;
    }
    setIsArchiveOpen(true);
  };

  const handleRestoreClick = (receptionist: ReceptionistResponse) => {
    setActiveReceptionist(receptionist);
    setIsRestoreOpen(true);
  };

  // Submit operations
  const handleCreateSubmit = async () => {
    // Basic validation
    if (!createFormValues.full_name || !createFormValues.email || !createFormValues.password) {
      notify.error("Please fill all required credentials step-by-step.");
      return;
    }
    if (createFormValues.password !== createFormValues.confirmPassword) {
      notify.error("Passwords do not match.");
      return;
    }

    // Email/Phone unique validation
    const emailTaken = receptionists.some(r => r.email.toLowerCase() === createFormValues.email.toLowerCase());
    if (emailTaken) {
      notify.error("A receptionist with this email is already registered.");
      return;
    }

    setSubmitting(true);
    try {
      const extraNotesObj: ExpandedReceptionistNotes = {
        employee_id: createFormValues.employee_id,
        blood_group: createFormValues.blood_group,
        nationality: createFormValues.nationality,
        employment_type: createFormValues.employment_type,
        working_days: createFormValues.working_days,
        working_hours: createFormValues.working_hours,
        salary_type: createFormValues.salary_type,
        department: createFormValues.department,
        designation: createFormValues.designation,
        mfa_enabled: createFormValues.mfa_enabled,
        notes: createFormValues.notes,
        aadhaar: createFormValues.aadhaar,
        pan: createFormValues.pan,
        bank_details: {
          account_number: createFormValues.account_number,
          ifsc_code: createFormValues.ifsc_code,
          bank_name: createFormValues.bank_name
        },
        salary_account: createFormValues.salary_account,
        upi_id: createFormValues.upi_id,
        permissions: createFormValues.permissions,
        attendance_pct: 100
      };

      const payload = {
        email: createFormValues.email,
        password: createFormValues.password,
        full_name: createFormValues.full_name,
        phone: createFormValues.phone || null,
        gender: createFormValues.gender || null,
        address: createFormValues.address || null,
        date_of_birth: createFormValues.date_of_birth || null,
        salary: createFormValues.salary ? parseFloat(createFormValues.salary) : null,
        shift: createFormValues.shift || null,
        joining_staff_date: createFormValues.joining_staff_date,
        medical_notes: serializeReceptionistNotes(extraNotesObj)
      };

      await receptionistService.createReceptionist(payload);
      notify.success("Receptionist account successfully created.");
      setIsCreateOpen(false);
      
      // Seed audit log
      const logs = getReceptionistLogs();
      saveReceptionistLogs([
        {
          id: Math.random().toString(),
          receptionist_id: createFormValues.employee_id,
          action: "Account Created",
          timestamp: new Date().toLocaleString(),
          byName: user?.profile?.full_name || "Admin",
          details: `Role assigned: Receptionist Officer, Shift: ${createFormValues.shift}`
        },
        ...logs
      ]);

      // Reset form
      setCreateStep(1);
      setCreateFormValues({
        full_name: "",
        email: "",
        phone: "",
        gender: "male",
        date_of_birth: "",
        address: "",
        blood_group: "",
        nationality: "Indian",
        employee_id: "",
        joining_staff_date: todayStr,
        employment_type: "Full Time",
        shift: "morning",
        working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        working_hours: "09:00 - 17:00",
        salary: "25000",
        salary_type: "Monthly",
        department: "Front Desk",
        designation: "Front Desk Officer",
        password: "",
        confirmPassword: "",
        permissions: ["member_crud", "trainer_read", "pricing_read"],
        portal_enabled: true,
        mfa_enabled: false,
        notes: "",
        aadhaar: "",
        pan: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        salary_account: "",
        upi_id: ""
      });
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Failed to create receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: Record<string, any>) => {
    if (!activeReceptionist) return;
    setSubmitting(true);
    try {
      const extraNotesObj: ExpandedReceptionistNotes = {
        ...activeNotes,
        employee_id: values.employee_id,
        employment_type: values.employment_type,
        working_hours: values.working_hours,
        salary_type: values.salary_type,
        department: values.department,
        designation: values.designation,
        notes: values.notes,
        permissions: values.permissions,
        aadhaar: values.aadhaar,
        pan: values.pan,
        salary_account: values.salary_account,
        upi_id: values.upi_id
      };

      const payload = {
        full_name: values.full_name,
        phone: values.phone,
        gender: values.gender,
        address: values.address,
        salary: values.salary ? parseFloat(values.salary) : null,
        shift: values.shift,
        medical_notes: serializeReceptionistNotes(extraNotesObj)
      };

      await receptionistService.updateReceptionist(activeReceptionist.id, payload);
      notify.success("Receptionist profile updated successfully.");
      setIsEditOpen(false);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Failed to update receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!activeReceptionist) return;
    setSubmitting(true);
    try {
      await receptionistService.archiveReceptionist(activeReceptionist.id);
      notify.success("Receptionist account archived successfully.");
      setIsArchiveOpen(false);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Failed to archive receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!activeReceptionist) return;
    setSubmitting(true);
    try {
      await receptionistService.restoreReceptionist(activeReceptionist.id);
      notify.success("Receptionist account restored successfully.");
      setIsRestoreOpen(false);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Failed to restore receptionist");
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Actions
  const handleBulkArchive = async () => {
    try {
      await receptionistService.bulkArchive(selectedIds);
      notify.success(`Archived ${selectedIds.length} receptionist accounts.`);
      setSelectedIds([]);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Bulk archiving failed.");
    }
  };

  const handleBulkRestore = async () => {
    try {
      await receptionistService.bulkRestore(selectedIds);
      notify.success(`Restored ${selectedIds.length} receptionist accounts.`);
      setSelectedIds([]);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Bulk restoring failed.");
    }
  };

  const handleBulkActivate = async () => {
    try {
      await receptionistService.bulkActivate(selectedIds);
      notify.success(`Portal access enabled for ${selectedIds.length} accounts.`);
      setSelectedIds([]);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Bulk activation failed.");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      await receptionistService.bulkDeactivate(selectedIds);
      notify.success(`Portal access disabled for ${selectedIds.length} accounts.`);
      setSelectedIds([]);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Bulk deactivation failed.");
    }
  };

  const handleBulkShiftSubmit = async () => {
    try {
      await receptionistService.bulkChangeShift(selectedIds, bulkShiftVal);
      notify.success(`Assigned shift "${bulkShiftVal}" to ${selectedIds.length} receptionists.`);
      setIsBulkShiftOpen(false);
      setSelectedIds([]);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Bulk shift assign failed.");
    }
  };

  const handleExport = (idsToExport = selectedIds) => {
    const list = idsToExport.length > 0 
      ? receptionists.filter((r) => idsToExport.includes(r.id)) 
      : receptionists;
    
    if (list.length === 0) {
      notify.error("No receptionist records available to export.");
      return;
    }

    const headers = ["Employee ID", "Full Name", "Email", "Phone", "Shift", "Salary", "Status"];
    const rows = list.map((r) => {
      const extra = parseReceptionistNotes(r.profile?.medical_notes);
      return [
        extra.employee_id || "N/A",
        r.profile?.full_name || "Unknown",
        r.email,
        r.profile?.phone || "N/A",
        r.profile?.shift || "Morning",
        r.profile?.salary || 0,
        r.is_active ? "Active" : "Suspended"
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Receptionist_Staff_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify.success("CSV file exported successfully.");
  };

  // Attendance Check-in / Out Actions
  const handleAttendanceSubmit = () => {
    if (!activeReceptionist) return;
    const records = getReceptionistAttendance();
    const newRecord: ReceptionistAttendance = {
      id: Math.random().toString(),
      receptionist_id: activeReceptionist.id,
      date: todayStr,
      check_in: attTimeIn,
      check_out: attStatus === "Present" ? attTimeOut : undefined,
      status: attStatus,
      working_hours: attStatus === "Present" ? 8 : 0,
      notes: attNotes
    };

    saveReceptionistAttendance([newRecord, ...records]);
    notify.success("Attendance entry recorded successfully.");
    setIsAttendanceOpen(false);
    loadData();
  };

  // Leave Submit Actions
  const handleLeaveSubmit = () => {
    if (!activeReceptionist) return;
    const leaves = getReceptionistLeaves();
    const newLeave: ReceptionistLeave = {
      id: Math.random().toString(),
      receptionist_id: activeReceptionist.id,
      receptionist_name: activeReceptionist.profile?.full_name || "Receptionist",
      start_date: leaveStart,
      end_date: leaveEnd,
      reason: leaveReason,
      status: "pending",
      attachment: leaveAttachment || undefined,
      applied_on: new Date().toLocaleDateString()
    };

    saveReceptionistLeaves([newLeave, ...leaves]);
    notify.success("Leave request submitted successfully.");
    setIsLeaveOpen(false);
    loadData();
  };

  const handleApproveLeave = (leaveId: string) => {
    const leaves = getReceptionistLeaves();
    const updated = leaves.map(l => l.id === leaveId ? { ...l, status: "approved" as const } : l);
    saveReceptionistLeaves(updated);
    notify.success("Leave request approved.");
    loadData();
  };

  const handleRejectLeave = (leaveId: string) => {
    const leaves = getReceptionistLeaves();
    const updated = leaves.map(l => l.id === leaveId ? { ...l, status: "rejected" as const } : l);
    saveReceptionistLeaves(updated);
    notify.error("Leave request rejected.");
    loadData();
  };

  // Payslip generation
  const handleGeneratePayslip = () => {
    if (!activeReceptionist) return;
    const slips = getReceptionistPayslips();
    const basic = Number(salBasic);
    const allowance = Number(salAllowance);
    const bonus = Number(salBonus);
    const deduction = Number(salDeduction);
    const pf = Number(salPF);
    const esic = Number(salESIC);
    const net = (basic + allowance + bonus) - (deduction + pf + esic);

    const newPayslip: ReceptionistPayslip = {
      id: Math.random().toString(),
      receptionist_id: activeReceptionist.id,
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      basic_salary: basic,
      allowance,
      bonus,
      deduction,
      pf,
      esic,
      net_salary: net,
      generated_at: new Date().toLocaleString()
    };

    saveReceptionistPayslips([newPayslip, ...slips]);
    notify.success(`Payslip generated successfully. Net salary: ₹${net}`);
    setIsSalaryOpen(false);
  };

  // Tool actions config
  const rowActionsList = useMemo(() => [
    { label: "View Profile Info", action: handleView },
    { label: "Modify Profile Details", action: handleEdit },
    { label: "Track Attendance", action: (row: ReceptionistResponse) => { setActiveReceptionist(row); setIsAttendanceOpen(true); } },
    { label: "Apply Leave Request", action: (row: ReceptionistResponse) => { setActiveReceptionist(row); setIsLeaveOpen(true); } },
    { label: "Salary Payroll Payout", action: (row: ReceptionistResponse) => { setActiveReceptionist(row); setIsSalaryOpen(true); } },
    { label: "Archive Account", action: handleArchiveClick, className: "text-red-500 font-medium" }
  ], [receptionists]);

  // Local filtered statistics
  const currentAttendanceRecords = useMemo(() => {
    if (!activeReceptionist) return [];
    return getReceptionistAttendance().filter(a => a.receptionist_id === activeReceptionist.id);
  }, [activeReceptionist, isAttendanceOpen]);

  const currentLeaveRecords = useMemo(() => {
    if (!activeReceptionist) return [];
    return getReceptionistLeaves().filter(l => l.receptionist_id === activeReceptionist.id);
  }, [activeReceptionist, isLeaveOpen]);

  const currentPayslips = useMemo(() => {
    if (!activeReceptionist) return [];
    return getReceptionistPayslips().filter(p => p.receptionist_id === activeReceptionist.id);
  }, [activeReceptionist, isSalaryOpen]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
        <StatCard title="Total Receptionists" value={stats.total_receptionists} comparisonText={`${stats.active_receptionists} Active accounts`} icon={Users} color="#3b82f6" />
        <StatCard title="Today Attendance" value={stats.today_attendance} comparisonText={`${stats.on_leave_receptionists} On Leave`} icon={CheckCircle2} color="#22c55e" />
        <StatCard title="Pending Leave Requests" value={stats.pending_leave_requests} comparisonText="Requires Admin review" icon={Clock} color="#f59e0b" />
        <StatCard title="Monthly Payroll Cost" value={`₹${stats.monthly_salary_cost.toLocaleString("en-IN")}`} comparisonText="Total active payroll" icon={DollarSign} color="#FF6B00" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-white">Receptionists Directory</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Manage front desk credentials, access permissions, work shifts, and salary details
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
        >
          <Plus size={16} /> Register Receptionist
        </Button>
      </div>

      {/* Filter and Bulk Action Toolbar */}
      <div className="bg-[#121212]/40 border border-white/5 p-4 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <FilterBar
              searchQuery={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by name, phone, email or employee ID..."
              filters={filterConfigs}
              filterValues={filters}
              onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
              onClearFilters={() => setFilters({ status: "active", shift: "", employment_type: "", show_archived: false })}
            />
          </div>
          <Button
            onClick={() => handleExport()}
            className="h-10 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-3 self-end md:self-auto"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>

        {/* Selected rows operations */}
        {selectedIds.length > 0 && (
          <div className="bg-[#171717] border border-white/5 p-3 rounded-2xl flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 mx-2">
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
              Enable Portal
            </Button>
            <Button
              onClick={handleBulkDeactivate}
              className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-yellow-500"
            >
              Suspend Portal
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
          data={receptionists}
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
              title="No Receptionists Found"
              description="Verify your filter parameters or search term, or register front desk staff."
              actionLabel="Register Receptionist"
              onAction={() => setIsCreateOpen(true)}
            />
          }
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: ADD RECEPTIONIST STEPPER FORM
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-white/5 pb-4">
            <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="text-[#FF6B00]" size={18} /> Register Front Desk Receptionist
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Complete profile parameters, credentials, and bank records step-by-step
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Indicators */}
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            {[
              { step: 1, label: "Personal" },
              { step: 2, label: "Employment" },
              { step: 3, label: "Portal Access" },
              { step: 4, label: "Administrative" }
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  createStep === s.step 
                    ? "bg-[#FF6B00] text-white" 
                    : createStep > s.step 
                      ? "bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30" 
                      : "bg-black/40 border border-white/5 text-slate-500"
                }`}>
                  {createStep > s.step ? "✓" : s.step}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  createStep === s.step ? "text-[#FF6B00]" : "text-slate-500"
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="py-6 space-y-4 text-left">
            {createStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</Label>
                  <Input 
                    value={createFormValues.full_name} 
                    onChange={(e) => setCreateFormValues({...createFormValues, full_name: e.target.value})}
                    placeholder="e.g. Priyal Sharma"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</Label>
                  <Input 
                    type="email"
                    value={createFormValues.email} 
                    onChange={(e) => setCreateFormValues({...createFormValues, email: e.target.value})}
                    placeholder="priyal@prohealth.com"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</Label>
                  <Input 
                    value={createFormValues.phone} 
                    onChange={(e) => setCreateFormValues({...createFormValues, phone: e.target.value})}
                    placeholder="9998887776"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</Label>
                  <select 
                    value={createFormValues.gender}
                    onChange={(e) => setCreateFormValues({...createFormValues, gender: e.target.value})}
                    className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</Label>
                  <Input 
                    type="date"
                    value={createFormValues.date_of_birth} 
                    onChange={(e) => setCreateFormValues({...createFormValues, date_of_birth: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</Label>
                  <Input 
                    value={createFormValues.blood_group} 
                    onChange={(e) => setCreateFormValues({...createFormValues, blood_group: e.target.value})}
                    placeholder="e.g. B+"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residential Address</Label>
                  <Textarea 
                    value={createFormValues.address} 
                    onChange={(e) => setCreateFormValues({...createFormValues, address: e.target.value})}
                    placeholder="Residential address"
                    className="border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee ID *</Label>
                  <Input 
                    value={createFormValues.employee_id} 
                    onChange={(e) => setCreateFormValues({...createFormValues, employee_id: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joining Date</Label>
                  <Input 
                    type="date"
                    value={createFormValues.joining_staff_date} 
                    onChange={(e) => setCreateFormValues({...createFormValues, joining_staff_date: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment Type</Label>
                  <select 
                    value={createFormValues.employment_type}
                    onChange={(e) => setCreateFormValues({...createFormValues, employment_type: e.target.value})}
                    className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift</Label>
                  <select 
                    value={createFormValues.shift}
                    onChange={(e) => setCreateFormValues({...createFormValues, shift: e.target.value})}
                    className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                  >
                    <option value="morning">Morning Shift</option>
                    <option value="evening">Evening Shift</option>
                    <option value="full-day">Full Day</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Salary (₹) *</Label>
                  <Input 
                    type="number"
                    value={createFormValues.salary} 
                    onChange={(e) => setCreateFormValues({...createFormValues, salary: e.target.value})}
                    placeholder="25000"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</Label>
                  <Input 
                    value={createFormValues.department} 
                    onChange={(e) => setCreateFormValues({...createFormValues, department: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</Label>
                  <Input 
                    value={createFormValues.designation} 
                    onChange={(e) => setCreateFormValues({...createFormValues, designation: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            {createStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Portal Username (Email)</Label>
                  <Input 
                    disabled
                    value={createFormValues.email} 
                    className="h-10 border-white/5 bg-[#171717] rounded-xl text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password *</Label>
                  <Input 
                    type="password"
                    value={createFormValues.password} 
                    onChange={(e) => setCreateFormValues({...createFormValues, password: e.target.value})}
                    placeholder="Min 8 characters"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password *</Label>
                  <Input 
                    type="password"
                    value={createFormValues.confirmPassword} 
                    onChange={(e) => setCreateFormValues({...createFormValues, confirmPassword: e.target.value})}
                    placeholder="Repeat password"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded-2xl border border-white/5">
                    {permissionOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createFormValues.permissions.includes(opt.value)}
                          onChange={(e) => {
                            const nextPerms = e.target.checked 
                              ? [...createFormValues.permissions, opt.value] 
                              : createFormValues.permissions.filter((p: string) => p !== opt.value);
                            setCreateFormValues({ ...createFormValues, permissions: nextPerms });
                          }}
                          className="accent-[#FF6B00]"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {createStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aadhaar Card Number</Label>
                  <Input 
                    value={createFormValues.aadhaar} 
                    onChange={(e) => setCreateFormValues({...createFormValues, aadhaar: e.target.value})}
                    placeholder="12-digit UID"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Card Number</Label>
                  <Input 
                    value={createFormValues.pan} 
                    onChange={(e) => setCreateFormValues({...createFormValues, pan: e.target.value})}
                    placeholder="e.g. ABCDE1234F"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</Label>
                  <Input 
                    value={createFormValues.bank_name} 
                    onChange={(e) => setCreateFormValues({...createFormValues, bank_name: e.target.value})}
                    placeholder="SBI, HDFC, ICICI"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</Label>
                  <Input 
                    value={createFormValues.account_number} 
                    onChange={(e) => setCreateFormValues({...createFormValues, account_number: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI ID</Label>
                  <Input 
                    value={createFormValues.upi_id} 
                    onChange={(e) => setCreateFormValues({...createFormValues, upi_id: e.target.value})}
                    placeholder="username@okaxis"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administrative Notes</Label>
                  <Textarea 
                    value={createFormValues.notes} 
                    onChange={(e) => setCreateFormValues({...createFormValues, notes: e.target.value})}
                    placeholder="Any internal operational notes..."
                    className="border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-white/5 pt-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (createStep === 1) setIsCreateOpen(false);
                else setCreateStep(createStep - 1);
              }}
              className="h-10 border-white/5 bg-[#171717] hover:bg-white/5 text-slate-300 rounded-xl text-xs font-black uppercase"
            >
              {createStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (createStep === 4) handleCreateSubmit();
                else setCreateStep(createStep + 1);
              }}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase"
            >
              {submitting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {createStep === 4 ? "Register Staff" : "Next Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: EDIT RECEPTIONIST PROFILE
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Modify Receptionist Parameters</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update personal details, shift configurations, salary payouts, and settings.
            </DialogDescription>
          </DialogHeader>

          {activeReceptionist && (
            <CrudForm
              fields={[
                { name: "full_name", label: "Full Name", type: "text", required: true },
                { name: "phone", label: "Phone Number", type: "phone", required: true },
                { name: "gender", label: "Gender", type: "select", options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }] },
                { name: "address", label: "Residential Address", type: "textarea" },
                { name: "employee_id", label: "Employee ID", type: "text", required: true },
                { name: "employment_type", label: "Employment Type", type: "select", options: employmentTypeOptions, required: true },
                { name: "salary_type", label: "Salary Payment Period", type: "select", options: [{ label: "Monthly", value: "Monthly" }, { label: "Hourly", value: "Hourly" }], required: true },
                { name: "salary", label: "Monthly Salary (₹)", type: "currency", required: true },
                { name: "shift", label: "Shift Schedule", type: "select", options: shiftOptions, required: true },
                { name: "working_hours", label: "Working Hours Range", type: "text" },
                { name: "department", label: "Department Branch", type: "text" },
                { name: "designation", label: "Designation Title", type: "text" },
                { name: "aadhaar", label: "Aadhaar Card", type: "text" },
                { name: "pan", label: "PAN Card", type: "text" },
                { name: "salary_account", label: "Bank Salary Account", type: "text" },
                { name: "upi_id", label: "UPI ID Address", type: "text" },
                { name: "permissions", label: "Portal Permissions", type: "multi-select", options: permissionOptions },
                { name: "notes", label: "Administrative Notes", type: "textarea" }
              ]}
              onSubmit={handleEditSubmit}
              submitLabel="Save Changes"
              loading={submitting}
              defaultValues={{
                full_name: activeReceptionist.profile?.full_name || "",
                phone: activeReceptionist.profile?.phone || "",
                gender: activeReceptionist.profile?.gender || "",
                address: activeReceptionist.profile?.address || "",
                employee_id: activeNotes.employee_id || "",
                employment_type: activeNotes.employment_type || "Full Time",
                salary_type: activeNotes.salary_type || "Monthly",
                salary: activeReceptionist.profile?.salary || 0,
                shift: activeReceptionist.profile?.shift || "morning",
                working_hours: activeNotes.working_hours || "09:00 - 17:00",
                department: activeNotes.department || "Front Desk",
                designation: activeNotes.designation || "Front Desk Officer",
                aadhaar: activeNotes.aadhaar || "",
                pan: activeNotes.pan || "",
                salary_account: activeNotes.salary_account || "",
                upi_id: activeNotes.upi_id || "",
                permissions: activeNotes.permissions || [],
                notes: activeNotes.notes || ""
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SHEET: PROFILE VIEW DETAILS DRAWER
      ───────────────────────────────────────────────────────────────────────────── */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-2xl bg-[#090909] border-l border-white/5 text-white p-6 overflow-y-auto h-full flex flex-col justify-between">
          <SheetHeader className="text-left border-b border-white/5 pb-4">
            <div className="flex justify-between items-start">
              <SheetTitle className="text-white flex items-center gap-2">
                <UserCheck className="text-[#FF6B00]" /> Staff Profile Drawer
              </SheetTitle>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-8 rounded-lg border-white/5 bg-[#121212] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"
              >
                <Printer size={12} /> Print Profile
              </Button>
            </div>
            <SheetDescription className="text-slate-400">
              Employee ID: <span className="font-mono text-white">{activeNotes.employee_id || "N/A"}</span>
            </SheetDescription>
          </SheetHeader>

          {activeReceptionist && (
            <div className="flex-1 my-6 space-y-6">
              {/* Header profile cards */}
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-14 h-14 rounded-full bg-black/40 border border-white/10 flex items-center justify-center font-black text-[#FF6B00] text-lg">
                  {activeReceptionist.profile?.avatar_url ? (
                    <img src={activeReceptionist.profile.avatar_url} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    activeReceptionist.profile?.full_name?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{activeReceptionist.profile?.full_name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">{activeNotes.designation || "Staff Officer"}</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{activeReceptionist.email}</div>
                </div>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex flex-wrap gap-1 border-b border-white/5 pb-2">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "personal", label: "Personal" },
                  { id: "employment", label: "Employment" },
                  { id: "salary", label: "Salary & Pay" },
                  { id: "permissions", label: "Permissions" },
                  { id: "attendance", label: "Attendance" },
                  { id: "leave", label: "Leaves" },
                  { id: "documents", label: "Docs" },
                  { id: "logs", label: "Activity Logs" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id as any)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      drawerTab === t.id ? "bg-[#FF6B00] text-white" : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="space-y-4 text-left">
                {drawerTab === "overview" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Attendance Rate</div>
                      <div className="text-lg font-black text-green-500 mt-1">{activeNotes.attendance_pct || 100}%</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Shift</div>
                      <div className="text-xs font-black text-white mt-1 capitalize">{activeReceptionist.profile?.shift || "Morning"}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Salary Rate</div>
                      <div className="text-xs font-black text-[#FF6B00] mt-1">₹{Number(activeReceptionist.profile?.salary || 0).toLocaleString("en-IN")}/mo</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</div>
                      <div className="text-xs font-black text-white mt-1">{activeNotes.department || "Front Desk"}</div>
                    </div>
                  </div>
                )}

                {drawerTab === "personal" && (
                  <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-500">Gender:</span> <span className="capitalize font-medium text-white">{activeReceptionist.profile?.gender || "N/A"}</span></div>
                      <div><span className="text-slate-500">DOB:</span> <span className="font-mono text-white">{activeReceptionist.profile?.date_of_birth || "N/A"}</span></div>
                      <div><span className="text-slate-500">Phone:</span> <span className="text-white">{activeReceptionist.profile?.phone || "N/A"}</span></div>
                      <div><span className="text-slate-500">Blood Group:</span> <span className="text-white font-mono">{activeNotes.blood_group || "N/A"}</span></div>
                      <div><span className="text-slate-500">Nationality:</span> <span className="text-white">{activeNotes.nationality || "Indian"}</span></div>
                    </div>
                    <div className="border-t border-white/5 pt-2 text-xs">
                      <span className="text-slate-500 block mb-1">Residential Address:</span>
                      <span className="text-slate-300 font-medium">{activeReceptionist.profile?.address || "No address provided."}</span>
                    </div>
                  </div>
                )}

                {drawerTab === "employment" && (
                  <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">Employee ID:</span> <span className="font-mono text-white">{activeNotes.employee_id}</span></div>
                      <div><span className="text-slate-500">Joining Date:</span> <span className="font-mono text-white">{activeReceptionist.profile?.joining_staff_date}</span></div>
                      <div><span className="text-slate-500">Employment Type:</span> <span className="text-white font-medium">{activeNotes.employment_type || "Full Time"}</span></div>
                      <div><span className="text-slate-500">Shift Schedule:</span> <span className="text-white font-medium capitalize">{activeReceptionist.profile?.shift}</span></div>
                      <div><span className="text-slate-500">Hours Range:</span> <span className="text-white font-mono">{activeNotes.working_hours || "09:00 - 17:00"}</span></div>
                      <div><span className="text-slate-500">Department:</span> <span className="text-white font-medium">{activeNotes.department}</span></div>
                      <div><span className="text-slate-500">Designation:</span> <span className="text-white font-medium">{activeNotes.designation}</span></div>
                    </div>
                  </div>
                )}

                {drawerTab === "salary" && (
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-xs grid grid-cols-2 gap-3">
                      <div><span className="text-slate-500">Basic Salary:</span> <span className="font-bold text-white">₹{Number(activeReceptionist.profile?.salary || 0).toLocaleString("en-IN")}</span></div>
                      <div><span className="text-slate-500">Salary Type:</span> <span className="font-bold text-white">{activeNotes.salary_type || "Monthly"}</span></div>
                      <div><span className="text-slate-500">Salary Account:</span> <span className="font-mono text-white">{activeNotes.salary_account || "N/A"}</span></div>
                      <div><span className="text-slate-500">UPI ID Address:</span> <span className="font-mono text-white">{activeNotes.upi_id || "N/A"}</span></div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Recent Salary Slips Ledger</h4>
                      {currentPayslips.length === 0 ? (
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-4">No Generated Payslips</div>
                      ) : (
                        <div className="space-y-2">
                          {currentPayslips.map((p) => (
                            <div key={p.id} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
                              <div>
                                <div className="font-bold text-white">{p.month}</div>
                                <span className="text-[10px] text-slate-500 font-mono">Generated: {p.generated_at.split(",")[0]}</span>
                              </div>
                              <span className="text-[#FF6B00] font-black font-mono">₹{p.net_salary.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {drawerTab === "permissions" && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Portal Access Scopes</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {permissionOptions.map((opt) => {
                        const hasPerm = activeNotes.permissions?.includes(opt.value);
                        return (
                          <div key={opt.value} className="flex items-center gap-2">
                            {hasPerm ? (
                              <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                              <AlertCircle size={14} className="text-slate-600" />
                            )}
                            <span className={hasPerm ? "text-slate-200" : "text-slate-500 line-through"}>{opt.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {drawerTab === "attendance" && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Attendance Log History</h4>
                    {currentAttendanceRecords.length === 0 ? (
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-4">No Attendance Records</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {currentAttendanceRecords.map((a) => (
                          <div key={a.id} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
                            <div>
                              <div className="font-bold text-white font-mono">{a.date}</div>
                              <span className="text-[10px] text-slate-500 font-mono">Clock In: {a.check_in} {a.check_out ? ` | Out: ${a.check_out}` : ""}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              a.status === "Present" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === "leave" && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Staff Leave Applications</h4>
                    {currentLeaveRecords.length === 0 ? (
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-4">No Leave Requests</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {currentLeaveRecords.map((l) => (
                          <div key={l.id} className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-white">{l.start_date} to {l.end_date}</div>
                                <span className="text-[10px] text-slate-500 font-mono">Applied: {l.applied_on}</span>
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                l.status === "approved" ? "bg-green-500/10 text-green-500" : l.status === "pending" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                              }`}>
                                {l.status}
                              </span>
                            </div>
                            <div className="text-slate-400 italic">Reason: {l.reason}</div>
                            {l.status === "pending" && (
                              <div className="flex gap-2 justify-end pt-1">
                                <Button size="sm" onClick={() => handleApproveLeave(l.id)} className="h-7 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] uppercase font-bold px-2.5">
                                  Approve
                                </Button>
                                <Button size="sm" onClick={() => handleRejectLeave(l.id)} className="h-7 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] uppercase font-bold px-2.5">
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === "documents" && (
                  <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-xs">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Government IDs & Credentials</h4>
                    <div><span className="text-slate-500">Aadhaar Card:</span> <span className="font-mono text-white font-medium">{activeNotes.aadhaar || "Not Submitted"}</span></div>
                    <div><span className="text-slate-500">PAN Card:</span> <span className="font-mono text-white font-medium">{activeNotes.pan || "Not Submitted"}</span></div>
                    <div><span className="text-slate-500">Bank Account Details:</span> <span className="font-medium text-white">{activeNotes.bank_details?.bank_name ? `${activeNotes.bank_details.bank_name} - ${activeNotes.bank_details.account_number}` : "Not Submitted"}</span></div>
                    <div><span className="text-slate-500">UPI Address:</span> <span className="font-mono text-white font-medium">{activeNotes.upi_id || "Not Submitted"}</span></div>
                  </div>
                )}

                {drawerTab === "logs" && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Security Audit Logs</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {getReceptionistLogs()
                        .filter(l => l.receptionist_id === activeNotes.employee_id)
                        .map((l) => (
                          <div key={l.id} className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                              <span>By: {l.byName}</span>
                              <span>{l.timestamp}</span>
                            </div>
                            <div className="font-bold text-white">{l.action}</div>
                            {l.details && <div className="text-slate-400 text-[10px]">{l.details}</div>}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <SheetFooter className="border-t border-white/5 pt-4">
            <Button onClick={() => setIsViewOpen(false)} className="w-full h-10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase">
              Close Drawer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: CHECK IN / ATTENDANCE TRACKER
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-[#FF6B00]">
              <Clock size={16} /> Mark Staff Attendance
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Clock-in/out records or submit manual status corrections
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-left text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Clock In Time</Label>
                <Input type="time" value={attTimeIn} onChange={(e) => setAttTimeIn(e.target.value)} className="h-10 border-white/5 bg-black/40 rounded-xl text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Clock Out Time</Label>
                <Input type="time" value={attTimeOut} onChange={(e) => setAttTimeOut(e.target.value)} className="h-10 border-white/5 bg-black/40 rounded-xl text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Status Category</Label>
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value as any)} className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-white px-3">
                <option value="Present">Present</option>
                <option value="Late">Late Arrival</option>
                <option value="Early Leave">Early Leave</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="Leave">On Leave</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Correction Notes</Label>
              <Input value={attNotes} onChange={(e) => setAttNotes(e.target.value)} placeholder="Biometric mismatch, manual clock, etc..." className="h-10 border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600" />
            </div>
          </div>

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button onClick={() => setIsAttendanceOpen(false)} variant="outline" className="h-10 border-white/5 bg-[#171717] text-slate-300 rounded-xl text-xs font-black uppercase">
              Cancel
            </Button>
            <Button onClick={handleAttendanceSubmit} className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase">
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: APPLY LEAVE REQUEST
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isLeaveOpen} onOpenChange={setIsLeaveOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-[#FF6B00]">
              <Calendar size={16} /> Submit Leave Request
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Apply for leaves or block dates with reasons
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-left text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</Label>
                <Input type="date" value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)} className="h-10 border-white/5 bg-black/40 rounded-xl text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">End Date</Label>
                <Input type="date" value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)} className="h-10 border-white/5 bg-black/40 rounded-xl text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Reason for Leave</Label>
              <Textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Describe the reason for leave request..." className="border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Attachment URL (Optional)</Label>
              <Input value={leaveAttachment} onChange={(e) => setLeaveAttachment(e.target.value)} placeholder="Medical certificate, docs, etc..." className="h-10 border-white/5 bg-black/40 rounded-xl text-white placeholder:text-slate-600" />
            </div>
          </div>

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button onClick={() => setIsLeaveOpen(false)} variant="outline" className="h-10 border-white/5 bg-[#171717] text-slate-300 rounded-xl text-xs font-black uppercase">
              Cancel
            </Button>
            <Button onClick={handleLeaveSubmit} className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase">
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: SALARY / PAYSLIP PAYOUT
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isSalaryOpen} onOpenChange={setIsSalaryOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-[#FF6B00]">
              <DollarSign size={16} /> Generate Monthly Payslip
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Review basic salary, allowances, PF, and generate payslips
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 text-left text-xs max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Basic Salary (₹)</Label>
                <Input type="number" value={salBasic} onChange={(e) => setSalBasic(e.target.value)} className="h-9 border-white/5 bg-black/40 rounded-lg text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Allowances (₹)</Label>
                <Input type="number" value={salAllowance} onChange={(e) => setSalAllowance(e.target.value)} className="h-9 border-white/5 bg-black/40 rounded-lg text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Performace Bonus (₹)</Label>
                <Input type="number" value={salBonus} onChange={(e) => setSalBonus(e.target.value)} className="h-9 border-white/5 bg-black/40 rounded-lg text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Deductions (₹)</Label>
                <Input type="number" value={salDeduction} onChange={(e) => setSalDeduction(e.target.value)} className="h-9 border-white/5 bg-black/40 rounded-lg text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">PF Contribution (₹)</Label>
                <Input type="number" value={salPF} onChange={(e) => setSalPF(e.target.value)} className="h-9 border-white/5 bg-black/40 rounded-lg text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">ESIC Contribution (₹)</Label>
                <Input type="number" value={salESIC} onChange={(e) => setSalESIC(e.target.value)} className="h-9 border-white/5 bg-black/40 rounded-lg text-white" />
              </div>
            </div>
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl mt-3 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Net Salary Calculated:</span>
              <span className="font-black text-[#FF6B00] font-mono text-sm">
                ₹{((Number(salBasic) + Number(salAllowance) + Number(salBonus)) - (Number(salDeduction) + Number(salPF) + Number(salESIC))).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button onClick={() => setIsSalaryOpen(false)} variant="outline" className="h-10 border-white/5 bg-[#171717] text-slate-300 rounded-xl text-xs font-black uppercase">
              Cancel
            </Button>
            <Button onClick={handleGeneratePayslip} className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase">
              Generate Payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: BULK ASSIGN SHIFT
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isBulkShiftOpen} onOpenChange={setIsBulkShiftOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-[#FF6B00]">
              Assign Shift to Selected Receptionists
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Bulk assign shift hours for {selectedIds.length} staff accounts
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 text-left">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shift Hours</Label>
            <select
              value={bulkShiftVal}
              onChange={(e) => setBulkShiftVal(e.target.value)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
            >
              <option value="morning">Morning Shift</option>
              <option value="evening">Evening Shift</option>
              <option value="full-day">Full Day</option>
            </select>
          </div>

          <DialogFooter className="border-t border-white/5 pt-4">
            <Button onClick={() => setIsBulkShiftOpen(false)} variant="outline" className="h-10 border-white/5 bg-[#171717] text-slate-300 rounded-xl text-xs font-black uppercase">
              Cancel
            </Button>
            <Button onClick={handleBulkShiftSubmit} className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase">
              Assign Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ArchiveConfirmDialog
        isOpen={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        onConfirm={handleArchiveConfirm}
        loading={submitting}
        itemName={activeReceptionist?.profile?.full_name || "this receptionist"}
      />
      <RestoreConfirmDialog
        isOpen={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        onConfirm={handleRestoreConfirm}
        loading={submitting}
        itemName={activeReceptionist?.profile?.full_name || "this receptionist"}
      />
    </div>
  );
}
