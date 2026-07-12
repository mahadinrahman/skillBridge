import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import type { MongoClient } from "mongodb";
import clientPromise from "@/lib/mongodb";

type UserRole = "admin" | "user";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any;

export async function getAuthServer() {
  if (authInstance) return authInstance;

  const client: MongoClient = await clientPromise;
  const db = client.db("skillbridge");

  authInstance = betterAuth({
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user: Record<string, unknown>) => {
            const userCount = await db.collection("user").countDocuments();
            return {
              data: {
                ...user,
                role: userCount === 0 ? "admin" : "user",
              },
            };
          },
        },
      },
    },
    trustedOrigins: [
      process.env.BETTER_AUTH_URL || "http://localhost:3000",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ],
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    plugins: [nextCookies()],
  });

  return authInstance;
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: UserRole;
  createdAt?: Date;
};
