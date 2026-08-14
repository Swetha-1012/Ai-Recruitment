import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Notification } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await Notification.find({ recipientId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
