import { useState, useEffect } from "react";
import { Users, Eye, Sparkles, Dumbbell, Apple, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import type { TrainerResponse, MemberResponse, WorkoutPlanResponse, DietPlanResponse } from "../../../lib/types";
import { Button } from "../../ui/button";
import { toast } from "sonner";

interface AssignedMembersProps {
  onSelectMemberForPlan: (memberId: string, memberName: string, planType: "workout" | "diet") => void;
}

export default function AssignedMembers({ onSelectMemberForPlan }: AssignedMembersProps) {
  const { user } = useAuth();
  const [trainerDetails, setTrainerDetails] = useState<TrainerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Nested member plans state
  const [memberPlans, setMemberPlans] = useState<Record<string, { workout?: WorkoutPlanResponse; diet?: DietPlanResponse }>>({});
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});

  const fetchTrainerRoster = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Get all trainers to find the one matching the current user profile
      const trainersList = await api.get<{ trainers: TrainerResponse[] }>("/api/v1/trainers/");
      const matched = trainersList.trainers.find((t) => t.profile.id === user.profile?.id);

      if (!matched) {
        toast.error("Trainer record not found in system roster");
        return;
      }

      // 2. Load complete details for this specific trainer (includes assigned_members)
      const details = await api.get<TrainerResponse>(`/api/v1/trainers/${matched.id}`);
      setTrainerDetails(details);
    } catch (err) {
      console.error("Failed to load trainer roster", err);
      toast.error("Failed to retrieve assigned coaching roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerRoster();
  }, [user]);

  const loadMemberPlans = async (memberId: string) => {
    setLoadingPlans((prev) => ({ ...prev, [memberId]: true }));
    try {
      const [workout, diet] = await Promise.allSettled([
        api.get<WorkoutPlanResponse>(`/api/v1/workout-plans/member/${memberId}`),
        api.get<DietPlanResponse>(`/api/v1/diet-plans/member/${memberId}`),
      ]);

      setMemberPlans((prev) => ({
        ...prev,
        [memberId]: {
          workout: workout.status === "fulfilled" ? workout.value : undefined,
          diet: diet.status === "fulfilled" ? diet.value : undefined,
        },
      }));
    } catch (err) {
      console.error("Failed to load plans for member", memberId, err);
    } finally {
      setLoadingPlans((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const toggleExpand = (memberId: string) => {
    if (expandedMemberId === memberId) {
      setExpandedMemberId(null);
    } else {
      setExpandedMemberId(memberId);
      if (!memberPlans[memberId]) {
        loadMemberPlans(memberId);
      }
    }
  };

  const members = trainerDetails?.assigned_members || [];

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">My Active Clients</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Assigned coaching roster and customized fitness programs
            </p>
          </div>
        </div>
        <Button
          onClick={fetchTrainerRoster}
          size="sm"
          className="bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg gap-1.5"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-500 font-semibold animate-pulse">
            Loading assigned roster list...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 font-semibold border border-dashed border-white/5 rounded-xl">
            No members assigned to your roster yet.
          </div>
        ) : (
          members.map((member) => {
            const isExpanded = expandedMemberId === member.id;
            const plans = memberPlans[member.id];
            const isLoadingP = loadingPlans[member.id];

            return (
              <div
                key={member.id}
                className="border border-white/5 rounded-xl bg-white/5 overflow-hidden transition-all"
              >
                {/* Header Summary */}
                <div
                  onClick={() => toggleExpand(member.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-[#FF7A00]/20 flex items-center justify-center text-primary font-black rounded-lg text-xs">
                      {member.profile.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {member.profile.full_name}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-none mt-1 font-mono">
                        {member.profile.phone || "No phone"} | {member.profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-bold bg-[#00C853]/10 text-[#00C853] px-2 py-0.5 rounded border border-[#00C853]/10 uppercase">
                      Coaching
                    </span>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-[#121212] p-4 space-y-4">
                    {isLoadingP ? (
                      <div className="text-center py-4 text-xs text-slate-500 font-semibold animate-pulse">
                        Retrieving active program parameters...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Workout Plan Section */}
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <Dumbbell size={12} className="text-primary" />
                              <span>Workout splits</span>
                            </span>
                            {plans?.workout && (
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                Active
                              </span>
                            )}
                          </div>
                          {plans?.workout ? (
                            <div className="space-y-1 text-xs">
                              <p className="font-bold text-white">{plans.workout.name}</p>
                              <p className="text-[10px] text-slate-400">{plans.workout.exercises?.length || 0} exercises assigned</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-500 italic">No active workout plan assigned.</p>
                              <Button
                                onClick={() => onSelectMemberForPlan(member.id, member.profile.full_name, "workout")}
                                className="w-full h-8 text-[9px] font-bold bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg flex items-center justify-center gap-1"
                              >
                                <Sparkles size={10} />
                                <span>Create Workout Plan</span>
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Diet Plan Section */}
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <Apple size={12} className="text-green-500" />
                              <span>Diet nutrition</span>
                            </span>
                            {plans?.diet && (
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                Active
                              </span>
                            )}
                          </div>
                          {plans?.diet ? (
                            <div className="space-y-1 text-xs">
                              <p className="font-bold text-white">{plans.diet.name}</p>
                              <p className="text-[10px] text-slate-400">{plans.diet.meals?.length || 0} meals scheduled</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-[10px] text-slate-500 italic">No active diet plan assigned.</p>
                              <Button
                                onClick={() => onSelectMemberForPlan(member.id, member.profile.full_name, "diet")}
                                className="w-full h-8 text-[9px] font-bold bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white rounded-lg flex items-center justify-center gap-1"
                              >
                                <Sparkles size={10} />
                                <span>Create Diet Plan</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
