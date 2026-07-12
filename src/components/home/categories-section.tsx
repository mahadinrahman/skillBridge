"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Briefcase,
  Cloud,
  Code2,
  Megaphone,
  Palette,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const categoryIcons: Record<string, React.ElementType> = {
  "Web Development": Code2,
  "Data Science": BarChart3,
  Design: Palette,
  Business: Briefcase,
  Marketing: Megaphone,
  "Cloud Computing": Cloud,
};

export function CategoriesSection() {
  return (
    <section className="py-20">
      <div className="section-container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find the perfect course across six in-demand learning paths.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const Icon = categoryIcons[category] || Code2;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/courses?category=${encodeURIComponent(category)}`}
                  className="glass group flex items-center gap-4 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category}</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore curated {category.toLowerCase()} courses
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
