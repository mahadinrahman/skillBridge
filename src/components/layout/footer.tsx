import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const footerLinks = {
  platform: [
    { href: "/courses", label: "Browse Courses" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/register", label: "Create Account" },
  ],
  categories: [
    { href: "/courses?category=Web+Development", label: "Web Development" },
    { href: "/courses?category=Data+Science", label: "Data Science" },
    { href: "/courses?category=Design", label: "Design" },
    { href: "/courses?category=Business", label: "Business" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/50">
      <div className="section-container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              {APP_NAME}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SkillBridge connects ambitious learners with expert-led courses
              designed for real-world careers in technology, design, and business.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                hello@skillbridge.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                + 8801397899955
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                121 MR Roard, Manirampur, Jashore
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
