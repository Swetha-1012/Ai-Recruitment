import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, AuditLog } from "@/lib/models";
import { comparePassword, signToken } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { sendMockEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = checkRateLimit(ip, 30, 60000); // 30 requests per minute
    if (!limiter.success) {
      return rateLimitResponse(limiter.resetTime);
    }

    await connectDB();
    const { email, password, otp, action } = await req.json();

    // 1. PASSWORDLESS OTP - REQUEST STEP
    if (action === "request_otp") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }

      // Generate a 6-digit login OTP
      const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPasswordOTP = loginOtp;
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      // Dispatch simulated email
      await sendMockEmail(
        user.email,
        "HireNova - Passwordless Login Verification OTP",
        `Hello ${user.name},\n\nYou requested a passwordless login code. Your 6-digit verification OTP is:\n\nLogin OTP: ${loginOtp}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nHireNova Recruitment Team`
      );

      return NextResponse.json({
        success: true,
        message: "Login OTP sent to your email. (Check notifications or server console log)",
        devOtp: loginOtp
      });
    }

    let user;

    // 2. PASSWORDLESS OTP - VERIFY STEP
    if (action === "verify_otp") {
      if (!email || !otp) {
        return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
      }

      user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordOTP: otp,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Clear the used OTP
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    } else {
      // 3. STANDARD PASSWORD AUTHENTICATION
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const isMatch = await comparePassword(password, user.password!);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    // Sign JWT
    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        isEmailVerified: user.isEmailVerified,
      },
    });

    // Set cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Log the action
    await AuditLog.create({
      actorId: user._id,
      action: "LOGIN",
      targetType: "User",
      targetId: user._id,
      details: `User logged in: ${user.email}`,
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
