import React, { useState } from "react";
import { Search, X, SlidersHorizontal, Save, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  
  // Custom dropdown select filters
  filters?: FilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, val: string) => void;

  // Date range selectors
  fromDate?: string;
  toDate?: string;
  onFromDateChange?: (val: string) => void;
  onToDateChange?: (val: string) => void;
  
  onClearFilters: () => void;
  onSaveFilters?: () => void;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search by keyword...",
  filters = [],
  filterValues,
  onFilterChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClearFilters,
  onSaveFilters
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Primary search bar and simple status filter */}
      <div className="bg-[#121212] border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 pl-11 pr-4 border-white/5 bg-black/40 rounded-2xl text-white focus-visible:ring-1 focus-visible:ring-[#FF6B00]"
          />
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`h-11 rounded-2xl px-4 border border-white/5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              showAdvanced || Object.values(filterValues).some(Boolean) || fromDate || toDate
                ? "bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </Button>

          <Button
            type="button"
            onClick={onClearFilters}
            className="h-11 rounded-2xl bg-transparent hover:bg-white/5 border border-transparent text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider px-3"
          >
            Clear
          </Button>

          {onSaveFilters && (
            <Button
              type="button"
              onClick={onSaveFilters}
              className="h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-4 flex items-center gap-2"
            >
              <Save size={14} />
              Save Presets
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvanced && (
        <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl shadow-xl animate-in slide-in-from-top-4 duration-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Render custom select dropdowns */}
          {filters.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {f.label}
              </label>
              <select
                value={filterValues[f.key] || ""}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
                className="w-full h-10 bg-black border border-white/5 rounded-xl text-white text-xs px-3 focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">All {f.label}s</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Date range picker columns */}
          {onFromDateChange && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Calendar size={12} />
                From Date
              </label>
              <Input
                type="date"
                value={fromDate || ""}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white text-xs"
              />
            </div>
          )}

          {onToDateChange && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Calendar size={12} />
                To Date
              </label>
              <Input
                type="date"
                value={toDate || ""}
                onChange={(e) => onToDateChange(e.target.value)}
                className="h-10 border-white/5 bg-black/40 rounded-xl text-white text-xs"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
