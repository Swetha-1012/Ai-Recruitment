"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Award, 
  Download, 
  Activity, 
  Star, 
  Loader2,
  FileText
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

export default function HiringManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [funnelData, setFunnelData] = useState<any[]>([]);

  // Detailed view state
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const fetchData = async () => {
    try {
      const appRes = await fetch("/api/applications");
      if (appRes.ok) {
        const appData = await appRes.json();
        // Hiring Managers primarily review shortlisted, technical, hr, and offer stage candidates
        setApplications(appData.applications || []);
      }

      const statsRes = await fetch("/api/recruiter/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {});
        setFunnelData(statsData.funnelData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecision = async (appId: string, action: "approve" | "reject") => {
    const confirmMsg = action === "approve" ? "Approve candidate for employment offer?" : "Reject candidate application?";
    if (!confirm(confirmMsg)) return;

    // Approving moves to 'offer' stage. Rejecting moves to 'rejected' stage.
    const newStage = action === "approve" ? "offer" : "rejected";
    const notes = action === "approve" ? "Hiring Manager approved candidate. Ready for offer generation." : "Hiring Manager rejected candidate.";

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, notes }),
      });

      if (res.ok) {
        alert(`Candidate successfully ${action === "approve" ? "approved" : "rejected"}!`);
        setSelectedApp(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFeedbackForApp = async (app: any) => {
    setSelectedApp(app);
    setLoadingFeedback(true);
    try {
      // Find interviews for this application
      const intRes = await fetch(`/api/interviews?applicationId=${app._id}`);
      if (intRes.ok) {
        const intData = await intRes.json();
        const inters = intData.interviews || [];
        
        // Fetch feedback for each completed interview
        const feedbackList = await Promise.all(
          inters
            .filter((i: any) => i.status === "feedback_submitted")
            .map(async (i: any) => {
              const fbRes = await fetch(`/api/interviews/${i._id}/feedback`);
              if (fbRes.ok) {
                const fbData = await fbRes.json();
                return {
                  title: i.title,
                  interviewer: fbData.feedback?.interviewerId?.name || "Devon Harris",
                  ...fbData.feedback,
                };
              }
              return null;
            })
        );
        setFeedback(feedbackList.filter(f => f !== null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const mockTimeData = [
    { name: "Jan", time: 14 },
    { name: "Feb", time: 13 },
    { name: "Mar", time: 11 },
    { name: "Apr", time: 10 },
    { name: "May", time: 9 },
    { name: "Jun", time: 8 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  // Filter candidate lists: Shortlisted, Technical, HR stages
  const activeCandidates = applications.filter((a) =>
    ["shortlisted", "technical", "hr", "offer", "hired"].includes(a.stage)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Manager Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Review evaluations, compare interviewer feedback, and authorize offer letters.</p>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Funnel chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-350">Company Hiring Funnel Analysis</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time-to-hire chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-350">Time-to-Hire Trend (Days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="time" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Candidates List & Decision Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shortlisted Candidates Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-650" /> Candidates Under Review
          </h2>
          
          {activeCandidates.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-450 italic">
              No candidates in shortlisted stages at this company.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-150 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/20 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">AI Match</th>
                    <th className="p-3">Pipeline Stage</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeCandidates.map((app) => (
                    <tr 
                      key={app._id} 
                      onClick={() => loadFeedbackForApp(app)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors cursor-pointer ${
                        selectedApp?._id === app._id ? "bg-indigo-50/20 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <td className="p-3 font-semibold text-slate-850 dark:text-slate-100">{app.candidateId?.name}</td>
                      <td className="p-3 font-medium">{app.jobId?.title}</td>
                      <td className="p-3">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{app.resumeMatchScore}%</span>
                      </td>
                      <td className="p-3 capitalize text-amber-600 font-semibold">{app.stage}</td>
                      <td className="p-3 text-right text-indigo-600 font-bold hover:underline">Review &rarr;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feedback comparison details drawer/panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[18rem]">
          {selectedApp ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="border-b border-slate-150 dark:border-slate-850 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedApp.candidateId.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedApp.jobId.title} (Match: {selectedApp.resumeMatchScore}%)</p>
                </div>

                {/* Scorecards */}
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Interviewer Feedback</div>
                  
                  {loadingFeedback ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-650" />
                    </div>
                  ) : feedback.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      No feedback submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedback.map((fb, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{fb.interviewer}</span>
                            <span className="font-extrabold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded text-[10px]">
                              Avg: {fb.overallRating}/10
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 font-medium">
                            <div>Tech Skills: {fb.ratings.technical}/10</div>
                            <div>Problem Solving: {fb.ratings.problemSolving}/10</div>
                            <div>Communication: {fb.ratings.communication}/10</div>
                            <div>Teamwork: {fb.ratings.teamwork}/10</div>
                          </div>

                          {fb.comments && (
                            <p className="text-[10.5px] italic text-slate-600 bg-white dark:bg-slate-950 p-2 border border-slate-100 rounded leading-relaxed mt-1">
                              &ldquo;{fb.comments}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {["shortlisted", "technical", "hr"].includes(selectedApp.stage) && (
                <div className="flex gap-3 pt-6 border-t border-slate-150 dark:border-slate-800 print:hidden">
                  <button
                    onClick={() => handleDecision(selectedApp._id, "approve")}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Hire
                  </button>
                  <button
                    onClick={() => handleDecision(selectedApp._id, "reject")}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Archive Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full">
              <FileText className="h-10 w-10 text-slate-300 mb-2" />
              <div className="text-xs text-slate-500">Select a candidate on the left to view technical evaluation details and feedback.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
