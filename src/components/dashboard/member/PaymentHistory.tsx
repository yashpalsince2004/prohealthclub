import { useState, useEffect } from "react";
import { CreditCard, RefreshCw, Download } from "lucide-react";
import { api } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth";
import { formatDate } from "../../../lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";
import { toast } from "sonner";

interface PaymentHistoryProps {
  memberId: string;
}

interface PaymentRecord {
  id: string;
  amount_paid: number;
  payment_method: string;
  payment_status: string;
  transaction_reference: string | null;
  payment_date: string;
  membership?: {
    plan?: {
      name: string;
    };
  };
}

export default function PaymentHistory({ memberId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint retrieves list of payments for a member
      const res = await api.get<PaymentRecord[]>(`/api/v1/payments/member/${memberId}`);
      setPayments(res);
    } catch (err: any) {
      setError(err.message || "Failed to load payment history logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchPayments();
    }
  }, [memberId]);

  const handleDownload = async (paymentId: string, paymentDate: string) => {
    setDownloadingId(paymentId);
    try {
      const apiBase = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";
      const token = getAccessToken();
      
      const response = await fetch(`${apiBase}/api/v1/payments/${paymentId}/receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not fetch the receipt PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      
      const formattedDate = new Date(paymentDate).toISOString().split("T")[0];
      link.download = `PRRO-Receipt-${formattedDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Receipt downloaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to download payment receipt PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-[#171717] border border-white/5 p-6 rounded-2xl shadow-lg space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="text-[#FF7A00]" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">My Payment History</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Review invoices and download receipts
            </p>
          </div>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Refresh</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#121212]">
        {error ? (
          <div className="p-8 text-center text-red-400 text-xs">
            <p>{error}</p>
            <button onClick={fetchPayments} className="mt-2 text-orange-400 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b border-white/5">
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Method</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5 animate-pulse">
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-16 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-24 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-12 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-16 rounded"></div></TableCell>
                    <TableCell><div className="h-4 bg-[#1f1f1f] w-16 rounded"></div></TableCell>
                    <TableCell className="text-right"><div className="h-8 bg-[#1f1f1f] w-24 ml-auto rounded"></div></TableCell>
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-semibold">
                    No billing history registered yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="text-xs text-white font-mono font-bold">
                      {formatDate(payment.payment_date)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-bold">
                      {payment.membership?.plan?.name || "Premium Plan"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 uppercase">
                      {payment.payment_method}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {payment.transaction_reference || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs font-black text-[#FF7A00]">
                      ₹{payment.amount_paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleDownload(payment.id, payment.payment_date)}
                        disabled={downloadingId === payment.id}
                        size="sm"
                        className="bg-[#FF7A00]/10 hover:bg-[#FF7A00] text-[#FF7A00] hover:text-white rounded-lg gap-1.5 h-8 font-bold border border-[#FF7A00]/20"
                      >
                        <Download size={12} />
                        <span>{downloadingId === payment.id ? "Downloading..." : "PDF Receipt"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
