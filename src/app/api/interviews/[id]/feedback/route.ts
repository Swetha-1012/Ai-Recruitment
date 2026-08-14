import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Interview, Feedback, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["interviewer", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const { ratings, comments } = await req.json();

    if (!ratings || typeof ratings !== "object") {
      return NextResponse.json({ error: "Ratings object is required" }, { status: 400 });
    }

    const { technical, communication, problemSolving, teamwork, leadership } = ratings;

    if (
      technical === undefined ||
      communication === undefined ||
      problemSolving === undefined ||
      teamwork === undefined ||
      leadership === undefined
    ) {
      return NextResponse.json({ error: "All rating categories are required" }, { status: 400 });
    }

    const interview = await Interview.findById(id).populate("applicationId");
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Verify interviewer matches
    if (auth.user!.role !== "admin" && interview.interviewerId.toString() !== auth.user!.userId) {
      return NextResponse.json({ error: "Forbidden: You are not the assigned interviewer" }, { status: 403 });
    }

    // Calculate overall rating as average
    const overallRating = parseFloat(
      ((technical + communication + problemSolving + teamwork + leadership) / 5).toFixed(1)
    );

    // Create Feedback entry
    const feedback = await Feedback.create({
      interviewId: interview._id,
      interviewerId: auth.user!.userId,
      ratings: { technical, communication, problemSolving, teamwork, leadership },
      overallRating,
      comments,
    });

    // Update Interview status
    interview.status = "feedback_submitted";
    await interview.save();

    // Notify Recruiter
    const application = interview.applicationId as any;
    const recruiter = await User.findById(application.timeline[0]?.updatedBy || application.candidateId);
    if (recruiter) {
      await Notification.create({
        recipientId: recruiter._id,
        message: `Feedback submitted for candidate "${(interview.candidateId as any).name || 'Applicant'}". Overall score: ${overallRating}/10`,
        type: "success",
      });
    }

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "SUBMIT_FEEDBACK",
      targetType: "Feedback",
      targetId: feedback._id,
      details: `Submitted interview feedback. Score: ${overallRating}/10`,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err: any) {
    console.error("Submit feedback error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit feedback" }, { status: 500 });
  }
}

// GET: Fetch feedback for an interview
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const feedback = await Feedback.findOne({ interviewId: id }).populate("interviewerId", "name email");

    // Mask salary and keep checks (Interviewers cannot view details if candidate profile contains it, though feedback is fine)
    // Here we just return feedback.
    if (!feedback) {
      return NextResponse.json({ success: false, message: "Feedback not yet submitted" });
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
