import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Company, AuditLog } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

// GET: Fetch company details for corporate users
export async function GET() {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "manager", "interviewer", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const companyId = auth.user!.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "No company associated with this account" }, { status: 400 });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, company });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch company details" }, { status: 500 });
  }
}

// PUT: Update company details (Recruiters/Admins only)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth(["recruiter", "admin"]);
    if (!auth.authenticated) return auth.errorResponse!;

    const companyId = auth.user!.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "No company associated with this account" }, { status: 400 });
    }

    const body = await req.json();
    const { name, logo, website, industry, size, description, locations } = body;

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    company.name = name || company.name;
    company.logo = logo !== undefined ? logo : company.logo;
    company.website = website !== undefined ? website : company.website;
    company.industry = industry !== undefined ? industry : company.industry;
    company.size = size !== undefined ? size : company.size;
    company.description = description !== undefined ? description : company.description;
    company.locations = locations !== undefined ? locations : company.locations;

    await company.save();

    await AuditLog.create({
      actorId: auth.user!.userId,
      action: "UPDATE_COMPANY",
      targetType: "Company",
      targetId: company._id,
      details: `Updated company details for ${company.name}`,
    });

    return NextResponse.json({ success: true, company });
  } catch (err: any) {
    console.error("Update company error:", err);
    return NextResponse.json({ error: err.message || "Failed to update company" }, { status: 500 });
  }
}
