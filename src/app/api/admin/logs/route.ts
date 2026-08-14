import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function GET() {
  try {
    await connectDB();
    const auth = await apiAuth(["admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const logs = await AuditLog.find({})
      .populate("actorId", "name email role")
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
