import { loadEnvConfig } from "@next/env";
import { MongoClient } from "mongodb";

// Load environment variables from .env files
loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/skillbridge";

const courses = [
  {
    title: "Complete React & Next.js Masterclass",
    shortDescription:
      "Build production-ready web applications with React 19 and Next.js App Router.",
    description:
      "Master modern frontend development with React and Next.js. This comprehensive course covers component architecture, server components, data fetching, authentication patterns, and deployment strategies.\n\nYou'll build three real-world projects including a full-stack dashboard, an e-commerce storefront, and a content management system. By the end, you'll have the skills to architect and ship production applications.",
    price: 89,
    category: "Web Development",
    level: "Intermediate",
    duration: "42 hours",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    rating: 4.9,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "Python for Data Science & Machine Learning",
    shortDescription:
      "Learn data analysis, visualization, and machine learning with Python and pandas.",
    description:
      "Dive into the world of data science with Python. This course takes you from fundamentals to advanced machine learning techniques used by data scientists at top tech companies.\n\nYou'll work with real datasets, build predictive models, and create compelling visualizations. Topics include pandas, NumPy, scikit-learn, and introductory deep learning with TensorFlow.",
    price: 79,
    category: "Data Science",
    level: "Beginner",
    duration: "38 hours",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    rating: 4.8,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "UI/UX Design Fundamentals",
    shortDescription:
      "Create beautiful, user-centered interfaces with Figma and modern design principles.",
    description:
      "Learn the art and science of user interface design. This course covers design thinking, user research, wireframing, prototyping, and visual design principles.\n\nUsing Figma as your primary tool, you'll design complete app interfaces from scratch. You'll also learn accessibility standards, design systems, and how to present your work to stakeholders.",
    price: 69,
    category: "Design",
    level: "Beginner",
    duration: "28 hours",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    rating: 4.7,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "Digital Marketing Strategy",
    shortDescription:
      "Master SEO, content marketing, social media, and paid advertising campaigns.",
    description:
      "Build a comprehensive digital marketing skill set that drives real business results. This course covers search engine optimization, content strategy, email marketing, social media management, and paid advertising on Google and Meta platforms.\n\nYou'll create a complete marketing plan for a fictional brand and learn to measure ROI using analytics tools like Google Analytics 4.",
    price: 59,
    category: "Marketing",
    level: "Beginner",
    duration: "24 hours",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    rating: 4.6,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "AWS Cloud Practitioner Certification Prep",
    shortDescription:
      "Prepare for the AWS Certified Cloud Practitioner exam with hands-on labs.",
    description:
      "Get cloud-ready with Amazon Web Services. This course prepares you for the AWS Cloud Practitioner certification while teaching practical cloud architecture skills.\n\nYou'll learn core AWS services including EC2, S3, RDS, Lambda, and IAM. Hands-on labs let you deploy real infrastructure in the AWS free tier. Perfect for developers and IT professionals entering the cloud space.",
    price: 99,
    category: "Cloud Computing",
    level: "Beginner",
    duration: "32 hours",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    rating: 4.8,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "Business Strategy & Entrepreneurship",
    shortDescription:
      "Learn to validate ideas, build business models, and launch successful startups.",
    description:
      "Turn your business ideas into reality with proven frameworks used by successful entrepreneurs. This course covers market validation, business model canvas, financial planning, fundraising, and growth strategies.\n\nYou'll develop a complete business plan and pitch deck for your own venture. Case studies from companies like Airbnb, Stripe, and Notion provide real-world context.",
    price: 74,
    category: "Business",
    level: "Intermediate",
    duration: "30 hours",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    rating: 4.7,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "Advanced TypeScript Patterns",
    shortDescription:
      "Deep dive into generics, utility types, decorators, and enterprise TypeScript architecture.",
    description:
      "Take your TypeScript skills to the expert level. This advanced course explores generic programming, conditional types, mapped types, template literal types, and the type system features that power large-scale applications.\n\nYou'll refactor a legacy JavaScript codebase to TypeScript, implement design patterns with full type safety, and learn testing strategies with Vitest and type-level testing.",
    price: 84,
    category: "Web Development",
    level: "Advanced",
    duration: "26 hours",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    rating: 4.9,
    createdBy: "system",
    createdAt: new Date(),
  },
  {
    title: "Full-Stack Node.js Development",
    shortDescription:
      "Build RESTful APIs and real-time applications with Node.js, Express, and MongoDB.",
    description:
      "Become a full-stack JavaScript developer with Node.js. This course covers server-side development, API design, database integration, authentication, WebSockets, and deployment.\n\nProjects include a task management API, a real-time chat application, and a microservices architecture. You'll also learn testing, logging, and monitoring best practices for production Node.js applications.",
    price: 94,
    category: "Web Development",
    level: "Intermediate",
    duration: "45 hours",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
    rating: 4.8,
    createdBy: "system",
    createdAt: new Date(),
  },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection("courses");

    const existing = await collection.countDocuments();
    if (existing > 0) {
      console.log(`Database already has ${existing} courses. Skipping seed.`);
      console.log("Run with FORCE_SEED=true to replace all courses.");
      if (process.env.FORCE_SEED !== "true") {
        return;
      }
      await collection.deleteMany({});
      console.log("Cleared existing courses.");
    }

    await collection.insertMany(courses);
    console.log(`Seeded ${courses.length} courses successfully.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
