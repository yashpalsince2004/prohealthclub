import { useState, useEffect } from "react";
import { Dumbbell, Apple, Plus, Trash2, Save, Sparkles, AlertCircle, ArrowLeft, Search } from "lucide-react";
import { api } from "../../../lib/api";
import type { MemberResponse, MemberListResponse } from "../../../lib/types";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { toast } from "sonner";

interface WorkoutPlanBuilderProps {
  initialMemberId?: string;
  initialMemberName?: string;
  initialType?: "workout" | "diet";
  onCancel: () => void;
}

export default function WorkoutPlanBuilder({
  initialMemberId,
  initialMemberName,
  initialType = "workout",
  onCancel,
}: WorkoutPlanBuilderProps) {
  const [planType, setPlanType] = useState<"workout" | "diet">(initialType);
  const [memberId, setMemberId] = useState(initialMemberId || "");
  const [memberName, setMemberName] = useState(initialMemberName || "");

  // Member search states (if no initial member)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberResponse[]>([]);
  const [searching, setSearching] = useState(false);

  // Common Meta
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Workout specific
  const [exercises, setExercises] = useState<any[]>([
    { day_of_week: 1, exercise_name: "", sets: 3, reps: 10, duration_minutes: 0, rest_seconds: 60, notes: "", order_index: 0 },
  ]);

  // Diet specific
  const [dailyCalories, setDailyCalories] = useState("");
  const [proteinGrams, setProteinGrams] = useState("");
  const [carbsGrams, setCarbsGrams] = useState("");
  const [fatGrams, setFatGrams] = useState("");
  const [dietItems, setDietItems] = useState<any[]>([
    { meal_type: "breakfast", food_name: "", quantity: "1", unit: "servings", calories: 300, notes: "", order_index: 0 },
  ]);

  const handleSearchMembers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<MemberListResponse>(`/api/v1/members/?page=1&per_page=10&search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.members);
    } catch (err) {
      toast.error("Failed to query member directory");
    } finally {
      setSearching(false);
    }
  };

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      { day_of_week: 1, exercise_name: "", sets: 3, reps: 10, duration_minutes: 0, rest_seconds: 60, notes: "", order_index: prev.length },
    ]);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExerciseChange = (idx: number, field: string, val: any) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: val } : ex))
    );
  };

  const handleAddDietItem = () => {
    setDietItems((prev) => [
      ...prev,
      { meal_type: "breakfast", food_name: "", quantity: "1", unit: "servings", calories: 300, notes: "", order_index: prev.length },
    ]);
  };

  const handleRemoveDietItem = (idx: number) => {
    setDietItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDietItemChange = (idx: number, field: string, val: any) => {
    setDietItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) {
      toast.error("Please select a target member first");
      return;
    }
    if (!title) {
      toast.error("Please provide a plan title");
      return;
    }

    setSubmitting(true);
    try {
      if (planType === "workout") {
        // Validate exercises
        const invalid = exercises.some((ex) => !ex.exercise_name);
        if (invalid) {
          toast.error("All added exercises must have a name");
          setSubmitting(false);
          return;
        }

        const payload = {
          member_id: memberId,
          title,
          description: description || null,
          start_date: startDate,
          end_date: endDate || null,
          exercises: exercises.map((ex) => ({
            ...ex,
            sets: parseInt(ex.sets) || null,
            reps: parseInt(ex.reps) || null,
            duration_minutes: parseInt(ex.duration_minutes) || null,
            rest_seconds: parseInt(ex.rest_seconds) || null,
            notes: ex.notes || null,
          })),
        };

        await api.post("/api/v1/workout-plans/", payload);
        toast.success(`Workout split successfully assigned to ${memberName}`);
      } else {
        // Validate diet items
        const invalid = dietItems.some((item) => !item.food_name);
        if (invalid) {
          toast.error("All added meal items must have a food name");
          setSubmitting(false);
          return;
        }

        const payload = {
          member_id: memberId,
          title,
          description: description || null,
          daily_calories: parseInt(dailyCalories) || null,
          protein_grams: parseInt(proteinGrams) || null,
          carbs_grams: parseInt(carbsGrams) || null,
          fat_grams: parseInt(fatGrams) || null,
          start_date: startDate,
          end_date: endDate || null,
          items: dietItems.map((item) => ({
            ...item,
            calories: parseInt(item.calories) || null,
            notes: item.notes || null,
          })),
        };

        await api.post("/api/v1/diet-plans/", payload);
        toast.success(`Nutrition regimen successfully assigned to ${memberName}`);
      }

      onCancel();
    } catch (err: any) {
      toast.error(err.message || "Failed to prescribe program");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 text-white max-w-4xl mx-auto">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Program Designer</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Prescribe customized workouts and macros to member profiles
            </p>
          </div>
        </div>

        {/* Toggle Plan Type */}
        {!initialMemberId && (
          <div className="flex bg-[#111111] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setPlanType("workout")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                planType === "workout" ? "bg-[#FF7A00] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Dumbbell size={12} />
              <span>Workout Plan</span>
            </button>
            <button
              onClick={() => setPlanType("diet")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                planType === "diet" ? "bg-green-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Apple size={12} />
              <span>Diet Plan</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Member Selection & Basic Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Member Row */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Target Member</Label>
            {memberName ? (
              <div className="h-10 px-3 rounded-xl bg-[#1D1D1D] border border-white/5 flex items-center justify-between text-white text-xs font-bold">
                <span>{memberName}</span>
                {!initialMemberId && (
                  <button
                    type="button"
                    onClick={() => {
                      setMemberId("");
                      setMemberName("");
                    }}
                    className="text-primary hover:underline text-[10px]"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search member name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600"
                  />
                </div>
                <Button type="button" onClick={handleSearchMembers} className="bg-white/5 text-slate-300 hover:text-white rounded-xl">
                  Search
                </Button>
              </div>
            )}

            {/* Member search dropdown */}
            {!memberName && searchResults.length > 0 && (
              <div className="bg-[#1D1D1D] border border-white/5 rounded-xl p-2 space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setMemberId(m.id);
                      setMemberName(m.profile.full_name);
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg cursor-pointer text-xs font-semibold"
                  >
                    {m.profile.full_name} ({m.profile.email})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan Title */}
          <div className="space-y-1.5">
            <Label htmlFor="planTitle" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Plan Title
            </Label>
            <Input
              id="planTitle"
              placeholder={planType === "workout" ? "Hypertrophy Push Split" : "Lean Bulk Nutrition"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="planDesc" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Description
            </Label>
            <Input
              id="planDesc"
              placeholder="Focus area, guidelines, and training targets"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white placeholder:text-slate-600 focus-visible:ring-primary"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white"
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label htmlFor="endDate" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              End Date (Optional)
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 border-white/5 bg-[#1D1D1D] rounded-xl text-white"
            />
          </div>
        </div>

        {/* Step 2: Custom Parameters (Macro metrics for Diet) */}
        {planType === "diet" && (
          <div className="border border-white/5 p-4 rounded-xl bg-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Calories (kcal)</Label>
              <Input
                type="number"
                placeholder="2400"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(e.target.value)}
                className="h-9 border-white/5 bg-[#171717] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Protein (g)</Label>
              <Input
                type="number"
                placeholder="150"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(e.target.value)}
                className="h-9 border-white/5 bg-[#171717] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carbs (g)</Label>
              <Input
                type="number"
                placeholder="250"
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(e.target.value)}
                className="h-9 border-white/5 bg-[#171717] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fat (g)</Label>
              <Input
                type="number"
                placeholder="70"
                value={fatGrams}
                onChange={(e) => setFatGrams(e.target.value)}
                className="h-9 border-white/5 bg-[#171717] rounded-lg text-white"
              />
            </div>
          </div>
        )}

        {/* Step 3: Dynamic Item Rows */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {planType === "workout" ? "Exercise Prescription" : "Nutrition Meals"}
            </span>
            <Button
              type="button"
              onClick={planType === "workout" ? handleAddExercise : handleAddDietItem}
              size="sm"
              className="bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold rounded-lg flex items-center gap-1"
            >
              <Plus size={14} />
              <span>{planType === "workout" ? "Add Exercise" : "Add Meal Item"}</span>
            </Button>
          </div>

          <div className="space-y-3">
            {planType === "workout"
              ? exercises.map((ex, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-wrap gap-3 items-end">
                    {/* Day of Week */}
                    <div className="w-32 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Day</Label>
                      <Select
                        value={ex.day_of_week.toString()}
                        onValueChange={(val) => handleExerciseChange(idx, "day_of_week", parseInt(val))}
                      >
                        <SelectTrigger className="h-9 bg-[#171717] border-white/5 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1D1D1D] text-white border-white/5 rounded-lg">
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="7">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Exercise Name */}
                    <div className="flex-1 min-w-[150px] space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Exercise Name</Label>
                      <Input
                        placeholder="Incline Bench Press"
                        value={ex.exercise_name}
                        onChange={(e) => handleExerciseChange(idx, "exercise_name", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                        required
                      />
                    </div>

                    {/* Sets */}
                    <div className="w-16 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Sets</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, "sets", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Reps */}
                    <div className="w-16 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Reps</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, "reps", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Rest */}
                    <div className="w-20 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Rest (s)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={ex.rest_seconds}
                        onChange={(e) => handleExerciseChange(idx, "rest_seconds", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Notes */}
                    <div className="flex-1 min-w-[150px] space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Coaching Notes</Label>
                      <Input
                        placeholder="Tempos, focus squeezes, etc."
                        value={ex.notes}
                        onChange={(e) => handleExerciseChange(idx, "notes", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Remove */}
                    {exercises.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveExercise(idx)}
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))
              : dietItems.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-wrap gap-3 items-end">
                    {/* Meal Type */}
                    <div className="w-32 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Meal Session</Label>
                      <Select
                        value={item.meal_type}
                        onValueChange={(val) => handleDietItemChange(idx, "meal_type", val)}
                      >
                        <SelectTrigger className="h-9 bg-[#171717] border-white/5 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1D1D1D] text-white border-white/5 rounded-lg">
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                          <SelectItem value="pre_workout">Pre-Workout</SelectItem>
                          <SelectItem value="post_workout">Post-Workout</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Food Name */}
                    <div className="flex-1 min-w-[150px] space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Food / Drink Item</Label>
                      <Input
                        placeholder="Boiled eggs or Whey Protein"
                        value={item.food_name}
                        onChange={(e) => handleDietItemChange(idx, "food_name", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="w-20 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Qty</Label>
                      <Input
                        placeholder="100"
                        value={item.quantity}
                        onChange={(e) => handleDietItemChange(idx, "quantity", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Unit */}
                    <div className="w-20 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Unit</Label>
                      <Input
                        placeholder="grams"
                        value={item.unit}
                        onChange={(e) => handleDietItemChange(idx, "unit", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Calories */}
                    <div className="w-20 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Calories (kcal)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.calories}
                        onChange={(e) => handleDietItemChange(idx, "calories", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Notes */}
                    <div className="flex-1 min-w-[150px] space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-slate-500">Nutrient Notes</Label>
                      <Input
                        placeholder="Vitamins, low fat, water intake etc."
                        value={item.notes}
                        onChange={(e) => handleDietItemChange(idx, "notes", e.target.value)}
                        className="h-9 bg-[#171717] border-white/5 rounded-lg text-white"
                      />
                    </div>

                    {/* Remove */}
                    {dietItems.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveDietItem(idx)}
                        className="h-9 w-9 p-0 text-red-500 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))
            }
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            className="hover:bg-white/5 text-slate-400 hover:text-white rounded-xl"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center gap-1.5"
            disabled={submitting}
          >
            <Save size={16} />
            <span>{submitting ? "Prescribing..." : "Prescribe Program"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
