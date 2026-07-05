import React from "react";
import { 
  AlertTriangle, CheckCircle2, XCircle, Info, 
  Archive, ArrowUpLeft, Trash2, ShieldAlert, LucideIcon 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BaseConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  icon?: LucideIcon;
  variant?: "danger" | "warning" | "info" | "success";
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  icon: Icon = AlertTriangle,
  variant = "warning"
}: BaseConfirmDialogProps) {
  
  const colors = {
    danger: "text-red-500 bg-red-500/10 border-red-500/20 hover:bg-red-600 hover:border-red-600 text-white",
    warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-600 hover:border-yellow-600 text-white",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-600 hover:border-blue-600 text-white",
    success: "text-green-500 bg-green-500/10 border-green-500/20 hover:bg-green-600 hover:border-green-600 text-white"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-[#121212] border border-white/5 text-white rounded-3xl p-6">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[variant].split(" ")[0]} ${colors[variant].split(" ")[1]} ${colors[variant].split(" ")[2]}`}>
            <Icon size={24} />
          </div>
          <DialogTitle className="text-sm font-black uppercase tracking-wider text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 font-medium leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-2 gap-3 mt-4 w-full">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 bg-[#171717] border border-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wider ${colors[variant].split(" ").slice(3).join(" ")}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 1. Delete Confirmation
export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
  itemName = "this record"
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Delete Record"
      description={`Are you sure you want to permanently delete ${itemName}? This record metadata cannot be recovered.`}
      onConfirm={onConfirm}
      confirmLabel="Delete"
      loading={loading}
      icon={Trash2}
      variant="danger"
    />
  );
}

// 2. Archive Confirmation
export function ArchiveConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
  itemName = "this record"
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Archive Record"
      description={`Archive ${itemName}? Archived items are hidden from active rosters but can be restored.`}
      onConfirm={onConfirm}
      confirmLabel="Archive"
      loading={loading}
      icon={Archive}
      variant="warning"
    />
  );
}

// 3. Restore Confirmation
export function RestoreConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
  itemName = "this record"
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Restore Record"
      description={`Restore ${itemName} back to active rosters?`}
      onConfirm={onConfirm}
      confirmLabel="Restore"
      loading={loading}
      icon={ArrowUpLeft}
      variant="info"
    />
  );
}

// 4. Success feedback Dialog
export function SuccessDialog({
  isOpen,
  onOpenChange,
  title = "Success",
  description
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs bg-[#121212] border border-white/5 text-white rounded-3xl p-6 text-center flex flex-col items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 animate-bounce">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="text-sm font-black uppercase text-white">{title}</h4>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{description}</p>
        <Button
          onClick={() => onOpenChange(false)}
          className="h-10 w-full bg-[#FF6B00] hover:bg-[#FF8020] text-white font-bold text-xs uppercase tracking-wider rounded-xl pt-1.5"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// 5. Error Feedback Dialog
export function ErrorDialog({
  isOpen,
  onOpenChange,
  title = "Operation Failed",
  description
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs bg-[#121212] border border-white/5 text-white rounded-3xl p-6 text-center flex flex-col items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <XCircle size={24} />
        </div>
        <h4 className="text-sm font-black uppercase text-white">{title}</h4>
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{description}</p>
        <Button
          onClick={() => onOpenChange(false)}
          className="h-10 w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl pt-1.5"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
