"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Code, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Loader2
} from "lucide-react";

interface Application {
  _id: string;
  stage: string;
  resumeMatchScore: number;
  aiAnalysis: {
    strongSkills: string[];
    missingSkills: string[];
    weakAreas: string[];
    recommendations: string;
  };
  jobId: {
    _id: string;
    title: string;
    location: string;
    workMode: string;
    companyId: {
      name: string;
    };
  };
  createdAt: string;
}

interface Interview {
  _id: string;
  title: string;
  type: string;
  dateTime: string;
  meetingLink: string;
  status: string;
  interviewerId: {
    name: string;
  };
}

interface Offer {
  _id: string;
  salary: number;
  joiningDate: string;
  location: string;
  benefits: string;
  status: string;
  jobId: {
    title: string;
  };
}

interface Assessment {
  _id: string;
  title: string;
  durationMinutes: number;
  questions: any[];
}

export default function CandidateDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      // Fetch session data
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) throw new Error("Failed to load session");
      const sessionData = await sessionRes.json();
      setProfile(sessionData.profile);
      setUser(sessionData.user);

      if (sessionData.authenticated) {
        // Fetch applications
        const appRes = await fetch("/api/applications");
        if (appRes.ok) {
          const appData = await appRes.json();
          setApplications(appData.applications || []);
        }

        // Fetch interviews
        const intRes = await fetch("/api/interviews");
        if (intRes.ok) {
          const intData = await intRes.json();
          setInterviews(intData.interviews || []);
        }

        // Fetch offers
        const offerRes = await fetch("/api/offers");
        if (offerRes.ok) {
          const offerData = await offerRes.json();
          setOffers(offerData.offers || []);
        }

        // Fetch assessments
        const assRes = await fetch("/api/assessments");
        if (assRes.ok) {
          const assData = await assRes.json();
          setAssessments(assData.assessments || []);
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
  }, []);

  const handleOfferResponse = async (offerId: string, action: "accept" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this job offer?`)) return;

    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      alert(`You have successfully ${action}ed the offer!`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    let score = 20; // registered user baseline
    if (profile.phone) score += 10;
    if (profile.location) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.education && profile.education.length > 0) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 20;
    return Math.min(100, score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const completion = getProfileCompletion();
  const activeOffers = offers.filter(o => o.status === "sent");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(20rem_20rem_at_right,theme(colors.indigo.400/20),transparent)]"></div>
        <h1 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name}!</h1>
        <p className="text-indigo-100 text-sm mt-1.5 max-w-xl">
          Apply to active software jobs, complete coding evaluations, and track interview loops in your custom applicant tracking console.
        </p>

        {/* Verification Status */}
        {!user?.isEmailVerified && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/30 rounded-lg flex items-center justify-between text-xs gap-3">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-300" />
              Email is currently unverified. Verify to apply to corporate positions.
            </span>
            <button
              onClick={async () => {
                const res = await fetch("/api/auth/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: user.id })
                });
                if (res.ok) {
                  alert("Email verification simulated successfully!");
                  fetchData();
                }
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-white rounded font-bold transition-all shadow-sm shrink-0"
            >
              Verify Email Now
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completion */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Strength</span>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold mt-2 text-slate-850 dark:text-white">{completion}%</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            <Link href="/dashboard/candidate/profile" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-3 inline-block">
              Complete Profile fields &rarr;
            </Link>
          </div>
        </div>

        {/* Applied Count */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Positions</span>
            <div className="text-2xl font-extrabold mt-2 text-slate-850 dark:text-white">{applications.length}</div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CheckCircle className="h-4 w-4 text-emerald-500" /> 
            Active resume evaluation
          </div>
        </div>

        {/* Interviews Count */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Interviews</span>
            <div className="text-2xl font-extrabold mt-2 text-slate-850 dark:text-white">
              {interviews.filter(i => i.status === "scheduled").length}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Calendar className="h-4 w-4 text-indigo-500" />
            Calendar sync active
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Apps & Offers, Right = Schedules & Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Job Offers */}
          {activeOffers.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5" /> Active Job Offer Received!
              </h2>
              <div className="space-y-4">
                {activeOffers.map((offer) => (
                  <div key={offer._id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-base">{offer.jobId.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                        Salary: INR {offer.salary}/yr | Start Date: {new Date(offer.joiningDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs font-medium text-slate-650 dark:text-slate-400 mt-2 line-clamp-2">
                        Benefits: {offer.benefits}
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => handleOfferResponse(offer._id, "accept")}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleOfferResponse(offer._id, "reject")}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Reject
                      </button>
                      {/* Formatted HTML print/PDF view */}
                      <Link
                        href={`/dashboard/candidate/offers/${offer._id}`}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                        title="Download Offer Letter"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-550" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Applications */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Applied Jobs Pipeline</h2>
            {applications.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-slate-400">You haven&apos;t applied to any jobs yet.</p>
                <Link href="/jobs" className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 hover:bg-indigo-500 transition-all">
                  Search & Apply <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const job = app.jobId as any;
                  return (
                    <div key={app._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                      <div>
                        <div className="font-bold text-slate-850 dark:text-slate-100">{job?.title || "Role"}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                          <span>{job?.companyId?.name || "HireNova Tech"}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" /> {job?.location} ({job?.workMode})</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded">
                            Match Score: {app.resumeMatchScore}%
                          </span>
                          <span className="text-[10px] font-semibold text-slate-450">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          app.stage === "hired" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450" :
                          app.stage === "offer" ? "bg-violet-100 text-violet-750 dark:bg-violet-950/30 dark:text-violet-450" :
                          app.stage === "rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-450"
                        }`}>
                          {app.stage}
                        </span>

                        {/* If shortlists and has pending assessments, show start test shortcut */}
                        {app.stage === "shortlisted" && (
                          <Link 
                            href={`/dashboard/candidate/assessments`}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all shadow"
                          >
                            Launch Assessment
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Upcoming Interviews */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-indigo-650" /> Upcoming Schedules
            </h2>
            {interviews.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No interviews scheduled.
              </div>
            ) : (
              <div className="space-y-3.5">
                {interviews.map((int) => (
                  <div key={int._id} className="p-3 bg-slate-50 dark:bg-slate-950/10 rounded-lg border border-slate-200/50 dark:border-slate-800/50 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{int.title}</span>
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold uppercase ${
                        int.status === "scheduled" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {int.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">
                      Time: {new Date(int.dateTime).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                      Type: <span className="capitalize">{int.type}</span> | Interviewer: {int.interviewerId?.name || "Devon Harris"}
                    </div>
                    
                    {int.status === "scheduled" && (
                      <a
                        href={int.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3.5 w-full text-center py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold flex items-center justify-center gap-1.5 transition-all shadow shadow-indigo-600/10"
                      >
                        Join Meeting Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Assessments */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-indigo-650" /> Pending Assessments
            </h2>
            {assessments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No active coding tasks assigned.
              </div>
            ) : (
              <div className="space-y-3.5">
                {assessments.map((ass) => (
                  <div key={ass._id} className="p-3 bg-slate-50 dark:bg-slate-950/10 rounded-lg border border-slate-200/50 dark:border-slate-800/50 text-xs flex justify-between items-center gap-3">
                    <div>
                      <div className="font-bold text-slate-850 dark:text-slate-100">{ass.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Duration: {ass.durationMinutes} mins</div>
                    </div>
                    <Link
                      href={`/dashboard/candidate/assessments`}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold hover:shadow transition-all shrink-0"
                    >
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
