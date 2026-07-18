"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Sparkles, EyeOff, Layers, ArrowRight } from "lucide-react";
import type { RecommendationItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  course: RecommendationItem;
  onNotInterested: (courseId: string) => void;
  onMoreLikeThis: (courseId: string) => void;
}

export function RecommendationCard({
  course,
  onNotInterested,
  onMoreLikeThis,
}: RecommendationCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onNotInterested(course.id);
    }, 300); // Wait for transition fade-out
  };

  // Determine color matching confidence level
  const getConfidenceColors = (score: number) => {
    if (score >= 85) {
      return {
        text: "text-emerald-500",
        stroke: "stroke-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };
    }
    if (score >= 70) {
      return {
        text: "text-violet-500",
        stroke: "stroke-violet-500",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      };
    }
    return {
      text: "text-indigo-500",
      stroke: "stroke-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    };
  };

  const colors = getConfidenceColors(course.confidenceScore);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (course.confidenceScore / 100) * circumference;

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative border-border/80 bg-card/60 backdrop-blur-md",
        isDismissing && "scale-95 opacity-0 pointer-events-none"
      )}
    >
      {/* Top Banner with Confidence & Dismiss */}
      <div className="absolute top-3 left-3 z-10">
        <Badge className={cn("flex items-center gap-1 font-semibold", colors.badge)}>
          <Sparkles className="h-3.5 w-3.5" />
          {course.confidenceScore}% Match
        </Badge>
      </div>

      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm border border-border/60 hover:text-destructive hover:bg-background transition-colors"
          title="Not Interested"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      </div>

      {/* Course Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      {/* Body */}
      <CardHeader className="space-y-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="bg-muted text-foreground/80">{course.category}</Badge>
          <div className="flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium">{course.rating.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-tight">
          {course.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.shortDescription}
        </p>

        <div className="flex items-center justify-between text-sm pt-2">
          <span className="font-medium text-muted-foreground">{course.level} • {course.duration}</span>
          <span className="text-xl font-black text-primary">
            {formatPrice(course.price)}
          </span>
        </div>

        {/* Why Recommended Section */}
        {showExplanation && (
          <div className={cn("glass rounded-xl p-3 text-xs space-y-1 relative border", colors.border)}>
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              Why Recomended
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {course.recommendationReason}
            </p>
          </div>
        )}
      </CardContent>

      {/* Footer Actions */}
      <CardFooter className="flex flex-col gap-2 pt-2 border-t border-border/40 bg-muted/30">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-1.5 text-xs h-9"
            onClick={() => onMoreLikeThis(course.id)}
          >
            <Layers className="h-3.5 w-3.5" />
            More Like This
          </Button>

          <Button size="sm" className="flex items-center justify-center gap-1 text-xs h-9" asChild>
            <Link href={`/courses/${course.id}`}>
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
