import Link from "next/link";
import { Target, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About",
};

const values = [
  {
    icon: Target,
    title: "Mission-Driven Learning",
    description:
      "We believe quality education should be accessible to everyone. Our mission is to bridge the gap between ambition and expertise through practical, career-focused courses.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "Learning thrives in community. SkillBridge fosters connections between students, instructors, and industry mentors to create a supportive learning environment.",
  },
  {
    icon: Zap,
    title: "Real-World Skills",
    description:
      "Every course is designed with employability in mind. You'll work on projects that mirror real workplace challenges, not abstract exercises.",
  },
];

export default function AboutPage() {
  return (
    <div className="section-container py-12">
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight">About SkillBridge</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          SkillBridge was founded in 2022 with a simple idea: make professional-grade
          education accessible to anyone with the drive to learn. Today, we serve over
          25,000 students across 40 countries, offering courses in web development, data
          science, design, business, and more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-16">
        {values.map((value) => (
          <Card key={value.title} className="text-center">
            <CardContent className="p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <value.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="glass rounded-3xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold">Ready to Start Your Journey?</h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Join thousands of learners who have transformed their careers with
          SkillBridge. Your next chapter starts here.
        </p>
        <Button className="mt-6" size="lg" asChild>
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    </div>
  );
}
