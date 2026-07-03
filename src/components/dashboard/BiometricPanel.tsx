import { useState, useEffect } from "react";
import { Fingerprint, Search, Check, RefreshCw, UserCheck, HelpCircle } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { UnmatchedScanResponse, AttendanceLogResponse, MemberResponse, MemberListResponse } from "../../lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function BiometricPanel() {
  const [unmatched, setUnmatched] = useState<UnmatchedScanResponse[]>([]);
  const [todayLogs, setTodayLogs] = useState<AttendanceLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingScan, setResolvingScan] = useState<UnmatchedScanResponse | null>(null);

  // Search member state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [unmatchedRes, todayRes] = await Promise.all([
        api.get<UnmatchedScanResponse[]>("/api/v1/attendance/unmatched?is_resolved=false"),
        api.get<AttendanceLogResponse[]>("/api/v1/attendance/today"),
      ]);
      setUnmatched(unmatchedRes);
      setTodayLogs(todayRes);
    } catch (err) {
      console.error("Failed to load biometric check-in data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Search members debounced/on-demand
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get<MemberListResponse>(`/api/v1/members/?page=1&per_page=10&search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.members);
    } catch (err) {
      toast.error("Failed to search members");
    } finally {
      setSearching(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!resolvingScan || !selectedMemberId) {
      toast.error("Please select a member to link");
      return;
    }

    try {
      await api.post(`/api/v1/attendance/unmatched/${resolvingScan.id}/resolve`, {
        member_id: selectedMemberId,
      });
      toast.success("Scan linked to member successfully!");
      setResolvingScan(null);
      setSelectedMemberId(null);
      setSearchQuery("");
      setSearchResults([]);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve scan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Fingerprint className="text-primary" size={16} />
            <span>Biometric Gate Panel</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Resolve unmatched biometric scans and view today's active check-ins
          </p>
        </div>
        <Button
          onClick={fetchData}
          size="sm"
          className="bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg gap-1.5"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Unmatched Scans Table */}
        <div className="lg:col-span-7 bg-[#171717] border border-white/5 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Unresolved Biometric Scans
          </h3>

          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2 scrollbar-none">
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-500 font-semibold animate-pulse">
                Syncing biometric queue...
              </div>
            ) : unmatched.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-semibold border border-dashed border-white/5 rounded-xl">
                No unresolved scans. The gate connection is clear!
              </div>
            ) : (
              unmatched.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Device ID / PIN: {scan.raw_pin}</span>
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                        Unmatched
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Terminal: {scan.device_serial} | {new Date(scan.scan_datetime).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => setResolvingScan(scan)}
                    className="h-8 px-3 text-[10px] font-bold bg-[#FF7A00] hover:bg-primary/95 text-white rounded-lg transition-transform duration-100 active:scale-95"
                  >
                    Link Profile
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Check-ins Panel */}
        <div className="lg:col-span-5 bg-[#171717] border border-white/5 p-5 rounded-2xl shadow-lg space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserCheck size={14} className="text-[#00C853]" />
            <span>Today's Checked-in Roster</span>
          </h3>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-2 scrollbar-none">
            {loading ? (
              <div className="text-center py-10 text-xs text-slate-500 font-semibold animate-pulse">
                Fetching attendance...
              </div>
            ) : todayLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-semibold border border-dashed border-white/5 rounded-xl">
                No check-ins recorded yet today.
              </div>
            ) : (
              todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{log.member_name}</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
                      {log.source} check-in
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#00C853] font-mono font-bold">
                      IN: {new Date(log.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {log.check_out && (
                      <p className="text-[9px] text-slate-500 font-mono">
                        OUT: {new Date(log.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resolution Dialog Modal */}
      <Dialog open={!!resolvingScan} onOpenChange={(open) => !open && setResolvingScan(null)}>
        <DialogContent className="bg-[#1D1D1D] border-white/5 text-white rounded-2xl max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-white">
              Link Biometric Scan
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Assign scan PIN <strong className="text-white">{resolvingScan?.raw_pin}</strong> (Terminal: {resolvingScan?.device_serial}) to a member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search member by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-10 border-white/5 bg-[#171717] text-white rounded-xl placeholder:text-slate-500"
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="bg-white/5 text-slate-300 hover:text-white rounded-xl">
                Search
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
              {searching ? (
                <div className="text-center py-4 text-xs text-slate-500">Searching directory...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  {searchQuery ? "No members found." : "Search above to select a member profile."}
                </div>
              ) : (
                searchResults.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      selectedMemberId === member.id
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{member.profile.full_name}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{member.profile.email}</p>
                    </div>
                    {selectedMemberId === member.id && <Check className="text-primary" size={14} />}
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setResolvingScan(null)}
              variant="ghost"
              className="hover:bg-white/5 text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveSubmit}
              disabled={!selectedMemberId}
              className="bg-[#FF7A00] hover:bg-primary/95 text-white rounded-xl font-bold"
            >
              Link Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
