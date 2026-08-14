import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Assessment } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Mask correct answers for Candidates to prevent source-code cheating
    if (auth.user!.role === "candidate") {
      const maskedQuestions = assessment.questions.map((q) => {
        const doc = q as any;
        return {
          _id: doc._id || doc.id,
          type: doc.type,
          questionText: doc.questionText,
          options: doc.options,
          starterCode: doc.starterCode,
          // Hide answers
        };
      });

      return NextResponse.json({
        success: true,
        assessment: {
          _id: assessment._id,
          title: assessment.title,
          description: assessment.description,
          durationMinutes: assessment.durationMinutes,
          questions: maskedQuestions,
        },
      });
    }

    return NextResponse.json({ success: true, assessment });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 });
  }
}
