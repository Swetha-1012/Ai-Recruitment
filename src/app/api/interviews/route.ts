import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Interview, Application, User, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";
import { sendMockEmail } from "@/lib/email";

// GET: Fetch list of scheduled interviews
export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (auth.user!.role === "candidate") {
      filter.candidateId = auth.user!.userId;
    } else if (auth.user!.role === "interviewer") {
      filter.interviewerId = auth.user!.userId;
    } else if (applicationId) {
      filter.applicationId = applicationId;
    } else {
      // Recruiters/Managers can see all interviews for their company
      const companyUsers = await User.find({ companyId: auth.user!.companyId }).select("_id");
      const userIds = companyUsers.map((u) => u._id);
      filter.$or = [
        { interviewerId: { $in: userIds } },
        { candidateId: { $in: userIds } }
      ];
    }

    const interviews = await Interview.find(filter)
      .populate("candidateId", "name email")
      .populate("interviewerId", "name email")
      .populate({
        path: "applicationId",
        populate: { path: "jobId" }
      })
      .sort({ dateTime: 1 });

    return NextResponse.json({ success: true, interviews });
  } catch (err: any) {
    console.error("List interviews error:", err);
    return NextResponse.json({ error: "Failed to list interviews" }, { status: 500 });
  }
}

// POST: Schedule a new interview (Recruiter/Admin only)
export async function POST(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { applicationId, interviewerId, title, type, dateTime } = await req.json();

    if (!applicationId || !interviewerId || !title || !type || !dateTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const interviewer = await User.findById(interviewerId);
    if (!interviewer || interviewer.role !== "interviewer") {
      return NextResponse.json({ error: "Selected interviewer is invalid" }, { status: 400 });
    }

    const candidate = await User.findById(application.candidateId);
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 400 });
    }

    // Generate meeting link
    const meetingCode = Math.random().toString(36).substring(2, 5) + "-" + 
                        Math.random().toString(36).substring(2, 6) + "-" + 
                        Math.random().toString(36).substring(2, 5);
    const meetingLink = `https://meet.google.com/${meetingCode}`;

    const interview = await Interview.create({
      applicationId,
      candidateId: candidate._id,
      interviewerId: interviewer._id,
      title,
      type,
      dateTime: new Date(dateTime),
      meetingLink,
      status: "scheduled",
    });

    // Move application stage to 'technical' or 'hr' depending on type
    const newStage = type === "hr" ? "hr" : "technical";
    if (application.stage !== newStage) {
      application.stage = newStage;
      application.timeline.push({
        stage: newStage,
        timestamp: new Date(),
        updatedBy: auth.user!.userId,
        notes: `Interview scheduled: ${title}. Link generated: ${meetingLink}`,
      });
      await application.save();
    }

    // Notify Candidate
    await Notification.create({
      recipientId: candidate._id,
      message: `New interview scheduled: "${title}" (${type}) on ${new Date(dateTime).toLocaleString()}. Join link: ${meetingLink}`,
      type: "alert",
    });

    // Notify Interviewer
    await Notification.create({
      recipientId: interviewer._id,
      message: `Assigned Interview: Evaluate "${candidate.name}" for "${(application.jobId as any).title}" on ${new Date(dateTime).toLocaleString()}`,
      type: "info",
    });

    // Audit Log
    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "SCHEDULE_INTERVIEW",
      targetType: "Interview",
      targetId: interview._id,
      details: `Scheduled interview: ${title} with candidate ${candidate.name} and interviewer ${interviewer.name}`,
    });

    // Mock Email Logs
    await sendMockEmail(
      candidate.email,
      `Interview Invitation: ${title}`,
      `Hello ${candidate.name},\n\nYou have been scheduled for an interview: "${title}" (${type}) on ${new Date(dateTime).toLocaleString()}.\n\nMeeting Join Link: ${meetingLink}\n\nPlease join the meeting room 5 minutes prior to the start time.\n\nBest regards,\nHireNova Recruitment Team`
    );

    await sendMockEmail(
      interviewer.email,
      `Assigned Interview Round: ${candidate.name}`,
      `Hello ${interviewer.name},\n\nYou have been assigned to evaluate candidate "${candidate.name}" for the position of "${(application.jobId as any).title || 'Software Developer'}" on ${new Date(dateTime).toLocaleString()}.\n\nMeeting Join Link: ${meetingLink}\n\nLog in to your dashboard to record scorecard ratings after completion.\n\nBest regards,\nHireNova HR Operations`
    );

    return NextResponse.json({ success: true, interview });
  } catch (err: any) {
    console.error("Create interview error:", err);
    return NextResponse.json({ error: err.message || "Failed to schedule interview" }, { status: 500 });
  }
}
