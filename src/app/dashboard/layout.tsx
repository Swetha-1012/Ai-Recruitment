import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/models";
import DashboardShellClient from "./DashboardShellClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectDB();
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch unread notifications for this user
  const dbNotifications = await Notification.find({
    recipientId: user._id,
  })
    .sort({ createdAt: -1 })
    .limit(10);

  const notifications = dbNotifications.map((n) => ({
    id: n._id.toString(),
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));

  // Standardize user object for client consumption
  const clientUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId ? user.companyId.toString() : null,
    companyName: (user.companyId as any)?.name || null,
    isEmailVerified: user.isEmailVerified,
  };

  return (
    <DashboardShellClient user={clientUser} initialNotifications={notifications}>
      {children}
    </DashboardShellClient>
  );
}
