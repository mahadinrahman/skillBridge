"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[65vh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-10 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="section-container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Trusted by 25,000+ learners worldwide
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Master In-Demand Skills with{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Expert-Led Courses
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              SkillBridge helps you learn web development, data science, design,
              and business skills through structured courses built by industry
              professionals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" asChild>
              <Link href="/courses">
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">
                <PlayCircle className="h-4 w-4" />
                Start Learning Free
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
