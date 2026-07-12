"use client";

import { useQuery } from "@tanstack/react-query";
import type { CoursesQueryParams, PaginatedCourses } from "@/types";

async function fetchCourses(
  params: CoursesQueryParams
): Promise<PaginatedCourses> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.level) searchParams.set("level", params.level);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const res = await fetch(`/api/courses?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
}

export function useCourses(params: CoursesQueryParams) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => fetchCourses(params),
  });
}
