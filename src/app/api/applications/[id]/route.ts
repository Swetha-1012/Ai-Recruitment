import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application, Candidate, Job, User, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";
import { sendMockEmail } from "@/lib/email";

// GET: Fetch detailed application data (Recruiter/Manager/Candidate/Interviewer)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const application = await Application.findById(id)
      .populate("candidateId", "name email")
      .populate({
        path: "jobId",
        populate: { path: "companyId" }
      });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Security check: Candidates can only see their own applications
    if (auth.user!.role === "candidate" && application.candidateId._id.toString() !== auth.user!.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch candidate profile details
    const profile = await Candidate.findOne({ userId: application.candidateId._id });

    return NextResponse.json({ success: true, application, profile });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch application details" }, { status: 500 });
  }
}

// PATCH: Move candidate stages & append timeline logs (Recruiter/Manager/Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "manager", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const { stage, notes } = await req.json();

    if (!stage) {
      return NextResponse.json({ error: "Stage parameter is required" }, { status: 400 });
    }

    const application = await Application.findById(id).populate("candidateId", "name email");
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return NextResponse.json({ error: "Associated job not found" }, { status: 404 });
    }

    // Check Recruiter Company matching
    if (auth.user!.role !== "admin" && job.companyId.toString() !== auth.user!.companyId) {
      return NextResponse.json({ error: "Forbidden: Candidate belongs to another company listing" }, { status: 403 });
    }

    const oldStage = application.stage;
    application.stage = stage;
    
    // Add timeline log
    application.timeline.push({
      stage,
      timestamp: new Date(),
      updatedBy: auth.user!.userId,
      notes: notes || `Moved application from "${oldStage}" to "${stage}".`,
    });

    await application.save();

    // Trigger Notifications & Emails
    const stageNames: Record<string, string> = {
      screening: "Resume Screening",
      shortlisted: "Shortlisted",
      technical: "Technical Interview Selection",
      hr: "HR Interview Selection",
      offer: "Offer Letter Generated",
      hired: "Hired",
      rejected: "Archived/Rejected",
    };

    const friendlyStage = stageNames[stage] || stage;

    // Notify Candidate
    await Notification.create({
      recipientId: application.candidateId,
      message: `Your application for "${job.title}" has been updated to: "${friendlyStage}".`,
      type: stage === "rejected" ? "warning" : stage === "hired" || stage === "offer" ? "success" : "info",
    });

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "UPDATE_APPLICATION_STAGE",
      targetType: "Application",
      targetId: application._id,
      details: `Moved candidate application for "${job.title}" to "${stage}" (previously "${oldStage}")`,
    });

    // Mock Email Simulator Logs
    const candidateUser = application.candidateId as any;
    await sendMockEmail(
      candidateUser.email,
      `Application Update: ${job.title} at HireNova`,
      `Hello ${candidateUser.name},\n\nYour application for the "${job.title}" position has been updated. New Stage: ${friendlyStage}.\n\nLog in to your Candidate Dashboard to track details.\n\nBest regards,\nHireNova Recruitment Team`
    );

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("Update stage error:", err);
    return NextResponse.json({ error: err.message || "Failed to update stage" }, { status: 500 });
  }
}
