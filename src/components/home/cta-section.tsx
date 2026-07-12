"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  "120+ expert-led courses across 6 categories",
  "Learn at your own pace with lifetime access",
  "Earn certificates recognized by employers",
  "Join 25,000+ learners building real careers",
];

export function CTASection() {
  return (
    <section className="py-20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 sm:p-8 md:p-14"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Rocket className="h-4 w-4" />
                Start Your Learning Journey
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Ready to Transform Your Career?
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed sm:text-base">
                Whether you&apos;re switching careers or leveling up in your current
                role, SkillBridge gives you structured paths, hands-on projects,
                and the support you need to succeed.
              </p>

              <ul className="mt-8 space-y-3 text-left">
                {highlights.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-start gap-3 text-sm sm:text-base"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-6 text-center sm:p-8 lg:text-left">
              <h3 className="text-lg font-semibold sm:text-xl">
                Take the first step today
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a free account and explore courses designed for
                real-world success. No credit card required to get started.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button size="lg" className="w-full py-3 flex-1" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full py-3 flex-1" asChild>
                  <Link href="/courses">Browse All Courses</Link>
                </Button>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Free to sign up · Cancel anytime · 14-day money-back guarantee
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
