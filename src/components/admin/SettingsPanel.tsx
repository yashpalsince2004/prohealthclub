import React, { useState, useEffect } from "react";
import { 
  Settings, Shield, Landmark, Clock, Bell, Save, 
  Loader2, CheckCircle, Info 
} from "lucide-react";
import { api } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "general", label: "General", icon: Settings },
  { value: "finance", label: "Finance", icon: Landmark },
  { value: "hours", label: "Working Hours", icon: Clock },
  { value: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [settingsGrouped, setSettingsGrouped] = useState<Record<string, any[]>>({});
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, any[]>>("/api/v1/admin/settings/");
      setSettingsGrouped(res || {});
      
      // Initialize flat form values dictionary
      const flatValues: Record<string, string> = {};
      Object.values(res).forEach((list) => {
        list.forEach((item) => {
          flatValues[item.key] = item.value || "";
        });
      });
      setFormValues(flatValues);
    } catch (err: any) {
      toast.error(err.message || "Failed to load gym settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (key: string, val: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build patch items list
      const settingsPayload = Object.entries(formValues).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      await api.patch("/api/v1/admin/settings/", {
        settings: settingsPayload
      });

      toast.success("Gym configuration settings saved successfully!");
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 bg-white/5 animate-pulse rounded-lg w-1/3"></div>
        <div className="h-48 bg-white/5 animate-pulse rounded-xl w-full"></div>
      </div>
    );
  }

  const activeSettings = settingsGrouped[activeCategory] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar tabs */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 bg-[#121212] border border-white/5 p-3 rounded-3xl h-fit overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap md:w-full ${
                  activeCategory === cat.value 
                    ? "bg-[#FF6B00] text-white" 
                    : "text-slate-400 hover:text-white bg-transparent"
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Configuration settings form */}
        <form onSubmit={handleSave} className="flex-1 bg-[#121212] border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                {CATEGORIES.find(c => c.value === activeCategory)?.label} Configuration
              </h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Control system parameters and presets
              </p>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider px-4 flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Settings
            </Button>
          </div>

          <div className="space-y-5">
            {activeSettings.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No settings found in this category</p>
            ) : (
              activeSettings.map((item) => (
                <div key={item.key} className="space-y-2 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start gap-4">
                    <Label className="text-[11px] font-bold uppercase tracking-wide text-slate-200">
                      {item.label}
                    </Label>
                    <span className="text-[8px] font-mono text-slate-600 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      {item.key}
                    </span>
                  </div>
                  
                  {item.key.includes("description") || item.key.includes("address") ? (
                    <textarea
                      value={formValues[item.key] || ""}
                      onChange={(e) => handleInputChange(item.key, e.target.value)}
                      className="w-full min-h-16 border-white/5 bg-[#171717] rounded-xl text-xs text-white p-3 focus:outline-none focus:border-[#FF6B00]"
                    />
                  ) : (
                    <Input
                      value={formValues[item.key] || ""}
                      onChange={(e) => handleInputChange(item.key, e.target.value)}
                      className="h-10 border-white/5 bg-[#171717] rounded-xl text-xs text-white"
                    />
                  )}
                  
                  {item.description && (
                    <div className="flex items-start gap-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
                      <Info size={12} className="text-[#FF6B00] flex-shrink-0 mt-0.5" />
                      {item.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
