import { useState, useEffect, useRef } from "react";
import { Search, Eye, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { MemberListResponse, MemberResponse } from "../../lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

interface MembersTableProps {
  onSelectMember: (id: string) => void;
  onDeleteMember?: (id: string) => void;
}

export default function MembersTable({ onSelectMember, onDeleteMember }: MembersTableProps) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(
        `/api/v1/members/?page=${page}&per_page=20&search=${encodeURIComponent(debouncedSearch)}`
      );
      const membersList = Array.isArray(res) ? res : (res?.members || []);
      setMembers(membersList);
      setTotal(res?.total ?? (membersList.length >= 20 ? (page * 20 + 1) : (page - 1) * 20 + membersList.length));
    } catch (err: any) {
      setError(err.message || "Failed to load members list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      try {
        await api.delete(`/api/v1/members/${id}`);
        toast.success("Member profile deleted successfully");
        if (onDeleteMember) onDeleteMember(id);
        fetchMembers();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete member");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search members by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 border-white/5 bg-[#171717] text-white placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary rounded-xl"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#171717] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        {error ? (
          <div className="p-12 text-center text-red-400 text-xs">
            <p>{error}</p>
            <button onClick={fetchMembers} className="mt-3 text-xs text-orange-400 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b border-white/5">
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plan</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // 5 Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5 animate-pulse">
                    <TableCell className="py-4 flex items-center space-x-3">
                      <div className="h-10 w-10 bg-[#1f1f1f] rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-[#1f1f1f] w-24 rounded"></div>
                        <div className="h-3 bg-[#1f1f1f] w-32 rounded"></div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-12 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-20 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-28 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-20 rounded"></div></TableCell>
                    <TableCell><div className="h-6 bg-[#1f1f1f] w-16 rounded-full"></div></TableCell>
                    <TableCell className="text-right"><div className="h-8 bg-[#1f1f1f] w-16 ml-auto rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500 font-semibold">
                    No members registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const activeMembership = member.active_membership;
                  const status = activeMembership ? activeMembership.status : "expired";
                  return (
                    <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold flex items-center space-x-3 py-4">
                        <div className="h-10 w-10 rounded-xl bg-[#FF7A00]/10 border border-[#FF7A00]/20 flex items-center justify-center text-primary font-black text-xs">
                          {member.profile.full_name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-bold leading-tight">{member.profile.full_name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{member.profile.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-slate-400">{member.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-sm text-slate-400">{member.profile.phone || "-"}</TableCell>
                      <TableCell className="text-sm text-slate-300 font-medium">
                        {activeMembership ? activeMembership.plan_name : <span className="text-slate-600 font-bold">No Active Plan</span>}
                      </TableCell>
                      <TableCell className="text-sm text-slate-400 font-semibold">
                        {activeMembership ? formatDate(activeMembership.end_date) : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            status === "active"
                              ? "bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20"
                              : "bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/20"
                          }`}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => onSelectMember(member.id)}
                            className="h-8 px-3 text-[10px] font-bold text-slate-300 hover:text-white border border-white/5 bg-[#1D1D1D] hover:bg-white/5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </Button>
                          <Button
                            onClick={() => handleDelete(member.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && members.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-2">
          <span>Total members registered: <strong className="text-white">{total}</strong></span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-8 px-3 text-[10px] font-bold bg-[#1D1D1D] hover:bg-white/5 border border-white/5 rounded-lg text-slate-300 disabled:opacity-50"
            >
              Previous
            </Button>
            <span className="font-bold text-white px-2">Page {page}</span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={members.length < 20}
              className="h-8 px-3 text-[10px] font-bold bg-[#1D1D1D] hover:bg-white/5 border border-white/5 rounded-lg text-slate-300 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
