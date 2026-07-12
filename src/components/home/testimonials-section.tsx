"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Frontend Developer at Stripe",
    content:
      "The React and TypeScript course gave me the confidence to switch careers. Within three months, I landed my first developer role.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Data Analyst at Spotify",
    content:
      "SkillBridge's data science track is incredibly practical. The projects mirror real workplace challenges, not toy datasets.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "UX Designer at Airbnb",
    content:
      "The design courses helped me build a portfolio that stood out. The instructor feedback was detailed and actionable.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Product Manager at Notion",
    content:
      "I enrolled in the business strategy course to complement my technical background. It was exactly what I needed to level up.",
    rating: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="section-container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">What Our Students Say</h2>
          <p className="mt-2 text-muted-foreground">
            Real stories from learners who transformed their careers with SkillBridge.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
