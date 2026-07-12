"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, HelpCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  // FAQ Accordion State
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday through Friday, from 9:00 AM to 6:00 PM EST. We usually respond to all inquiries within 24 hours.",
    },
    {
      question: "Do you offer corporate or team discounts?",
      answer: "Yes, we offer tailored pricing plans for teams, universities, and organizations. Contact our sales team via email for a custom quote.",
    },
    {
      question: "Can I request a refund if I'm not satisfied?",
      answer: "Absolutely. We offer a 14-day money-back guarantee for all individual course purchases if you haven't completed more than 20% of the content.",
    },
    {
      question: "How do I get a certificate of completion?",
      answer: "Once you complete 100% of the lessons and quizzes in a course, your certificate will be generated automatically in your dashboard.",
    },
  ];

  return (
    <div className="section-container py-12 px-4 mx-auto max-w-6xl">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Have a question? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 max-w-5xl mx-auto items-start">
        {/* Contact Info Column */}
        <div className="space-y-6">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground">hello@skillbridge.com</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm text-muted-foreground">+880 1234 567890</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardContent className="flex items-start gap-4 p-6">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-sm text-muted-foreground">
                  121 MR Road
                  <br />
                  Manirampur,Jashore, Bangladesh
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic FAQ Accordion Column */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-muted/20 bg-muted/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 divide-y divide-muted/20">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left font-medium transition-colors hover:text-primary"
                  >
                    <span className="text-sm sm:text-base pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}