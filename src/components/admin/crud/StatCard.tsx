import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // e.g. +12.5 or -3.2
  trendDirection?: "up" | "down";
  comparisonText?: string;
  loading?: boolean;
  sparklineData?: number[];
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = "up",
  comparisonText,
  loading = false,
  sparklineData = [10, 20, 15, 30, 25, 40, 35, 50],
  color = "#FF6B00"
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-3 flex-1">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24 bg-white/5 rounded" />
          <Skeleton className="h-8 w-8 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-20 bg-white/5 rounded" />
        <Skeleton className="h-4 w-32 bg-white/5 rounded" />
      </div>
    );
  }

  // Generate SVG path for sparkline spark
  const maxVal = Math.max(...sparklineData, 1);
  const minVal = Math.min(...sparklineData, 0);
  const range = maxVal - minVal;
  
  const width = 120;
  const height = 30;
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const isUp = trendDirection === "up" || (trend !== undefined && trend > 0);

  return (
    <div
      className="bg-[#121212] border border-white/5 p-5 rounded-3xl shadow-xl flex-1 flex items-center justify-between relative overflow-hidden group hover:border-white/10 transition-colors"
      style={{ "--hover-color": color } as React.CSSProperties}
    >
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {title}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-white">
            {value}
          </span>
          
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
              isUp 
                ? "bg-green-500/10 text-green-500" 
                : "bg-red-500/10 text-red-500"
            }`}>
              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>

        {comparisonText && (
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none pt-0.5">
            {comparisonText}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end justify-between h-full gap-4 pl-4">
        {/* Top: Icon element */}
        <div className="w-10 h-10 rounded-2xl bg-[#171717] border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-[var(--hover-color)] transition-colors">
          <Icon size={18} />
        </div>

        {/* Bottom: Sparkline Mini Chart */}
        {sparklineData.length > 0 && (
          <div className="w-24 h-8 flex items-center">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
              <polyline
                fill="none"
                stroke={isUp ? "#22c55e" : "#ef4444"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
