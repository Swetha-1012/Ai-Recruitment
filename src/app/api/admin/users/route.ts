import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (role) {
      filter.role = role;
    }

    // Return users in company
    if (auth.user!.role !== "admin") {
      filter.companyId = auth.user!.companyId;
    }

    const users = await User.find(filter).select("name email role companyId").sort({ name: 1 });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
