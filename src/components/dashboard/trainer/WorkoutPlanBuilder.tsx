import React, { useState, useEffect } from "react";
import { 
  Dumbbell, Plus, Trash2, Save, Search, X, Calendar, 
  ChevronRight, Sparkles, Check, Info, Loader2 
} from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

export default function WorkoutPlanBuilder() {
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
  const [activeDay, setActiveDay] = useState<number>(1);
  const [exercisesByDay, setExercisesByDay] = useState<Record<number, any[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Exercise Picker Modal states
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string>("");
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Pre-fill fields for selected exercise to add
  const [selectedLibraryExercise, setSelectedLibraryExercise] = useState<any>(null);
  const [exerciseSets, setExerciseSets] = useState("3");
  const [exerciseReps, setExerciseReps] = useState("10");
  const [exerciseRest, setExerciseRest] = useState("60");
  const [exerciseNotes, setExerciseNotes] = useState("");

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
        `/api/v1/workout-plans/?member_id=${selectedMemberId}&trainer_id=${user.trainer_id}`
      );
      setExistingPlans(res || []);
    } catch (err) {
      toast.error("Failed to load workout plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    setIsEditing(false);
    setEditingPlanId(null);
  }, [selectedMemberId]);

  // Load exercise library
  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      let url = "/api/v1/exercise-library/?page=1&per_page=100";
      if (exerciseQuery) url += `&search=${encodeURIComponent(exerciseQuery)}`;
      if (muscleFilter) url += `&muscle_group=${muscleFilter}`;
      const res = await api.get<any>(url);
      setExerciseLibrary(res.exercises || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (isPickerOpen) {
      fetchLibrary();
    }
  }, [isPickerOpen, exerciseQuery, muscleFilter]);

  const handleStartNewPlan = () => {
    setEditingPlanId(null);
    setPlanTitle("");
    setPlanDescription("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setExercisesByDay({
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    });
    setActiveDay(1);
    setIsEditing(true);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    setPlanTitle(plan.title);
    setPlanDescription(plan.description || "");
    setStartDate(plan.start_date || new Date().toISOString().split("T")[0]);
    setEndDate(plan.end_date || "");
    
    // Group exercises by day
    const grouped: Record<number, any[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    };
    if (plan.exercises) {
      plan.exercises.forEach((ex: any) => {
        if (grouped[ex.day_of_week]) {
          grouped[ex.day_of_week].push({
            name: ex.exercise_name,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            rest_seconds: ex.rest_seconds || 60,
            notes: ex.notes || "",
          });
        }
      });
    }
    setExercisesByDay(grouped);
    setActiveDay(1);
    setIsEditing(true);
  };

  const handleAddExerciseClick = () => {
    setSelectedLibraryExercise(null);
    setExerciseSets("3");
    setExerciseReps("10");
    setExerciseRest("60");
    setExerciseNotes("");
    setIsPickerOpen(true);
  };

  const handleSelectExerciseFromLib = (ex: any) => {
    setSelectedLibraryExercise(ex);
    setExerciseSets(String(ex.default_sets || 3));
    setExerciseReps(String(ex.default_reps || 10));
    setExerciseRest(String(ex.default_rest_seconds || 60));
    setExerciseNotes(ex.description || "");
  };

  const handleConfirmAddExercise = () => {
    if (!selectedLibraryExercise) return;
    
    const newEx = {
      name: selectedLibraryExercise.name,
      sets: parseInt(exerciseSets) || 3,
      reps: parseInt(exerciseReps) || 10,
      rest_seconds: parseInt(exerciseRest) || 60,
      notes: exerciseNotes,
    };

    setExercisesByDay(prev => ({
      ...prev,
      [activeDay]: [...prev[activeDay], newEx]
    }));

    setIsPickerOpen(false);
    toast.success(`${selectedLibraryExercise.name} added to day.`);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercisesByDay(prev => {
      const copy = [...prev[activeDay]];
      copy.splice(idx, 1);
      return { ...prev, [activeDay]: copy };
    });
  };

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
      // Flatten exercises
      const flattenedExercises: any[] = [];
      Object.entries(exercisesByDay).forEach(([day, exList]) => {
        const dayNum = parseInt(day);
        exList.forEach((ex, idx) => {
          flattenedExercises.push({
            day_of_week: dayNum,
            exercise_name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
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
        exercises: flattenedExercises,
      };

      if (editingPlanId) {
        await api.patch(`/api/v1/workout-plans/${editingPlanId}`, payload);
        toast.success("Workout plan updated successfully!");
      } else {
        await api.post("/api/v1/workout-plans/", payload);
        toast.success("Workout plan created successfully!");
      }

      setIsEditing(false);
      setEditingPlanId(null);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || "Failed to save workout plan");
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
            <span className="text-xs font-black uppercase tracking-wider text-white">Workout Programs</span>
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
              <p className="text-xs text-slate-500 italic text-center py-4">No workout plans assigned</p>
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
                    Duration: {plan.start_date} to {plan.end_date || "Continuous"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Workout Editor */}
      <div className="lg:col-span-8">
        {isEditing ? (
          <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {editingPlanId ? "Edit Workout Program" : "Prescribe New Workout"}
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Configure training routines, targets, and sets
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

            {/* Plan Meta Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Program Title *</Label>
                <Input
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="e.g. 5-Day Hypertrophy Split"
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
                placeholder="Details of splits, progressive overload scheme, or instructions..."
                className="min-h-16 border-white/5 bg-black/40 rounded-xl text-white"
              />
            </div>

            {/* Day of Week Tabs */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl overflow-x-auto scrollbar-none">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setActiveDay(d.value)}
                    className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold transition-all ${
                      activeDay === d.value 
                        ? "bg-[#FF6B00] text-white" 
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Exercises List for Active Day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Day Schedule Exercises ({exercisesByDay[activeDay]?.length || 0})
                  </span>
                  <Button
                    onClick={handleAddExerciseClick}
                    className="h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-wider px-2.5 flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  {(!exercisesByDay[activeDay] || exercisesByDay[activeDay].length === 0) ? (
                    <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-xs italic">
                      Rest Day / No exercises scheduled
                    </div>
                  ) : (
                    exercisesByDay[activeDay].map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-black/30 border border-white/5 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-1">
                          <span className="text-xs font-bold text-white block">{ex.name}</span>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">{ex.sets} Sets</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">{ex.reps} Reps</span>
                            <span className="bg-white/5 px-2 py-0.5 rounded-md">{ex.rest_seconds}s Rest</span>
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-slate-500 font-medium italic pt-1">{ex.notes}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleRemoveExercise(idx)}
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
              <Dumbbell size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">No Program Selected</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Select an existing workout split on the left or create a new routine
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EXERCISE PICKER DIALOG */}
      <Dialog open={isPickerOpen} onOpenChange={() => setIsPickerOpen(false)}>
        <DialogContent className="max-w-md bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black uppercase tracking-wider text-[#FF6B00]">
              Add Exercise to Split
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Search standard exercise library configurations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                value={exerciseQuery}
                onChange={(e) => setExerciseQuery(e.target.value)}
                placeholder="Search Bench Press, Squats..."
                className="h-10 border-white/5 bg-[#171717] rounded-xl text-white"
              />
              <select
                value={muscleFilter}
                onChange={(e) => setMuscleFilter(e.target.value)}
                className="h-10 bg-[#171717] border border-white/5 rounded-xl text-white text-xs px-2 focus:outline-none"
              >
                <option value="">All Muscles</option>
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="shoulders">Shoulders</option>
                <option value="biceps">Biceps</option>
                <option value="triceps">Triceps</option>
                <option value="legs">Legs</option>
                <option value="glutes">Glutes</option>
                <option value="core">Core</option>
                <option value="cardio">Cardio</option>
                <option value="full_body">Full Body</option>
              </select>
            </div>

            {/* Results selection list */}
            {!selectedLibraryExercise ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-white/5 rounded-2xl bg-black/20 p-2">
                {loadingLibrary ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">Querying database...</p>
                ) : exerciseLibrary.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No exercises found</p>
                ) : (
                  exerciseLibrary.map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => handleSelectExerciseFromLib(ex)}
                      className="p-2 bg-[#171717] hover:bg-[#1f1f1f] rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-bold text-white">{ex.name}</span>
                      <span className="text-[8px] bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        {ex.muscle_group}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Selected Exercise parameters overrides
              <div className="space-y-4 bg-black/40 border border-white/5 p-4 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-white block">{selectedLibraryExercise.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Target: {selectedLibraryExercise.muscle_group}</span>
                  </div>
                  <Button
                    onClick={() => setSelectedLibraryExercise(null)}
                    className="h-6 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-2 text-[9px]"
                  >
                    Change
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Sets</label>
                    <Input
                      type="number"
                      value={exerciseSets}
                      onChange={(e) => setExerciseSets(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Reps</label>
                    <Input
                      type="number"
                      value={exerciseReps}
                      onChange={(e) => setExerciseReps(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Rest (s)</label>
                    <Input
                      type="number"
                      value={exerciseRest}
                      onChange={(e) => setExerciseRest(e.target.value)}
                      className="h-9 border-white/5 bg-[#171717] rounded-xl text-white text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Instructions / Notes</label>
                  <Input
                    value={exerciseNotes}
                    onChange={(e) => setExerciseNotes(e.target.value)}
                    placeholder="Tempo, equipment parameters, weight guidelines..."
                    className="h-9 border-white/5 bg-[#171717] rounded-xl text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddExercise}
              disabled={!selectedLibraryExercise}
              className="bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold h-10 rounded-xl"
            >
              Add to Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
