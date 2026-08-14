import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { EmailLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function GET() {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "manager", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const emails = await EmailLog.find({})
      .sort({ sentAt: -1 })
      .limit(100);

    return NextResponse.json({ success: true, emails });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch email logs" }, { status: 500 });
  }
}
