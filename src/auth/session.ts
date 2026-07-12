import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthServer, type AuthUser } from "@/lib/auth";

export async function getSession() {
  const auth = await getAuthServer();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return (session?.user as AuthUser) ?? null;
}

export async function requireAuth(redirectTo = "/login") {
  const session = await getSession();
  if (!session) {
    redirect(redirectTo);
  }
  return session;
}

export async function requireAdmin(redirectTo = "/dashboard") {
  const session = await requireAuth();
  const user = session.user as AuthUser;
  if (user.role !== "admin") {
    redirect(redirectTo);
  }
  return session;
}

export function isAdmin(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}
