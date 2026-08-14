import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog, Notification } from "@/lib/models";
import { hashPassword } from "@/lib/auth";
import { sendMockEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { action, email, otp, newPassword } = await req.json();

    if (action === "request") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Return 200 for security, but without details
        return NextResponse.json({ success: true, message: "If the email is registered, an OTP will be sent." });
      }

      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPasswordOTP = generatedOtp;
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();

      // Create in-app notification & mock email
      await Notification.create({
        recipientId: user._id,
        message: `Password reset OTP generated. Your OTP is ${generatedOtp}. It will expire in 10 minutes.`,
        type: "warning",
      });

      // Audit Log
      await AuditLog.create({
        actorId: user._id,
        action: "PASSWORD_RESET_REQUEST",
        targetType: "User",
        targetId: user._id,
        details: `Password reset OTP generated for email: ${user.email}`,
      });

      // Simulating email sending
      await sendMockEmail(
        user.email,
        "HireNova - Password Reset Verification OTP",
        `Hello ${user.name},\n\nYou requested a password reset. Your 6-digit verification OTP is: ${generatedOtp}.\n\nThis code will expire in 10 minutes.\n\nBest regards,\nHireNova Recruitment Team`
      );

      return NextResponse.json({
        success: true,
        message: "OTP sent to your email. (Check notifications or server console log in development mode)",
        devOtp: generatedOtp, // Output in development to make demoing effortless
      });
    }

    if (action === "reset") {
      if (!email || !otp || !newPassword) {
        return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Update password
      user.password = await hashPassword(newPassword);
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      await AuditLog.create({
        actorId: user._id,
        action: "PASSWORD_RESET_COMPLETE",
        targetType: "User",
        targetId: user._id,
        details: `Password successfully reset for email: ${user.email}`,
      });

      return NextResponse.json({ success: true, message: "Password reset successful! You can now log in." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
