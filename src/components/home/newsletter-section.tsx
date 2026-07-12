"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success("Thanks for subscribing! Check your inbox for a welcome email.");
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="glass mx-auto max-w-2xl rounded-3xl p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold tracking-tight">Stay in the Loop</h2>
          <p className="mt-3 text-muted-foreground">
            Get weekly updates on new courses, exclusive discounts, and learning
            tips delivered straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4" />
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
