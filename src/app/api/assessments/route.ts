import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Assessment, Company, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

// GET: Fetch assessments
export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (auth.user!.role !== "admin") {
      filter.companyId = auth.user!.companyId;
    }

    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, assessments });
  } catch (err: any) {
    console.error("Fetch assessments error:", err);
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 });
  }
}

// POST: Create a new assessment (Recruiter/Admin only)
export async function POST(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { title, description, questions, durationMinutes } = await req.json();

    if (!title || !questions || !durationMinutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const company = await Company.findById(auth.user!.companyId);
    if (!company) {
      return NextResponse.json({ error: "Recruiter has no associated company" }, { status: 400 });
    }

    const assessment = await Assessment.create({
      title,
      description,
      companyId: company._id,
      questions,
      durationMinutes: parseInt(durationMinutes),
    });

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "CREATE_ASSESSMENT",
      targetType: "Assessment",
      targetId: assessment._id,
      details: `Created coding assessment: ${assessment.title} (${questions.length} questions, ${durationMinutes} mins)`,
    });

    return NextResponse.json({ success: true, assessment });
  } catch (err: any) {
    console.error("Create assessment error:", err);
    return NextResponse.json({ error: err.message || "Failed to create assessment" }, { status: 500 });
  }
}
