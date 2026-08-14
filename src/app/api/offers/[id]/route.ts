import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Offer, Application, Job, User, Notification, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

// GET: Fetch offer details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const offer = await Offer.findById(id)
      .populate("candidateId", "name email")
      .populate({
        path: "jobId",
        populate: { path: "companyId" }
      });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Security check: Candidate can only view their own offer
    if (auth.user!.role === "candidate" && offer.candidateId._id.toString() !== auth.user!.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, offer });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch offer details" }, { status: 500 });
  }
}

// PATCH: Accept or Reject an offer (Candidate only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await apiAuth(["candidate"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const { id } = await params;
    const { action } = await req.json(); // accept or reject

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Action must be 'accept' or 'reject'" }, { status: 400 });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Verify candidate matches
    if (offer.candidateId.toString() !== auth.user!.userId) {
      return NextResponse.json({ error: "Forbidden: You are not the candidate for this offer" }, { status: 403 });
    }

    const application = await Application.findById(offer.applicationId);
    if (!application) {
      return NextResponse.json({ error: "Associated application not found" }, { status: 404 });
    }

    const job = await Job.findById(offer.jobId);
    if (!job) {
      return NextResponse.json({ error: "Associated job not found" }, { status: 404 });
    }

    const statusValue = action === "accept" ? "accepted" : "rejected";
    const stageValue = action === "accept" ? "hired" : "rejected";

    offer.status = statusValue;
    await offer.save();

    application.stage = stageValue;
    application.timeline.push({
      stage: stageValue,
      timestamp: new Date(),
      updatedBy: auth.user!.userId,
      notes: `Offer letter was ${statusValue} by the candidate.`,
    });
    await application.save();

    // Notify Recruiters at this company
    const recruiters = await User.find({ companyId: job.companyId, role: "recruiter" });
    for (const rec of recruiters) {
      await Notification.create({
        recipientId: rec._id,
        message: `Candidate ${auth.user!.name} has ${statusValue} the offer for "${job.title}".`,
        type: action === "accept" ? "success" : "warning",
      });
    }

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: action === "accept" ? "ACCEPT_OFFER" : "REJECT_OFFER",
      targetType: "Offer",
      targetId: offer._id,
      details: `Candidate ${auth.user!.name} ${statusValue} the offer for job ID ${job._id}`,
    });

    return NextResponse.json({ success: true, offer, stage: stageValue });
  } catch (err: any) {
    console.error("Respond offer error:", err);
    return NextResponse.json({ error: err.message || "Failed to respond to offer" }, { status: 500 });
  }
}
