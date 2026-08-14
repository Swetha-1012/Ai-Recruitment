import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Candidate, User, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["candidate", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const body = await req.json();
    const userId = auth.user!.userId;

    const {
      name,
      phone,
      location,
      education,
      experience,
      skills,
      certifications,
      portfolio,
      github,
      linkedin,
      coverLetter,
    } = body;

    // Update User Name
    if (name) {
      await User.findByIdAndUpdate(userId, { name });
    }

    // Find or create profile
    let profile = await Candidate.findOne({ userId });
    if (!profile) {
      profile = new Candidate({ userId });
    }

    profile.phone = phone !== undefined ? phone : profile.phone;
    profile.location = location !== undefined ? location : profile.location;
    profile.education = education !== undefined ? education : profile.education;
    profile.experience = experience !== undefined ? experience : profile.experience;
    profile.skills = skills !== undefined ? (Array.isArray(skills) ? skills : skills.split(",").map((s: string) => s.trim())) : profile.skills;
    profile.certifications = certifications !== undefined ? (Array.isArray(certifications) ? certifications : certifications.split(",").map((s: string) => s.trim())) : profile.certifications;
    profile.portfolio = portfolio !== undefined ? portfolio : profile.portfolio;
    profile.github = github !== undefined ? github : profile.github;
    profile.linkedin = linkedin !== undefined ? linkedin : profile.linkedin;
    profile.coverLetter = coverLetter !== undefined ? coverLetter : profile.coverLetter;

    await profile.save();

    await AuditLog.create({
      actorId: userId,
      action: "UPDATE_PROFILE",
      targetType: "Candidate",
      targetId: profile._id,
      details: "Updated profile details manually.",
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
