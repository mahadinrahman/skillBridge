import { requireAdmin } from "@/auth/session";
import { AddCourseForm } from "@/features/admin/add-course-form";

export const metadata = {
  title: "Add Course",
};

export const dynamic = "force-dynamic";

export default async function AddCoursePage() {
  await requireAdmin();
  return <AddCourseForm />;
}
