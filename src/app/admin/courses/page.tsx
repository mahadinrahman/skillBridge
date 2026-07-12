import { requireAdmin } from "@/auth/session";
import { ManageCoursesTable } from "@/features/admin/manage-courses-table";

export const metadata = {
  title: "Manage Courses",
};

export const dynamic = "force-dynamic";

export default async function ManageCoursesPage() {
  await requireAdmin();
  return <ManageCoursesTable />;
}
