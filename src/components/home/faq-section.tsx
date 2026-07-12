"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I enroll in a course?",
    answer:
      "Create a free account, browse our course catalog, and click Enroll on any course page. You'll get instant access to all course materials.",
  },
  {
    question: "Do courses include certificates?",
    answer:
      "Yes. Upon completing all lessons and assignments, you'll receive a downloadable certificate you can add to your LinkedIn profile and resume.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Absolutely. All courses are self-paced with lifetime access. Learn on your schedule, whether that's 30 minutes a day or intensive weekend sessions.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, and PayPal. Course prices are listed in USD with no hidden fees.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a 14-day money-back guarantee. If you're not satisfied with a course, contact our support team within 14 days of purchase for a full refund.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20">
      <div className="section-container max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Got questions? We have answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="glass rounded-xl overflow-hidden">
              <button
                className="flex w-full items-center justify-between p-5 text-left font-medium"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                {faq.question}
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
