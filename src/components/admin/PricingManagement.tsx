import React, { useState, useEffect, useMemo } from "react";
import { 
  CreditCard, Shield, Key, Sparkles, Plus, Edit, Trash, Check, AlertTriangle, 
  Search, Sliders, DollarSign, ListFilter, RefreshCw
} from "lucide-react";
import { pricingService } from "../../lib/pricingService";
import { PlanResponse, PTPlan, LockerPlan, AdditionalService } from "../../lib/types";
import { notify } from "../../lib/notify";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import Permission from "../common/Permission";
import StatCard from "./crud/StatCard";
import DataTable from "./crud/DataTable";
import CrudForm, { FormFieldConfig } from "./crud/CrudForm";
import { formatINR } from "../../lib/format";

type ActiveTab = "membership" | "pt" | "locker" | "service";

export default function PricingManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("membership");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Data lists
  const [membershipPlans, setMembershipPlans] = useState<PlanResponse[]>([]);
  const [ptPlans, setPtPlans] = useState<PTPlan[]>([]);
  const [lockerPlans, setLockerPlans] = useState<LockerPlan[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);

  // Dialog / Edit states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "membership") {
        const data = await pricingService.getMembershipPlans({ active_only: false });
        setMembershipPlans(data);
      } else if (activeTab === "pt") {
        const data = await pricingService.getPTPlans({ active_only: false });
        setPtPlans(data);
      } else if (activeTab === "locker") {
        const data = await pricingService.getLockerPlans({ active_only: false });
        setLockerPlans(data);
      } else if (activeTab === "service") {
        const data = await pricingService.getAdditionalServices({ active_only: false });
        setAdditionalServices(data);
      }
    } catch (err: any) {
      notify.error(err?.message || "Failed to load pricing configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      membershipCount: membershipPlans.length,
      activeMemberships: membershipPlans.filter(p => p.is_active).length,
      ptCount: ptPlans.length,
      activePts: ptPlans.filter(p => p.is_active).length,
      serviceCount: additionalServices.length,
      activeServices: additionalServices.filter(s => s.is_active).length
    };
  }, [membershipPlans, ptPlans, additionalServices]);

  // Handle Add Item Form Submit
  const onAddSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (activeTab === "membership") {
        // Convert comma-separated string to array
        const featuresArray = typeof data.features === "string" 
          ? data.features.split(",").map((f: string) => f.trim()).filter(Boolean)
          : [];
        await pricingService.createMembershipPlan({ ...data, features: featuresArray });
      } else if (activeTab === "pt") {
        await pricingService.createPTPlan(data);
      } else if (activeTab === "locker") {
        await pricingService.createLockerPlan(data);
      } else if (activeTab === "service") {
        await pricingService.createAdditionalService(data);
      }
      notify.success("New pricing template added successfully");
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to create pricing template");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Item Form Submit
  const onEditSubmit = async (data: any) => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      if (activeTab === "membership") {
        const featuresArray = typeof data.features === "string" 
          ? data.features.split(",").map((f: string) => f.trim()).filter(Boolean)
          : Array.isArray(data.features) ? data.features : [];
        await pricingService.updateMembershipPlan(activeItem.id, { ...data, features: featuresArray });
      } else if (activeTab === "pt") {
        await pricingService.updatePTPlan(activeItem.id, data);
      } else if (activeTab === "locker") {
        await pricingService.updateLockerPlan(activeItem.id, data);
      } else if (activeTab === "service") {
        await pricingService.updateAdditionalService(activeItem.id, data);
      }
      notify.success("Pricing template updated successfully");
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to update pricing template");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete/Archive Confirmed
  const onDeleteConfirm = async () => {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      if (activeTab === "membership") {
        await pricingService.deleteMembershipPlan(activeItem.id);
      } else if (activeTab === "pt") {
        await pricingService.deletePTPlan(activeItem.id);
      } else if (activeTab === "locker") {
        await pricingService.deleteLockerPlan(activeItem.id);
      } else if (activeTab === "service") {
        await pricingService.deleteAdditionalService(activeItem.id);
      }
      notify.success("Pricing template deleted successfully");
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err?.message || "Failed to archive pricing template");
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns Configurations
  const membershipColumns = [
    {
      key: "name",
      header: "Plan Name",
      render: (row: PlanResponse) => (
        <div>
          <span className="font-bold text-white block">{row.name}</span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold">{row.category || "General"}</span>
        </div>
      )
    },
    {
      key: "duration_days",
      header: "Duration",
      render: (row: PlanResponse) => (
        <span className="text-slate-300 font-medium">
          {row.duration_days === 30 ? "1 Month" : row.duration_days === 90 ? "3 Months" : row.duration_days === 180 ? "6 Months" : row.duration_days === 365 ? "1 Year" : `${row.duration_days} Days`}
        </span>
      )
    },
    {
      key: "price",
      header: "Base Price",
      render: (row: PlanResponse) => <span className="text-[#00C853] font-bold">{formatINR(row.price)}</span>
    },
    {
      key: "admission_fee",
      header: "Admission Fee",
      render: (row: PlanResponse) => <span className="text-slate-300">{formatINR(row.admission_fee)}</span>
    },
    {
      key: "tax",
      header: "GST Tax %",
      render: (row: PlanResponse) => <span className="text-slate-400 font-mono">{row.tax}%</span>
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: PlanResponse) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
          row.is_active 
            ? "bg-green-500/10 text-green-500 border-green-500/20" 
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: PlanResponse) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsEditOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <Edit size={12} />
          </Button>
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10"
          >
            <Trash size={12} />
          </Button>
        </div>
      )
    }
  ];

  const ptColumns = [
    {
      key: "package_name",
      header: "Package Name",
      render: (row: PTPlan) => <span className="font-bold text-white block">{row.package_name}</span>
    },
    {
      key: "price",
      header: "Monthly Price",
      render: (row: PTPlan) => <span className="text-[#00C853] font-bold">{formatINR(row.price)}</span>
    },
    {
      key: "session_count",
      header: "Sessions",
      render: (row: PTPlan) => <span className="text-slate-300 font-bold">{row.session_count} Sessions</span>
    },
    {
      key: "features",
      header: "Included Inclusions",
      render: (row: PTPlan) => {
        const inclusions = [];
        if (row.diet_included) inclusions.push("Diet");
        if (row.stretching_included) inclusions.push("Stretching");
        if (row.supplement_guidance) inclusions.push("Supplements");
        if (row.whatsapp_support) inclusions.push("WhatsApp");
        if (row.locker_included) inclusions.push("Locker");
        if (row.transformation_included) inclusions.push("Transformation");
        return (
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block max-w-xs truncate">
            {inclusions.join(" • ") || "None"}
          </span>
        );
      }
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: PTPlan) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
          row.is_active 
            ? "bg-green-500/10 text-green-500 border-green-500/20" 
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: PTPlan) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsEditOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <Edit size={12} />
          </Button>
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10"
          >
            <Trash size={12} />
          </Button>
        </div>
      )
    }
  ];

  const lockerColumns = [
    {
      key: "name",
      header: "Locker Config",
      render: (row: LockerPlan) => <span className="font-bold text-white block">{row.name}</span>
    },
    {
      key: "deposit",
      header: "Security Deposit",
      render: (row: LockerPlan) => <span className="text-slate-300">{formatINR(row.deposit)}</span>
    },
    {
      key: "monthly_rent",
      header: "Monthly Rent",
      render: (row: LockerPlan) => <span className="text-[#00C853] font-bold">{formatINR(row.monthly_rent)}</span>
    },
    {
      key: "quarterly_rent",
      header: "Quarterly Rent (3m)",
      render: (row: LockerPlan) => <span className="text-[#00C853] font-bold">{formatINR(row.quarterly_rent)}</span>
    },
    {
      key: "refundable",
      header: "Refundable",
      render: (row: LockerPlan) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.refundable ? "bg-blue-500/10 text-blue-500" : "bg-slate-500/10 text-slate-400"}`}>
          {row.refundable ? "Refundable" : "Non-Refundable"}
        </span>
      )
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: LockerPlan) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
          row.is_active 
            ? "bg-green-500/10 text-green-500 border-green-500/20" 
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: LockerPlan) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsEditOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <Edit size={12} />
          </Button>
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10"
          >
            <Trash size={12} />
          </Button>
        </div>
      )
    }
  ];

  const serviceColumns = [
    {
      key: "name",
      header: "Service Name",
      render: (row: AdditionalService) => <span className="font-bold text-white block">{row.name}</span>
    },
    {
      key: "price",
      header: "Service Price",
      render: (row: AdditionalService) => <span className="text-[#00C853] font-bold">{formatINR(row.price)}</span>
    },
    {
      key: "description",
      header: "Description",
      render: (row: AdditionalService) => <span className="text-slate-400 text-xs">{row.description || "No description"}</span>
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: AdditionalService) => (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
          row.is_active 
            ? "bg-green-500/10 text-green-500 border-green-500/20" 
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: AdditionalService) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsEditOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <Edit size={12} />
          </Button>
          <Button
            onClick={() => {
              setActiveItem(row);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10"
          >
            <Trash size={12} />
          </Button>
        </div>
      )
    }
  ];

  // Forms config
  const membershipFields: FormFieldConfig[] = [
    { name: "name", label: "Plan Name", type: "text", required: true, placeholder: "e.g. Cardio + CrossFit (3 Months)" },
    { 
      name: "category", 
      label: "Category Category", 
      type: "select", 
      required: true,
      options: [
        { label: "CrossFit + Weight Training", value: "CrossFit + Weight Training" },
        { label: "Only Cardio", value: "Only Cardio" },
        { label: "Cardio + CrossFit + Weight Training", value: "Cardio + CrossFit + Weight Training" }
      ]
    },
    { 
      name: "duration_days", 
      label: "Duration", 
      type: "select", 
      required: true,
      options: [
        { label: "1 Month (30 Days)", value: 30 },
        { label: "3 Months (90 Days)", value: 90 },
        { label: "6 Months (180 Days)", value: 180 },
        { label: "1 Year (365 Days)", value: 365 }
      ]
    },
    { name: "price", label: "Plan Base Price (₹)", type: "number", required: true, placeholder: "e.g. 3500" },
    { name: "admission_fee", label: "Admission Fee (₹)", type: "number", required: true, placeholder: "e.g. 200" },
    { name: "tax", label: "GST Tax %", type: "number", required: true, placeholder: "e.g. 18" },
    { name: "color", label: "Display Color (Hex)", type: "text", placeholder: "e.g. #FF6B00" },
    { name: "display_order", label: "Display Order", type: "number", placeholder: "0" },
    { name: "is_active", label: "Visible / Active", type: "checkbox" },
    { name: "features", label: "Plan Benefits (comma-separated list)", type: "textarea", placeholder: "e.g. CrossFit Access, Cardio Zone, Free BMI Analysis" }
  ];

  const ptFields: FormFieldConfig[] = [
    { name: "package_name", label: "Package Name", type: "text", required: true, placeholder: "e.g. Silver, Gold, Platinum" },
    { name: "price", label: "Monthly Base Price (₹)", type: "number", required: true, placeholder: "e.g. 4000" },
    { name: "session_count", label: "Included Sessions Count", type: "number", required: true, placeholder: "e.g. 12" },
    { name: "whatsapp_support", label: "WhatsApp Support Included", type: "checkbox" },
    { name: "locker_included", label: "Locker Included", type: "checkbox" },
    { name: "transformation_included", label: "Transformation Plan Included", type: "checkbox" },
    { name: "diet_included", label: "Diet Plan Included", type: "checkbox" },
    { name: "stretching_included", label: "Regular Stretching Included", type: "checkbox" },
    { name: "supplement_guidance", label: "Supplement Guidance Included", type: "checkbox" },
    { name: "description", label: "Package Description", type: "textarea", placeholder: "Certified Personal Trainer..." },
    { name: "is_active", label: "Active", type: "checkbox" }
  ];

  const lockerFields: FormFieldConfig[] = [
    { name: "name", label: "Locker Plan Name", type: "text", required: true, placeholder: "e.g. Standard Locker" },
    { name: "deposit", label: "Security Deposit (₹)", type: "number", required: true, placeholder: "e.g. 500" },
    { name: "monthly_rent", label: "Monthly Rent (₹)", type: "number", required: true, placeholder: "e.g. 250" },
    { name: "quarterly_rent", label: "Quarterly Rent (₹)", type: "number", required: true, placeholder: "e.g. 600" },
    { name: "late_fee", label: "Late Return Fee (₹)", type: "number", placeholder: "0" },
    { name: "refundable", label: "Deposit Refundable", type: "checkbox" },
    { name: "is_active", label: "Active", type: "checkbox" }
  ];

  const serviceFields: FormFieldConfig[] = [
    { name: "name", label: "Service Name", type: "text", required: true, placeholder: "e.g. Body Massage" },
    { name: "price", label: "Service Fee (₹)", type: "number", required: true, placeholder: "e.g. 500" },
    { name: "description", label: "Service Details", type: "textarea", placeholder: "Relaxing full body session..." },
    { name: "is_active", label: "Active", type: "checkbox" }
  ];

  // Filters computed list
  const filteredData = useMemo(() => {
    if (activeTab === "membership") {
      return membershipPlans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    } else if (activeTab === "pt") {
      return ptPlans.filter(p => p.package_name.toLowerCase().includes(search.toLowerCase()));
    } else if (activeTab === "locker") {
      return lockerPlans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    } else {
      return additionalServices.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    }
  }, [search, activeTab, membershipPlans, ptPlans, lockerPlans, additionalServices]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Membership Categories"
          value={stats.membershipCount}
          subtext={`${stats.activeMemberships} Active plans`}
          icon={CreditCard}
          color="text-orange-500"
          bg="bg-orange-500/10"
        />
        <StatCard
          title="PT Roster Packages"
          value={stats.ptCount}
          subtext={`${stats.activePts} Active packages`}
          icon={Shield}
          color="text-yellow-500"
          bg="bg-yellow-500/10"
        />
        <StatCard
          title="Locker Pricing configs"
          value={lockerPlans.length}
          subtext="Configured deposits & rents"
          icon={Key}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          title="Services Master count"
          value={stats.serviceCount}
          subtext={`${stats.activeServices} Active services`}
          icon={Sparkles}
          color="text-purple-500"
          bg="bg-purple-500/10"
        />
      </div>

      {/* Main Panel Controls */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: "membership", label: "Membership Plans", icon: CreditCard },
              { id: "pt", label: "Personal Training", icon: Shield },
              { id: "locker", label: "Locker Configs", icon: Key },
              { id: "service", label: "Services Master", icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSearch("");
                  setActiveTab(tab.id as ActiveTab);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-[#FF7A00] text-black shadow-lg" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <Permission allowedRoles={["admin"]}>
            <Button
              onClick={() => {
                setActiveItem(null);
                setIsAddOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-500/10"
            >
              <Plus size={16} />
              Add Template
            </Button>
          </Permission>
        </div>

        {/* Toolbar & Search */}
        <div className="flex items-center gap-3 bg-black/30 border border-white/5 p-3 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${activeTab === "membership" ? "Membership Plans" : activeTab === "pt" ? "PT Packages" : activeTab === "locker" ? "Locker plans" : "Services"}...`}
              className="w-full bg-[#171717] border border-white/5 pl-10 pr-4 py-2 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
            />
          </div>
          <Button
            onClick={loadData}
            className="h-9 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl px-3 border border-white/5"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Dynamic Data Table */}
        <div className="border border-white/5 rounded-3xl bg-black/20 overflow-hidden">
          <DataTable
            data={filteredData}
            columns={
              activeTab === "membership" 
                ? membershipColumns 
                : activeTab === "pt" 
                ? ptColumns 
                : activeTab === "locker" 
                ? lockerColumns 
                : serviceColumns
            }
            loading={loading}
          />
        </div>
      </div>

      {/* DIALOG 1: ADD TEMPLATE */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Add {activeTab === "membership" ? "Membership Plan" : activeTab === "pt" ? "PT Package" : activeTab === "locker" ? "Locker Plan" : "Service"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Create a new master template to be offered in registrations and subscriptions.
            </DialogDescription>
          </DialogHeader>

          <CrudForm
            fields={
              activeTab === "membership" 
                ? membershipFields 
                : activeTab === "pt" 
                ? ptFields 
                : activeTab === "locker" 
                ? lockerFields 
                : serviceFields
            }
            onSubmit={onAddSubmit}
            submitLabel="Create Template"
            loading={submitting}
            defaultValues={{
              is_active: true,
              refundable: true,
              late_fee: 0,
              display_order: 0,
              tax: 18,
              admission_fee: 200,
              color: activeTab === "membership" ? "#FF6B00" : undefined
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: EDIT TEMPLATE */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl bg-[#121212] border border-white/5 text-white rounded-3xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">
              Edit {activeTab === "membership" ? "Membership Plan" : activeTab === "pt" ? "PT Package" : activeTab === "locker" ? "Locker Plan" : "Service"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold">
              Update pricing, options, or descriptions for this template.
            </DialogDescription>
          </DialogHeader>

          {activeItem && (
            <CrudForm
              fields={
                activeTab === "membership" 
                  ? membershipFields 
                  : activeTab === "pt" 
                  ? ptFields 
                  : activeTab === "locker" 
                  ? lockerFields 
                  : serviceFields
              }
              onSubmit={onEditSubmit}
              submitLabel="Save Changes"
              loading={submitting}
              defaultValues={{
                ...activeItem,
                features: Array.isArray(activeItem.features) ? activeItem.features.join(", ") : activeItem.features
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: DELETE CONFIRM */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-sm font-black uppercase tracking-wider">Confirm Archiving</DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold leading-relaxed">
              Are you sure you want to delete/archive this pricing template? Existing subscribers will remain unaffected, but new registrations will not be able to choose this plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button
              onClick={() => setIsDeleteOpen(false)}
              className="h-10 bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase text-xs tracking-wider rounded-xl border border-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={onDeleteConfirm}
              disabled={submitting}
              className="h-10 bg-red-500 hover:bg-red-600 text-white font-bold uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-red-500/10"
            >
              {submitting ? "Archiving..." : "Archive Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
