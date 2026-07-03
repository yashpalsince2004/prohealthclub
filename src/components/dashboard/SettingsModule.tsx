import { useState } from "react";
import { Save, Shield, Clock, Landmark, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

export default function SettingsModule() {
  const [gymName, setGymName] = useState("Prro Health Cllub");
  const [taxPercent, setTaxPercent] = useState("18");
  const [hours, setHours] = useState({
    weekday: "06:00 AM - 10:00 PM",
    saturday: "07:00 AM - 09:00 PM",
    sunday: "08:00 AM - 01:00 PM"
  });

  const [plans, setPlans] = useState([
    { name: "Starter Pack Monthly", duration: "1 Month", price: 1500, active: true },
    { name: "3-Month Gold Plan", duration: "3 Months", price: 4500, active: true },
    { name: "Annual Platinum Plan", duration: "12 Months", price: 18000, active: true }
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-white">System Settings</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure gym operations and policies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Forms */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSave} className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Landmark size={14} className="text-primary" />
              <span>Business Settings</span>
            </h3>

            {/* Gym Name */}
            <div className="space-y-1.5">
              <Label htmlFor="set-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gym Branch Name</Label>
              <Input
                id="set-name"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl focus-visible:ring-primary focus-visible:border-white/10"
              />
            </div>

            {/* GST Tax settings */}
            <div className="space-y-1.5">
              <Label htmlFor="set-tax" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Service Tax (GST %)</Label>
              <Input
                id="set-tax"
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl focus-visible:ring-primary focus-visible:border-white/10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Save size={16} />
              <span>Save Configurations</span>
            </Button>
          </form>

          {/* Operating hours */}
          <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <span>Operational Business Hours</span>
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Weekdays (Mon-Fri)</span>
                <span className="text-white font-mono">{hours.weekday}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Saturdays</span>
                <span className="text-white font-mono">{hours.saturday}</span>
              </div>
              <div className="flex justify-between">
                <span>Sundays</span>
                <span className="text-white font-mono">{hours.sunday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Membership Plan management */}
        <div className="lg:col-span-6 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <span>Active Membership Plans</span>
              </h3>
              <button
                onClick={() => {
                  const name = prompt("Enter new plan name:");
                  const price = prompt("Enter plan price (₹):");
                  const duration = prompt("Enter plan duration (e.g. 6 Months):");
                  if (name && price && duration) {
                    setPlans(prev => [
                      ...prev,
                      { name, price: parseFloat(price) || 0, duration, active: true }
                    ]);
                    toast.success("New plan configured!");
                  }
                }}
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                + Add Plan
              </button>
            </div>

            <div className="bg-[#1D1D1D] border border-white/5 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((p, idx) => (
                    <TableRow key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <TableCell className="text-xs font-bold text-white">{p.name}</TableCell>
                      <TableCell className="text-xs text-slate-400">{p.duration}</TableCell>
                      <TableCell className="text-xs font-bold text-white text-right">₹{p.price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
            <Shield size={12} className="text-primary" />
            <span>Authorized Operations Admin Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
