import React, { useState, useEffect, useMemo } from "react";
import { 
  User, Users, UserCheck, UserX, AlertTriangle, 
  UserPlus, Upload, Download, MapPin, Phone, Mail, Award, Activity,
  Calendar, DollarSign, Clock, ShieldAlert, RefreshCw, Clipboard, Trash, Edit, Check, Eye, Sliders
} from "lucide-react";
import { memberService, Member, sanitizePayload, MemberCreatePayload, MemberUpdatePayload } from "../../lib/memberService";
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
  const [submitting, setSubmitting] = useState(false);

  // Bulk dialog triggers
  const [isBulkTrainerOpen, setIsBulkTrainerOpen] = useState(false);
  const [isBulkPlanOpen, setIsBulkPlanOpen] = useState(false);
  const [bulkTrainerId, setBulkTrainerId] = useState("");
  const [bulkPlanId, setBulkPlanId] = useState("");

  // History / timeline details state
  const [membershipHistory, setMembershipHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Membership Control Sub-Modals
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(30);
  const [extendNotes, setExtendNotes] = useState("");

  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState("");
  const [renewStartFromExpiry, setRenewStartFromExpiry] = useState(true);
  const [renewNotes, setRenewNotes] = useState("");

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradePlanId, setUpgradePlanId] = useState("");
  const [upgradeNotes, setUpgradeNotes] = useState("");

  const [isFreezeConfirmOpen, setIsFreezeConfirmOpen] = useState(false);
  const [freezeNotes, setFreezeNotes] = useState("");

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState("");

  const [isTrainerAssignOpen, setIsTrainerAssignOpen] = useState(false);
  const [assignTrainerId, setAssignTrainerId] = useState("");

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

  useEffect(() => {
    if (!activeMember) return;
    const fetchMemberHistory = async () => {
      setLoadingHistory(true);
      try {
        const [membershipsRes, paymentsRes, attendanceRes] = await Promise.all([
          api.get<any>(`/api/v1/memberships/?member_id=${activeMember.id}`),
          api.get<any>(`/api/v1/payments/member/${activeMember.id}`),
          api.get<any>(`/api/v1/attendance/member/${activeMember.id}`)
        ]);
        setMembershipHistory(membershipsRes?.data?.memberships || membershipsRes?.memberships || membershipsRes?.data || []);
        setPaymentHistory(paymentsRes?.data || paymentsRes || []);
        const attData = attendanceRes?.data?.logs || attendanceRes?.logs || attendanceRes?.data || attendanceRes?.data?.data || [];
        setAttendanceHistory(Array.isArray(attData) ? attData : []);
      } catch (err) {
        console.error("Error loading member history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchMemberHistory();
  }, [activeMember]);

  // Prevent Radix UI from locking body clickability after dialogs/sheets close
  useEffect(() => {
    const unlock = () => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    };
    unlock();
    const timer = setTimeout(unlock, 100);
    const timer2 = setTimeout(unlock, 300);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [isCreateOpen, isEditOpen, isArchiveOpen, isRestoreOpen, isViewOpen]);

  // Columns definition mapping for DataTable
  const columns = useMemo(() => [
    {
      key: "avatar",
      header: "Avatar",
      render: (row: Member) => {
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
      render: (row: Member) => <span className="font-bold text-white">{row.profile?.full_name || "N/A"}</span>
    },
    {
      key: "phone",
      header: "Phone",
      render: (row: Member) => <span className="text-slate-400">{row.profile?.phone || "N/A"}</span>
    },
    {
      key: "email",
      header: "Email",
      render: (row: Member) => <span className="text-slate-400">{row.profile?.email || "N/A"}</span>
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
    { name: "occupation", label: "Occupation / Profession", type: "text", placeholder: "e.g. Software Engineer" },
    { name: "height", label: "Height (cm)", type: "number", placeholder: "e.g. 175" },
    { name: "weight", label: "Weight (kg)", type: "number", placeholder: "e.g. 70" },
    { name: "medical_notes", label: "Medical Notes / Health Conditions", type: "textarea", placeholder: "Injuries, chronic conditions, physical constraints..." },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", placeholder: "Contact Person" },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "phone", placeholder: "Phone Number" },
    { name: "emergency_relation", label: "Emergency Contact Relation", type: "text", placeholder: "e.g. Spouse, Parent" },
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
      options: trainers.map((t) => ({ label: `${t.profile?.full_name || "Trainer"} (${t.specialization || "General"})`, value: t.id }))
    },
    { name: "notes", label: "General Administrative Notes", type: "textarea", placeholder: "Health risks, dietary notes..." }
  ], [plans, trainers]);

  const editFields: FormFieldConfig[] = useMemo(() => [
    { name: "full_name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
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
    { name: "occupation", label: "Occupation / Profession", type: "text" },
    { name: "height", label: "Height (cm)", type: "number" },
    { name: "weight", label: "Weight (kg)", type: "number" },
    { name: "medical_notes", label: "Medical Notes / Health Conditions", type: "textarea" },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text" },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "phone" },
    { name: "emergency_relation", label: "Emergency Contact Relation", type: "text" },
    {
      name: "trainer_id",
      label: "Modify Trainer Assignment",
      type: "select",
      options: trainers.map((t) => ({ label: t.profile?.full_name || "Trainer", value: t.id }))
    },
    { name: "notes", label: "General Administrative Notes", type: "textarea" }
  ], [plans, trainers]);

  const filterConfigs = useMemo(() => [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active Subs", value: "active" },
        { label: "Expired Subs", value: "expired" },
        { label: "All Members", value: "all" }
      ]
    },
    {
      key: "gender",
      label: "Gender",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" }
      ]
    },
    {
      key: "plan_id",
      label: "Plan",
      options: plans.map((p) => ({ label: p.name, value: p.id }))
    },
    {
      key: "trainer_id",
      label: "Trainer",
      options: trainers.map((t) => ({ label: t.profile.full_name, value: t.id }))
    },
    {
      key: "is_active",
      label: "Portal Status",
      options: [
        { label: "Login Enabled", value: "true" },
        { label: "Login Disabled", value: "false" }
      ]
    }
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

    setSubmitting(true);
    try {
      const sanitized = sanitizePayload(data) as MemberCreatePayload;
      await memberService.createMember(sanitized);
      notify.success("New member added successfully");
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      if (err.code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
        err.details.forEach((detail: any) => {
          const rawField = detail.field || "";
          const cleanField = rawField.replace(/^body\s*->\s*/, "");
          if (cleanField === "height") {
            notify.error("Height must be a number.");
          } else if (cleanField === "weight") {
            notify.error("Weight must be a number.");
          } else if (cleanField === "gender") {
            notify.error("Gender must be Male, Female or Other.");
          } else if (cleanField === "date_of_birth") {
            notify.error("Date of birth is invalid.");
          } else {
            const fieldName = cleanField.charAt(0).toUpperCase() + cleanField.slice(1).replace(/_/g, " ");
            notify.error(`${fieldName}: ${detail.message}`);
          }
        });
      } else {
        notify.error(err?.message || "Failed to create new member record");
        setIsCreateOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data: any) => {
    if (!activeMember) return;
    setSubmitting(true);
    try {
      const sanitized = sanitizePayload(data) as MemberUpdatePayload;
      await memberService.updateMember(activeMember.id, sanitized);
      notify.success("Member record updated successfully");
      setIsEditOpen(false);
      
      // Update activeMember with updated profile data to refresh the drawer in place
      setActiveMember(prev => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          ...sanitized
        },
        notes: sanitized.notes || prev.notes
      } : null);

      loadData();
    } catch (err: any) {
      if (err.code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
        err.details.forEach((detail: any) => {
          const rawField = detail.field || "";
          const cleanField = rawField.replace(/^body\s*->\s*/, "");
          if (cleanField === "height") {
            notify.error("Height must be a number.");
          } else if (cleanField === "weight") {
            notify.error("Weight must be a number.");
          } else if (cleanField === "gender") {
            notify.error("Gender must be Male, Female or Other.");
          } else if (cleanField === "date_of_birth") {
            notify.error("Date of birth is invalid.");
          } else {
            const fieldName = cleanField.charAt(0).toUpperCase() + cleanField.slice(1).replace(/_/g, " ");
            notify.error(`${fieldName}: ${detail.message}`);
          }
        });
      } else {
        notify.error(err?.message || "Failed to edit member profile");
        setIsEditOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onArchiveConfirm = async () => {
    if (!activeMember) return;
    try {
      await memberService.archiveMember(activeMember.id);
      notify.success("Member archived successfully");
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to archive member account");
    } finally {
      setIsArchiveOpen(false);
      setIsViewOpen(false);
      setActiveMember(null);
    }
  };

  const onRestoreConfirm = async () => {
    if (!activeMember) return;
    try {
      await memberService.restoreMember(activeMember.id);
      notify.success("Member restored successfully");
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to restore member");
    } finally {
      setIsRestoreOpen(false);
      setIsViewOpen(false);
      setActiveMember(null);
    }
  };

  // Membership Actions
  const handleExtendSubmit = async () => {
    if (!activeMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.extendMembership(activeMember.active_membership.id, extendDays, extendNotes);
      notify.success("Membership extended successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to extend membership");
    } finally {
      setIsExtendOpen(false);
      setExtendNotes("");
    }
  };

  const handleRenewSubmit = async () => {
    if (!activeMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.renewMembership(activeMember.active_membership.id, {
        plan_id: renewPlanId,
        start_from_expiry: renewStartFromExpiry,
        notes: renewNotes
      });
      notify.success("Membership renewed successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to renew membership");
    } finally {
      setIsRenewOpen(false);
      setRenewNotes("");
    }
  };

  const handleUpgradeSubmit = async () => {
    if (!activeMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.upgradeMembership(activeMember.active_membership.id, upgradePlanId, upgradeNotes);
      notify.success("Plan changed successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to update membership plan");
    } finally {
      setIsUpgradeOpen(false);
      setUpgradeNotes("");
    }
  };

  const handleFreezeSubmit = async () => {
    if (!activeMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.freezeMembership(activeMember.active_membership.id, freezeNotes);
      notify.success("Membership frozen successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to freeze membership");
    } finally {
      setIsFreezeConfirmOpen(false);
      setFreezeNotes("");
    }
  };

  const handleUnfreezeSubmit = async () => {
    if (!activeMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.unfreezeMembership(activeMember.active_membership.id);
      notify.success("Membership resumed successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to resume membership");
    }
  };

  const handleCancelSubmit = async () => {
    if (!activeMember?.active_membership) {
      notify.error("Active membership not found");
      return;
    }
    try {
      await memberService.cancelMembership(activeMember.active_membership.id, cancelNotes);
      notify.success("Membership cancelled successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to cancel membership");
    } finally {
      setIsCancelConfirmOpen(false);
      setCancelNotes("");
    }
  };

  const handleAssignTrainerSubmit = async () => {
    if (!activeMember) return;
    try {
      await memberService.updateMember(activeMember.id, { trainer_id: assignTrainerId || undefined });
      notify.success("Trainer assignment updated successfully");
      loadData();
      // Reload active member
      const updated = await memberService.getMemberById(activeMember.id);
      setActiveMember(updated);
    } catch (err: any) {
      notify.error(err?.message || "Failed to update trainer assignment");
    } finally {
      setIsTrainerAssignOpen(false);
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
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk trainer allocation failed");
    } finally {
      setIsBulkTrainerOpen(false);
      setBulkTrainerId("");
      setSelectedIds([]);
    }
  };

  const handleBulkPlan = async () => {
    if (!bulkPlanId) return;
    try {
      await memberService.bulkChangePlan(selectedIds, bulkPlanId);
      notify.success("Plan updated for selected members successfully");
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Bulk plan assignment failed");
    } finally {
      setIsBulkPlanOpen(false);
      setBulkPlanId("");
      setSelectedIds([]);
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
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Error occurred during CSV upload parsing");
    } finally {
      setIsImportOpen(false);
      setCsvFile(null);
      setImportPreview([]);
    }
  };

  // Excel/CSV Export
  const handleExport = (format: "csv" | "excel") => {
    if (members.length === 0) return;
    const headers = ["Member ID", "Full Name", "Phone", "Email", "Plan", "Trainer", "Joining Date", "Status"];
    const rows = members.map((m) => [
      m.id,
      m.profile?.full_name || "N/A",
      m.profile?.phone || "N/A",
      m.profile?.email || "N/A",
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

  const rowActionsList = useMemo(() => {
    const list: {
      label: string;
      action: (member: Member) => void;
      className?: string;
    }[] = [
      { label: "Edit Profile", action: handleView }
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
                gender: "",
                plan_id: "",
                trainer_id: "",
                is_active: "",
                show_archived: false
              })}
            />
          </div>
          <Button
            onClick={() => handleExport("excel")}
            variant="outline"
            className="h-11 rounded-2xl border-white/5 bg-[#121212] hover:bg-[#171717] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-4 shadow-lg w-full md:w-auto shrink-0"
          >
            <Download size={14} />
            Export List
          </Button>
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
            <Button
              onClick={() => {
                const selectedMembers = members.filter((m) => selectedIds.includes(m.id));
                const headers = ["Member ID", "Full Name", "Phone", "Email", "Plan", "Trainer", "Joining Date", "Status"];
                const rows = selectedMembers.map((m) => [
                  m.id,
                  m.profile?.full_name || "N/A",
                  m.profile?.phone || "N/A",
                  m.profile?.email || "N/A",
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
                link.setAttribute("download", `Member_Export_Selected_${new Date().toISOString().split("T")[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                notify.success(`Exported ${selectedMembers.length} selected members as CSV`);
              }}
              className="h-8 px-3 rounded-xl bg-black border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white"
            >
              Export Selected
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

      {/* DRAWER: VIEW DETAILS */}
      <Sheet open={isViewOpen} onOpenChange={(open) => {
        setIsViewOpen(open);
        if (!open) {
          setActiveMember(null);
        }
      }}>
        <SheetContent className="w-full sm:max-w-2xl bg-[#090909] border-l border-white/5 text-white p-6 overflow-y-auto h-full flex flex-col justify-between">
          <SheetHeader className="text-left border-b border-white/5 pb-4">
            <SheetTitle className="text-white flex items-center gap-2">
              <Users className="text-[#FF6B00]" /> Member Profile Drawer
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              View all personal, membership, activity history, and coaching details.
            </SheetDescription>
          </SheetHeader>

          {activeMember && (
            <div className="flex-1 space-y-6 py-6 overflow-y-auto pr-1">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-[#121212] border border-white/5 p-4 rounded-3xl">
                <div className="w-16 h-16 rounded-full border-2 border-[#FF6B00]/40 bg-black/40 flex items-center justify-center text-lg font-black text-slate-400">
                  {activeMember.profile?.avatar_url ? (
                    <img src={activeMember.profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    activeMember.profile?.full_name ? activeMember.profile.full_name[0].toUpperCase() : "?"
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white">{activeMember.profile?.full_name || "N/A"}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Member ID: {activeMember.id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      activeMember.active_membership?.status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}>
                      {activeMember.active_membership?.status || "Inactive"}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      activeMember.is_active ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    }`}>
                      Portal: {activeMember.is_active ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions (Edit & Delete) */}
              <div className="flex items-center gap-3 bg-[#121212] border border-white/5 p-4 rounded-3xl">
                <Button
                  onClick={() => {
                    setIsEditOpen(true);
                  }}
                  className="flex-1 h-10 bg-black hover:bg-slate-900 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-200 rounded-xl flex items-center justify-center gap-1.5"
                >
                  ✏️ Edit Profile
                </Button>
                <Permission allowedRoles={["admin"]}>
                  <Button
                    onClick={() => {
                      setIsArchiveOpen(true);
                    }}
                    className="flex-1 h-10 bg-black hover:bg-slate-900 border border-red-500/20 text-xs font-bold uppercase tracking-wider text-red-500 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    🗑️ Delete Member
                  </Button>
                </Permission>
              </div>

              {/* Collapsible Tabs or Accordion sections */}
              <div className="space-y-4">
                
                {/* 1. PERSONAL INFORMATION */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <User size={14} /> Personal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Gender</p>
                      <p className="text-white capitalize mt-0.5">{activeMember.profile?.gender || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Date of Birth</p>
                      <p className="text-white mt-0.5">{activeMember.profile?.date_of_birth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Email Address</p>
                      <p className="text-white mt-0.5 truncate">{activeMember.profile?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Phone Number</p>
                      <p className="text-white mt-0.5">{activeMember.profile?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Occupation</p>
                      <p className="text-white mt-0.5 capitalize">{activeMember.profile?.occupation || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Height & Weight</p>
                      <p className="text-white mt-0.5">
                        {activeMember.profile?.height ? `${activeMember.profile.height} cm` : "N/A"} / {activeMember.profile?.weight ? `${activeMember.profile.weight} kg` : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 text-[10px] uppercase">Residential Address</p>
                      <p className="text-white mt-0.5">{activeMember.profile?.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* 2. EMERGENCY CONTACT & MEDICAL INFO */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Medical & Emergency Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Emergency Contact Name</p>
                      <p className="text-white mt-0.5">{activeMember.profile?.emergency_contact_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Emergency Relation & Phone</p>
                      <p className="text-white mt-0.5">
                        {activeMember.profile?.emergency_contact_phone || "N/A"}{" "}
                        {activeMember.profile?.emergency_relation && `(${activeMember.profile.emergency_relation})`}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500 text-[10px] uppercase font-bold text-red-400">Medical Notes / Constraints</p>
                      <p className="text-white mt-0.5 bg-black/40 border border-white/5 p-2 rounded-xl text-[11px] whitespace-pre-line">
                        {activeMember.profile?.medical_notes || "No reported medical conditions or physical constraints."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. MEMBERSHIP SUBSCRIPTION & CONTROLS */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <Award size={14} /> Membership Subscription
                  </h4>
                  {activeMember.active_membership ? (
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="grid grid-cols-2 gap-4 text-slate-300">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Current Plan</p>
                          <p className="text-[#FF6B00] font-black mt-0.5">{activeMember.active_membership.plan_name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Days Remaining</p>
                          <p className="text-white font-mono mt-0.5">{activeMember.active_membership.days_remaining} Days</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Valid Duration</p>
                          <p className="text-white mt-0.5">{activeMember.active_membership.start_date} to {activeMember.active_membership.end_date}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase">Auto Renew</p>
                          <p className="text-white mt-0.5">{activeMember.active_membership.auto_renew ? "Enabled" : "Disabled"}</p>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <Permission allowedRoles={["admin", "receptionist"]}>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                          <Button
                            onClick={() => {
                              setUpgradePlanId("");
                              setIsUpgradeOpen(true);
                            }}
                            className="h-8 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                          >
                            Change Plan
                          </Button>
                          <Button
                            onClick={() => setIsExtendOpen(true)}
                            className="h-8 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                          >
                            Extend
                          </Button>
                          <Button
                            onClick={() => {
                              setRenewPlanId("");
                              setIsRenewOpen(true);
                            }}
                            className="h-8 bg-black hover:bg-slate-900 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200 rounded-xl"
                          >
                            Renew Plan
                          </Button>
                          {activeMember.active_membership.status === "active" ? (
                            <Button
                              onClick={() => setIsFreezeConfirmOpen(true)}
                              className="h-8 bg-black hover:bg-slate-900 border border-[#F59E0B]/20 text-[10px] font-bold uppercase tracking-wider text-yellow-500 rounded-xl"
                            >
                              Freeze
                            </Button>
                          ) : activeMember.active_membership.status === "paused" ? (
                            <Button
                              onClick={handleUnfreezeSubmit}
                              className="h-8 bg-black hover:bg-slate-900 border border-green-500/20 text-[10px] font-bold uppercase tracking-wider text-green-500 rounded-xl"
                            >
                              Resume
                            </Button>
                          ) : null}
                          <Button
                            onClick={() => setIsCancelConfirmOpen(true)}
                            className="h-8 bg-black hover:bg-slate-900 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider text-red-500 rounded-xl col-span-2"
                          >
                            Cancel Subscription
                          </Button>
                        </div>
                      </Permission>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-500 italic">No active membership subscription found.</p>
                      <Permission allowedRoles={["admin", "receptionist"]}>
                        <Button
                          onClick={() => {
                            if (plans.length > 0) {
                              setRenewPlanId(plans[0].id);
                              setIsRenewOpen(true);
                            } else {
                              notify.error("No plans configured");
                            }
                          }}
                          className="mt-2 h-8 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-[10px] font-bold uppercase tracking-wider"
                        >
                          Subscribe Member
                        </Button>
                      </Permission>
                    </div>
                  )}
                </div>

                {/* 4. ASSIGNED FITNESS COACH */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Users size={14} /> Assigned Coach</span>
                    <Permission allowedRoles={["admin", "receptionist"]}>
                      <Button
                        onClick={() => {
                          setAssignTrainerId(activeMember.assigned_trainer?.id || "");
                          setIsTrainerAssignOpen(true);
                        }}
                        className="h-6 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase tracking-wider text-slate-300"
                      >
                        {activeMember.assigned_trainer ? "Change Trainer" : "Assign Trainer"}
                      </Button>
                    </Permission>
                  </h4>
                  {activeMember.assigned_trainer ? (
                    <div className="text-xs font-semibold text-slate-300">
                      <p className="text-white">{activeMember.assigned_trainer.full_name}</p>
                      <p className="text-[10px] text-slate-500">{activeMember.assigned_trainer.specialization || "General Coaching Specialist"}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No personal trainer assigned.</p>
                  )}
                </div>

                {/* 5. MEMBERSHIP TIMELINE HISTORY */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <Clock size={14} /> Membership Timeline
                  </h4>
                  {membershipHistory.length > 0 ? (
                    <div className="space-y-4 pl-2 border-l border-white/5 text-[11px] font-semibold text-slate-400">
                      {membershipHistory.map((m: any, index: number) => {
                        const isCurrent = activeMember.active_membership?.id === m.id;
                        return (
                          <div key={m.id || index} className="relative pl-4">
                            <div className={`absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full ${
                              isCurrent ? "bg-[#FF6B00]" : m.status === "active" ? "bg-green-500" : "bg-slate-700"
                            }`} />
                            <p className="text-white flex items-center gap-2">
                              {m.plan?.name || m.plan_name || "Membership Plan"}{" "}
                              {isCurrent && <span className="text-[8px] bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] px-1 py-0.5 rounded-md font-bold uppercase">Current</span>}
                            </p>
                            <p className="text-slate-500 text-[10px]">
                              {m.start_date} to {m.end_date} • <span className="capitalize">{m.status}</span>
                            </p>
                            {m.notes && <p className="text-[10px] text-slate-600 italic mt-0.5">Note: {m.notes}</p>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No membership subscription timeline records found.</p>
                  )}
                </div>

                {/* 6. PAYMENTS SUMMARY */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <DollarSign size={14} /> Payments History
                  </h4>
                  {paymentHistory.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {paymentHistory.map((p: any, index: number) => (
                        <div key={p.id || index} className="bg-black/40 border border-white/5 p-2.5 rounded-2xl flex justify-between items-center text-xs font-semibold">
                          <div>
                            <p className="text-white">₹{p.amount_paid} • <span className="capitalize text-slate-400">{p.payment_method}</span></p>
                            <p className="text-[10px] text-slate-500">{p.payment_date} • Ref: {p.transaction_reference || "N/A"}</p>
                          </div>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                            p.payment_status === "completed" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {p.payment_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No payment transactions registered.</p>
                  )}
                </div>

                {/* 7. ATTENDANCE HISTORY */}
                <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF6B00] border-b border-white/5 pb-2 flex items-center gap-1.5">
                    <Activity size={14} /> Attendance History (Recent Visit Logs)
                  </h4>
                  {attendanceHistory.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {attendanceHistory.slice(0, 10).map((a: any, index: number) => {
                        const checkInDate = new Date(a.check_in).toLocaleString();
                        const checkOutDate = a.check_out ? new Date(a.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "In Gym";
                        return (
                          <div key={a.id || index} className="bg-black/40 border border-white/5 p-2.5 rounded-2xl flex justify-between items-center text-xs font-semibold">
                            <div>
                              <p className="text-white">{checkInDate}</p>
                              <p className="text-[10px] text-slate-500">Source: <span className="capitalize">{a.source}</span> {a.duration_minutes && `• Duration: ${a.duration_minutes}m`}</p>
                            </div>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                              a.check_out ? "bg-slate-500/10 text-slate-400" : "bg-green-500/10 text-green-500"
                            }`}>
                              {a.check_out ? `Out ${checkOutDate}` : "Active"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No attendance scans or manual visit logs.</p>
                  )}
                </div>

                {/* 8. AUDIT INFO */}
                <AuditInfo createdAt={activeMember.joining_date} createdByName="Staff Account" />

              </div>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 mt-4">
            <Button
              onClick={() => setIsViewOpen(false)}
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider hover:bg-white/10"
            >
              Close Profile Drawer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* SUB-MODALS FOR MEMBERSHIP CONTROLS */}
      {/* 1. EXTEND MEMBERSHIP */}
      <Dialog open={isExtendOpen} onOpenChange={setIsExtendOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Calendar size={14} className="text-[#FF6B00]" /> Extend Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Extend the member's current active plan expiration date.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Number of Days</Label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
                min="1"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes / Reason</Label>
              <textarea
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
                placeholder="Reason for extension..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsExtendOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExtendSubmit}
              disabled={extendDays <= 0}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-45"
            >
              Extend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. RENEW MEMBERSHIP */}
      <Dialog open={isRenewOpen} onOpenChange={setIsRenewOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><RefreshCw size={14} className="text-[#FF6B00]" /> Renew Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Subscribe or extend membership with a chosen plan period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Renewal Plan</Label>
              <select
                value={renewPlanId}
                onChange={(e) => setRenewPlanId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                ))}
              </select>
            </div>
            {activeMember?.active_membership && (
              <div className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-xl">
                <span className="text-[11px] font-bold text-slate-400">Start from Expiry Date?</span>
                <input
                  type="checkbox"
                  checked={renewStartFromExpiry}
                  onChange={(e) => setRenewStartFromExpiry(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] cursor-pointer"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes / Comments</Label>
              <textarea
                value={renewNotes}
                onChange={(e) => setRenewNotes(e.target.value)}
                className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
                placeholder="Payment terms, special discounts..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsRenewOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRenewSubmit}
              disabled={!renewPlanId}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-45"
            >
              Renew
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. CHANGE / UPGRADE PLAN */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Sliders size={14} className="text-[#FF6B00]" /> Migrate/Change Plan</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Instantly cancel the current plan and switch to a new plan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select New Plan</Label>
              <select
                value={upgradePlanId}
                onChange={(e) => setUpgradePlanId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">Select Plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notes / Reason</Label>
              <textarea
                value={upgradeNotes}
                onChange={(e) => setUpgradeNotes(e.target.value)}
                className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
                placeholder="Reason for migration..."
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsUpgradeOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpgradeSubmit}
              disabled={!upgradePlanId}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-45"
            >
              Migrate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. FREEZE MEMBERSHIP */}
      <Dialog open={isFreezeConfirmOpen} onOpenChange={setIsFreezeConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Clock size={14} className="text-yellow-500" /> Pause / Freeze Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Are you sure you want to pause/freeze this membership?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-left space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pause Notes / Reason</Label>
            <textarea
              value={freezeNotes}
              onChange={(e) => setFreezeNotes(e.target.value)}
              className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
              placeholder="e.g., Medical leave, traveling..."
            />
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full mt-2">
            <Button
              type="button"
              onClick={() => setIsFreezeConfirmOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFreezeSubmit}
              className="h-10 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Freeze Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. CANCEL MEMBERSHIP */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Trash size={14} className="text-red-500" /> Cancel Membership</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              This will immediately deactivate and terminate the subscription. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-left space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Reason</Label>
            <textarea
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="w-full bg-[#171717] border border-white/5 rounded-xl text-xs text-white p-3 h-20 focus:outline-none focus:border-[#FF6B00] resize-none"
              placeholder="Reason for cancel..."
            />
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full mt-2">
            <Button
              type="button"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCancelSubmit}
              className="h-10 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. TRAINER ASSIGNMENT */}
      <Dialog open={isTrainerAssignOpen} onOpenChange={setIsTrainerAssignOpen}>
        <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5"><Users size={14} className="text-[#FF6B00]" /> Coach Allocation</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Assign or change the fitness coach for this member.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 text-left">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Fitness Coach</Label>
              <select
                value={assignTrainerId}
                onChange={(e) => setAssignTrainerId(e.target.value)}
                className="w-full h-10 bg-[#171717] border border-white/5 rounded-xl text-xs text-white px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">No Coach / Unassigned</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>{t.profile.full_name} ({t.specialization || "General"})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-3 w-full">
            <Button
              type="button"
              onClick={() => setIsTrainerAssignOpen(false)}
              className="h-10 bg-[#171717] border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignTrainerSubmit}
              className="h-10 bg-[#FF6B00] hover:bg-[#FF8020] text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Save
            </Button>
          </DialogFooter>
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
            loading={submitting}
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
              loading={submitting}
              defaultValues={{
                full_name: activeMember.profile?.full_name || "",
                email: activeMember.profile?.email || "",
                phone: activeMember.profile?.phone || "",
                date_of_birth: activeMember.profile?.date_of_birth || "",
                gender: activeMember.profile?.gender || "",
                address: activeMember.profile?.address || "",
                occupation: activeMember.profile?.occupation || "",
                height: activeMember.profile?.height || "",
                weight: activeMember.profile?.weight || "",
                medical_notes: activeMember.profile?.medical_notes || "",
                emergency_contact_name: activeMember.profile?.emergency_contact_name || "",
                emergency_contact_phone: activeMember.profile?.emergency_contact_phone || "",
                emergency_relation: activeMember.profile?.emergency_relation || "",
                trainer_id: activeMember.assigned_trainer?.id || "",
                notes: activeMember.notes || ""
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
        itemName={activeMember?.profile?.full_name}
      />

      <RestoreConfirmDialog
        isOpen={isRestoreOpen}
        onOpenChange={setIsRestoreOpen}
        onConfirm={onRestoreConfirm}
        itemName={activeMember?.profile?.full_name}
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
                  {t.profile?.full_name || "Trainer"} ({t.specialization || "General"})
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
