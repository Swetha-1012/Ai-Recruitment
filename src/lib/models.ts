import mongoose, { Schema, Document } from "mongoose";

// ==========================================
// Helper: Get or Compile Model
// ==========================================
const getModel = <T>(name: string, schema: Schema) => {
  return (mongoose.models[name] || mongoose.model<T>(name, schema)) as mongoose.Model<T & Document>;
};

// ==========================================
// 1. Company
// ==========================================
export interface ICompany {
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  locations?: string[];
  createdAt: Date;
}
const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  logo: String,
  website: String,
  industry: String,
  size: String,
  description: String,
  locations: [String],
  createdAt: { type: Date, default: Date.now }
});
export const Company = getModel<ICompany>("Company", CompanySchema);

// ==========================================
// 2. User
// ==========================================
export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "candidate" | "recruiter" | "manager" | "interviewer" | "admin";
  companyId?: mongoose.Types.ObjectId;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordOTP?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["candidate", "recruiter", "manager", "interviewer", "admin"], required: true },
  companyId: { type: Schema.Types.ObjectId, ref: "Company" },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});
export const User = getModel<IUser>("User", UserSchema);

// ==========================================
// 3. Job
// ==========================================
export interface IJob {
  title: string;
  department: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceRequired?: number;
  skills: string[];
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "hybrid" | "onsite";
  deadline?: Date;
  description: string;
  companyId: mongoose.Types.ObjectId;
  status: "active" | "closed";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}
const JobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  salaryMin: Number,
  salaryMax: Number,
  experienceRequired: Number,
  skills: [String],
  employmentType: { type: String, enum: ["full-time", "part-time", "contract", "internship"], required: true },
  workMode: { type: String, enum: ["remote", "hybrid", "onsite"], required: true },
  deadline: Date,
  description: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});
export const Job = getModel<IJob>("Job", JobSchema);

// ==========================================
// 4. Candidate Profile
// ==========================================
export interface ICandidate {
  userId: mongoose.Types.ObjectId;
  phone?: string;
  location?: string;
  education: Array<{ school: string; degree: string; fieldOfStudy: string; startYear: number; endYear: number }>;
  experience: Array<{ company: string; role: string; startDate: Date; endDate?: Date; description: string }>;
  skills: string[];
  certifications: string[];
  portfolio?: string;
  github?: string;
  linkedin?: string;
  resumeUrl?: string;
  resumeText?: string;
  coverLetter?: string;
  createdAt: Date;
}
const CandidateSchema = new Schema<ICandidate>({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
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
  portfolio: String,
  github: String,
  linkedin: String,
  resumeUrl: String,
  resumeText: String,
  coverLetter: String,
  createdAt: { type: Date, default: Date.now }
});
export const Candidate = getModel<ICandidate>("Candidate", CandidateSchema);

