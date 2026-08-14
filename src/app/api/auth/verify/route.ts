import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog } from "@/lib/models";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, userId } = await req.json();

    let user;
    if (token) {
      user = await User.findOne({ verificationToken: token });
    } else if (userId) {
      user = await User.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid token or user ID" }, { status: 400 });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    await AuditLog.create({
      actorId: user._id,
      action: "VERIFY_EMAIL",
      targetType: "User",
      targetId: user._id,
      details: `User verified email: ${user.email}`,
    });

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
