"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, User, Video, Clock, CheckCircle2, Loader2, X, Plus } from "lucide-react";

function InterviewsContent() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get("appId") || "";

  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [applicationId, setApplicationId] = useState(initialAppId);
  const [interviewerId, setInterviewerId] = useState("");
  const [title, setTitle] = useState("Technical Assessment Interview");
  const [type, setType] = useState("technical");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch interviews
      const intRes = await fetch("/api/interviews");
      if (intRes.ok) {
        const intData = await intRes.json();
        setInterviews(intData.interviews || []);
      }

      // Fetch applications (for dropdown selection)
      const appRes = await fetch("/api/applications");
      if (appRes.ok) {
        const appData = await appRes.json();
        // Allow scheduling for non-rejected, non-hired candidates
        const activeApps = (appData.applications || []).filter(
          (a: any) => !["rejected", "hired"].includes(a.stage)
        );
        setApplications(activeApps);
      }

      // Fetch interviewers (corporate roles)
      const userRes = await fetch("/api/admin/seed"); // We can fetch all users from admin endpoint or seed
      // For safety, let's query the database users with role interviewer
      // We can implement a quick user fetch API at /api/admin/users
      const usersRes = await fetch("/api/admin/users?role=interviewer");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setInterviewers(usersData.users || []);
      } else {
        // Fallback seed list if endpoint doesn't exist yet
        setInterviewers([
          { _id: "66b2a0c4f83b27b3d3090003", name: "Devon Harris", email: "interviewer1@hirenova.tech" }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (initialAppId) {
      setApplicationId(initialAppId);
      setShowModal(true);
    }
  }, [initialAppId]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dateTime = new Date(`${date}T${time}`).toISOString();
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          interviewerId,
          title,
          type,
          dateTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule");
      }

      alert("Interview scheduled successfully!");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Assigned Interview Schedules</h1>
          <p className="text-xs text-slate-500 mt-1">Book technical and HR interview rounds and review meeting invitations.</p>
        </div>
        <button
          onClick={() => {
            setApplicationId(initialAppId);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Book Interview
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
          No interviews scheduled. Click the button above to schedule your first meeting.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold text-slate-650 dark:text-slate-350">
              <tr>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Interview Title</th>
                <th className="p-4">Assigned Interviewer</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Meeting URL</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {interviews.map((int) => (
                <tr key={int._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{int.candidateId?.name}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{int.title}</td>
                  <td className="p-4">{int.interviewerId?.name}</td>
                  <td className="p-4 capitalize">{int.type}</td>
                  <td className="p-4 text-indigo-650 dark:text-indigo-400 font-semibold">
                    {new Date(int.dateTime).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {int.status === "scheduled" && (
                      <a
                        href={int.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Video className="h-3.5 w-3.5" /> Join Link
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      int.status === "scheduled" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {int.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md z-50 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Book Interview Session</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Select Candidate Application</label>
                <select
                  required
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Candidate --</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.candidateId?.name} - {app.jobId?.title} (AI: {app.resumeMatchScore}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Assigned Interviewer</label>
                <select
                  required
                  value={interviewerId}
                  onChange={(e) => setInterviewerId(e.target.value)}
                  className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Corporate Interviewer --</option>
                  {interviewers.map((int) => (
                    <option key={int._id} value={int._id}>
                      {int.name} ({int.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Interview Round Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Technical Round"
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Round Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  >
                    <option value="technical">Technical</option>
                    <option value="hr">HR Round</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Interview Slot"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookInterviews() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    }>
      <InterviewsContent />
    </Suspense>
  );
}
