import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application, Job, Candidate, User, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";
import { calculateMatchScore } from "@/lib/ai";

// GET: List applications (filter by candidate, job, or company)
export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const candidateId = searchParams.get("candidateId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (auth.user!.role === "candidate") {
      // Candidates can only see their own applications
      filter.candidateId = auth.user!.userId;
    } else if (candidateId) {
      filter.candidateId = candidateId;
    }

    if (jobId) {
      filter.jobId = jobId;
    }

    // If recruiter or manager, restrict to their company's jobs
    if (["recruiter", "manager", "interviewer"].includes(auth.user!.role)) {
      const companyJobs = await Job.find({ companyId: auth.user!.companyId }).select("_id");
      const jobIds = companyJobs.map((j) => j._id);
      filter.jobId = { $in: jobIds };
    }

    const applications = await Application.find(filter)
      .populate("candidateId", "name email")
      .populate({
        path: "jobId",
        populate: { path: "companyId" }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, applications });
  } catch (err: any) {
    console.error("List applications error:", err);
    return NextResponse.json({ error: "Failed to list applications" }, { status: 500 });
  }
}

// POST: Apply to a job (Candidate only)
export async function POST(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["candidate"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await Job.findById(jobId).populate("companyId");
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "closed") {
      return NextResponse.json({ error: "This job post has been closed" }, { status: 400 });
    }

    const candidateId = auth.user!.userId;

    // Check for duplicate application
    const existing = await Application.findOne({ candidateId, jobId });
    if (existing) {
      return NextResponse.json({ error: "You have already applied to this job position" }, { status: 400 });
    }

    // Check if candidate has uploaded their resume
    const candidateProfile = await Candidate.findOne({ userId: candidateId });
    if (!candidateProfile || !candidateProfile.resumeText) {
      return NextResponse.json({ error: "Please upload your resume to your profile before applying" }, { status: 400 });
    }

    // Run AI Resume Matching Score comparisons
    const matchAnalysis = await calculateMatchScore(
      candidateProfile.resumeText,
      job.skills,
      job.description
    );

    // Create the Application
    const application = await Application.create({
      candidateId,
      jobId,
      stage: "applied",
      resumeMatchScore: matchAnalysis.score,
      aiAnalysis: {
        strongSkills: matchAnalysis.strongSkills,
        missingSkills: matchAnalysis.missingSkills,
        weakAreas: matchAnalysis.weakAreas,
        recommendations: matchAnalysis.recommendations,
      },
      timeline: [
        {
          stage: "applied",
          timestamp: new Date(),
          notes: "Application submitted successfully.",
        },
      ],
    });

    // Notify Recruiters at this company
    const recruiters = await User.find({ companyId: job.companyId, role: "recruiter" });
    for (const rec of recruiters) {
      await Notification.create({
        recipientId: rec._id,
        message: `New applicant: ${auth.user!.name} applied for "${job.title}". Match Score: ${matchAnalysis.score}%`,
        type: "info",
      });
    }

    // In-app alert for candidate
    await Notification.create({
      recipientId: candidateId,
      message: `Your application for "${job.title}" at ${job.companyId.name} was received. AI Match: ${matchAnalysis.score}%`,
      type: "success",
    });

    await AuditLog.create({
      actorId: candidateId,
      action: "SUBMIT_APPLICATION",
      targetType: "Application",
      targetId: application._id,
      details: `Applied to job: ${job.title}. Match score calculated: ${matchAnalysis.score}%`,
    });

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    console.error("Apply error:", err);
    return NextResponse.json({ error: err.message || "Application submission failed" }, { status: 500 });
  }
}
