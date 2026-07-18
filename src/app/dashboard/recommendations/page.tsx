import { requireAuth } from "@/auth/session";
import { RecommendationsDashboard } from "@/features/recommendations/recommendations-dashboard";

export const metadata = {
  title: "AI Course Recommendations",
  description: "Personalized AI-powered learning path recommendation engine matching your interests and goals.",
};

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  // Ensure the user is logged in before rendering the recommendation interface
  await requireAuth();

  return <RecommendationsDashboard />;
}
