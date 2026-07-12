import { requireAuth } from "@/auth/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth";

export const metadata = {
  title: "Profile",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = session.user as AuthUser;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="section-container py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your account information.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <Badge variant={user.role === "admin" ? "accent" : "secondary"} className="mt-1">
                {user.role === "admin" ? "Administrator" : "Student"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="mt-1 font-medium">
                {user.createdAt ? formatDate(user.createdAt) : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
