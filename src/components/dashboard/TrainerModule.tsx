import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  Star, 
  Eye, 
  Calendar as CalendarIcon, 
  Award,
  ArrowLeft,
  CalendarCheck
} from "lucide-react";
import { Trainer, Member } from "./mockData";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { toast } from "sonner";

interface TrainerModuleProps {
  trainers: Trainer[];
  members: Member[];
  onToggleTrainerStatus: (id: string) => void;
}

export default function TrainerModule({
  trainers,
  members,
  onToggleTrainerStatus
}: TrainerModuleProps) {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);

  // PT Schedule Mock Data
  const ptSessions = [
    { id: "S-1", time: "07:00 AM", clientName: "Amit Patel", trainerName: "Vikram Malhotra", type: "Strength Conditioning", status: "Completed" },
    { id: "S-2", time: "08:30 AM", clientName: "Priya Sharma", trainerName: "Ananya Sharma", type: "Functional Core", status: "Completed" },
    { id: "S-3", time: "11:00 AM", clientName: "Karan Johar", trainerName: "Vikram Malhotra", type: "Rehab Stretch", status: "Cancelled" },
    { id: "S-4", time: "05:00 PM", clientName: "Deepak Malhotra", trainerName: "Rohan Das", type: "Powerlifting Heavy", status: "Upcoming" },
    { id: "S-5", time: "06:30 PM", clientName: "Amit Patel", trainerName: "Vikram Malhotra", type: "Hypertrophy Push", status: "Upcoming" }
  ];

  const handleTrainerClick = (id: string) => {
    setSelectedTrainerId(id);
  };

  const selectedTrainer = trainers.find(t => t.id === selectedTrainerId);
  const trainerClients = selectedTrainer 
    ? members.filter(m => m.assignedTrainerId === selectedTrainer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            {selectedTrainer ? `${selectedTrainer.name} Profile` : "Trainer Control Center"}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {selectedTrainer ? "Trainer Performance and client list" : "Manage and schedule certified instructors"}
          </p>
        </div>

        {selectedTrainer && (
          <button
            onClick={() => setSelectedTrainerId(null)}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white border border-white/5 bg-[#171717] hover:bg-white/5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Instructors</span>
          </button>
        )}
      </div>

      {!selectedTrainer ? (
        <div className="space-y-8">
          {/* Trainer Grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in duration-200">
            {trainers.map(t => (
              <div 
                key={t.id} 
                className="bg-[#171717] border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4 hover:border-primary/25 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="h-12 w-12 object-cover rounded-xl border border-white/5"
                    />
                    <div>
                      <h4 className="text-xs font-black text-white">{t.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">{t.id}</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400">{t.specialization}</p>

                  <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-2 text-left">
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Experience</span>
                      <p className="text-xs font-bold text-white mt-0.5">{t.experience}</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Today's Sessions</span>
                      <p className="text-xs font-bold text-white mt-0.5">{t.todaySessions} slots</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Clients</span>
                      <p className="text-xs font-bold text-white mt-0.5">{t.assignedMembers} members</p>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Trainer Rating</span>
                      <p className="text-xs font-bold text-[#FFC107] mt-0.5 flex items-center gap-0.5">
                        <Star size={10} className="fill-[#FFC107]" />
                        <span>{t.rating}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTrainerClick(t.id)}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 border border-white/5"
                  >
                    <Eye size={12} />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      onToggleTrainerStatus(t.id);
                      toast.info(`Trainer status updated to ${t.status === "Active" ? "Inactive" : "Active"}`);
                    }}
                    className={`px-3 py-2 rounded-xl border transition-all ${
                      t.status === "Active" 
                        ? "bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853] hover:bg-[#00C853]/25" 
                        : "bg-[#FF5252]/10 border-[#FF5252]/20 text-[#FF5252] hover:bg-[#FF5252]/25"
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">{t.status}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PT Sessions Timeline */}
          <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CalendarCheck size={14} className="text-primary" />
                <span>Today's Personal Training Schedule</span>
              </h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                PT Timeline
              </span>
            </div>

            <div className="bg-[#1D1D1D] border border-white/5 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Slot</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Member</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instructor Assigned</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Routine Category</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptSessions.map((sess) => (
                    <TableRow key={sess.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <TableCell className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#FF7A00]" />
                        <span>{sess.time}</span>
                      </TableCell>
                      <TableCell className="text-xs font-black text-white">{sess.clientName}</TableCell>
                      <TableCell className="text-xs text-slate-300 font-semibold">{sess.trainerName}</TableCell>
                      <TableCell className="text-xs text-slate-400 font-medium">{sess.type}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          sess.status === "Completed" ? "bg-[#00C853]/10 text-[#00C853]" : 
                          sess.status === "Cancelled" ? "bg-[#FF5252]/10 text-[#FF5252]" : 
                          "bg-blue-500/10 text-blue-500"
                        }`}>
                          {sess.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        /* Single Trainer Profile View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left panel - Trainer details Card */}
          <div className="lg:col-span-4 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-6">
            <div className="text-center space-y-3">
              <img 
                src={selectedTrainer.avatar} 
                alt={selectedTrainer.name} 
                className="h-28 w-28 object-cover rounded-2xl mx-auto border-2 border-primary"
              />
              <div>
                <h3 className="text-lg font-black text-white">{selectedTrainer.name}</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedTrainer.id}</p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {selectedTrainer.specialization}
              </span>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-semibold">Monthly Salary:</span>
                <span className="text-xs text-white font-bold">₹{selectedTrainer.salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-semibold">Performance Score:</span>
                <span className="text-xs text-emerald-500 font-black">{selectedTrainer.performanceScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400 font-semibold">Average Rating:</span>
                <span className="text-xs text-[#FFC107] font-black flex items-center gap-0.5">
                  <Star size={12} className="fill-[#FFC107]" />
                  <span>{selectedTrainer.rating} / 5</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right panel - Client list table */}
          <div className="lg:col-span-8 bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Active Client Roster ({trainerClients.length})
            </h3>
            
            <div className="bg-[#1D1D1D] border border-white/5 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Name</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member ID</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Membership Plan</TableHead>
                    <TableHead className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainerClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-semibold">
                        No clients currently assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    trainerClients.map(c => (
                      <TableRow key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <TableCell className="text-xs font-bold text-white">{c.name}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-400">{c.id}</TableCell>
                        <TableCell className="text-xs text-slate-300 font-medium">{c.membership}</TableCell>
                        <TableCell className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            c.status === "Active" ? "bg-[#00C853]/10 text-[#00C853]" : "bg-[#FF5252]/10 text-[#FF5252]"
                          }`}>
                            {c.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
