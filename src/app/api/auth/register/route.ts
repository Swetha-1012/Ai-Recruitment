import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, Company, Candidate, AuditLog } from "@/lib/models";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";
import { sendMockEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = checkRateLimit(ip, 20, 60000); // 20 requests per minute
    if (!limiter.success) {
      return rateLimitResponse(limiter.resetTime);
    }

    await connectDB();
    const { name, email, password, role, companyName } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    let companyId = null;

    // Handle Company for Recruiter/Manager/Interviewer roles
    if (["recruiter", "manager", "interviewer"].includes(role)) {
      if (companyName) {
        let comp = await Company.findOne({ name: companyName });
        if (!comp) {
          comp = await Company.create({
            name: companyName,
            industry: "Technology",
            size: "10-50",
            website: `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            locations: ["Remote", "Hybrid"],
          });
        }
        companyId = comp._id;
      } else {
        // Fallback default company
        let defaultCompany = await Company.findOne({ name: "HireNova Tech" });
        if (!defaultCompany) {
          defaultCompany = await Company.create({
            name: "HireNova Tech",
            industry: "Software & Technology",
            size: "100-500",
            website: "https://hirenova.tech",
            locations: ["New York", "San Francisco", "Remote"],
          });
        }
        companyId = defaultCompany._id;
      }
    }

    // Create user. For Admin, Recruiter, etc. we set isEmailVerified: true by default to speed up hackathon demo flows.
    // Candidates are registered as unverified and can be verified via our simple dashboard simulation.
    const isEmailVerified = role !== "candidate";
    const verificationToken = role === "candidate" 
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : undefined;

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      companyId,
      isEmailVerified,
      verificationToken,
    });

    if (role === "candidate" && verificationToken) {
      await sendMockEmail(
        email.toLowerCase(),
        "HireNova - Registration Email Verification OTP",
        `Hello ${name},\n\nWelcome to HireNova! To complete your registration and activate your candidate account, please enter the following 6-digit verification OTP:\n\nVerification OTP: ${verificationToken}\n\nThis code is valid for 15 minutes.\n\nBest regards,\nHireNova Recruitment Team`
      );
    }

    // Create Profile if user is a Candidate
    if (role === "candidate") {
      await Candidate.create({
        userId: newUser._id,
        education: [],
        experience: [],
        skills: [],
        certifications: [],
      });
    }

    // Write Audit Log
    await AuditLog.create({
      actorId: newUser._id,
      action: "REGISTER",
      targetType: "User",
      targetId: newUser._id,
      details: `User registered with name ${name} and role ${role}`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
