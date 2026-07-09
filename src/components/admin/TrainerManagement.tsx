import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Users, UserCheck, UserX, AlertTriangle, 
  UserPlus, Upload, Download, MapPin, Phone, Mail, Award, Activity,
  Calendar, DollarSign, Clock, ShieldAlert, RefreshCw, Clipboard, Trash, Edit, Check, Eye, Sliders, Briefcase, GraduationCap,
  Star, ChevronLeft, ChevronRight, X, Printer, Plus, Minus, ArrowLeftRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { trainerService, TrainerCreatePayload, TrainerUpdatePayload } from "../../lib/trainerService";
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
import FilterBar from "./crud/FilterBar";
import CrudForm, { FormFieldConfig } from "./crud/CrudForm";
import AuditInfo from "./crud/AuditInfo";
import { BaseEmptyState } from "./crud/EmptyStates";
import { ArchiveConfirmDialog, RestoreConfirmDialog } from "./crud/CrudDialogs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { TrainerResponse, MemberResponse } from "../../lib/types";
import Sidebar from "../dashboard/Sidebar";
import Navbar from "../dashboard/Navbar";
import { useAuth } from "../../hooks/useAuth";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES & HELPER FUNCTIONS FOR EXTRA FIELDS
// ─────────────────────────────────────────────────────────────────────────────

interface ExpandedTrainerBio {
  bio: string;
  blood_group?: string;
  nationality?: string;
  languages?: string;
  skills?: string;
  achievements?: string;
  can_accept_pt?: boolean;
  can_accept_group_classes?: boolean;
  notes?: string;
}

const parseTrainerBio = (bioStr: string | null): ExpandedTrainerBio => {
  if (!bioStr) return { bio: "", blood_group: "", nationality: "", languages: "", skills: "", achievements: "", can_accept_pt: true, can_accept_group_classes: true, notes: "" };
  try {
    const trimmed = bioStr.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return {
        bio: "",
        blood_group: "",
        nationality: "",
        languages: "",
        skills: "",
        achievements: "",
        can_accept_pt: true,
        can_accept_group_classes: true,
        notes: "",
        ...JSON.parse(trimmed)
      };
    }
  } catch (e) {
    // Treat as legacy text
  }
  return { bio: bioStr, blood_group: "N/A", nationality: "N/A", languages: "English", skills: "General Coaching", achievements: "None", can_accept_pt: true, can_accept_group_classes: true, notes: "" };
};

const serializeTrainerBio = (data: ExpandedTrainerBio): string => {
  return JSON.stringify(data);
};

// ─────────────────────────────────────────────────────────────────────────────
// PT ASSIGNMENTS SYSTEM (LOCALSTORAGE + DATABASE CO-ORDINATION)
// ─────────────────────────────────────────────────────────────────────────────

export interface PTAssignment {
  id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  trainer_id: string;
  trainer_name: string;
  trainer_avatar?: string;
  duration: "1 Month" | "3 Months" | "6 Months" | "12 Months";
  start_date: string;
  end_date: string;
  time_slot: string;
  status: "active" | "completed" | "cancelled" | "expired" | "transferred" | "renewed";
  notes?: string;
  history?: {
    action: string;
    timestamp: string;
    byName: string;
    details?: string;
  }[];
}

