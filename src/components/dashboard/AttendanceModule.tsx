import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserCheck, 
  UserMinus, 
  Fingerprint, 
  Scan, 
  QrCode, 
  UserX, 
  Clock, 
  Calendar as CalendarIcon, 
  Save, 
  PlusCircle 
} from "lucide-react";
import { Member, BiometricEvent } from "./mockData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface AttendanceModuleProps {
  members: Member[];
  biometricEvents: BiometricEvent[];
  onManualCheckIn: (memberId: string, checkInTime: string) => void;
  onManualCheckOut: (memberId: string) => void;
}

export default function AttendanceModule({
  members,
  biometricEvents,
  onManualCheckIn,
  onManualCheckOut
}: AttendanceModuleProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [attendanceType, setAttendanceType] = useState<"checkin" | "checkout">("checkin");
  const [reason, setReason] = useState("");

  const checkedInCount = members.filter(m => m.attendanceToday).length;
  const totalCount = members.length;
  const absentCount = totalCount - checkedInCount;

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error("Please select a member first.");
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    if (attendanceType === "checkin") {
      if (member.attendanceToday) {
        toast.warning(`${member.name} is already checked in today!`);
        return;
      }
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      onManualCheckIn(selectedMemberId, timeStr);
      toast.success(`${member.name} checked in successfully at ${timeStr}!`);
    } else {
      if (!member.attendanceToday) {
        toast.warning(`${member.name} is not checked in today.`);
        return;
      }
      onManualCheckOut(selectedMemberId);
      toast.success(`${member.name} checked out successfully!`);
    }

    setSelectedMemberId("");
    setReason("");
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Roster</span>
            <p className="text-3xl font-black text-white">{totalCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inside Gym</span>
            <p className="text-3xl font-black text-[#00C853]">{checkedInCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#00C853]/10 flex items-center justify-center text-[#00C853]">
            <Scan size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Absent</span>
            <p className="text-3xl font-black text-[#FF5252]">{absentCount}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#FF5252]/10 flex items-center justify-center text-[#FF5252]">
            <UserX size={22} />
          </div>
        </div>

        <div className="bg-[#171717] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Late Arrivals</span>
            <p className="text-3xl font-black text-amber-500">2</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock size={22} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Manual check-in log controls */}
        <div className="lg:col-span-4 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Manual Gate Override</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit Log Action</p>
          </div>

          <form onSubmit={handleAttendanceSubmit} className="space-y-4 py-2">
            {/* Member Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Member</label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                  <SelectValue placeholder="Choose athlete account" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.id}) {m.attendanceToday ? "• Inside" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-In / Check-Out Toggle */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Type</label>
              <Select value={attendanceType} onValueChange={(val: any) => setAttendanceType(val)}>
                <SelectTrigger className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl">
                  <SelectValue placeholder="Select Action" />
                </SelectTrigger>
                <SelectContent className="bg-[#1D1D1D] border-white/5 text-white rounded-xl">
                  <SelectItem value="checkin">Check-In Member</SelectItem>
                  <SelectItem value="checkout">Check-Out Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason / Override Note</label>
              <Input
                placeholder="e.g. Card misplaced, late arrival approval"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-11 border-white/5 bg-[#1D1D1D] text-white rounded-xl placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-white/10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#FF7A00] hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg hover:shadow-primary/10 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>Override Gate</span>
            </Button>
          </form>

          <div className="border-t border-white/5 pt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
            Overrides are monitored and logged
          </div>
        </div>

        {/* Right Column: Real-time Biometric Terminal Logs */}
        <div className="lg:col-span-8 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Biometric Event Timeline</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded border border-[#00C853]/25 animate-pulse">
              Live Feed Active
            </span>
          </div>

          <div className="bg-[#1D1D1D] border border-white/5 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Terminal Location</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input Method</TableHead>
                  <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {biometricEvents.map((evt) => (
                  <TableRow key={evt.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <TableCell className="text-xs font-bold text-slate-400">{evt.timestamp}</TableCell>
                    <TableCell className="text-xs font-black text-white">{evt.memberName}</TableCell>
                    <TableCell className="text-xs text-slate-300 font-medium">{evt.deviceName}</TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                        {evt.type === "Face" ? <Scan size={12} className="text-blue-500" /> :
                         evt.type === "Fingerprint" ? <Fingerprint size={12} className="text-[#FF7A00]" /> :
                         evt.type === "QR" ? <QrCode size={12} className="text-emerald-500" /> :
                         <PlusCircle size={12} className="text-amber-500" />}
                        {evt.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        evt.status === "Success" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#FF5252]/10 text-[#FF5252]"
                      }`}>
                        {evt.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
