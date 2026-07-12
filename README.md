# 📚 SkillBridge – Full Stack Course Marketplace

SkillBridge is a comprehensive full-stack online learning platform designed to connect learners with high-quality educational content. Users can explore courses, enroll in programs, and manage their learning journey, while administrators oversee course management and platform analytics. The project demonstrates modern full-stack development using Next.js, TypeScript, MongoDB, and Better Auth.

---

# 🎯 Purpose of the Project

SkillBridge aims to simplify online education by providing a modern course marketplace where students can discover and enroll in courses with ease. From a technical perspective, the project showcases authentication, role-based authorization, dynamic course management, responsive UI design, and real-time dashboard analytics using a production-ready Next.js architecture.

---

## 🔗 Live Demo

**Live Website:** https://your-live-site.vercel.app

**GitHub Repository:** https://github.com/your-username/skillbridge

---

# ✨ Key Features

## 👤 Authentication & Authorization

- Secure Email/Password authentication powered by Better Auth.
- Session management with persistent login.
- Role-Based Access Control (Admin & User).
- Automatic admin assignment for the first registered user.

---

## 📚 Course Marketplace

- Browse all available courses.
- Powerful search functionality.
- Category and difficulty level filtering.
- Price sorting.
- Pagination for better performance.
- Responsive course detail pages.
- Skeleton loaders for smooth loading experience.

---

## 👨‍🎓 User Dashboard

- Personal profile management.
- View enrolled courses.
- Track learning progress through dashboard.

---

## 👨‍💼 Admin Dashboard

- Platform statistics dashboard.
- Course management system.
- Add new courses.
- Delete existing courses.
- Interactive analytics using Recharts.

---

## 🎨 UI & User Experience

- Modern responsive interface.
- Built with Tailwind CSS and shadcn/ui.
- Dark & Light mode support.
- Smooth animations powered by Framer Motion.
- Optimized loading experience with skeleton components.

---

# 🛠 Technologies & Packages Used

## Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TanStack Query
- React Hook Form
- Zod
- Recharts

## Backend

- Next.js Route Handlers
- MongoDB
- Better Auth

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- MongoDB Atlas (or Local MongoDB)

---

## Installation

Clone the repository

```bash
git clone https://github.com/your-username/skillbridge.git
```

Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file and add:

```env
MONGODB_URI=mongodb://localhost:27017/skillbridge

BETTER_AUTH_SECRET=your-secret-key

BETTER_AUTH_URL=http://localhost:3000

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a Better Auth secret

```bash
openssl rand -base64 32
```

---

## Seed Sample Data

```bash
npm run seed
```

---

## Run the Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

# 👥 User Roles

## 👨‍🎓 User

- Register & Login
- Browse courses
- Search & filter courses
- Enroll in courses
- View enrolled courses
- Manage personal profile

---

## 👨‍💼 Admin

- Manage all courses
- Add new courses
- Delete courses
- Monitor platform statistics
- View analytics dashboard

---

# 📂 Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── auth/             # Authentication helpers
├── components/
│   ├── ui/
│   ├── layout/
│   ├── home/
│   └── courses/
├── features/
├── hooks/
├── lib/
├── services/
└── types/
```

---

# 📡 API Overview

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | /api/auth/[...all] | Better Auth handlers |
| GET/POST | /api/courses | Get/Create courses |
| GET/DELETE | /api/courses/[id] | Course details/Delete |
| GET/POST | /api/enrollments | User enrollments |
| GET | /api/admin/stats | Dashboard statistics |

---

# 📜 Available Scripts

| Command | Description |
|---------|-------------|
| npm run dev | Start development server |
| npm run build | Production build |
| npm run start | Start production server |
| npm run lint | Run ESLint |
| npm run seed | Seed sample courses |

---

# 👨‍💻 Author

**Mahadin Rahman**

Frontend Developer

---

⭐ If you like this project, consider giving it a star on GitHub!