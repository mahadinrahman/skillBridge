"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FilterSidebar } from "./filter-sidebar";
import { RecommendationCard } from "./recommendation-card";
import { PreferencesForm } from "./preferences-form";
import { RecommendationsSkeleton } from "./recommendations-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Sparkles,
  Settings,
  RefreshCw,
  SlidersHorizontal,
  Compass,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { PaginatedRecommendations, UserPreferences } from "@/types";

interface FilterState {
  category: string;
  level: string;
  maxPrice: string;
  maxDuration: string;
}

export function RecommendationsDashboard() {
  const queryClient = useQueryClient();

  // Dashboard state
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [refineCourseId, setRefineCourseId] = useState<string | null>(null);

  // Sidebar Filters State
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    level: "",
    maxPrice: "",
    maxDuration: "",
  });

  // Query 1: User preferences (goals, category, level)
  const { data: preferences, isLoading: isPreferencesLoading } = useQuery<UserPreferences>({
    queryKey: ["recommendation-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/recommendations/preferences");
      if (!res.ok) throw new Error("Failed to load preferences");
      return res.json();
    },
  });

  // Query 2: AI Recommended courses based on current filters, page, and refinement seed
  const {
    data: recsData,
    isLoading: isRecsLoading,
    isRefetching: isRecsRefetching,
    isError,
    refetch: triggerRefetch,
  } = useQuery<PaginatedRecommendations>({
    queryKey: [
      "recommendations",
      filters,
      page,
      refineCourseId,
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters.category) searchParams.set("category", filters.category);
      if (filters.level) searchParams.set("level", filters.level);
      if (filters.maxPrice) searchParams.set("maxPrice", filters.maxPrice);
      if (filters.maxDuration) searchParams.set("maxDuration", filters.maxDuration);
      if (refineCourseId) searchParams.set("refineCourseId", refineCourseId);
      searchParams.set("page", String(page));
      searchParams.set("limit", "6");

      const res = await fetch(`/api/recommendations?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
  });

  // Mutation: Save Preferences
  const savePrefsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/recommendations/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both preferences and recommendations to force AI recalculation
      queryClient.invalidateQueries({ queryKey: ["recommendation-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setPage(1);
    },
  });

  // Mutation: Submit feedback (not interested / click)
  const feedbackMutation = useMutation({
    mutationFn: async ({ courseId, type }: { courseId: string; type: "not_interested" | "more_like_this" }) => {
      const res = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, type }),
      });
      if (!res.ok) throw new Error("Failed to save feedback");
      return res.json();
    },
    onSuccess: (_, variables) => {
      if (variables.type === "not_interested") {
        toast.info("Recommendation dismissed. Learning from feedback...");
      } else if (variables.type === "more_like_this") {
        toast.success("Refining suggestions based on this course selection...");
        setRefineCourseId(variables.courseId);
        setPage(1);
      }
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });

  // Handler: Modify filter key
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page to 1 on filter modification
  };

  // Handler: Clear all filters
  const handleClearFilters = () => {
    setFilters({
      category: "",
      level: "",
      maxPrice: "",
      maxDuration: "",
    });
    setPage(1);
  };

  // Handler: Trigger full cache invalidation and fresh OpenAI call
  const handleRefresh = async () => {
    toast.promise(
      (async () => {
        // Fetch recommendations directly with refresh=true query parameter to bypass cache
        const searchParams = new URLSearchParams();
        if (filters.category) searchParams.set("category", filters.category);
        if (filters.level) searchParams.set("level", filters.level);
        if (filters.maxPrice) searchParams.set("maxPrice", filters.maxPrice);
        if (filters.maxDuration) searchParams.set("maxDuration", filters.maxDuration);
        if (refineCourseId) searchParams.set("refineCourseId", refineCourseId);
        searchParams.set("page", String(page));
        searchParams.set("limit", "6");
        searchParams.set("refresh", "true");

        const res = await fetch(`/api/recommendations?${searchParams.toString()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        // Invalidate queries so TanStack query cache reflects the new calculated response
        queryClient.invalidateQueries({ queryKey: ["recommendations"] });
        queryClient.invalidateQueries({ queryKey: ["recommendation-preferences"] });
      })(),
      {
        loading: "Contacting SkillBridge AI Engine...",
        success: "Recommendations refreshed successfully!",
        error: "Failed to recalculate recommendations.",
      }
    );
  };

  // Check if onboarding is needed (empty preferences)
  const isNewUser =
    preferences &&
    (!preferences.learningGoals || preferences.favoriteCategories.length === 0);

  const isLoading = isPreferencesLoading || isRecsLoading;

  return (
    <div className="section-container py-12 space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary animate-pulse" />
            AI Smart Recommendation Engine
          </h1>
          <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
            Our personalized AI analyzes your learning behavior, goals, viewed courses, search query history, and completed badges to match the perfect study paths.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreferencesOpen(true)}
            className="flex items-center gap-1.5 h-10 rounded-xl"
          >
            <Settings className="h-4 w-4" />
            AI Preferences
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRecsRefetching}
            className="flex items-center gap-1.5 h-10 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isRecsRefetching ? "animate-spin" : ""}`} />
            Refresh Recommendations
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden h-10 w-10 border border-border/80 rounded-xl"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Onboarding View (Empty Preferences Profile) */}
      {isNewUser && (
        <div className="glass rounded-3xl p-8 border border-primary/20 text-center space-y-6 max-w-3xl mx-auto my-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Welcome to AI Recommendations!</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Tell SkillBridge AI about your interests, difficulty preferences, and targets, and our engine will create a tailored course selection for you.
            </p>
          </div>
          <Button onClick={() => setPreferencesOpen(true)} className="rounded-xl px-6">
            Configure AI Profile Settings
          </Button>
        </div>
      )}

      {/* Refinement seed overlay banner if active */}
      {refineCourseId && (
        <div className="glass flex items-center justify-between gap-4 p-4 rounded-xl border border-secondary/20 bg-secondary/5">
          <span className="text-xs font-semibold text-secondary-foreground flex items-center gap-1.5">
            <Compass className="h-4 w-4 animate-spin-slow" />
            Showing recommendations tailored to match your "More Like This" seed.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRefineCourseId(null);
              setPage(1);
            }}
            className="h-7 px-2 hover:bg-secondary/15 flex items-center gap-1 text-xs"
          >
            Reset Refinement
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Main Grid Content */}
      {isLoading ? (
        <RecommendationsSkeleton />
      ) : isError ? (
        <div className="py-12 border rounded-xl border-destructive/20 bg-destructive/5 text-center max-w-md mx-auto space-y-3">
          <p className="text-sm font-bold text-destructive">Failed to Load Recommendations</p>
          <p className="text-xs text-muted-foreground">There was an issue processing your profile tags. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => triggerRefetch()} className="mx-auto">
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-4">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>

          {/* Course recommendations list */}
          <div className="lg:col-span-3 space-y-6">
            {recsData && recsData.recommendations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {recsData.recommendations.map((course) => (
                    <RecommendationCard
                      key={course.id}
                      course={course}
                      onNotInterested={(id) =>
                        feedbackMutation.mutate({ courseId: id, type: "not_interested" })
                      }
                      onMoreLikeThis={(id) =>
                        feedbackMutation.mutate({ courseId: id, type: "more_like_this" })
                      }
                    />
                  ))}
                </div>

                {/* Pagination footer */}
                {recsData.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/40 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      className="rounded-xl"
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground font-semibold">
                      Page {page} of {recsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === recsData.totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, recsData.totalPages))}
                      className="rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Compass className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No recommendations found</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Try clearing your sidebar filters or update your AI preference settings to discover other learning courses.
                </p>
                <Button className="mt-6 rounded-xl" onClick={handleClearFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal preferences settings form */}
      {preferencesOpen && (
        <PreferencesForm
          initialData={preferences}
          onSave={async (data) => {
            await savePrefsMutation.mutateAsync(data);
          }}
          onClose={() => setPreferencesOpen(false)}
        />
      )}
    </div>
  );
}
