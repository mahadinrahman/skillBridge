# SkillBridge

A production-ready full-stack course marketplace built with **Next.js 16**, **React 19**, **TypeScript**, **MongoDB**, and **Better Auth**.

## Features

- **Authentication** — Email/password registration, login, logout, session management, and role-based access (Admin / User)
- **Public Pages** — Landing page, courses catalog, course details, about, contact, and 404
- **User Dashboard** — Profile and enrolled courses
- **Admin Dashboard** — Statistics, Recharts analytics, course management (add/delete)
- **Course Listing** — Search, category/level filters, price sorting, pagination, skeleton loaders
- **Modern UI** — Tailwind CSS, shadcn/ui components, Framer Motion animations, dark mode

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts, TanStack Query, React Hook Form, Zod |
| Backend | Next.js Route Handlers, MongoDB, Better Auth |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone and install dependencies**

```bash
npm install
```

2. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/skillbridge
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a secret:

```bash
openssl rand -base64 32
```

3. **Seed sample courses**

```bash
npm run seed
```

4. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### First User = Admin

The first registered user is automatically assigned the **admin** role. Subsequent users receive the **user** role.

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── auth/             # Server-side session helpers
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui primitives
│   ├── layout/       # Navbar, footer, theme toggle
│   ├── home/         # Landing page sections
│   └── courses/      # Course cards & skeletons
├── features/         # Feature-specific client components
├── hooks/            # Custom React hooks
├── lib/              # Auth, MongoDB, utilities
├── services/         # Database service layer
└── types/            # TypeScript type definitions
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/auth/[...all]` | Better Auth handlers |
| GET/POST | `/api/courses` | List/create courses |
| GET/DELETE | `/api/courses/[id]` | Get/delete course |
| GET/POST | `/api/enrollments` | User enrollments |
| GET | `/api/admin/stats` | Admin dashboard statistics |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed sample courses |

## License

MIT