const getPTAssignments = (): PTAssignment[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_pt_assignments");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const savePTAssignments = (assignments: PTAssignment[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_pt_assignments", JSON.stringify(assignments));
  } catch (e) {
    console.error(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR & LEAVES SYSTEM (LOCALSTORAGE)
// ─────────────────────────────────────────────────────────────────────────────

interface CalendarSlot {
  id: string;
  trainer_id: string;
  date: string; // YYYY-MM-DD
  type: "leave" | "blocked";
  reason?: string;
}

const getCalendarSlots = (): CalendarSlot[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_trainer_calendar_slots");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveCalendarSlots = (slots: CalendarSlot[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_trainer_calendar_slots", JSON.stringify(slots));
  } catch (e) {
    console.error(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE LOGGER SYSTEM (LOCALSTORAGE)
// ─────────────────────────────────────────────────────────────────────────────

interface TrainerAttendance {
  trainer_id: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "half_day" | "leave" | "late";
  working_hours?: number;
}

const getTrainerAttendance = (): TrainerAttendance[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_trainer_attendance");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveTrainerAttendance = (attendanceList: TrainerAttendance[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_trainer_attendance", JSON.stringify(attendanceList));
  } catch (e) {
    console.error(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATIONS SYSTEM (LOCALSTORAGE)
// ─────────────────────────────────────────────────────────────────────────────

interface TrainerCertification {
  id: string;
  trainer_id: string;
  name: string;
  institute: string;
  issue_date: string;
  expiry_date: string;
  certificate_url?: string;
}

const getTrainerCertifications = (): TrainerCertification[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("prohealthclub_trainer_certifications");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveTrainerCertifications = (certs: TrainerCertification[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("prohealthclub_trainer_certifications", JSON.stringify(certs));
  } catch (e) {
    console.error(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function TrainerManagement({ standalone = false }: { standalone?: boolean }) {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // List & Stats state
  const [trainers, setTrainers] = useState<TrainerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_trainers: 0,
    active_trainers: 0,
    inactive_trainers: 0,
    on_leave_trainers: 0,
    total_assigned_members: 0,
    average_rating: 4.8,
    capacity_utilization: 0,
    personal_trainers_active: 0
  });

  // Query / filters state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("joining_staff_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [filters, setFilters] = useState<Record<string, any>>({
    status: "all",
    shift: "",
    employment_type: "",
    specialization: "",
    show_archived: false
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog Controls
  const [activeTrainer, setActiveTrainer] = useState<TrainerResponse | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Advanced Operations Modals
  const [isAssignPTOpen, setIsAssignPTOpen] = useState(false);
  const [isTransferPTOpen, setIsTransferPTOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBulkShiftOpen, setIsBulkShiftOpen] = useState(false);
  const [bulkShiftVal, setBulkShiftVal] = useState("Morning");

  // Form selections cache
  const [membersList, setMembersList] = useState<any[]>([]);

  // PT Subscription form state
  const [ptMemberId, setPtMemberId] = useState("");
  const [ptDuration, setPtDuration] = useState<"1 Month" | "3 Months" | "6 Months" | "12 Months">("1 Month");
  const [ptStartDate, setPtStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [ptTimeSlot, setPtTimeSlot] = useState("07:00 AM - 08:00 AM");
  const [ptNotes, setPtNotes] = useState("");

  // Transfer client state
  const [transferClientId, setTransferClientId] = useState("");
  const [transferOldTrainerId, setTransferOldTrainerId] = useState("");
  const [transferNewTrainerId, setTransferNewTrainerId] = useState("");

  // Leave / Block Calendar Form state
  const [calDate, setCalDate] = useState(new Date().toISOString().split("T")[0]);
  const [calType, setCalType] = useState<"leave" | "blocked">("leave");
  const [calReason, setCalReason] = useState("");

  // Certification Form state
  const [certName, setCertName] = useState("");
  const [certInstitute, setCertInstitute] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpiryDate, setCertExpiryDate] = useState("");

  // Stepper state for Add Trainer Form
  const [createStep, setCreateStep] = useState(1);
  const [createFormValues, setCreateFormValues] = useState<Record<string, any>>({
    full_name: "", email: "", phone: "", date_of_birth: "", gender: "male", address: "",
    emergency_contact_name: "", emergency_contact_phone: "", emergency_relation: "",
    blood_group: "O+", nationality: "Indian", employee_id: "", joining_staff_date: new Date().toISOString().split("T")[0],
    experience_years: 0, employment_type: "Full Time", shift: "Morning", working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    working_hours: "06:00 - 14:00", salary: 0, salary_type: "Monthly", status: "active",
    qualification: "", certifications: [], specializations: [], bio: "", languages: "English, Hindi",
    skills: "Strength Coaching", achievements: "None", max_members: 15, current_members: 0,
    is_available: true, can_accept_pt: true, can_accept_group_classes: true, notes: "", password: ""
  });

  // Tab control in Profile Drawer
  const [drawerTab, setDrawerTab] = useState<"overview" | "details" | "pt_clients" | "calendar" | "attendance" | "performance">("overview");

  // Load Directory Data & Aggregate Local Metadata Stats
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
        show_archived: filters.show_archived
      };

      const [listRes, statsRes, membersRes] = await Promise.all([
        trainerService.getTrainers(listParams),
        trainerService.getTrainerStats(),
        trainerService.getMembers()
      ]);

      const backendTrainers = listRes.data || [];
      
      // Merge backend list with PT Assignments to calculate active clients count and count active PT flags
      const ptList = getPTAssignments();
      const calSlots = getCalendarSlots();
      const todayStr = new Date().toISOString().split("T")[0];

      let totalCoached = 0;
      let onLeaveToday = 0;
      let ptActiveCoaches = 0;

      const mergedTrainers = backendTrainers.map((t) => {
        // Find PT clients for this trainer
        const trainerPTs = ptList.filter((pt) => pt.trainer_id === t.id && pt.status === "active");
        const leaves = calSlots.filter((slot) => slot.trainer_id === t.id && slot.date === todayStr && slot.type === "leave");
        
        const bioData = parseTrainerBio(t.bio);

        if (trainerPTs.length > 0) totalCoached += trainerPTs.length;
        if (leaves.length > 0) onLeaveToday++;
        if (bioData.can_accept_pt !== false) ptActiveCoaches++;

        return {
          ...t,
          assigned_member_count: trainerPTs.length,
          is_available: leaves.length === 0 && (bioData.can_accept_pt !== false)
        };
      });

      setTrainers(mergedTrainers);
      setTotalCount(listRes.total || 0);
      setMembersList(membersRes || []);

      // Calculate aggregated metrics
      const activeCount = mergedTrainers.filter((t) => t.is_active).length;
      const totalCapacity = mergedTrainers.reduce((acc, t) => acc + (t.max_members || 15), 0);
      const utilization = totalCapacity > 0 ? Math.round((totalCoached / totalCapacity) * 100) : 0;

      setStats({
        total_trainers: statsRes.total_trainers || mergedTrainers.length,
        active_trainers: activeCount,
        inactive_trainers: mergedTrainers.length - activeCount,
        on_leave_trainers: onLeaveToday,
        total_assigned_members: totalCoached,
        average_rating: statsRes.average_rating || 4.8,
        capacity_utilization: utilization,
        personal_trainers_active: ptActiveCoaches
      });

    } catch (err: any) {
      notify.error(err?.message || "Failed to load trainers directory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, search, sortKey, sortDirection, filters]);

  // Options Configurations
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
    { label: "Functional Training", value: "Functional Training" }
  ];

  const certificationOptions = [
    { label: "ACE Certified", value: "ACE Certified" },
    { label: "NASM CPT", value: "NASM CPT" },
    { label: "ISSA Certified", value: "ISSA Certified" },
    { label: "CrossFit L1", value: "CrossFit L1" },
    { label: "RYT 200", value: "RYT 200" },
    { label: "Pn1 Nutrition", value: "Pn1" },
    { label: "CSCS Strength Spec.", value: "CSCS" }
  ];

  const shiftOptions = [
    { label: "Morning Shift (6AM - 2PM)", value: "Morning" },
    { label: "Evening Shift (2PM - 10PM)", value: "Evening" },
    { label: "Night Shift (10PM - 6AM)", value: "Night" },
    { label: "Flexible Schedule", value: "Flexible" }
  ];

  const employmentTypeOptions = [
    { label: "Full Time Staff", value: "Full Time" },
    { label: "Part Time Staff", value: "Part Time" },
    { label: "Contractual Coach", value: "Contract" }
  ];

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
      header: "PT Roster",
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
      header: "Shift",
      render: (row: TrainerResponse) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
          {row.shift || "Morning"}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: TrainerResponse) => {
        const isActive = row.is_active;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}>
            {isActive ? "Active" : "Suspended"}
          </span>
        );
      }
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
    { key: "employment_type", label: "Employment", options: employmentTypeOptions },
    { key: "specialization", label: "Specialty", options: specializationOptions }
  ], []);

  // Row Action Handlers
  const handleView = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setDrawerTab("overview");
    setIsViewOpen(true);
  };

  const handleEdit = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setIsEditOpen(true);
  };

  const handleArchiveClick = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    // Block archiving if they have active client subscriptions!
    if (trainer.assigned_member_count > 0) {
      setTransferOldTrainerId(trainer.id);
      setTransferNewTrainerId("");
      setIsTransferPTOpen(true);
      notify.error("Trainer cannot be archived. Please transfer active clients first.");
      return;
    }
    setIsArchiveOpen(true);
  };

  const handleRestoreClick = (trainer: TrainerResponse) => {
    setActiveTrainer(trainer);
    setIsRestoreOpen(true);
  };

  // Submit Operations
  const handleCreateSubmit = async () => {
    // Basic checks
    if (!createFormValues.full_name || !createFormValues.email || !createFormValues.employee_id) {
      notify.error("Full Name, Email and Employee ID are required.");
      return;
    }
    if (createFormValues.password && createFormValues.password.length < 8) {
      notify.error("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // Serialize extra fields into bio JSON
      const serializedBio = serializeTrainerBio({
        bio: createFormValues.bio,
        blood_group: createFormValues.blood_group,
        nationality: createFormValues.nationality,
        languages: createFormValues.languages,
        skills: createFormValues.skills,
        achievements: createFormValues.achievements,
        can_accept_pt: createFormValues.can_accept_pt,
        can_accept_group_classes: createFormValues.can_accept_group_classes,
        notes: createFormValues.notes
      });

      const payload: TrainerCreatePayload = {
        email: createFormValues.email,
        password: createFormValues.password || "Password123",
        full_name: createFormValues.full_name,
        phone: createFormValues.phone || null,
        date_of_birth: createFormValues.date_of_birth || null,
        gender: createFormValues.gender || null,
        address: createFormValues.address || null,
        emergency_contact_name: createFormValues.emergency_contact_name || null,
        emergency_contact_phone: createFormValues.emergency_contact_phone || null,
        emergency_relation: createFormValues.emergency_relation || null,
        employee_id: createFormValues.employee_id || null,
        specialization: createFormValues.specialization || createFormValues.specializations[0] || "General Coaching",
        specializations: createFormValues.specializations || [],
        experience_years: createFormValues.experience_years ? parseInt(createFormValues.experience_years) : 0,
        qualification: createFormValues.qualification || null,
        certifications: createFormValues.certifications || [],
        bio: serializedBio,
        employment_type: createFormValues.employment_type || "Full Time",
        salary: createFormValues.salary ? parseFloat(createFormValues.salary) : 0,
        salary_type: createFormValues.salary_type || "Monthly",
        shift: createFormValues.shift || "Morning",
        joining_staff_date: createFormValues.joining_staff_date || null,
        max_members: createFormValues.max_members ? parseInt(createFormValues.max_members) : 15,
        working_days: createFormValues.working_days || [],
        working_hours: createFormValues.working_hours || null
      };

      await trainerService.createTrainer(payload);
      notify.success("Trainer profile registered successfully.");
      setIsCreateOpen(false);
      setCreateStep(1);
      // Reset values
      setCreateFormValues({
        full_name: "", email: "", phone: "", date_of_birth: "", gender: "male", address: "",
        emergency_contact_name: "", emergency_contact_phone: "", emergency_relation: "",
        blood_group: "O+", nationality: "Indian", employee_id: "", joining_staff_date: new Date().toISOString().split("T")[0],
        experience_years: 0, employment_type: "Full Time", shift: "Morning", working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        working_hours: "06:00 - 14:00", salary: 0, salary_type: "Monthly", status: "active",
        qualification: "", certifications: [], specializations: [], bio: "", languages: "English, Hindi",
        skills: "Strength Coaching", achievements: "None", max_members: 15, current_members: 0,
        is_available: true, can_accept_pt: true, can_accept_group_classes: true, notes: "", password: ""
      });
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to create trainer profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!activeTrainer) return;
    setSubmitting(true);
    try {
      // Retain JSON serialization on bio
      const currentBioData = parseTrainerBio(activeTrainer.bio);
      const serializedBio = serializeTrainerBio({
        ...currentBioData,
        bio: data.bio
      });

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
        bio: serializedBio,
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
      notify.success("Trainer profile updated successfully.");
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
      setIsViewOpen(false);
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

  // Bulk Operations
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

  // Toggle availability state
  const handleToggleActiveState = async () => {
    if (!activeTrainer) return;
    try {
      await trainerService.updateTrainer(activeTrainer.id, { is_active: !activeTrainer.is_active });
      notify.success(activeTrainer.is_active ? "Trainer account suspended." : "Trainer account activated.");
      const updated = await trainerService.getTrainerById(activeTrainer.id);
      setActiveTrainer(updated);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to toggle portal access state");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PT SUBSCRIPTION ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAssignPTSubmit = async () => {
    if (!activeTrainer || !ptMemberId) {
      notify.error("Please choose a member.");
      return;
    }

    try {
      const selectedMemberObj = membersList.find((m) => m.id === ptMemberId);
      if (!selectedMemberObj) throw new Error("Selected member not found");

      // Calculate End Date based on Duration
      const start = new Date(ptStartDate);
      let monthsToAdd = 1;
      if (ptDuration === "3 Months") monthsToAdd = 3;
      else if (ptDuration === "6 Months") monthsToAdd = 6;
      else if (ptDuration === "12 Months") monthsToAdd = 12;

      start.setMonth(start.getMonth() + monthsToAdd);
      const endDateString = start.toISOString().split("T")[0];

      // Update Member assigned coach in Backend Database
      await memberService.updateMember(ptMemberId, { trainer_id: activeTrainer.id });

      // Save Assignment inside LocalStorage
      const newAssignment: PTAssignment = {
        id: "PT-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        member_id: ptMemberId,
        member_name: selectedMemberObj.profile?.full_name || "Member",
        member_phone: selectedMemberObj.profile?.phone || "",
        trainer_id: activeTrainer.id,
        trainer_name: activeTrainer.profile?.full_name || "Trainer",
        trainer_avatar: activeTrainer.profile?.avatar_url || "",
        duration: ptDuration,
        start_date: ptStartDate,
        end_date: endDateString,
        time_slot: ptTimeSlot,
        status: "active",
        notes: ptNotes,
        history: [{
          action: "Created Subscription",
          timestamp: new Date().toLocaleDateString(),
          byName: user?.full_name || "Staff",
          details: `Duration: ${ptDuration}, Slot: ${ptTimeSlot}`
        }]
      };

      const currentPTs = getPTAssignments();
      savePTAssignments([...currentPTs, newAssignment]);

      notify.success("Personal Trainer Assignment booked successfully.");
      setIsAssignPTOpen(false);
      setPtMemberId("");
      setPtNotes("");

      // Reload Drawer Data
      const updated = await trainerService.getTrainerById(activeTrainer.id);
      setActiveTrainer(updated);
      loadData();
    } catch (e: any) {
      notify.error(e.message || "Failed to assign personal trainer subscription");
    }
  };

  const handleCancelPT = async (assignmentId: string) => {
    try {
      const allPTs = getPTAssignments();
      const updatedPTs = allPTs.map((pt) => {
        if (pt.id === assignmentId) {
          // Unassign member from coach in backend
          memberService.updateMember(pt.member_id, { trainer_id: null });
          return {
            ...pt,
            status: "cancelled" as const,
            history: [
              ...(pt.history || []),
              {
                action: "Cancelled Subscription",
                timestamp: new Date().toLocaleDateString(),
                byName: user?.full_name || "Staff"
              }
            ]
          };
        }
        return pt;
      });
      savePTAssignments(updatedPTs);
      notify.success("Subscription cancelled successfully.");
      loadData();
      if (activeTrainer) {
        const updated = await trainerService.getTrainerById(activeTrainer.id);
        setActiveTrainer(updated);
      }
    } catch (err: any) {
      notify.error(err.message || "Failed to cancel subscription");
    }
  };

  const handleExtendPT = async (assignmentId: string, days: number) => {
    const allPTs = getPTAssignments();
    const updatedPTs = allPTs.map((pt) => {
      if (pt.id === assignmentId) {
        const currentEnd = new Date(pt.end_date);
        currentEnd.setDate(currentEnd.getDate() + days);
        return {
          ...pt,
          end_date: currentEnd.toISOString().split("T")[0],
          history: [
            ...(pt.history || []),
            {
              action: "Extended Subscription",
              timestamp: new Date().toLocaleDateString(),
              byName: user?.full_name || "Staff",
              details: `Extended by ${days} days`
            }
          ]
        };
      }
      return pt;
    });
    savePTAssignments(updatedPTs);
    notify.success(`Subscription extended by ${days} days.`);
    loadData();
    if (activeTrainer) {
      const updated = await trainerService.getTrainerById(activeTrainer.id);
      setActiveTrainer(updated);
    }
  };

  const handleTransferPTSubmit = async () => {
    if (!transferClientId || !transferNewTrainerId) {
      notify.error("Please choose a member and new trainer.");
      return;
    }

    try {
      const newTrainerObj = trainers.find((t) => t.id === transferNewTrainerId);
      if (!newTrainerObj) throw new Error("Selected new trainer not found");

      // Update Member assigned coach in Backend Database
      await memberService.updateMember(transferClientId, { trainer_id: transferNewTrainerId });

      // Update LocalStorage Assignments
      const allPTs = getPTAssignments();
      const updatedPTs = allPTs.map((pt) => {
        if (pt.member_id === transferClientId && pt.status === "active") {
          return {
            ...pt,
            trainer_id: transferNewTrainerId,
            trainer_name: newTrainerObj.profile?.full_name || "Trainer",
            trainer_avatar: newTrainerObj.profile?.avatar_url || "",
            history: [
              ...(pt.history || []),
              {
                action: "Transferred Trainer",
                timestamp: new Date().toLocaleDateString(),
                byName: user?.full_name || "Staff",
                details: `Transferred from ${pt.trainer_name} to ${newTrainerObj.profile?.full_name}`
              }
            ]
          };
        }
        return pt;
      });
      savePTAssignments(updatedPTs);

      notify.success("Coached Client transferred successfully.");
      setIsTransferPTOpen(false);
      setTransferClientId("");
      setTransferNewTrainerId("");

      loadData();
      if (activeTrainer) {
        const updated = await trainerService.getTrainerById(activeTrainer.id);
        setActiveTrainer(updated);
      }
    } catch (e: any) {
      notify.error(e.message || "Failed to transfer coached client");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CALENDAR LEAVE / BLOCKED SLOTS MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAddCalendarSlot = () => {
    if (!activeTrainer || !calDate) return;
    const newSlot: CalendarSlot = {
      id: "CAL-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      trainer_id: activeTrainer.id,
      date: calDate,
      type: calType,
      reason: calReason || "No details"
    };

    const slots = getCalendarSlots();
    saveCalendarSlots([...slots, newSlot]);
    notify.success(calType === "leave" ? "Leave day added to schedule." : "Time slot blocked.");
    setCalReason("");
    loadData();
  };

  const handleRemoveCalendarSlot = (slotId: string) => {
    const slots = getCalendarSlots();
    saveCalendarSlots(slots.filter((s) => s.id !== slotId));
    notify.success("Calendar slot restriction removed.");
    loadData();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CERTIFICATIONS ACTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAddCert = () => {
    if (!activeTrainer || !certName || !certInstitute || !certIssueDate || !certExpiryDate) {
      notify.error("All certification fields are required.");
      return;
    }

    const newCert: TrainerCertification = {
      id: "CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      trainer_id: activeTrainer.id,
      name: certName,
      institute: certInstitute,
      issue_date: certIssueDate,
      expiry_date: certExpiryDate
    };

    const certs = getTrainerCertifications();
    saveTrainerCertifications([...certs, newCert]);
    notify.success("Professional Certification added.");
    setCertName("");
    setCertInstitute("");
    setCertIssueDate("");
    setCertExpiryDate("");
  };

  const handleRemoveCert = (certId: string) => {
    const certs = getTrainerCertifications();
    saveTrainerCertifications(certs.filter((c) => c.id !== certId));
    notify.success("Certification removed.");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ATTENDANCE MARKING
  // ─────────────────────────────────────────────────────────────────────────────

  const handleMarkAttendance = (status: "present" | "absent" | "half_day" | "leave" | "late") => {
    if (!activeTrainer) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const allAtt = getTrainerAttendance();
    const filtered = allAtt.filter((a) => !(a.trainer_id === activeTrainer.id && a.date === todayStr));
    
    const newAtt: TrainerAttendance = {
      trainer_id: activeTrainer.id,
      date: todayStr,
      status,
      working_hours: status === "present" ? 8 : status === "half_day" ? 4 : 0
    };

    saveTrainerAttendance([...filtered, newAtt]);
    notify.success(`Marked attendance status: ${status.replace("_", " ").toUpperCase()}`);
    loadData();
  };

  // CSV Export for Directory
  const handleExport = (idsToExport?: string[]) => {
    const list = idsToExport 
      ? trainers.filter((t) => idsToExport.includes(t.id)) 
      : trainers;

    if (list.length === 0) {
      notify.error("No trainer records available to export");
      return;
    }

    const headers = ["Employee ID", "Full Name", "Email", "Phone", "Gender", "Specialization", "Experience", "Salary", "Salary Type", "Shift", "Status", "Max Capacity", "Assigned Members"];
    const rows = list.map((t) => [
      t.employee_id || "",
      t.profile?.full_name || "",
      t.profile?.email || "",
      t.profile?.phone || "",
      t.profile?.gender || "",
      t.specialization || "",
      t.experience_years ? `${t.experience_years} years` : "0",
      t.salary || "",
      t.salary_type || "",
      t.shift || "",
      t.is_active ? "Active" : "Suspended",
      t.max_members,
      t.assigned_member_count
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Trainers_Directory_${new Date().toISOString().split("T")[0]}.csv`);
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

  // Derived Values for Active Trainer Drawer View
  const activeTrainerBio = useMemo(() => {
    return parseTrainerBio(activeTrainer?.bio || null);
  }, [activeTrainer]);

  const activeTrainerPTs = useMemo(() => {
    if (!activeTrainer) return [];
    return getPTAssignments().filter((pt) => pt.trainer_id === activeTrainer.id);
  }, [activeTrainer, isAssignPTOpen, isTransferPTOpen]);

  const activeTrainerCerts = useMemo(() => {
    if (!activeTrainer) return [];
    return getTrainerCertifications().filter((c) => c.trainer_id === activeTrainer.id);
  }, [activeTrainer, isCertOpen]);

  const activeTrainerCalendar = useMemo(() => {
    if (!activeTrainer) return [];
    return getCalendarSlots().filter((s) => s.trainer_id === activeTrainer.id);
  }, [activeTrainer, isCalendarOpen]);

  const activeTrainerAttendanceSummary = useMemo(() => {
    if (!activeTrainer) return { present: 0, absent: 0, half_day: 0, leave: 0, late: 0, percent: 100 };
    const all = getTrainerAttendance().filter((a) => a.trainer_id === activeTrainer.id);
    if (all.length === 0) return { present: 0, absent: 0, half_day: 0, leave: 0, late: 0, percent: 100 };
    
    const stats = { present: 0, absent: 0, half_day: 0, leave: 0, late: 0 };
    all.forEach((a) => {
      if (a.status in stats) {
        stats[a.status as keyof typeof stats]++;
      }
    });

    const workDays = stats.present + stats.half_day + stats.late;
    const percent = Math.round((workDays / all.length) * 100);

    return { ...stats, percent };
  }, [activeTrainer]);

  // Salary simulation based on rates
  const activeTrainerSalaryEarnings = useMemo(() => {
    if (!activeTrainer) return 0;
    const base = activeTrainer.salary || 0;
    const clientBonus = activeTrainer.assigned_member_count * 1500; // ₹1,500 bonus per active PT client
    return base + clientBonus;
  }, [activeTrainer]);

  return (
    <div className={standalone ? "min-h-screen bg-[#090909] text-white flex select-none overflow-x-hidden font-sans" : ""}>
      {standalone && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <div
        className={standalone ? "flex-1 flex flex-col min-h-screen transition-all duration-300" : "space-y-6 bg-[#090909] text-white p-6 min-h-screen w-full"}
        style={standalone ? {
          paddingLeft: isSidebarCollapsed ? "104px" : "284px",
          paddingTop: "88px",
          paddingRight: "16px",
          paddingBottom: "16px",
          width: "100%"
        } : undefined}
      >
        {standalone && <Navbar />}

        <main className="flex-1 min-h-0 space-y-6 pt-4">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                🏋️ Trainers & Schedule Directory
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                Configure professional instructors, certifications, PT assignments, leave calendars and capacity utilization
              </p>
            </div>
            
            <Permission allowedRoles={["admin"]}>
              <Button
                onClick={() => {
                  setCreateStep(1);
                  setIsCreateOpen(true);
                }}
                className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2 shadow-lg shadow-[#FF6B00]/10"
              >
                <UserPlus size={16} />
                Register Trainer
              </Button>
            </Permission>
          </div>

          {/* KPI Dashboard Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Trainers" value={stats.total_trainers} icon={Users} color="#FF6B00" />
            <StatCard title="Available Coaches" value={stats.active_trainers - stats.on_leave_trainers} icon={UserCheck} color="#10B981" />
            <StatCard title="On Leave Today" value={stats.on_leave_trainers} icon={UserX} color="#F59E0B" />
            <StatCard title="Coached Clients" value={stats.total_assigned_members} icon={Activity} color="#EF4444" />
            <StatCard title="Average Rating" value={`${stats.average_rating} ⭐`} icon={Star} color="#F59E0B" />
            <StatCard title="Capacity Utilization" value={`${stats.capacity_utilization}%`} icon={Briefcase} color="#10B981" />
            <StatCard title="PT active Coaches" value={stats.personal_trainers_active} icon={ShieldAlert} color="#FF6B00" />
            <StatCard title="Busy (At Capacity)" value={trainers.filter((t) => t.assigned_member_count >= t.max_members).length} icon={AlertTriangle} color="#EF4444" />
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
                  Export Directory
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: ADD TRAINER STEPPER
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-white/5 pb-4">
            <DialogTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="text-[#FF6B00]" size={18} /> Register Gym Trainer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Provide personal, employment, and capacities step-by-step
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Indicators */}
          <div className="flex items-center justify-between py-4 border-b border-white/5">
            {[
              { step: 1, label: "Personal" },
              { step: 2, label: "Employment" },
              { step: 3, label: "Credentials" },
              { step: 4, label: "Capacity" }
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

          {/* Stepper Fields Panel */}
          <div className="py-6 space-y-4 text-left">
            {createStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name *</Label>
                  <Input 
                    value={createFormValues.full_name} 
                    onChange={(e) => setCreateFormValues({...createFormValues, full_name: e.target.value})}
                    placeholder="e.g. Vikram Malhotra"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</Label>
                  <Input 
                    type="email"
                    value={createFormValues.email} 
                    onChange={(e) => setCreateFormValues({...createFormValues, email: e.target.value})}
                    placeholder="vikram@prohealth.com"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</Label>
                  <Input 
                    value={createFormValues.phone} 
                    onChange={(e) => setCreateFormValues({...createFormValues, phone: e.target.value})}
                    placeholder="9999988888"
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
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password (Portal Access) *</Label>
                  <Input 
                    type="password"
                    value={createFormValues.password} 
                    onChange={(e) => setCreateFormValues({...createFormValues, password: e.target.value})}
                    placeholder="Min 8 characters..."
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood Group</Label>
                  <Input 
                    value={createFormValues.blood_group} 
                    onChange={(e) => setCreateFormValues({...createFormValues, blood_group: e.target.value})}
                    placeholder="e.g. O+"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nationality</Label>
                  <Input 
                    value={createFormValues.nationality} 
                    onChange={(e) => setCreateFormValues({...createFormValues, nationality: e.target.value})}
                    placeholder="e.g. Indian"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Residential Address</Label>
                  <Textarea 
                    value={createFormValues.address} 
                    onChange={(e) => setCreateFormValues({...createFormValues, address: e.target.value})}
                    placeholder="Street, City, State details..."
                    className="min-h-16 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact Person</Label>
                  <Input 
                    value={createFormValues.emergency_contact_name} 
                    onChange={(e) => setCreateFormValues({...createFormValues, emergency_contact_name: e.target.value})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact relation & phone</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      value={createFormValues.emergency_relation} 
                      onChange={(e) => setCreateFormValues({...createFormValues, emergency_relation: e.target.value})}
                      placeholder="Spouse"
                      className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                    />
                    <Input 
                      value={createFormValues.emergency_contact_phone} 
                      onChange={(e) => setCreateFormValues({...createFormValues, emergency_contact_phone: e.target.value})}
                      placeholder="Phone"
                      className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                    />
                  </div>
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
                    placeholder="e.g. EMP-22"
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
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience (Years)</Label>
                  <Input 
                    type="number"
                    value={createFormValues.experience_years} 
                    onChange={(e) => setCreateFormValues({...createFormValues, experience_years: parseInt(e.target.value) || 0})}
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
                    {employmentTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Shift</Label>
                  <select 
                    value={createFormValues.shift}
                    onChange={(e) => setCreateFormValues({...createFormValues, shift: e.target.value})}
                    className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                  >
                    {shiftOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Working Hours Range</Label>
                  <Input 
                    value={createFormValues.working_hours} 
                    onChange={(e) => setCreateFormValues({...createFormValues, working_hours: e.target.value})}
                    placeholder="e.g. 06:00 AM - 02:00 PM"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Payout Rate</Label>
                  <Input 
                    type="number"
                    value={createFormValues.salary} 
                    onChange={(e) => setCreateFormValues({...createFormValues, salary: parseFloat(e.target.value) || 0})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Structure Type</Label>
                  <select 
                    value={createFormValues.salary_type}
                    onChange={(e) => setCreateFormValues({...createFormValues, salary_type: e.target.value})}
                    className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                  >
                    <option value="Monthly">Monthly Base</option>
                    <option value="Hourly">Hourly Freelancer</option>
                  </select>
                </div>
              </div>
            )}

            {createStep === 3 && (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Qualifications</Label>
                  <Input 
                    value={createFormValues.qualification} 
                    onChange={(e) => setCreateFormValues({...createFormValues, qualification: e.target.value})}
                    placeholder="B.Sc Physical Education, Certified Kinesiologist..."
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certifications (Hold Cmd/Ctrl to select multiple)</Label>
                  <select 
                    multiple
                    value={createFormValues.certifications}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                      setCreateFormValues({...createFormValues, certifications: opts});
                    }}
                    className="w-full h-24 bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-2"
                  >
                    {certificationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialties (Hold Cmd/Ctrl to select multiple)</Label>
                  <select 
                    multiple
                    value={createFormValues.specializations}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                      setCreateFormValues({...createFormValues, specializations: opts});
                    }}
                    className="w-full h-24 bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-2"
                  >
                    {specializationOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Languages Spoken</Label>
                  <Input 
                    value={createFormValues.languages} 
                    onChange={(e) => setCreateFormValues({...createFormValues, languages: e.target.value})}
                    placeholder="e.g. English, Hindi, Punjabi"
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coaching Bio</Label>
                  <Textarea 
                    value={createFormValues.bio} 
                    onChange={(e) => setCreateFormValues({...createFormValues, bio: e.target.value})}
                    placeholder="Write a brief professional summary..."
                    className="min-h-16 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            {createStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Member Capacity</Label>
                  <Input 
                    type="number"
                    value={createFormValues.max_members} 
                    onChange={(e) => setCreateFormValues({...createFormValues, max_members: parseInt(e.target.value) || 15})}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-3 pt-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="can_accept_pt"
                      checked={createFormValues.can_accept_pt}
                      onChange={(e) => setCreateFormValues({...createFormValues, can_accept_pt: e.target.checked})}
                      className="w-4 h-4 accent-[#FF6B00] border border-white/10"
                    />
                    <label htmlFor="can_accept_pt" className="text-xs font-bold text-slate-300">Accept Personal Training</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="can_accept_group"
                      checked={createFormValues.can_accept_group_classes}
                      onChange={(e) => setCreateFormValues({...createFormValues, can_accept_group_classes: e.target.checked})}
                      className="w-4 h-4 accent-[#FF6B00] border border-white/10"
                    />
                    <label htmlFor="can_accept_group" className="text-xs font-bold text-slate-300">Accept Group Classes</label>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administrative Notes</Label>
                  <Textarea 
                    value={createFormValues.notes} 
                    onChange={(e) => setCreateFormValues({...createFormValues, notes: e.target.value})}
                    placeholder="General health risk warnings or internal details..."
                    className="min-h-20 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full border-t border-white/5 pt-4">
            <Button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (createStep === 1) setIsCreateOpen(false);
                else setCreateStep(createStep - 1);
              }}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase text-slate-300"
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
              {createStep === 4 ? "Register Trainer" : "Next Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: EDIT TRAINER PROFILE
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Modify Trainer Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update personal parameters, qualifications, salaries or working days.
            </DialogDescription>
          </DialogHeader>

          {activeTrainer && (
            <CrudForm
              fields={[
                { name: "full_name", label: "Full Name", type: "text", required: true },
                { name: "phone", label: "Phone Number", type: "phone", required: true },
                { name: "date_of_birth", label: "Date of Birth", type: "date" },
                { name: "gender", label: "Gender", type: "select", options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }, { label: "Other", value: "other" }] },
                { name: "address", label: "Residential Address", type: "textarea" },
                { name: "employee_id", label: "Employee ID", type: "text", required: true },
                { name: "qualification", label: "Qualifications", type: "text" },
                { name: "bio", label: "Coaching Philosophy (Bio)", type: "textarea" },
                { name: "specialization", label: "Specialization", type: "select", options: specializationOptions, required: true },
                { name: "specializations", label: "Multi-Specialties", type: "multi-select", options: specializationOptions },
                { name: "experience_years", label: "Experience Years", type: "number", required: true },
                { name: "certifications", label: "Professional Certifications", type: "multi-select", options: certificationOptions },
                { name: "employment_type", label: "Employment Type", type: "select", options: employmentTypeOptions, required: true },
                { name: "salary_type", label: "Salary Type", type: "select", options: [{ label: "Monthly", value: "Monthly" }, { label: "Hourly", value: "Hourly" }], required: true },
                { name: "salary", label: "Salary Rate", type: "currency", required: true },
                { name: "shift", label: "Shift", type: "select", options: shiftOptions, required: true },
                { name: "max_members", label: "Max Capacity", type: "number", required: true },
                { name: "working_hours", label: "Working Hours Range", type: "text" },
                { name: "joining_staff_date", label: "Joining Date", type: "date", required: true }
              ]}
              onSubmit={handleEditSubmit}
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
                bio: activeTrainerBio.bio || "",
                specialization: activeTrainer.specialization || "",
                specializations: activeTrainer.specializations || [],
                experience_years: activeTrainer.experience_years || 0,
                certifications: activeTrainer.certifications || [],
                employment_type: activeTrainer.employment_type || "Full Time",
                salary_type: activeTrainer.salary_type || "Monthly",
                salary: activeTrainer.salary || 0,
                shift: activeTrainer.shift || "Morning",
                max_members: activeTrainer.max_members || 15,
                working_hours: activeTrainer.working_hours || "",
                joining_staff_date: activeTrainer.joining_staff_date || ""
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          SHEET: PROFILE VIEW DETAILS
      ───────────────────────────────────────────────────────────────────────────── */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="w-full sm:max-w-2xl bg-[#090909] border-l border-white/5 text-white p-6 overflow-y-auto h-full flex flex-col justify-between">
          <SheetHeader className="text-left border-b border-white/5 pb-4">
            <div className="flex justify-between items-start">
              <SheetTitle className="text-white flex items-center gap-2">
                <Users className="text-[#FF6B00]" /> Trainer Profile Drawer
              </SheetTitle>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-8 rounded-lg border-white/5 bg-[#121212] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5"
              >
                <Printer size={12} /> Print
              </Button>
            </div>
            <SheetDescription className="text-slate-400">
              View all personal info, certifications, coached PT clients, schedule calendars and logs.
            </SheetDescription>
          </SheetHeader>

          {activeTrainer && (
            <div className="flex-1 space-y-6 py-6 overflow-y-auto pr-1">
              
              {/* Profile Card Header Summary */}
              <div className="flex items-center gap-4 bg-[#121212] border border-white/5 p-4 rounded-3xl">
                <div className="w-16 h-16 rounded-full border-2 border-[#FF6B00]/40 bg-black/40 flex items-center justify-center text-lg font-black text-slate-400 overflow-hidden">
                  {activeTrainer.profile?.avatar_url ? (
                    <img src={activeTrainer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    activeTrainer.profile?.full_name ? activeTrainer.profile.full_name[0].toUpperCase() : "?"
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    {activeTrainer.profile?.full_name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                    ID: {activeTrainer.employee_id || "N/A"} • Shift: {activeTrainer.shift}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-orange-500/10 text-[#FF6B00] border border-[#FF6B00]/20">
                      {activeTrainer.specialization || "Fitness Coach"}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                      activeTrainer.is_active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {activeTrainer.is_active ? "Portal Enabled" : "Suspended"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions top panel */}
              <div className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setIsViewOpen(false);
                    setIsEditOpen(true);
                  }}
                  className="h-8 px-3 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                >
                  ✏️ Edit Profile
                </Button>
                
                <Permission allowedRoles={["admin", "receptionist"]}>
                  <Button
                    onClick={() => setIsAssignPTOpen(true)}
                    className="h-8 px-3 bg-black hover:bg-slate-900 border border-[#FF6B00]/30 text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] rounded-xl"
                  >
                    ➕ Assign Member
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setTransferOldTrainerId(activeTrainer.id);
                      setTransferNewTrainerId("");
                      setIsTransferPTOpen(true);
                    }}
                    className="h-8 px-3 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300 rounded-xl"
                  >
                    ↔️ Transfer Client
                  </Button>
                </Permission>
                
                <Button
                  onClick={handleToggleActiveState}
                  className="h-8 px-3 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300 rounded-xl"
                >
                  🔒 Lock Portal
                </Button>

                <Permission allowedRoles={["admin"]}>
                  <Button
                    onClick={() => {
                      setIsViewOpen(false);
                      setIsArchiveOpen(true);
                    }}
                    className="h-8 px-3 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-500 rounded-xl"
                  >
                    🗑️ Delete Trainer
                  </Button>
                </Permission>
              </div>

              {/* TABS HEADER */}
              <div className="flex border-b border-white/5 gap-4 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "details", label: "Employment" },
                  { id: "pt_clients", label: "Coached Clients" },
                  { id: "calendar", label: "Calendar" },
                  { id: "attendance", label: "Attendance" },
                  { id: "performance", label: "Performance" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id as any)}
                    className={`text-[10px] font-black uppercase tracking-wider pb-2 border-b-2 whitespace-nowrap transition-all ${
                      drawerTab === t.id 
                        ? "border-[#FF6B00] text-white" 
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TABS CONTAINER */}
              <div className="space-y-4">
                
                {/* TAB 1: OVERVIEW */}
                {drawerTab === "overview" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00] border-b border-white/5 pb-2">Biography</h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{activeTrainerBio.bio || "No coaching biography registered."}"
                      </p>
                    </div>

                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00] border-b border-white/5 pb-2">Personal Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Gender</p>
                          <p className="text-white mt-0.5 capitalize">{activeTrainer.profile?.gender || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Date of Birth</p>
                          <p className="text-white mt-0.5">{activeTrainer.profile?.date_of_birth || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Blood Group</p>
                          <p className="text-white mt-0.5">{activeTrainerBio.blood_group || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Nationality</p>
                          <p className="text-white mt-0.5">{activeTrainerBio.nationality || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Contact Phone</p>
                          <p className="text-white mt-0.5">{activeTrainer.profile?.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Email Address</p>
                          <p className="text-white mt-0.5 font-mono text-[11px]">{activeTrainer.profile?.email || "N/A"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-500 text-[10px] uppercase font-bold text-red-400">Emergency contact</p>
                          <p className="text-white mt-0.5">
                            {activeTrainer.profile?.emergency_contact_name || "N/A"} ({activeTrainer.profile?.emergency_relation || "No relation"}) - {activeTrainer.profile?.emergency_contact_phone || "No phone"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EMPLOYMENT */}
                {drawerTab === "details" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00] border-b border-white/5 pb-2">Payroll Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Employment Type</p>
                          <p className="text-white mt-0.5">{activeTrainer.employment_type || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Salary Structure</p>
                          <p className="text-white mt-0.5">{activeTrainer.salary_type || "Monthly"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-bold text-green-400">Salary Base Rate</p>
                          <p className="text-green-400 font-bold mt-0.5">₹{(activeTrainer.salary || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Est. Monthly Earnings</p>
                          <p className="text-white font-bold mt-0.5">₹{activeTrainerSalaryEarnings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00] border-b border-white/5 pb-2">Qualifications & specialties</h4>
                      <div className="space-y-3 text-xs text-slate-300 font-semibold">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Qualifications</p>
                          <p className="text-white mt-0.5">{activeTrainer.qualification || "No formal degrees listed."}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Languages Spoken</p>
                          <p className="text-white mt-0.5">{activeTrainerBio.languages || "English"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Skills / Specializations</p>
                          <p className="text-white mt-0.5">{activeTrainerBio.skills || "Fitness Coach"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Achievements</p>
                          <p className="text-white mt-0.5">{activeTrainerBio.achievements || "None"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Certifications list */}
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-xs font-black uppercase text-[#FF6B00]">Certifications ({activeTrainerCerts.length})</h4>
                        <Button
                          onClick={() => setIsCertOpen(true)}
                          className="h-6 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider"
                        >
                          Manage Certs
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {activeTrainerCerts.length > 0 ? (
                          activeTrainerCerts.map((c) => {
                            const expiry = new Date(c.expiry_date);
                            const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const isExpiringSoon = diffDays > 0 && diffDays <= 30;

                            return (
                              <div key={c.id} className="bg-black/40 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs font-semibold">
                                <div>
                                  <p className="text-white font-bold">{c.name}</p>
                                  <p className="text-[10px] text-slate-500">{c.institute} • Valid until {c.expiry_date}</p>
                                </div>
                                {isExpiringSoon ? (
                                  <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border border-yellow-500/20">
                                    Expires in {diffDays} days!
                                  </span>
                                ) : diffDays <= 0 ? (
                                  <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border border-red-500/20">
                                    Expired!
                                  </span>
                                ) : (
                                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border border-green-500/20">
                                    Active
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-500 italic">No certifications uploaded.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: COACHED CLIENTS */}
                {drawerTab === "pt_clients" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">PT CLIENTS LIST</h4>
                      <Button
                        onClick={() => setIsAssignPTOpen(true)}
                        className="h-7 px-3 bg-[#FF6B00] hover:bg-[#FF8020] text-white text-[10px] font-black uppercase rounded-lg"
                      >
                        New PT Client
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {activeTrainerPTs.length > 0 ? (
                        activeTrainerPTs.map((pt) => {
                          const expiry = new Date(pt.end_date);
                          const diff = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          const daysLeft = diff > 0 ? `${diff} days left` : "Expired";

                          return (
                            <div key={pt.id} className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-3">
                              <div className="flex justify-between items-start border-b border-white/5 pb-2">
                                <div>
                                  <h5 className="text-xs font-black text-white">{pt.member_name}</h5>
                                  <p className="text-[10px] text-slate-500">Phone: {pt.member_phone} • Slot: {pt.time_slot}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                  pt.status === "active" 
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                                    : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                                }`}>
                                  {pt.status === "active" ? daysLeft : pt.status}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                {pt.status === "active" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleExtendPT(pt.id, 30)}
                                      className="h-7 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase rounded-lg text-slate-300"
                                    >
                                      Extend 30 Days
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleCancelPT(pt.id)}
                                      className="h-7 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 text-[9px] font-bold uppercase rounded-lg text-red-500"
                                    >
                                      Cancel PT
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-xs text-slate-500 italic">No personal training assignments registered.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: CALENDAR */}
                {drawerTab === "calendar" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00] border-b border-white/5 pb-2">Calendar restrictions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-slate-500 uppercase">Date</Label>
                          <Input 
                            type="date"
                            value={calDate} 
                            onChange={(e) => setCalDate(e.target.value)}
                            className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-slate-500 uppercase">Type</Label>
                          <select 
                            value={calType}
                            onChange={(e) => setCalType(e.target.value as any)}
                            className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                          >
                            <option value="leave">Leave Day (Full day off)</option>
                            <option value="blocked">Block Schedule Slot</option>
                          </select>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                          <Label className="text-[10px] font-bold text-slate-500 uppercase">Reason / Notes</Label>
                          <Input 
                            value={calReason} 
                            onChange={(e) => setCalReason(e.target.value)}
                            placeholder="Sick leave, family function, block morning slot..."
                            className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2 flex justify-end">
                          <Button
                            onClick={handleAddCalendarSlot}
                            className="h-9 px-4 bg-[#FF6B00] hover:bg-[#FF8020] text-white text-xs font-bold uppercase rounded-lg"
                          >
                            Add Calendar Restriction
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Slots Listing */}
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00]">Leave Days & Blocked Slots</h4>
                      <div className="space-y-2">
                        {activeTrainerCalendar.length > 0 ? (
                          activeTrainerCalendar.map((slot) => (
                            <div key={slot.id} className="bg-black/40 border border-white/5 p-3 rounded-2xl flex justify-between items-center text-xs font-semibold">
                              <div>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase mr-2 ${
                                  slot.type === "leave" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"
                                }`}>
                                  {slot.type}
                                </span>
                                <span className="text-white font-mono">{slot.date}</span>
                                <p className="text-[10px] text-slate-500 mt-1">Reason: {slot.reason}</p>
                              </div>
                              <Button
                                onClick={() => handleRemoveCalendarSlot(slot.id)}
                                className="h-6 w-6 p-0 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">No leaves or blocked slots configured.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: ATTENDANCE */}
                {drawerTab === "attendance" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00]">Mark Today's Attendance</h4>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {[
                          { status: "present", label: "Present ✅", color: "bg-green-500/10 text-green-500 border border-green-500/20" },
                          { status: "absent", label: "Absent ❌", color: "bg-red-500/10 text-red-500 border border-red-500/20" },
                          { status: "half_day", label: "Half Day ⏱️", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" },
                          { status: "leave", label: "On Leave 🌴", color: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
                          { status: "late", label: "Late ⏰", color: "bg-orange-500/10 text-orange-500 border border-orange-500/20" }
                        ].map((btn) => (
                          <Button
                            key={btn.status}
                            onClick={() => handleMarkAttendance(btn.status as any)}
                            className={`h-8 text-[10px] font-bold uppercase rounded-lg ${btn.color}`}
                          >
                            {btn.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-3">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00]">Attendance summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Attendance Score</p>
                          <p className="text-white mt-0.5 font-bold">{activeTrainerAttendanceSummary.percent}% Present</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Days Tracked</p>
                          <p className="text-white mt-0.5">
                            P: {activeTrainerAttendanceSummary.present} • A: {activeTrainerAttendanceSummary.absent} • HD: {activeTrainerAttendanceSummary.half_day}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: PERFORMANCE */}
                {drawerTab === "performance" && (
                  <div className="space-y-4 animate-in fade-in duration-200 text-left">
                    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-[#FF6B00]">Coaching scoreboard</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Coached Members</p>
                          <p className="text-white mt-0.5 font-mono text-base font-bold">{activeTrainer.assigned_member_count} active clients</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Program Renewals</p>
                          <p className="text-white mt-0.5 font-mono text-base font-bold">88% Renewal rate</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Completed Programs</p>
                          <p className="text-white mt-0.5">34 PT clients completed</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Average Rating</p>
                          <p className="text-yellow-400 mt-0.5 flex items-center gap-1">4.9 ⭐ (45 votes)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Audit logs footer */}
              <AuditInfo createdAt={activeTrainer.joining_staff_date || todayStr} createdByName="Admin Gateway" />
            </div>
          )}

          <div className="border-t border-white/5 pt-4 mt-4">
            <Button
              onClick={() => setIsViewOpen(false)}
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider hover:bg-white/10 text-slate-300"
            >
              Close Profile Drawer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: ASSIGN PERSONAL TRAINER (PT)
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isAssignPTOpen} onOpenChange={setIsAssignPTOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-[#FF6B00]" /> Book PT Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Assign a gym member to {activeTrainer?.profile?.full_name}'s coaching roster
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Choose Member</Label>
              <select
                value={ptMemberId}
                onChange={(e) => setPtMemberId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none"
              >
                <option value="">Select a member...</option>
                {membersList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.profile?.full_name} ({m.profile?.phone || "No phone"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Duration</Label>
                <select
                  value={ptDuration}
                  onChange={(e) => setPtDuration(e.target.value as any)}
                  className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3"
                >
                  <option value="1 Month">1 Month (₹3,000)</option>
                  <option value="3 Months">3 Months (₹8,000)</option>
                  <option value="6 Months">6 Months (₹15,000)</option>
                  <option value="12 Months">12 Months (₹28,000)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Start Date</Label>
                <Input
                  type="date"
                  value={ptStartDate}
                  onChange={(e) => setPtStartDate(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Daily Time Slot</Label>
              <select
                value={ptTimeSlot}
                onChange={(e) => setPtTimeSlot(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none"
              >
                <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM</option>
                <option value="07:00 AM - 08:00 AM">07:00 AM - 08:00 AM</option>
                <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM</option>
                <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM</option>
                <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Special Notes</Label>
              <Textarea
                value={ptNotes}
                onChange={(e) => setPtNotes(e.target.value)}
                placeholder="Injuries, weight loss goals, special nutrition requirements..."
                className="min-h-16 border-white/5 bg-black/40 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsAssignPTOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignPTSubmit}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase"
            >
              Assign Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: TRANSFER CLIENTS
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isTransferPTOpen} onOpenChange={setIsTransferPTOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ArrowLeftRight size={14} className="text-[#FF6B00]" /> Transfer Coached Clients
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Re-allocate members to another trainer to free up schedule roster
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Select Coached Client</Label>
              <select
                value={transferClientId}
                onChange={(e) => setTransferClientId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none"
              >
                <option value="">Select a member...</option>
                {/* Only list members assigned to this old trainer */}
                {membersList
                  .filter((m) => m.assigned_trainer?.id === transferOldTrainerId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.profile?.full_name} ({m.profile?.phone || "No phone"})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Select New Trainer</Label>
              <select
                value={transferNewTrainerId}
                onChange={(e) => setTransferNewTrainerId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none"
              >
                <option value="">Select new trainer...</option>
                {trainers
                  .filter((t) => t.id !== transferOldTrainerId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.profile?.full_name} ({t.specialization || "General"})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsTransferPTOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleTransferPTSubmit}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase"
            >
              Execute Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: ADD CERTIFICATION
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-[#FF6B00]" /> Manage Certifications
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Add professional credentials and institutes expiry reminders
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Certificate Name</Label>
              <Input 
                value={certName} 
                onChange={(e) => setCertName(e.target.value)}
                placeholder="e.g. NASM Corrective Exercise Specialist"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase">Issuing Institute</Label>
              <Input 
                value={certInstitute} 
                onChange={(e) => setCertInstitute(e.target.value)}
                placeholder="e.g. National Academy of Sports Medicine"
                className="h-10 border-white/5 bg-black/40 rounded-xl text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Issue Date</Label>
                <Input 
                  type="date"
                  value={certIssueDate} 
                  onChange={(e) => setCertIssueDate(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 text-xs text-white rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Expiry Date</Label>
                <Input 
                  type="date"
                  value={certExpiryDate} 
                  onChange={(e) => setCertExpiryDate(e.target.value)}
                  className="h-10 border-white/5 bg-black/40 text-xs text-white rounded-xl"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleAddCert}
                className="h-9 px-4 bg-[#FF6B00] hover:bg-[#FF8020] text-white text-xs font-bold uppercase rounded-lg"
              >
                Add Certification
              </Button>
            </div>
          </div>

          <DialogFooter className="w-full">
            <Button
              type="button"
              onClick={() => setIsCertOpen(false)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase text-slate-300"
            >
              Done / Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────────────────
          DIALOG: BULK CHANGE SHIFT
      ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={isBulkShiftOpen} onOpenChange={setIsBulkShiftOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-[#FF6B00]" /> Bulk Shift Re-Assignment
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Batch allocate selected trainers to a new work schedule shift.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 text-left space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select New Shift</Label>
            <select
              value={bulkShiftVal}
              onChange={(e) => setBulkShiftVal(e.target.value)}
              className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none"
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

      {/* CONFIRM ARCHIVE */}
      <ArchiveConfirmDialog
        isOpen={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        onConfirm={handleConfirmArchive}
        loading={submitting}
        itemName={activeTrainer?.profile?.full_name}
      />

      {/* CONFIRM RESTORE */}
      <RestoreConfirmDialog
        isOpen={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        onConfirm={handleConfirmRestore}
        loading={submitting}
        itemName={activeTrainer?.profile?.full_name}
      />
    </div>
  );
}
