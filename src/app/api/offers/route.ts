import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Offer, Application, Job, User, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";
import { sendMockEmail } from "@/lib/email";

// GET: Fetch offer letters
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
    } else if (applicationId) {
      filter.applicationId = applicationId;
    } else {
      // Recruiters/Managers can see all company offers
      const companyJobs = await Job.find({ companyId: auth.user!.companyId }).select("_id");
      const jobIds = companyJobs.map((j) => j._id);
      filter.jobId = { $in: jobIds };
    }

    const offers = await Offer.find(filter)
      .populate("candidateId", "name email")
      .populate("jobId", "title location")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, offers });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

// POST: Generate an offer letter (Recruiter/Admin only)
export async function POST(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { applicationId, salary, joiningDate, location, benefits } = await req.json();

    if (!applicationId || !salary || !joiningDate || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const application = await Application.findById(applicationId).populate("candidateId", "name email");
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const job = await Job.findById(application.jobId).populate("companyId");
    if (!job) {
      return NextResponse.json({ error: "Job details not found" }, { status: 404 });
    }

    // Check existing offer
    let offer = await Offer.findOne({ applicationId });
    if (offer) {
      offer.salary = parseFloat(salary);
      offer.joiningDate = new Date(joiningDate);
      offer.location = location;
      offer.benefits = benefits;
      offer.status = "sent";
      await offer.save();
    } else {
      offer = await Offer.create({
        applicationId,
        candidateId: application.candidateId,
        jobId: application.jobId,
        salary: parseFloat(salary),
        joiningDate: new Date(joiningDate),
        location,
        benefits,
        status: "sent",
      });
    }

    // Move application to 'offer' stage
    application.stage = "offer";
    application.timeline.push({
      stage: "offer",
      timestamp: new Date(),
      updatedBy: auth.user!.userId,
      notes: `Offer letter generated and sent. Salary: INR ${salary}/yr. Joining Date: ${new Date(joiningDate).toLocaleDateString()}`,
    });
    await application.save();

    // Notify Candidate
    await Notification.create({
      recipientId: application.candidateId,
      message: `Congratulations! You received an offer letter for the "${job.title}" role. Open your dashboard to view details.`,
      type: "success",
    });

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "GENERATE_OFFER",
      targetType: "Offer",
      targetId: offer._id,
      details: `Generated offer for candidate ${application.candidateId} at INR ${salary}/yr.`,
    });

    // Mock Email Logs
    const candidateUser = application.candidateId as any;
    await sendMockEmail(
      candidateUser.email,
      `Official Offer of Employment: ${job.title}`,
      `Hello ${candidateUser.name},\n\nWe are absolutely delighted to offer you the position of "${job.title}" at "${company.name}".\n\nYour base salary is INR ${salary.toLocaleString()}/yr.\n\nPlease log in to your Candidate Dashboard to review the full details and formal offer contract, and select either to Accept or Reject.\n\nBest regards,\nSarah Jenkins\nRecruitment Team`
    );

    return NextResponse.json({ success: true, offer });
  } catch (err: any) {
    console.error("Create offer error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate offer" }, { status: 500 });
  }
}
