"use client";

import { CATEGORIES, LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Filter } from "lucide-react";

interface FilterState {
  category: string;
  level: string;
  maxPrice: string;
  maxDuration: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClearFilters: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen = false,
  onClose,
}: FilterSidebarProps) {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const content = (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-wide text-foreground">Category</h4>
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange("category", "")}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all text-left ${
              !filters.category
                ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                : "bg-muted/40 hover:bg-muted text-muted-foreground"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange("category", cat)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all text-left ${
                filters.category === cat
                  ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Level */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-wide text-foreground">Difficulty</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterChange("level", "")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
              !filters.level
                ? "bg-primary/10 text-primary border-primary/30 font-bold"
                : "bg-muted/40 hover:bg-muted border-transparent text-muted-foreground"
            }`}
          >
            All
          </button>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => onFilterChange("level", lvl)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                filters.level === lvl
                  ? "bg-primary/10 text-primary border-primary/30 font-bold"
                  : "bg-muted/40 hover:bg-muted border-transparent text-muted-foreground"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-wide text-foreground">Max Price ($)</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="No Limit"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            className="h-9 text-xs"
            min="0"
          />
          {filters.maxPrice && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFilterChange("maxPrice", "")}
              className="h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Max Duration */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold tracking-wide text-foreground">Max Duration (Hours)</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="No Limit"
            value={filters.maxDuration}
            onChange={(e) => onFilterChange("maxDuration", e.target.value)}
            className="h-9 text-xs"
            min="0"
          />
          {filters.maxDuration && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFilterChange("maxDuration", "")}
              className="h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Clear Button */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full text-xs h-9 border-dashed"
        >
          Clear Active Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Card className="hidden lg:block h-fit border-border/80 bg-card/60 backdrop-blur-md sticky top-24">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/40 mb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-primary" />
            Sidebar Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">{content}</CardContent>
      </Card>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs border-l border-border bg-background p-6 shadow-2xl animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-primary" />
                Sidebar Filters
              </h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-120px)]">{content}</div>
          </div>
        </div>
      )}
    </>
  );
}
