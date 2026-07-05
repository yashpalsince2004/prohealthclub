import React, { useState, useEffect } from "react";
import { 
  Apple, Plus, Trash2, Save, Loader2, Info, Calendar, 
  ChevronRight, Calculator 
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { toast } from "sonner";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

export default function DietPlanBuilder() {
  const { user } = useAuth();
  const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [existingPlans, setExistingPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Editor states
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [activeMealTab, setActiveMealTab] = useState<string>("breakfast");

  // Diet target macros
  const [targetCalories, setTargetCalories] = useState("2000");
  const [targetProtein, setTargetProtein] = useState("150");
  const [targetCarbs, setTargetCarbs] = useState("200");
  const [targetFat, setTargetFat] = useState("70");

  // Meal items list grouped by meal type
  const [mealItems, setMealItems] = useState<Record<string, any[]>>({
    breakfast: [], lunch: [], dinner: [], snacks: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal / Temp states for new meal item being added to active tab
  const [tempFoodName, setTempFoodName] = useState("");
  const [tempQty, setTempQty] = useState("1");
  const [tempUnit, setTempUnit] = useState("serving");
  const [tempCalories, setTempCalories] = useState("200");
  const [tempProtein, setTempProtein] = useState("10");
  const [tempCarbs, setTempCarbs] = useState("20");
  const [tempFat, setTempFat] = useState("5");
  const [tempNotes, setTempNotes] = useState("");

  // Load assigned members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.trainer_id) return;
      setLoadingMembers(true);
      try {
        const res = await api.get<any>(`/api/v1/trainers/${user.trainer_id}`);
        setAssignedMembers(res.assigned_members || []);
        if (res.assigned_members && res.assigned_members.length > 0) {
          setSelectedMemberId(res.assigned_members[0].id);
        }
      } catch (err) {
        toast.error("Failed to load coaching roster");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [user?.trainer_id]);

  // Load existing plans for selected member
  const fetchPlans = async () => {
    if (!selectedMemberId || !user?.trainer_id) return;
    setLoadingPlans(true);
    try {
      const res = await api.get<any>(
        `/api/v1/diet-plans/?member_id=${selectedMemberId}&trainer_id=${user.trainer_id}`
      );
      setExistingPlans(res || []);
    } catch (err) {
      toast.error("Failed to load diet plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    setIsEditing(false);
    setEditingPlanId(null);
  }, [selectedMemberId]);

  const handleStartNewPlan = () => {
    setEditingPlanId(null);
    setPlanTitle("");
    setPlanDescription("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setTargetCalories("2000");
    setTargetProtein("150");
    setTargetCarbs("200");
    setTargetFat("70");
    setMealItems({
      breakfast: [], lunch: [], dinner: [], snacks: []
    });
    setActiveMealTab("breakfast");
    setIsEditing(true);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    setPlanTitle(plan.title);
    setPlanDescription(plan.description || "");
    setStartDate(plan.start_date || new Date().toISOString().split("T")[0]);
    setEndDate(plan.end_date || "");
    setTargetCalories(String(plan.daily_calories || 2000));
    setTargetProtein(String(plan.protein_grams || 150));
    setTargetCarbs(String(plan.carbs_grams || 200));
    setTargetFat(String(plan.fat_grams || 70));
    
    // Group meal items
    const grouped: Record<string, any[]> = {
      breakfast: [], lunch: [], dinner: [], snacks: []
    };
    if (plan.items) {
      plan.items.forEach((item: any) => {
        const type = item.meal_type.toLowerCase();
        if (grouped[type]) {
          grouped[type].push({
            food_name: item.food_name,
            quantity: item.quantity,
            unit: item.unit || "serving",
            calories: item.calories || 0,
            protein: item.protein_grams || 0,
            carbs: item.carbs_grams || 0,
            fat: item.fat_grams || 0,
            notes: item.notes || ""
          });
        }
      });
    }
    setMealItems(grouped);
    setActiveMealTab("breakfast");
    setIsEditing(true);
  };

  const handleAddMealItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempFoodName.trim()) {
      toast.error("Please enter food name");
      return;
    }

    const newItem = {
      food_name: tempFoodName,
      quantity: tempQty,
      unit: tempUnit,
      calories: parseInt(tempCalories) || 0,
      protein: parseInt(tempProtein) || 0,
      carbs: parseInt(tempCarbs) || 0,
      fat: parseInt(tempFat) || 0,
      notes: tempNotes,
    };

    setMealItems(prev => ({
      ...prev,
      [activeMealTab]: [...prev[activeMealTab], newItem]
    }));

    // Reset fields
    setTempFoodName("");
    setTempQty("1");
    setTempUnit("serving");
    setTempCalories("200");
    setTempProtein("10");
    setTempCarbs("20");
    setTempFat("5");
    setTempNotes("");

    toast.success("Meal item added to split!");
  };

  const handleRemoveMealItem = (idx: number) => {
    setMealItems(prev => {
      const copy = [...prev[activeMealTab]];
      copy.splice(idx, 1);
      return { ...prev, [activeMealTab]: copy };
    });
  };

  // Calculate totals of added meal items
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  Object.values(mealItems).forEach((list) => {
    list.forEach((item) => {
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.carbs += item.carbs;
      totals.fat += item.fat;
    });
  });

  const handleSavePlan = async () => {
    if (!planTitle.trim()) {
      toast.error("Please enter a plan title.");
      return;
    }
    if (!selectedMemberId) {
      toast.error("Please select a member first.");
      return;
    }

    setSubmitting(true);
    try {
      // Flatten meal items
      const flattenedItems: any[] = [];
      Object.entries(mealItems).forEach(([mealType, list]) => {
        list.forEach((item, idx) => {
          flattenedItems.push({
            meal_type: mealType,
            food_name: item.food_name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein_grams: item.protein,
            carbs_grams: item.carbs,
            fat_grams: item.fat,
            notes: item.notes,
            order_index: idx
          });
        });
      });

      const payload = {
        member_id: selectedMemberId,
        title: planTitle,
        description: planDescription,
        start_date: startDate,
        end_date: endDate || null,
        daily_calories: parseInt(targetCalories) || 2000,
        protein_grams: parseInt(targetProtein) || 150,
        carbs_grams: parseInt(targetCarbs) || 200,
        fat_grams: parseInt(targetFat) || 70,
        items: flattenedItems,
      };

      if (editingPlanId) {
        await api.patch(`/api/v1/diet-plans/${editingPlanId}`, payload);
        toast.success("Diet plan updated successfully!");
      } else {
        await api.post("/api/v1/diet-plans/", payload);
        toast.success("Diet plan created successfully!");
      }

      setIsEditing(false);
      setEditingPlanId(null);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || "Failed to save diet plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
      {/* LEFT PANEL: Member Selection & Existing Plans List */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Select Member</span>
            {loadingMembers ? (
              <div className="h-10 bg-white/5 animate-pulse rounded-xl w-full"></div>
            ) : assignedMembers.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No assigned members found</p>
            ) : (
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full h-11 bg-black border border-white/5 rounded-xl text-white text-xs px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                {assignedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.profile?.full_name || "Unknown Member"}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-white">Diet & Nutrition Plans</span>
            {!isEditing && (
              <Button
                onClick={handleStartNewPlan}
                className="h-8 rounded-lg bg-[#FF6B00] hover:bg-[#FF8020] text-white text-[10px] font-black uppercase tracking-wider px-2.5"
              >
                New Plan
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
            {loadingPlans ? (
              <div className="space-y-2">
                <div className="h-14 bg-white/5 animate-pulse rounded-xl"></div>
                <div className="h-14 bg-white/5 animate-pulse rounded-xl"></div>
              </div>
            ) : existingPlans.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No diet plans assigned</p>
            ) : (
              existingPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleEditPlan(plan)}
                  className={`p-3.5 border rounded-2xl cursor-pointer transition-colors text-left space-y-1.5 ${
                    editingPlanId === plan.id 
                      ? "bg-[#FF6B00]/10 border-[#FF6B00]/40" 
                      : "bg-[#171717]/60 border-white/5 hover:bg-[#171717]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white block">{plan.title}</span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      plan.is_active ? "bg-green-500/10 text-green-500" : "bg-white/5 text-slate-500"
                    }`}>
                      {plan.is_active ? "Active" : "Archived"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Target: {plan.daily_calories} kcal &bull; P:{plan.protein_grams}g C:{plan.carbs_grams}g F:{plan.fat_grams}g
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Diet Editor */}
      <div className="lg:col-span-8">
        {isEditing ? (
          <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {editingPlanId ? "Edit Nutrition Program" : "Prescribe New Diet Plan"}
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Configure meals, calorie thresholds, and macros
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider px-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePlan}
                  disabled={submitting}
                  className="h-9 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-[10px] uppercase tracking-wider px-3 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save Program
                </Button>
              </div>
            </div>

            {/* Macro Targets Settings */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B00] flex items-center gap-1">
                <Calculator size={12} />
                Daily Caloric & Macro Targets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Calories (kcal)</label>
                  <Input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Protein (g)</label>
                  <Input
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Carbs (g)</label>
                  <Input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Fats (g)</label>
                  <Input
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(e.target.value)}
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center font-bold"
                  />
                </div>
              </div>

              {/* Dynamic macro summary progress bar */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Current Program Totals vs Targets</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-bold text-slate-300">
                  <div className="bg-[#171717] p-2 rounded-xl border border-white/5">
                    Calories: {totals.calories} / {targetCalories} kcal
                  </div>
                  <div className="bg-[#171717] p-2 rounded-xl border border-white/5">
                    Protein: {totals.protein}g / {targetProtein}g
                  </div>
                  <div className="bg-[#171717] p-2 rounded-xl border border-white/5">
                    Carbs: {totals.carbs}g / {targetCarbs}g
                  </div>
                  <div className="bg-[#171717] p-2 rounded-xl border border-white/5">
                    Fat: {totals.fat}g / {targetFat}g
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Meta Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Program Title *</Label>
                <Input
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="e.g. Lean Bulking Nutrition"
                  className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 border-white/5 bg-black/40 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Program Description</Label>
              <Textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Water intake recommendations, cheat meal guidelines..."
                className="min-h-16 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>

            {/* Meal Tabs */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl overflow-x-auto scrollbar-none">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setActiveMealTab(t.value)}
                    className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                      activeMealTab === t.value 
                        ? "bg-[#FF6B00] text-white" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Add Meal Item Form */}
              <form onSubmit={handleAddMealItem} className="p-4 bg-black/30 border border-white/5 rounded-2xl space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                  Add Item to {activeMealTab}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Food Item Name *</label>
                    <Input
                      value={tempFoodName}
                      onChange={(e) => setTempFoodName(e.target.value)}
                      placeholder="e.g. Scrambled Egg Whites"
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-600 uppercase">Quantity</label>
                      <Input
                        value={tempQty}
                        onChange={(e) => setTempQty(e.target.value)}
                        placeholder="1"
                        className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-600 uppercase">Unit</label>
                      <Input
                        value={tempUnit}
                        onChange={(e) => setTempUnit(e.target.value)}
                        placeholder="serving"
                        className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Calories</label>
                    <Input
                      type="number"
                      value={tempCalories}
                      onChange={(e) => setTempCalories(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Protein (g)</label>
                    <Input
                      type="number"
                      value={tempProtein}
                      onChange={(e) => setTempProtein(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Carbs (g)</label>
                    <Input
                      type="number"
                      value={tempCarbs}
                      onChange={(e) => setTempCarbs(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 uppercase">Fats (g)</label>
                    <Input
                      type="number"
                      value={tempFat}
                      onChange={(e) => setTempFat(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Preparation notes, timing, or options..."
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white flex-1"
                  />
                  <Button
                    type="submit"
                    className="h-9 bg-[#FF6B00] hover:bg-[#FF8020] text-white px-4 rounded-xl font-bold text-xs"
                  >
                    Add
                  </Button>
                </div>
              </form>

              {/* Scheduled Meal Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Scheduled Meal Items ({mealItems[activeMealTab]?.length || 0})
                </span>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  {(!mealItems[activeMealTab] || mealItems[activeMealTab].length === 0) ? (
                    <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-xs italic">
                      No foods configured for this meal segment
                    </div>
                  ) : (
                    mealItems[activeMealTab].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-1">
                          <span className="text-xs font-bold text-white block">
                            {item.food_name} &bull; <span className="text-slate-400">{item.quantity} {item.unit}</span>
                          </span>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">{item.calories} kcal</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">P: {item.protein}g</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">C: {item.carbs}g</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">F: {item.fat}g</span>
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-slate-500 font-medium italic pt-1">{item.notes}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleRemoveMealItem(idx)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 p-0 hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#121212] border border-dashed border-white/5 p-12 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-500 mx-auto">
              <Apple size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">No Program Selected</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Select an existing diet split on the left or create a new nutrition split
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
