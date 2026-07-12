"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { CourseCard } from "@/components/courses/course-card";
import { CourseGridSkeleton } from "@/components/courses/course-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, COURSES_PER_PAGE, LEVELS } from "@/lib/constants";
import type { CoursesQueryParams } from "@/types";

export function CoursesListing() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const sort = (searchParams.get("sort") as CoursesQueryParams["sort"]) || "newest";
  const page = Number(searchParams.get("page")) || 1;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`/courses?${params.toString()}`);
    },
    [router, searchParams]
  );

  const { data, isLoading, isError } = useCourses({
    search: searchParams.get("search") || undefined,
    category: category || undefined,
    level: level || undefined,
    sort,
    page,
    limit: COURSES_PER_PAGE,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search, page: "1" });
  };

  return (
    <div className="section-container py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Explore Courses</h1>
        <p className="mt-2 text-muted-foreground">
          Discover expert-led courses across technology, design, and business.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </form>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={category || "all"}
            onValueChange={(v) =>
              updateParams({ category: v === "all" ? "" : v, page: "1" })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={level || "all"}
            onValueChange={(v) =>
              updateParams({ level: v === "all" ? "" : v, page: "1" })
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {lvl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => updateParams({ sort: v, page: "1" })}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <CourseGridSkeleton count={COURSES_PER_PAGE} />}

      {isError && (
        <EmptyState
          title="Something went wrong"
          description="We couldn't load courses. Please try again later."
        />
      )}

      {data && data.courses.length === 0 && (
        <EmptyState
          title="No courses found"
          description="Try adjusting your search or filters to find what you're looking for."
          actionLabel="Clear Filters"
          actionHref="/courses"
        />
      )}

      {data && data.courses.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {data.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= data.totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
