import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, Company, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

// GET: Get all active jobs or filter/search jobs
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const workMode = searchParams.get("workMode");
    const employmentType = searchParams.get("employmentType");
    const experienceRequired = searchParams.get("experience");
    const salaryMin = searchParams.get("salaryMin");
    const skills = searchParams.get("skills");
    const companyId = searchParams.get("companyId");
    const status = searchParams.get("status") || "active"; // active or all

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (workMode) {
      query.workMode = workMode;
    }

    if (employmentType) {
      query.employmentType = employmentType;
    }

    if (experienceRequired) {
      query.experienceRequired = { $lte: parseInt(experienceRequired) };
    }

    if (salaryMin) {
      query.salaryMax = { $gte: parseInt(salaryMin) };
    }

    if (companyId) {
      query.companyId = companyId;
    }

    if (skills) {
      const skillsList = skills.split(",").map((s) => s.trim());
      query.skills = { $in: skillsList.map((s) => new RegExp(s, "i")) };
    }

    const jobs = await Job.find(query).populate("companyId").sort({ createdAt: -1 });

    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    console.error("Fetch jobs error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// POST: Create a new job listing (Recruiter/Admin only)
export async function POST(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const {
      title,
      department,
      location,
      salaryMin,
      salaryMax,
      experienceRequired,
      skills,
      employmentType,
      workMode,
      deadline,
      description,
    } = await req.json();

    if (!title || !department || !location || !employmentType || !workMode || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get recruiter's company
    const company = await Company.findById(auth.user!.companyId);
    if (!company) {
      return NextResponse.json({ error: "Recruiter has no associated company. Add/select a company first." }, { status: 400 });
    }

    const job = await Job.create({
      title,
      department,
      location,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      experienceRequired: experienceRequired ? parseInt(experienceRequired) : undefined,
      skills: Array.isArray(skills) ? skills : skills ? skills.split(",").map((s: string) => s.trim()) : [],
      employmentType,
      workMode,
      deadline: deadline ? new Date(deadline) : undefined,
      description,
      companyId: company._id,
      createdBy: auth.user!.userId,
    });

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "CREATE_JOB",
      targetType: "Job",
      targetId: job._id,
      details: `Created job post: ${job.title} under ${department}`,
    });

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error("Create job error:", err);
    return NextResponse.json({ error: err.message || "Failed to create job" }, { status: 500 });
  }
}
