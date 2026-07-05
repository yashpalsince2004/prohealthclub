import React from "react";
import { Plus, Download, Upload, RotateCw, Trash2, Archive, ArrowUpLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Permission from "@/components/common/Permission";

interface ActionToolbarProps {
  selectedCount?: number;
  onAdd?: () => void;
  addLabel?: string;
  addPermission?: string[];
  
  onImport?: () => void;
  importPermission?: string[];
  
  onExport?: () => void;
  exportPermission?: string[];
  
  onRefresh?: () => void;
  
  onDeleteSelected?: () => void;
  deletePermission?: string[];
  
  onArchiveSelected?: () => void;
  archivePermission?: string[];
  
  onRestoreSelected?: () => void;
  restorePermission?: string[];
  
  loading?: boolean;
}

export default function ActionToolbar({
  selectedCount = 0,
  onAdd,
  addLabel = "Add Item",
  addPermission,
  onImport,
  importPermission,
  onExport,
  exportPermission,
  onRefresh,
  onDeleteSelected,
  deletePermission,
  onArchiveSelected,
  archivePermission,
  onRestoreSelected,
  restorePermission,
  loading = false
}: ActionToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-lg animate-in fade-in duration-200">
      
      {/* Left: Bulk selection indicators & actions */}
      <div className="flex items-center gap-2 flex-wrap min-h-[40px]">
        {hasSelection ? (
          <>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-xl">
              {selectedCount} Selected
            </span>

            {/* Bulk Archive */}
            {onArchiveSelected && (
              <Permission permissions={archivePermission}>
                <Button
                  onClick={onArchiveSelected}
                  disabled={loading}
                  className="h-9 px-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Archive size={12} />
                  Archive
                </Button>
              </Permission>
            )}

            {/* Bulk Restore */}
            {onRestoreSelected && (
              <Permission permissions={restorePermission}>
                <Button
                  onClick={onRestoreSelected}
                  disabled={loading}
                  className="h-9 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <ArrowUpLeft size={12} />
                  Restore
                </Button>
              </Permission>
            )}

            {/* Bulk Delete */}
            {onDeleteSelected && (
              <Permission permissions={deletePermission}>
                <Button
                  onClick={onDeleteSelected}
                  disabled={loading}
                  className="h-9 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Trash2 size={12} />
                  Delete
                </Button>
              </Permission>
            )}
          </>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            No rows selected
          </span>
        )}
      </div>

      {/* Right: Regular actions like Add, Import, Export, Refresh */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={loading}
            className="w-9 h-9 p-0 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <RotateCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        )}

        {onImport && (
          <Permission permissions={importPermission}>
            <Button
              onClick={onImport}
              disabled={loading}
              className="h-9 px-3 rounded-xl bg-[#171717] border border-white/5 hover:bg-white/5 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Upload size={12} />
              Import
            </Button>
          </Permission>
        )}

        {onExport && (
          <Permission permissions={exportPermission}>
            <Button
              onClick={onExport}
              disabled={loading}
              className="h-9 px-3 rounded-xl bg-[#171717] border border-white/5 hover:bg-[#1f1f1f] text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Download size={12} />
              Export
            </Button>
          </Permission>
        )}

        {onAdd && (
          <Permission permissions={addPermission}>
            <Button
              onClick={onAdd}
              disabled={loading}
              className="h-9 px-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8020] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#FF6B00]/10"
            >
              <Plus size={14} />
              {addLabel}
            </Button>
          </Permission>
        )}
      </div>
    </div>
  );
}
