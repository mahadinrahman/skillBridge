import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCourses } from "@/components/home/featured-courses";
import { CategoriesSection } from "@/components/home/categories-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { StatisticsSection } from "@/components/home/statistics-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FAQSection } from "@/components/home/faq-section";
import { CTASection } from "@/components/home/cta-section";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCourses />
      <CategoriesSection />
      <WhyChooseUs />
      <StatisticsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
