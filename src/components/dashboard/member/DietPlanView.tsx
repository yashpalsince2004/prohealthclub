import { useState, useEffect } from "react";
import { Apple, Sparkles, RefreshCw, Calendar } from "lucide-react";
import { api } from "../../../lib/api";
import { formatDate } from "../../../lib/format";
import type { DietPlanResponse } from "../../../lib/types";
import { Button } from "../../ui/button";

export default function DietPlanView() {
  const [plan, setPlan] = useState<DietPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DietPlanResponse>("/api/v1/diet-plans/active/me");
      setPlan(res);
    } catch (err: any) {
      if (err.status !== 404) {
        setError(err.message || "Failed to load active diet regimen");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const mealLabels: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack Sessions",
    pre_workout: "Pre-Workout Intake",
    post_workout: "Post-Workout Recovery",
  };

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5 text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Apple className="text-green-500" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Diet & Nutrition</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Active customized nutrition and macro diet plan
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
          Retrieving nutrition details...
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
          No diet plans assigned to you yet. Consult your gym nutritionist!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Macro Summary Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Daily Calories</span>
              <p className="text-base font-black text-[#FF7A00] mt-1">{plan.daily_calories || 0} kcal</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Protein Target</span>
              <p className="text-base font-black text-white mt-1">{plan.protein_grams || 0}g</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Carbs Target</span>
              <p className="text-base font-black text-white mt-1">{plan.carbs_grams || 0}g</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Fat Target</span>
              <p className="text-base font-black text-white mt-1">{plan.fat_grams || 0}g</p>
            </div>
          </div>

          {/* Meals group */}
          <div className="space-y-4">
            {Object.keys(plan.items_by_meal).length === 0 ? (
              <p className="text-xs text-slate-500 italic">No food items added to diet plan.</p>
            ) : (
              Object.entries(plan.items_by_meal).map(([mealKey, itemsList]) => (
                <div key={mealKey} className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-widest text-[#00C853] flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>{mealLabels[mealKey] || mealKey}</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3.5 border-l border-white/5">
                    {itemsList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{item.food_name}</p>
                          <p className="text-[9px] text-slate-500 mt-1 font-bold">
                            Portion: {item.quantity} {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block font-mono">
                            {item.calories ? `${item.calories} kcal` : "-"}
                          </span>
                          {item.notes && (
                            <span className="text-[9px] text-slate-500 block font-semibold mt-0.5 max-w-[120px] truncate">
                              {item.notes}
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
