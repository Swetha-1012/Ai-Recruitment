import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Assessment, AssessmentAttempt, Application, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["candidate", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const { action, applicationId, answers, tabSwitches } = await req.json();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const candidateId = auth.user!.userId;

    if (action === "start") {
      if (!applicationId) {
        return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
      }

      // Check if attempt exists
      let attempt = await AssessmentAttempt.findOne({ assessmentId: id, candidateId });
      if (attempt) {
        return NextResponse.json({ success: true, attempt, message: "Resuming existing test session." });
      }

      attempt = await AssessmentAttempt.create({
        assessmentId: id,
        candidateId,
        applicationId,
        status: "started",
        tabSwitches: 0,
        startedAt: new Date(),
        answers: [],
      });

      await AuditLog.create({
        actorId: candidateId,
        action: "START_ASSESSMENT",
        targetType: "AssessmentAttempt",
        targetId: attempt._id,
        details: `Candidate started assessment: ${assessment.title}`,
      });

      return NextResponse.json({ success: true, attempt });
    }

    if (action === "submit") {
      const attempt = await AssessmentAttempt.findOne({ assessmentId: id, candidateId, status: "started" });
      if (!attempt) {
        return NextResponse.json({ error: "No active test session found" }, { status: 400 });
      }

      if (!answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: "Answers array is required" }, { status: 400 });
      }

      // Evaluate Answers
      let correctCount = 0;
      const evaluatedAnswers = answers.map((subAnswer) => {
        const question = assessment.questions.find(
          (q) => (q as any)._id.toString() === subAnswer.questionId
        );

        let isCorrect = false;

        if (question) {
          if (question.type === "mcq") {
            isCorrect =
              subAnswer.selectedOption?.trim().toLowerCase() ===
              question.correctAnswer?.trim().toLowerCase();
          } else if (question.type === "sql") {
            // SQL validation checks if keywords matches
            const sub = (subAnswer.codeSubmitted || "").toLowerCase();
            const correct = (question.correctAnswer || "").toLowerCase();
            const keywords = correct.split(/\s+/).filter(k => k.length > 2);
            isCorrect = keywords.every(kw => sub.includes(kw));
          } else {
            // Coding/Debugging check (simple syntax or execution simulation)
            // Evaluates code contents or compiles string
            const code = subAnswer.codeSubmitted || "";
            if (question.correctAnswer) {
              isCorrect = code.replace(/\s+/g, "").includes(question.correctAnswer.replace(/\s+/g, ""));
            } else {
              isCorrect = code.length > 15; // default pass if logic contains text
            }
          }
        }

        if (isCorrect) correctCount++;

        return {
          questionId: subAnswer.questionId,
          selectedOption: subAnswer.selectedOption,
          codeSubmitted: subAnswer.codeSubmitted,
          isCorrect,
        };
      });

      const score = Math.round((correctCount / assessment.questions.length) * 100);

      attempt.answers = evaluatedAnswers;
      attempt.score = score;
      attempt.status = "submitted";
      attempt.tabSwitches = tabSwitches || 0;
      attempt.submittedAt = new Date();
      await attempt.save();

      // Log results in the Application Stage Notes
      const app = await Application.findById(attempt.applicationId);
      if (app) {
        app.timeline.push({
          stage: app.stage,
          timestamp: new Date(),
          notes: `Completed assessment "${assessment.title}". Score: ${score}% (Tab Switches: ${tabSwitches || 0})`,
        });
        await app.save();
      }

      // Notify candidate
      await Notification.create({
        recipientId: candidateId,
        message: `Your assessment "${assessment.title}" has been submitted successfully. Score: ${score}%`,
        type: "success",
      });

      // Notify recruiter
      const appDetails = await Application.findById(attempt.applicationId).populate("jobId");
      if (appDetails) {
        const recruiters = await User.find({ companyId: (appDetails.jobId as any).companyId, role: "recruiter" });
        for (const rec of recruiters) {
          await Notification.create({
            recipientId: rec._id,
            message: `Candidate ${auth.user!.name} completed "${assessment.title}". Score: ${score}% | Cheating flags: ${tabSwitches || 0}`,
            type: score < 40 ? "warning" : "info",
          });
        }
      }

      await AuditLog.create({
        actorId: candidateId,
        action: "SUBMIT_ASSESSMENT",
        targetType: "AssessmentAttempt",
        targetId: attempt._id,
        details: `Submitted assessment: ${assessment.title}. Score: ${score}%, Tab Switches: ${tabSwitches || 0}`,
      });

      return NextResponse.json({ success: true, attempt, score });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Attempt error:", err);
    return NextResponse.json({ error: err.message || "Failed to log test attempt" }, { status: 500 });
  }
}
