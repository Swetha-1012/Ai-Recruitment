import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { 
  Application, 
  User, 
  Candidate, 
  Job, 
  Interview, 
  Feedback, 
  AssessmentAttempt 
} from "@/lib/models";
import { apiAuth } from "@/lib/middleware";
import { 
  calculateMatchScore, 
  generateInterviewQuestions, 
  generateInterviewSummary 
} from "@/lib/ai";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "manager", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    
    // Load application
    const application = await Application.findById(id)
      .populate("candidateId", "name email role")
      .populate("jobId");
      
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const candidateUser = application.candidateId as any;
    const job = application.jobId as any;

    // Load candidate profile details
    const candidateProfile = await Candidate.findOne({ userId: candidateUser._id });
    if (!candidateProfile) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    // Fetch interviews for this application
    const interviews = await Interview.find({ applicationId: application._id })
      .populate("interviewerId", "name email");

    // Fetch feedback logs for completed interviews
    const interviewIds = interviews.map((i) => i._id);
    const feedbackList = await Feedback.find({ interviewId: { $in: interviewIds } })
      .populate("interviewerId", "name");

    // Fetch coding assessments attempts
    const assessmentsAttempts = await AssessmentAttempt.find({ applicationId: application._id })
      .populate("assessmentId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ai: any = application.aiAnalysis || {};
    let saveNeeded = false;

    // 1. Check/Recompute Match Score Breakdown
    if (!ai.overallMatch || ai.overallMatch === 50) {
      const match = await calculateMatchScore(
        candidateProfile.resumeText || "",
        job.skills,
        job.description
      );
      ai.overallMatch = match.overallMatch;
      ai.skillMatch = match.skillMatch;
      ai.experienceMatch = match.experienceMatch;
      ai.strongSkills = match.strongSkills;
      ai.partialSkills = match.partialSkills;
      ai.missingSkills = match.missingSkills;
      ai.evidence = match.evidence;
      ai.weakAreas = match.weakAreas;
      ai.recommendations = match.recommendations;
      saveNeeded = true;
    }

    // 2. Check/Generate Personalized Interview Questions
    if (!ai.interviewQuestions || ai.interviewQuestions.length === 0) {
      const questions = await generateInterviewQuestions(
        candidateProfile.resumeText || "",
        job.skills,
        job.description
      );
      ai.interviewQuestions = questions;
      saveNeeded = true;
    }

    // 3. Check/Generate Interview Summary if new feedback is submitted
    if (feedbackList.length > 0 && (!ai.interviewSummary || !ai.interviewSummary.consensus)) {
      // Calculate averages from all feedback logs
      const ratings = {
        technical: 0,
        communication: 0,
        problemSolving: 0,
        teamwork: 0,
        leadership: 0,
      };
      
      feedbackList.forEach((fb) => {
        ratings.technical += fb.ratings.technical;
        ratings.communication += fb.ratings.communication;
        ratings.problemSolving += fb.ratings.problemSolving;
        ratings.teamwork += fb.ratings.teamwork;
        ratings.leadership += fb.ratings.leadership;
      });

      const count = feedbackList.length;
      ratings.technical = Math.round(ratings.technical / count);
      ratings.communication = Math.round(ratings.communication / count);
      ratings.problemSolving = Math.round(ratings.problemSolving / count);
      ratings.teamwork = Math.round(ratings.teamwork / count);
      ratings.leadership = Math.round(ratings.leadership / count);

      const commentsText = feedbackList.map(f => `${f.interviewerId?.name}: ${f.comments}`).join("\n");
      const summary = await generateInterviewSummary(ratings, commentsText);
      ai.interviewSummary = summary;
      saveNeeded = true;
    }

    if (saveNeeded) {
      application.aiAnalysis = ai;
      application.resumeMatchScore = ai.overallMatch; // Map backward compatible score
      await application.save();
    }

    // Profile completion percentage
    let profileFieldsCount = 0;
    if (candidateProfile.skills?.length > 0) profileFieldsCount += 25;
    if (candidateProfile.experience?.length > 0) profileFieldsCount += 25;
    if (candidateProfile.education?.length > 0) profileFieldsCount += 25;
    if (candidateProfile.resumeText) profileFieldsCount += 25;

    return NextResponse.json({
      success: true,
      application: {
        _id: application._id,
        stage: application.stage,
        createdAt: application.createdAt,
        timeline: application.timeline,
      },
      candidate: {
        id: candidateUser._id,
        name: candidateUser.name,
        email: candidateUser.email,
        profile: candidateProfile,
        profileCompletion: profileFieldsCount || 40,
      },
      job: {
        id: job._id,
        title: job.title,
        department: job.department,
        skills: job.skills,
        description: job.description,
      },
      hiringIntelligence: {
        overallFit: ai.overallMatch || application.resumeMatchScore || 70,
        resumeMatch: ai.skillMatch || 70,
        experienceFit: ai.experienceMatch || 75,
        codingScore: assessmentsAttempts.length > 0 ? assessmentsAttempts[0].score : null,
        codingSwitches: assessmentsAttempts.length > 0 ? assessmentsAttempts[0].tabSwitches : 0,
        feedbackAverage: feedbackList.length > 0 
          ? Math.round((feedbackList.reduce((acc, curr) => acc + curr.overallRating, 0) / feedbackList.length) * 10) / 10
          : null,
      },
      aiReport: ai,
      interviews,
      feedback: feedbackList,
      assessments: assessmentsAttempts,
    });
  } catch (err: any) {
    console.error("Candidate 360 error:", err);
    return NextResponse.json({ error: "Failed to load Hiring Intelligence data." }, { status: 500 });
  }
}

// POST: Explicitly trigger AI re-analysis / questions regeneration
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const application = await Application.findById(id).populate("jobId");
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const candidateProfile = await Candidate.findOne({ userId: application.candidateId });
    if (!candidateProfile) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    const job = application.jobId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ai: any = application.aiAnalysis || {};

    if (action === "reanalyze") {
      const match = await calculateMatchScore(
        candidateProfile.resumeText || "",
        job.skills,
        job.description
      );
      ai.overallMatch = match.overallMatch;
      ai.skillMatch = match.skillMatch;
      ai.experienceMatch = match.experienceMatch;
      ai.strongSkills = match.strongSkills;
      ai.partialSkills = match.partialSkills;
      ai.missingSkills = match.missingSkills;
      ai.evidence = match.evidence;
      ai.weakAreas = match.weakAreas;
      ai.recommendations = match.recommendations;
    } else if (action === "regenerate_questions") {
      const questions = await generateInterviewQuestions(
        candidateProfile.resumeText || "",
        job.skills,
        job.description
      );
      ai.interviewQuestions = questions;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    application.aiAnalysis = ai;
    application.resumeMatchScore = ai.overallMatch;
    await application.save();

    return NextResponse.json({ success: true, ai });
  } catch (err: any) {
    console.error("AI trigger failed:", err);
    return NextResponse.json({ error: err.message || "Action execution failed" }, { status: 500 });
  }
}
