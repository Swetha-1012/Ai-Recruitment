import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

// GET: Fetch job details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const job = await Job.findById(id).populate("companyId");
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// PATCH: Edit or close a job (Recruiter/Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify ownership
    if (auth.user!.role !== "admin" && job.createdBy.toString() !== auth.user!.userId) {
      return NextResponse.json({ error: "Forbidden: You did not create this job posting" }, { status: 403 });
    }

    const updates = await req.json();
    
    // Update simple fields
    const allowedFields = [
      "title",
      "department",
      "location",
      "salaryMin",
      "salaryMax",
      "experienceRequired",
      "skills",
      "employmentType",
      "workMode",
      "deadline",
      "description",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === "skills" && typeof updates.skills === "string") {
          job.skills = updates.skills.split(",").map((s: string) => s.trim());
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (job as any)[field] = updates[field];
        }
      }
    });

    await job.save();

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "UPDATE_JOB",
      targetType: "Job",
      targetId: job._id,
      details: `Updated job posting: ${job.title} status is ${job.status}`,
    });

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error("Update job error:", err);
    return NextResponse.json({ error: err.message || "Failed to update job" }, { status: 500 });
  }
}

// DELETE: Delete a job (Recruiter/Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (auth.user!.role !== "admin" && job.createdBy.toString() !== auth.user!.userId) {
      return NextResponse.json({ error: "Forbidden: You did not create this job posting" }, { status: 403 });
    }

    await Job.findByIdAndDelete(id);

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "DELETE_JOB",
      targetType: "Job",
      targetId: job._id,
      details: `Deleted job post: ${job.title}`,
    });

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
