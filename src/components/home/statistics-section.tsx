"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "25K+", label: "Active Students" },
  { value: "120+", label: "Expert Courses" },
  { value: "4.8", label: "Average Rating" },
  { value: "95%", label: "Completion Rate" },
];

export function StatisticsSection() {
  return (
    <section className="py-20">
      <div className="section-container">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Numbers That Speak for Themselves
            </h2>
            <p className="mt-2 text-muted-foreground">
              Join a growing community of learners transforming their careers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
