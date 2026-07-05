import React, { useState } from "react";
import { 
  ChevronUp, ChevronDown, EyeOff, RefreshCw, 
  MoreHorizontal, ChevronLeft, ChevronRight, CheckSquare, Square 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { TableSkeleton } from "./Skeletons";

export interface ColumnConfig {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: ColumnConfig[];
  loading?: boolean;
  
  // Pagination
  page: number;
  perPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;

  // Sorting
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string, direction: "asc" | "desc") => void;

  // Refresh
  onRefresh?: () => void;

  // Selection
  onSelectionChange?: (selectedIds: string[]) => void;
  
  // Row action menu
  rowActions?: {
    label: string;
    action: (row: any) => void;
    className?: string;
  }[];

  // Empty state custom component
  emptyState?: React.ReactNode;
}

export default function DataTable({
  data,
  columns,
  loading = false,
  page,
  perPage,
  totalCount,
  onPageChange,
  onPerPageChange,
  sortKey,
  sortDirection,
  onSortChange,
  onRefresh,
  onSelectionChange,
  rowActions = [],
  emptyState
}: DataTableProps) {
  // Columns visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (key: string) => {
    if (!onSortChange) return;
    const direction = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(key, direction);
  };

  const handleSelectRow = (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      next = selectedIds.filter(selectedId => selectedId !== id);
    } else {
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const handleSelectAll = () => {
    let next: string[] = [];
    if (selectedIds.length < data.length) {
      next = data.map(item => item.id).filter(Boolean);
    }
    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const totalPages = Math.ceil(totalCount / perPage) || 1;

  if (loading) {
    return <TableSkeleton />;
  }

  const activeColumns = columns.filter(col => visibleColumns[col.key]);

  return (
    <div className="bg-[#121212]/60 border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col w-full animate-in fade-in duration-200">
      
      {/* Header utility bar (Visibility control + Refresh) */}
      <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/20">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
          Showing {data.length} of {totalCount} records
        </span>
        <div className="flex items-center gap-2">
          {/* Column visibility dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 rounded-xl border-white/5 bg-[#171717] hover:bg-white/5 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                <EyeOff size={12} />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#121212] border border-white/5 text-white rounded-2xl w-48">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Toggle Columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={visibleColumns[col.key]}
                  onCheckedChange={() => toggleColumnVisibility(col.key)}
                  className="text-xs hover:bg-white/5 cursor-pointer text-slate-300"
                >
                  {col.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {onRefresh && (
            <Button
              onClick={onRefresh}
              className="w-9 h-9 p-0 rounded-xl bg-[#171717] border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white"
            >
              <RefreshCw size={12} />
            </Button>
          )}
        </div>
      </div>

      {/* Responsive table viewport */}
      <div className="overflow-x-auto w-full scrollbar-none relative">
        <table className="w-full text-left border-collapse select-text">
          {/* Sticky header */}
          <thead className="bg-[#171717]/80 backdrop-blur sticky top-0 border-b border-white/5 z-10">
            <tr>
              {/* Checkbox select all column */}
              {onSelectionChange && (
                <th className="py-3 px-4 w-12 text-center">
                  <button 
                    type="button"
                    onClick={handleSelectAll} 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {selectedIds.length === data.length && data.length > 0 ? (
                      <CheckSquare size={14} className="text-[#FF6B00]" />
                    ) : (
                      <Square size={14} />
                    )}
                  </button>
                </th>
              )}

              {/* Data headers */}
              {activeColumns.map((col) => (
                <th 
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3 px-4 text-[10px] font-black uppercase text-slate-400 tracking-wider ${
                    col.sortable ? "cursor-pointer select-none hover:text-white" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}

              {/* Actions header column */}
              {rowActions.length > 0 && (
                <th className="py-3 px-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-wider w-16">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 bg-[#121212]/30">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={activeColumns.length + (onSelectionChange ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} 
                  className="py-12"
                >
                  {emptyState || (
                    <p className="text-xs text-slate-500 italic text-center uppercase tracking-widest font-black">
                      No Records Found
                    </p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-white/5 transition-colors border-none ${
                      isSelected ? "bg-[#FF6B00]/5" : ""
                    }`}
                  >
                    {/* Select Checkbox row cell */}
                    {onSelectionChange && (
                      <td className="py-3.5 px-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleSelectRow(row.id)} 
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare size={14} className="text-[#FF6B00]" />
                          ) : (
                            <Square size={14} />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Data row cells */}
                    {activeColumns.map((col) => (
                      <td key={col.key} className="py-3.5 px-4 text-xs font-semibold text-slate-200">
                        {col.render ? col.render(row) : (row[col.key] !== undefined ? String(row[col.key]) : "N/A")}
                      </td>
                    ))}

                    {/* Action dropdown row cell */}
                    {rowActions.length > 0 && (
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#121212] border border-white/5 text-white rounded-2xl w-40">
                            {rowActions.map((action, i) => (
                              <DropdownMenuItem
                                key={i}
                                onClick={() => action.action(row)}
                                className={`text-xs hover:bg-white/5 cursor-pointer font-semibold ${
                                  action.className || "text-slate-300"
                                }`}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-black/20 gap-4">
        {/* Limit changer */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Rows per page:</span>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="bg-black border border-white/5 rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:border-[#FF6B00]"
          >
            {[10, 25, 50, 100].map((limit) => (
              <option key={limit} value={limit}>{limit}</option>
            ))}
          </select>
        </div>

        {/* Page navigators */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="w-8 h-8 p-0 rounded-lg bg-[#171717] border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="w-8 h-8 p-0 rounded-lg bg-[#171717] border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
