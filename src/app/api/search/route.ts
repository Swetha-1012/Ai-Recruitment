import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, User, Company, Interview } from "@/lib/models";
import { apiAuth } from "@/lib/middleware";

export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = await apiAuth();
    if (!auth.authenticated) return auth.errorResponse!;

    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.get("query") || "";

    if (!queryStr || queryStr.trim().length === 0) {
      return NextResponse.json({
        success: true,
        results: { jobs: [], candidates: [], recruiters: [], companies: [], interviews: [] }
      });
    }

    const regex = new RegExp(queryStr, "i");

    // Perform concurrent search queries across collections
    const [jobs, users, companies, interviews] = await Promise.all([
      // 1. Search Jobs
      Job.find({
        $or: [
          { title: regex },
          { department: regex },
          { skills: { $in: [regex] } }
        ]
      })
        .populate("companyId")
        .limit(10),

      // 2. Search Users (Candidates & Recruiters)
      User.find({
        $or: [
          { name: regex },
          { email: regex }
        ]
      }).limit(20),

      // 3. Search Companies
      Company.find({
        $or: [
          { name: regex },
          { industry: regex },
          { locations: { $in: [regex] } }
        ]
      }).limit(5),

      // 4. Search Interviews
      Interview.find({
        $or: [
          { title: regex },
          { type: regex }
        ]
      })
        .populate("candidateId", "name email")
        .populate("interviewerId", "name")
        .limit(10)
    ]);

    // Group users by role
    const candidates = users.filter((u) => u.role === "candidate").map(u => ({ id: u._id, name: u.name, email: u.email }));
    const recruiters = users.filter((u) => u.role === "recruiter").map(u => ({ id: u._id, name: u.name, email: u.email }));

    return NextResponse.json({
      success: true,
      results: {
        jobs,
        candidates,
        recruiters,
        companies,
        interviews
      }
    });
  } catch (err: any) {
    console.error("Global search error:", err);
    return NextResponse.json({ error: "Search execution failed" }, { status: 500 });
  }
}
