import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-white/5 rounded-lg" />
          <Skeleton className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
      </div>
      <TableSkeleton />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-[#121212]/60 border border-white/5 rounded-3xl p-5 space-y-4 w-full">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-10 bg-white/5 rounded-xl" />
        </div>
      </div>
      <div className="border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-white/5 h-10 border-b border-white/5 flex items-center px-4">
          <Skeleton className="h-4 w-full bg-white/5 rounded" />
        </div>
        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 flex items-center px-4 gap-4">
              <Skeleton className="h-4 w-1/4 bg-white/5 rounded" />
              <Skeleton className="h-4 w-1/4 bg-white/5 rounded" />
              <Skeleton className="h-4 w-1/6 bg-white/5 rounded" />
              <Skeleton className="h-4 w-1/12 bg-white/5 rounded" />
              <Skeleton className="h-4 w-1/12 bg-white/5 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32 bg-white/5 rounded-lg" />
        <Skeleton className="h-8 w-48 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-1/3 bg-white/5 rounded-lg" />
        <Skeleton className="h-8 w-8 bg-white/5 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/4 bg-white/5 rounded-md" />
        <Skeleton className="h-4 w-1/4 bg-white/5 rounded-md" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20 bg-white/5 rounded" />
            <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 bg-white/5 rounded" />
        <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
      </div>
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
        <Skeleton className="h-10 w-full bg-[#FF6B00]/20 rounded-xl" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
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

export function AvatarSkeleton() {
  return <Skeleton className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />;
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#121212] border border-white/5 p-5 rounded-3xl space-y-4 w-full">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32 bg-white/5 rounded-lg" />
        <Skeleton className="h-8 w-20 bg-white/5 rounded-lg" />
      </div>
      <div className="h-48 bg-white/5 rounded-2xl flex items-end p-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton 
            key={i} 
            className="flex-1 bg-white/5 rounded-t-md" 
            style={{ height: `${Math.random() * 80 + 20}%` }} 
          />
        ))}
      </div>
    </div>
  );
}
