import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog } from "@/lib/models";
import { signToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    // In a real OAuth flow, we would exchange code for Google token, verify it, and get candidate email.
    // Here we fetch candidate1@example.com (Arun Kumar) as the simulated OAuth response.
    const candidateEmail = "candidate1@example.com";
    const user = await User.findOne({ email: candidateEmail });

    if (!user) {
      return NextResponse.json({ error: "Simulated OAuth user not found. Please re-seed the database." }, { status: 404 });
    }

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId?.toString(),
    });

    await AuditLog.create({
      actorId: user._id,
      action: "OAUTH_LOGIN",
      targetType: "User",
      targetId: user._id,
      details: "User logged in successfully via simulated Google OAuth.",
    });

    // Construct response redirecting to candidate dashboard
    const url = new URL("/dashboard/candidate", req.url);
    const response = NextResponse.redirect(url);

    // Set secure cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    return NextResponse.json({ error: err.message || "OAuth login failed" }, { status: 500 });
  }
}
