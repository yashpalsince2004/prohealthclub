import { useState, useEffect } from "react";
import { Dumbbell, Calendar, RefreshCw } from "lucide-react";
import { api } from "../../../lib/api";
import { formatDate } from "../../../lib/format";
import type { WorkoutPlanResponse } from "../../../lib/types";
import { Button } from "../../ui/button";

export default function WorkoutPlanView() {
  const [plan, setPlan] = useState<WorkoutPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WorkoutPlanResponse>("/api/v1/workout-plans/active/me");
      setPlan(res);
    } catch (err: any) {
      // 404 is a clean state indicating no plan is assigned
      if (err.status !== 404) {
        setError(err.message || "Failed to load active workout split");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const daysMapping: Record<string, string> = {
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
    "7": "Sunday",
  };

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5 text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="text-primary" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Workout Prescriptions</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Active customized gym workout split and repetitions
            </p>
          </div>
        </div>
        <Button
          onClick={fetchPlan}
          size="sm"
          className="bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg gap-1.5"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-slate-500 font-semibold animate-pulse">
          Retrieving active workout split...
        </div>
      ) : error ? (
        <div className="text-center py-8 text-xs text-red-400">
          <p>{error}</p>
          <button onClick={fetchPlan} className="mt-2 text-orange-400 hover:underline">
            Try again
          </button>
        </div>
      ) : !plan ? (
        <div className="text-center py-12 text-xs text-slate-500 font-semibold border border-dashed border-white/5 rounded-xl">
          No workout plans assigned to you yet. Consult your gym trainer!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metadata Block */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h4 className="text-sm font-black text-white">{plan.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Coach: {plan.trainer_name || "Club General Trainer"}
              </p>
            </div>
            <div className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Assigned: {formatDate(plan.start_date)}
            </div>
          </div>

          {/* Daily list split */}
          <div className="space-y-4">
            {Object.keys(plan.exercises_by_day).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No exercises added to split.</p>
            ) : (
              Object.entries(plan.exercises_by_day).map(([dayKey, exercisesList]) => (
                <div key={dayKey} className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-widest text-[#FF7A00] flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{daysMapping[dayKey] || `Day ${dayKey}`}</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3.5 border-l border-white/5">
                    {exercisesList.map((ex) => (
                      <div
                        key={ex.id}
                        className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{ex.exercise_name}</p>
                          {ex.notes && (
                            <p className="text-[9px] text-slate-400 mt-1">{ex.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block font-mono">
                            {ex.sets} sets × {ex.reps} reps
                          </span>
                          {ex.rest_seconds && (
                            <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                              Rest: {ex.rest_seconds}s
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
