import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export default async function DashboardRootPage() {
  await connectDB();
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  redirect(`/dashboard/${user.role}`);
}
