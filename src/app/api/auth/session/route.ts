import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Candidate, Company } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    let profile = null;
    if (user.role === "candidate") {
      profile = await Candidate.findOne({ userId: user._id });
    }

    let company = null;
    if (user.companyId) {
      company = await Company.findById(user.companyId);
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      profile,
      company,
    });
  } catch (error: any) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
