"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Loader2,
  Sparkles
} from "lucide-react";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      
      // Fetch Job Details
      const jobRes = await fetch(`/api/jobs/${id}`);
      if (!jobRes.ok) throw new Error("Job not found");
      const jobData = await jobRes.json();
      setJob(jobData.job);

      // Fetch User & Profile session
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);
        setProfile(sessionData.profile);

        if (sessionData.authenticated) {
          // Fetch existing applications
          const appRes = await fetch(`/api/applications?jobId=${id}`);
          if (appRes.ok) {
            const appData = await appRes.json();
            const existingApp = appData.applications?.find((a: any) => a.jobId._id === id);
            if (existingApp) {
              setApplication(existingApp);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "candidate") {
      setError("Only Candidates can apply for job listings.");
      return;
    }

    if (!profile || !profile.resumeText) {
      setError("Please upload your resume in the Candidate profile tab before applying.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Application submitted successfully! AI Match Score: ${data.application.resumeMatchScore}%`);
      setApplication(data.application);
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm max-w-md mx-auto mt-12">
        {error}
      </div>
    );
  }

  const company = job.companyId || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Back Button */}
      <Link
        href="/jobs"
        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Jobs Board
      </Link>

      {/* Main Job Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded uppercase">
            {job.department}
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">{job.title}</h1>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{company.name}</p>
          
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location} ({job.workMode})</span>
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.employmentType}</span>
            <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> INR {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {application ? (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/60 rounded-xl text-center">
              <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 text-xs font-bold justify-center">
                <ShieldCheck className="h-4 w-4" /> Applied
              </div>
              <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">Stage: {application.stage}</div>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Match: {application.resumeMatchScore}%</div>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="h-4.5 w-4.5 text-emerald-550 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main details block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col (2/3) Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Job Description</h2>
            <div className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Minimum Requirements</h2>
            <ul className="text-xs text-slate-600 dark:text-slate-350 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0"></span>
                Required Experience: Minimum {job.experienceRequired} years in a similar capacity.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0"></span>
                Willingness to adapt and learn new technology stacks.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col (1/3) Sidebar details */}
        <div className="space-y-6">
          {/* Required Skills list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill: string) => (
                <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* AI Matching Details Panel if applied */}
          {application && application.aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 p-6 rounded-2xl border border-indigo-150 dark:border-indigo-900/40 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-350 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> AI Application Analysis
              </h3>
              
              <div className="text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Strong Match Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {application.aiAnalysis.strongSkills.map((s: string) => (
                    <span key={s} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 px-2 py-0.5 rounded text-[10px] font-bold">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {application.aiAnalysis.missingSkills.length > 0 && (
                <div className="text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Missing Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {application.aiAnalysis.missingSkills.map((s: string) => (
                      <span key={s} className="bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-450 px-2 py-0.5 rounded text-[10px] font-bold">
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                <div className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">Hiring Advice:</div>
                {application.aiAnalysis.recommendations}
              </div>
            </div>
          )}

          {/* Company Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">About the Company</h3>
            <div className="text-xs font-semibold text-slate-750 dark:text-slate-350">{company.name}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-4">
              {company.description || "Leading provider of software development and full stack recruitment portals."}
            </p>
            <div className="text-[10px] text-slate-450 space-y-1">
              <div>Industry: {company.industry}</div>
              <div>Company Size: {company.size} employees</div>
              <div>Office locations: {company.locations?.join(", ")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
