/* eslint-disable */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/devfusion-ats";

// Schema Definitions
const CompanySchema = new mongoose.Schema({
  name: String,
  industry: String,
  size: String,
  website: String,
  locations: [String],
  description: String,
});
const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["candidate", "recruiter", "manager", "interviewer", "admin"], default: "candidate" },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const CandidateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: String,
  location: String,
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  skills: [String],
  certifications: [String],
});
const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: String,
  location: String,
  salaryMin: Number,
  salaryMax: Number,
  experienceRequired: Number,
  skills: [String],
  employmentType: { type: String, enum: ["full-time", "part-time", "contract", "internship"] },
  workMode: { type: String, enum: ["onsite", "hybrid", "remote"] },
  deadline: Date,
  description: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

const AssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  durationMinutes: { type: Number, required: true },
  questions: [{
    type: { type: String, enum: ["mcq", "code", "sql", "debug"], required: true },
    questionText: { type: String, required: true },
    options: [String],
    correctAnswer: String,
    starterCode: String,
    testCases: [{ input: String, output: String }]
  }],
});
const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", AssessmentSchema);

const AuditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  targetType: String,
  targetId: mongoose.Schema.Types.ObjectId,
  details: String,
  timestamp: { type: Date, default: Date.now },
});
const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

async function main() {
  try {
    console.log("Connecting to database at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    // Clear existing data
    console.log("Clearing existing database collections...");
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Candidate.deleteMany({});
    await Assessment.deleteMany({});
    await AuditLog.deleteMany({});
    
    // Clear dynamic session records
    await mongoose.connection.collection("applications").deleteMany({});
    await mongoose.connection.collection("interviews").deleteMany({});
    await mongoose.connection.collection("feedbacks").deleteMany({});
    await mongoose.connection.collection("assessmentattempts").deleteMany({});
    await mongoose.connection.collection("offers").deleteMany({});
    await mongoose.connection.collection("notifications").deleteMany({});

    console.log("Creating company details...");
    const company = await Company.create({
      name: "HireNova Tech",
      industry: "Software Engineering & Cloud",
      size: "100-500",
      website: "https://hirenova.tech",
      locations: ["Chennai", "Bangalore", "San Francisco", "Remote"],
      description: "Building next-generation full-stack platforms and AI agents.",
    });

    const defaultPassword = await bcrypt.hash("password123", 10);

    console.log("Creating users...");
    const recruiter = await User.create({
      name: "Sarah Jenkins",
      email: "recruiter1@hirenova.tech",
      password: defaultPassword,
      role: "recruiter",
      companyId: company._id,
      isEmailVerified: true,
    });

    const candidateUser = await User.create({
      name: "Arun Kumar",
      email: "candidate1@example.com",
      password: defaultPassword,
      role: "candidate",
      isEmailVerified: false,
      verificationToken: "verify-token-12345",
    });

    const userSwetha = await User.create({
      name: "Swetha Narayanan",
      email: "swethanarayanan006@gmail.com",
      password: defaultPassword,
      role: "candidate",
      isEmailVerified: true,
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

    console.log("Creating candidate profile details...");
    await Candidate.create({
      userId: candidateUser._id,
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

    await Candidate.create({
      userId: userSwetha._id,
      phone: "+91 98765 43210",
      location: "Coimbatore, Tamil Nadu",
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
          description: "Developed and styled frontend layouts with React and Tailwind CSS.",
        },
      ],
      skills: ["React", "JavaScript", "Node.js", "MongoDB", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Next.js"],
      certifications: ["Frontend Developer Certificate"],
    });

    console.log("Creating job listings...");
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
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: "We are looking for a skilled Frontend Developer proficient in React, JavaScript, Node.js, and MongoDB. You will join our agile team to build responsive and robust software systems. Experience with Tailwind and Next.js App Router is a plus.",
      companyId: company._id,
      status: "active",
      createdBy: recruiter._id,
    });

    console.log("Creating assessments...");
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

    console.log("Writing audit log...");
    await AuditLog.create({
      actorId: admin._id,
      action: "RESET_DATABASE",
      targetType: "Database",
      targetId: admin._id,
      details: "Reset database and seeded Recruiter, Candidate, Interviewer, Hiring Manager, Job, and Assessment presets.",
    });

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Seed execution failed:", err);
    process.exit(1);
  }
}

main();
