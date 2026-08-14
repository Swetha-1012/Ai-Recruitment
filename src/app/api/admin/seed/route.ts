import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { 
  User, 
  Company, 
  Job, 
  Candidate, 
  Application, 
  Interview, 
  Feedback, 
  Assessment, 
  AssessmentAttempt, 
  Offer, 
  Notification, 
  AuditLog 
} from "@/lib/models";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    await connectDB();

    // 1. Clear existing collections
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Candidate.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Feedback.deleteMany({});
    await Assessment.deleteMany({});
    await AssessmentAttempt.deleteMany({});
    await Offer.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // 2. Create Company
    const company = await Company.create({
      name: "HireNova Tech",
      industry: "Software Engineering & Cloud",
      size: "100-500",
      website: "https://hirenova.tech",
      locations: ["Chennai", "Bangalore", "San Francisco", "Remote"],
      description: "Building next-generation full-stack platforms and AI agents.",
    });

    const defaultPassword = await hashPassword("password123");

    // 3. Create Users
    const recruiter = await User.create({
      name: "Sarah Jenkins",
      email: "recruiter1@hirenova.tech",
      password: defaultPassword,
      role: "recruiter",
      companyId: company._id,
      isEmailVerified: true,
    });

    const candidate = await User.create({
      name: "Arun Kumar",
      email: "candidate1@example.com",
      password: defaultPassword,
      role: "candidate",
      isEmailVerified: false, // Starts as unverified to demo candidate workflow
      verificationToken: "verify-token-12345",
    });

    const interviewer = await User.create({
      name: "Devon Harris",
      email: "interviewer1@hirenova.tech",
      password: defaultPassword,
      role: "interviewer",
      companyId: company._id,
      isEmailVerified: true,
    });

    const manager = await User.create({
      name: "Marcus Aurelius",
      email: "manager1@hirenova.tech",
      password: defaultPassword,
      role: "manager",
      companyId: company._id,
      isEmailVerified: true,
    });

    const admin = await User.create({
      name: "Super Admin",
      email: "admin@hirenova.tech",
      password: defaultPassword,
      role: "admin",
      companyId: company._id,
      isEmailVerified: true,
    });

    // 4. Create Candidate Profile
    await Candidate.create({
      userId: candidate._id,
      phone: "+91 98765 43210",
      location: "Chennai, Tamil Nadu",
      education: [
        {
          school: "Karpagam Academy of Technology",
          degree: "B.E.",
          fieldOfStudy: "Computer Science and Engineering",
          startYear: 2021,
          endYear: 2025,
        },
      ],
      experience: [
        {
          company: "Innovate Inc",
          role: "Software Intern",
          startDate: new Date("2024-05-01"),
          endDate: new Date("2024-11-01"),
          description: "Assisted in code refactoring and developed React widgets in Next.js. Fixed UI inconsistencies.",
        },
      ],
      skills: ["React", "JavaScript", "Node.js", "MongoDB", "TypeScript", "HTML", "CSS", "Git", "Tailwind CSS", "Next.js"],
      certifications: ["React Advanced Certification"],
    });

    // 5. Create Job Listing
    const job = await Job.create({
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote",
      salaryMin: 800000,
      salaryMax: 1200000,
      experienceRequired: 2,
      skills: ["React", "JavaScript", "Node.js", "MongoDB"],
      employmentType: "full-time",
      workMode: "remote",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: "We are looking for a skilled Frontend Developer proficient in React, JavaScript, Node.js, and MongoDB. You will join our agile team to build responsive and robust software systems. Experience with Tailwind and Next.js App Router is a plus.",
      companyId: company._id,
      status: "active",
      createdBy: recruiter._id,
    });

    // 6. Create Coding Assessment
    await Assessment.create({
      title: "Frontend Technical Challenge",
      description: "Test covering core React patterns, SQL basics, and JavaScript algorithms.",
      companyId: company._id,
      durationMinutes: 15,
      questions: [
        {
          type: "mcq",
          questionText: "Which React hook is used to execute side effects (like data fetching or subscription logs)?",
          options: ["useState", "useEffect", "useMemo", "useCallback"],
          correctAnswer: "useEffect",
        },
        {
          type: "sql",
          questionText: "Write a SQL query to fetch all columns from the 'users' table where the role is 'candidate'.",
          correctAnswer: "SELECT * FROM users WHERE role = 'candidate';",
        },
        {
          type: "code",
          questionText: "Complete the javascript function isPalindrome(str) that returns true if a string is read identically forwards and backwards (case-insensitive).",
          starterCode: `function isPalindrome(str) {\n  // Write your code here\n}`,
          correctAnswer: "str.toLowerCase().replace(/[^a-z0-9]/g, '') === str.toLowerCase().replace(/[^a-z0-9]/g, '').split('').reverse().join('')",
        }
      ],
    });

    // 7. Write Audit Log
    await AuditLog.create({
      actorId: admin._id,
      action: "RESET_DATABASE",
      targetType: "Database",
      targetId: admin._id,
      details: "Reset database and seeded Recruiter, Candidate, Interviewer, Hiring Manager, Job, and Assessment presets.",
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully! Demo accounts: Recruiter (recruiter1@hirenova.tech), Candidate (candidate1@example.com), Manager (manager1@hirenova.tech), Interviewer (interviewer1@hirenova.tech), Admin (admin@hirenova.tech). All passwords are 'password123'.",
    });
  } catch (err: any) {
    console.error("Database seed error:", err);
    return NextResponse.json({ error: err.message || "Failed to seed database" }, { status: 500 });
  }
}