// ==========================================
// 5. Application
// ==========================================
export interface IApplication {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  stage: "applied" | "screening" | "shortlisted" | "technical" | "hr" | "offer" | "hired" | "rejected";
  resumeMatchScore?: number;
  aiAnalysis?: {
    overallMatch: number;
    skillMatch: number;
    experienceMatch: number;
    strongSkills: string[];
    partialSkills: string[];
    missingSkills: string[];
    evidence: Array<{ skill: string; level: string; text: string; source: string }>;
    weakAreas: string[];
    recommendations: string;
    interviewQuestions?: Array<{ category: string; question: string }>;
    interviewSummary?: {
      strengths: string[];
      concerns: string[];
      consensus: string;
      recommendation: string;
    };
  };
  timeline: Array<{
    stage: string;
    timestamp: Date;
    updatedBy?: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  createdAt: Date;
}
const ApplicationSchema = new Schema<IApplication>({
  candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  stage: {
    type: String,
    enum: ["applied", "screening", "shortlisted", "technical", "hr", "offer", "hired", "rejected"],
    default: "applied"
  },
  resumeMatchScore: Number,
  aiAnalysis: {
    overallMatch: { type: Number, default: 50 },
    skillMatch: { type: Number, default: 50 },
    experienceMatch: { type: Number, default: 50 },
    strongSkills: [String],
    partialSkills: [String],
    missingSkills: [String],
    evidence: [{
      skill: String,
      level: String,
      text: String,
      source: String
    }],
    weakAreas: [String],
    recommendations: String,
    interviewQuestions: [{
      category: String,
      question: String
    }],
    interviewSummary: {
      strengths: [String],
      concerns: [String],
      consensus: String,
      recommendation: String
    }
  },
  timeline: [{
    stage: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    notes: String
  }],
  createdAt: { type: Date, default: Date.now }
});
export const Application = getModel<IApplication>("Application", ApplicationSchema);

// ==========================================
// 6. Interview
// ==========================================
export interface IInterview {
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  title: string;
  type: "technical" | "hr" | "manager";
  dateTime: Date;
  meetingLink?: string;
  status: "scheduled" | "completed" | "feedback_pending" | "feedback_submitted";
  createdAt: Date;
}
const InterviewSchema = new Schema<IInterview>({
  applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  interviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["technical", "hr", "manager"], required: true },
  dateTime: { type: Date, required: true },
  meetingLink: String,
  status: { type: String, enum: ["scheduled", "completed", "feedback_pending", "feedback_submitted"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now }
});
export const Interview = getModel<IInterview>("Interview", InterviewSchema);

// ==========================================
// 7. Feedback
// ==========================================
export interface IFeedback {
  interviewId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  ratings: {
    technical: number;
    communication: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
  };
  overallRating: number;
  comments?: string;
  createdAt: Date;
}
const FeedbackSchema = new Schema<IFeedback>({
  interviewId: { type: Schema.Types.ObjectId, ref: "Interview", required: true },
  interviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ratings: {
    technical: { type: Number, required: true },
    communication: { type: Number, required: true },
    problemSolving: { type: Number, required: true },
    teamwork: { type: Number, required: true },
    leadership: { type: Number, required: true }
  },
  overallRating: { type: Number, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now }
});
export const Feedback = getModel<IFeedback>("Feedback", FeedbackSchema);

// ==========================================
// 8. Assessment
// ==========================================
export interface IAssessmentQuestion {
  id?: string;
  type: "mcq" | "code" | "sql" | "debug";
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  starterCode?: string;
  testCases?: Array<{ input: string; output: string }>;
}
export interface IAssessment {
  title: string;
  description?: string;
  companyId: mongoose.Types.ObjectId;
  questions: IAssessmentQuestion[];
  durationMinutes: number;
  createdAt: Date;
}
const AssessmentSchema = new Schema<IAssessment>({
  title: { type: String, required: true },
  description: String,
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  questions: [{
    type: { type: String, enum: ["mcq", "code", "sql", "debug"], required: true },
    questionText: { type: String, required: true },
    options: [String],
    correctAnswer: String,
    starterCode: String,
    testCases: [{ input: String, output: String }]
  }],
  durationMinutes: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});
export const Assessment = getModel<IAssessment>("Assessment", AssessmentSchema);

// ==========================================
// 9. AssessmentAttempt
// ==========================================
export interface IAssessmentAttempt {
  assessmentId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: string;
    selectedOption?: string;
    codeSubmitted?: string;
    isCorrect?: boolean;
  }>;
  score?: number;
  status: "started" | "submitted";
  tabSwitches: number;
  startedAt: Date;
  submittedAt?: Date;
}
const AssessmentAttemptSchema = new Schema<IAssessmentAttempt>({
  assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
  answers: [{
    questionId: String,
    selectedOption: String,
    codeSubmitted: String,
    isCorrect: Boolean
  }],
  score: Number,
  status: { type: String, enum: ["started", "submitted"], default: "started" },
  tabSwitches: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date
});
export const AssessmentAttempt = getModel<IAssessmentAttempt>("AssessmentAttempt", AssessmentAttemptSchema);

// ==========================================
// 10. Offer Letter
// ==========================================
export interface IOffer {
  applicationId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  salary: number;
  joiningDate: Date;
  location: string;
  benefits?: string;
  status: "generated" | "sent" | "accepted" | "rejected";
  letterPdfUrl?: string;
  createdAt: Date;
}
const OfferSchema = new Schema<IOffer>({
  applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
  candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  salary: { type: Number, required: true },
  joiningDate: { type: Date, required: true },
  location: { type: String, required: true },
  benefits: String,
  status: { type: String, enum: ["generated", "sent", "accepted", "rejected"], default: "generated" },
  letterPdfUrl: String,
  createdAt: { type: Date, default: Date.now }
});
export const Offer = getModel<IOffer>("Offer", OfferSchema);

// ==========================================
// 11. Notification
// ==========================================
export interface INotification {
  recipientId: mongoose.Types.ObjectId;
  message: string;
  type: "success" | "info" | "warning" | "alert";
  isRead: boolean;
  createdAt: Date;
}
const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["success", "info", "warning", "alert"], default: "info" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
export const Notification = getModel<INotification>("Notification", NotificationSchema);

// ==========================================
// 12. AuditLog
// ==========================================
export interface IAuditLog {
  actorId?: mongoose.Types.ObjectId;
  action: string;
  targetType?: string;
  targetId?: mongoose.Types.ObjectId;
  details?: string;
  timestamp: Date;
}
const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  targetType: String,
  targetId: Schema.Types.ObjectId,
  details: String,
  timestamp: { type: Date, default: Date.now }
});
export const AuditLog = getModel<IAuditLog>("AuditLog", AuditLogSchema);

// ==========================================
// 13. EmailLog
// ==========================================
export interface IEmailLog {
  recipient: string;
  subject: string;
  body: string;
  sentAt: Date;
}
const EmailLogSchema = new Schema<IEmailLog>({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});
export const EmailLog = getModel<IEmailLog>("EmailLog", EmailLogSchema);

// ==========================================
// 14. PlatformSettings
// ==========================================
export interface IPlatformSettings {
  key: string;
  value: string;
  description?: string;
}
const PlatformSettingsSchema = new Schema<IPlatformSettings>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  description: String
});
export const PlatformSettings = getModel<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema);

