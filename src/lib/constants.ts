export const APP_NAME = "SkillBridge";

export const CATEGORIES = [
  "Web Development",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "Cloud Computing",
  "Educations",
] as const;

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const COURSES_PER_PAGE = 8;

export const NAV_LINKS = {
  public: [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  user: [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/courses", label: "Manage Courses" },
    { href: "/admin/courses/new", label: "Add Course" },
    { href: "/dashboard/profile", label: "Profile" },
  ],
} as const;
