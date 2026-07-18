"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/60 bg-card/60 backdrop-blur-md">
      {/* Confidence badge placeholder */}
      <div className="p-3 pb-0 flex justify-between items-center">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="aspect-[16/10] w-full" />
      <CardHeader className="space-y-3 pt-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-6 w-5/6" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        {/* Why recommended placeholder */}
        <Skeleton className="h-16 w-full rounded-xl" />
      </CardContent>
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </Card>
  );
}

export function RecommendationsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-4">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1 hidden lg:block">
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-border/40 mb-4">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Skeleton */}
      <div className="lg:col-span-3 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
