import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Eye, Archive, RefreshCw, UserPlus, Download,
  MoreHorizontal, Users, CheckCircle, XCircle, X,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { MemberResponse } from "../../lib/types";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import AddMemberForm from "./AddMemberForm";

interface MembersTableProps {
  onSelectMember?: (id: string) => void;
}

// ──────────────────────────────────────────────────────────────
// Status badge helper
// ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
    paused: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
        cfg[status] ?? cfg.expired
      }`}
    >
      {status}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────
// View Member slide-over panel
// ──────────────────────────────────────────────────────────────
function ViewMemberPanel({
  member,
  onClose,
}: {
  member: MemberResponse;
  onClose: () => void;
}) {
  const p = member.profile;
  const am = member.active_membership;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-[#111] border-l border-white/5 overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#111] z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] font-black text-sm">
              {p.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">{p.full_name}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{p.phone || "—"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Membership card */}
          {am ? (
            <div className="rounded-2xl border border-[#FF6B00]/20 bg-[#FF6B00]/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">
                  Active Plan
                </span>
                <StatusBadge status={am.status} />
              </div>
              <p className="text-sm font-black text-white">{am.plan_name}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold">Start</p>
                  <p className="text-white font-bold">{formatDate(am.start_date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">Expiry</p>
                  <p className="text-white font-bold">{formatDate(am.end_date)}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">Days Left</p>
                  <p className="text-white font-bold">{am.days_remaining}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-center">
              <XCircle size={24} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No Active Membership</p>
            </div>
          )}

          {/* Personal info */}
          <Section title="Personal">
            <Field label="Member ID" value={member.id.substring(0, 12) + "…"} mono />
            <Field label="Email" value={p.email ?? "—"} />
            <Field label="Phone" value={p.phone ?? "—"} />
            <Field label="Date of Birth" value={p.date_of_birth ? formatDate(p.date_of_birth) : "—"} />
            <Field label="Gender" value={p.gender ?? "—"} />
            <Field label="Joined" value={formatDate(member.joining_date)} />
          </Section>

          {p.address && (
            <Section title="Address">
              <p className="text-xs text-slate-300">{p.address}</p>
            </Section>
          )}

          {(p.emergency_contact_name || p.emergency_contact_phone) && (
            <Section title="Emergency Contact">
              <Field label="Name" value={p.emergency_contact_name ?? "—"} />
              <Field label="Phone" value={p.emergency_contact_phone ?? "—"} />
            </Section>
          )}

          {member.notes && (
            <Section title="Notes">
              <p className="text-xs text-slate-300 leading-relaxed">{member.notes}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="text-[11px] text-slate-500 font-semibold">{label}</span>
      <span
        className={`text-[11px] text-white font-bold ${mono ? "font-mono text-[10px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export default function MembersTable({ onSelectMember }: MembersTableProps) {
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewMember, setViewMember] = useState<MemberResponse | null>(null);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [search]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEnvelope<MemberResponse[]>(
        `/api/v1/members/?page=${page}&per_page=20&search=${encodeURIComponent(debouncedSearch)}`
      );
      setMembers(res.data || []);
      setTotal(res.meta?.total ?? 0);
    } catch (err: any) {
      setError(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? They can be restored later.`)) return;
    try {
      await api.delete(`/api/v1/members/${id}`);
      toast.success(`${name} archived successfully`);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || "Archive failed");
    }
  };

  const handleExport = () => {
    const rows = [
      ["Member ID", "Full Name", "Email", "Phone", "Plan", "Status", "Joined"],
      ...members.map((m) => [
        m.id,
        m.profile.full_name,
        m.profile.email ?? "",
        m.profile.phone ?? "",
        m.active_membership?.plan_name ?? "None",
        m.active_membership?.status ?? "expired",
        m.joining_date,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Members exported to CSV");
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      {/* ── Action Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Primary action */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF6B00]/20 transition-all"
          >
            <UserPlus size={14} />
            Add Member
          </Button>
          <Button
            onClick={handleExport}
            disabled={members.length === 0}
            className="h-9 px-3 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <Download size={13} />
            Export
          </Button>
          <Button
            onClick={fetchMembers}
            disabled={loading}
            className="h-9 w-9 p-0 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Right: Search + stats */}
        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white/3 border border-white/5 rounded-xl px-3 py-1.5">
              <Users size={11} className="text-[#FF6B00]" />
              <span className="text-white">{total}</span> members
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 w-64 border-white/5 bg-[#1a1a1a] text-white text-xs placeholder:text-slate-600 focus-visible:ring-[#FF6B00]/30 focus-visible:border-[#FF6B00]/30 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {error ? (
          <div className="p-12 text-center space-y-3">
            <XCircle size={32} className="mx-auto text-red-500/60" />
            <p className="text-xs text-red-400 font-semibold">{error}</p>
            <button
              onClick={fetchMembers}
              className="text-xs text-[#FF6B00] hover:underline font-bold"
            >
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/3">
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                {["Member", "ID", "Phone", "Active Plan", "Expiry", "Status", "Actions"].map((h) => (
                  <TableHead
                    key={h}
                    className={`text-[10px] font-black text-slate-500 uppercase tracking-wider py-3 ${
                      h === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5 animate-pulse">
                    {[144, 80, 80, 120, 80, 70, 60].map((w, j) => (
                      <TableCell key={j} className="py-4">
                        {j === 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-white/5 rounded-xl" />
                            <div className="space-y-1.5">
                              <div className="h-3 bg-white/5 rounded w-28" />
                              <div className="h-2.5 bg-white/5 rounded w-36" />
                            </div>
                          </div>
                        ) : (
                          <div className={`h-3 bg-white/5 rounded`} style={{ width: w }} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center">
                    <div className="space-y-3">
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
                        <Users size={22} className="text-slate-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-500">
                        {debouncedSearch ? "No members match your search" : "No members registered yet"}
                      </p>
                      {!debouncedSearch && (
                        <Button
                          onClick={() => setIsAddOpen(true)}
                          className="h-8 px-4 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-bold rounded-xl"
                        >
                          <UserPlus size={12} className="mr-1.5" /> Add First Member
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => {
                  const am = m.active_membership;
                  const status = am?.status ?? "expired";
                  return (
                    <TableRow
                      key={m.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors group"
                    >
                      {/* Member */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] font-black text-xs flex-shrink-0">
                            {m.profile.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate leading-tight">
                              {m.profile.full_name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {m.profile.email ?? m.profile.phone ?? "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* ID */}
                      <TableCell className="font-mono text-[10px] text-slate-500">
                        {m.id.substring(0, 8)}…
                      </TableCell>

                      {/* Phone */}
                      <TableCell className="text-xs text-slate-400">
                        {m.profile.phone || "—"}
                      </TableCell>

                      {/* Plan */}
                      <TableCell className="text-xs text-slate-300 font-medium">
                        {am ? am.plan_name : <span className="text-slate-600">No Plan</span>}
                      </TableCell>

                      {/* Expiry */}
                      <TableCell className="text-xs text-slate-400">
                        {am ? formatDate(am.end_date) : "—"}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => {
                              setViewMember(m);
                              onSelectMember?.(m.id);
                            }}
                            className="h-7 px-2.5 text-[10px] font-bold text-slate-300 hover:text-white border border-white/5 bg-white/3 hover:bg-white/8 rounded-lg transition-all flex items-center gap-1"
                            title="View details"
                          >
                            <Eye size={11} />
                            View
                          </Button>
                          <Button
                            onClick={() => handleArchive(m.id, m.profile.full_name)}
                            className="h-7 w-7 p-0 text-red-500/70 hover:text-red-400 border border-red-500/10 bg-red-500/3 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center"
                            title="Archive member"
                          >
                            <Archive size={11} />
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

      {/* ── Pagination ─────────────────────────────────────── */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-500 font-semibold">
            Showing{" "}
            <span className="text-white font-bold">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, total)}
            </span>{" "}
            of <span className="text-white font-bold">{total}</span> members
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-8 px-3 bg-white/3 border border-white/5 hover:bg-white/8 text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={12} /> Prev
            </Button>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-white font-bold text-[10px]">
              {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="h-8 px-3 bg-white/3 border border-white/5 hover:bg-white/8 text-slate-300 rounded-xl text-[10px] font-bold flex items-center gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Add Member Dialog ──────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl bg-[#0f0f0f] border border-white/5 text-white rounded-3xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center">
                  <UserPlus size={16} className="text-[#FF6B00]" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-black text-white">Register New Member</DialogTitle>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    Complete all 3 steps to register a member
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <AddMemberForm
              onSuccess={() => {
                setIsAddOpen(false);
                fetchMembers();
                toast.success("Member registered and table refreshed!");
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Member Slide-Over ─────────────────────────── */}
      {viewMember && (
        <ViewMemberPanel
          member={viewMember}
          onClose={() => setViewMember(null)}
        />
      )}
    </div>
  );
}
