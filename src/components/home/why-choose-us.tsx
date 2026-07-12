"use client";

import { motion } from "framer-motion";
import { Award, Clock, Headphones, Users } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Industry-Recognized Certificates",
    description:
      "Earn certificates upon completion that you can showcase on LinkedIn and your resume.",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    description:
      "Learn from practitioners with years of real-world experience at top companies.",
  },
  {
    icon: Clock,
    title: "Learn at Your Own Pace",
    description:
      "Lifetime access to course materials so you can revisit lessons whenever you need.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description:
      "Get help from our support team and connect with fellow learners in every course.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20">
      <div className="section-container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose SkillBridge</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to go from beginner to job-ready professional.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
