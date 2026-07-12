import { requireAdmin } from "@/auth/session";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export const metadata = {
  title: "Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  return <AdminDashboard />;
}
