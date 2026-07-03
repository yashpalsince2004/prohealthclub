import { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { api } from "../../../lib/api";
import { formatDate } from "../../../lib/format";
import type { AttendanceListResponse, AttendanceLogResponse } from "../../../lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";

interface AttendanceHistoryProps {
  memberId: string;
}

export default function AttendanceHistory({ memberId }: AttendanceHistoryProps) {
  const [logs, setLogs] = useState<AttendanceLogResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AttendanceListResponse>(
        `/api/v1/attendance/member/${memberId}?page=${page}&per_page=10`
      );
      setLogs(res.logs);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || "Failed to load visit history logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, memberId]);

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="text-[#FF7A00]" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">My Attendance Log</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              History of your physical gym entries and visits
            </p>
          </div>
        </div>
        <Button
          onClick={fetchHistory}
          size="sm"
          className="bg-white/5 border border-white/5 text-slate-400 hover:text-white rounded-lg gap-1.5"
        >
          <RefreshCw size={12} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#121212]">
        {error ? (
          <div className="p-8 text-center text-red-400 text-xs">
            <p>{error}</p>
            <button onClick={fetchHistory} className="mt-2 text-orange-400 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b border-white/5">
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Check In</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Check Out</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Gate Node</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5 animate-pulse">
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-16 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-12 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-12 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-16 rounded"></div></TableCell>
                    <TableCell className="text-right"><div className="h-4 bg-[#1f1f1f] w-20 ml-auto rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500 font-semibold">
                    No visit checks registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="text-xs text-white font-mono font-bold">
                      {formatDate(log.check_in)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {new Date(log.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {log.check_out
                        ? new Date(log.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : <span className="text-[#00C853] font-bold">Still Inside</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-semibold">
                      {log.duration_minutes ? `${log.duration_minutes} mins` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold text-slate-400 uppercase border border-white/5">
                        {log.source}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && logs.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Total visits logged: <strong className="text-white">{total}</strong></span>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-8 px-3 text-[10px] font-bold bg-[#1D1D1D] hover:bg-white/5 border border-white/5 rounded-lg disabled:opacity-50"
            >
              Previous
            </Button>
            <span className="font-bold text-white px-2 mt-1">Page {page}</span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={logs.length < 10}
              className="h-8 px-3 text-[10px] font-bold bg-[#1D1D1D] hover:bg-white/5 border border-white/5 rounded-lg disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
