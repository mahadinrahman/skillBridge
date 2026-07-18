"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, LEVELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PreferencesData {
  favoriteCategories: string[];
  preferredDifficulty: "Beginner" | "Intermediate" | "Advanced" | "All";
  learningGoals: string;
}

interface PreferencesFormProps {
  initialData?: PreferencesData;
  onSave: (data: PreferencesData) => Promise<void>;
  onClose: () => void;
}

export function PreferencesForm({
  initialData,
  onSave,
  onClose,
}: PreferencesFormProps) {
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(
    initialData?.favoriteCategories || []
  );
  const [preferredDifficulty, setPreferredDifficulty] = useState<
    "Beginner" | "Intermediate" | "Advanced" | "All"
  >(initialData?.preferredDifficulty || "All");
  const [learningGoals, setLearningGoals] = useState(
    initialData?.learningGoals || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle category inclusion
  const handleCategoryToggle = (category: string) => {
    setFavoriteCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (favoriteCategories.length === 0) {
      toast.error("Please select at least one favorite category");
      return;
    }
    if (!learningGoals.trim()) {
      toast.error("Please describe your learning goals");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        favoriteCategories,
        preferredDifficulty,
        learningGoals,
      });
      toast.success("Preferences updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl border border-border bg-background p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Custom Preferences
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Favorite Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-foreground">
              Select Your Interests (Favorite Categories)
            </Label>
            <p className="text-xs text-muted-foreground">
              Choose categories you would like the AI engine to prioritize.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const isSelected = favoriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all border text-left flex items-center justify-between ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
                    }`}
                  >
                    {cat}
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white ml-2 animate-ping" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-foreground">
              Preferred Skill Level
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["All", ...LEVELS].map((lvl) => {
                const isSelected = preferredDifficulty === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPreferredDifficulty(lvl as any)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-transparent"
                    }`}
                  >
                    {lvl === "All" ? "All Levels" : lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="space-y-3">
            <Label htmlFor="goals" className="text-sm font-bold text-foreground">
              Describe Your Learning Goals
            </Label>
            <p className="text-xs text-muted-foreground">
              What do you want to learn? (e.g. "I want to learn Next.js to build modern web apps and eventually get a job as a full-stack engineer.")
            </p>
            <Textarea
              id="goals"
              placeholder="Type your goals here..."
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="min-h-[100px] text-sm leading-relaxed rounded-xl"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground">
              {learningGoals.length}/500 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Refresh Recommendations"
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
