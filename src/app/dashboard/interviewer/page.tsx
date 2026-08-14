"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Video, 
  Clock, 
  MessageSquare, 
  FileText, 
  Loader2, 
  X,
  Star,
  CheckCircle2
} from "lucide-react";

export default function InterviewerDashboard() {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  
  // Feedback Modal States
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState("");
  const [technical, setTechnical] = useState(8);
  const [communication, setCommunication] = useState(8);
  const [problemSolving, setProblemSolving] = useState(8);
  const [teamwork, setTeamwork] = useState(8);
  const [leadership, setLeadership] = useState(8);
  const [submitting, setSubmitting] = useState(false);

  const fetchInterviews = async () => {
    try {
      const res = await fetch("/api/interviews");
      if (res.ok) {
        const data = await res.json();
        setInterviews(data.interviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const openFeedbackForm = (int: any) => {
    setSelectedInterview(int);
    setTechnical(8);
    setCommunication(8);
    setProblemSolving(8);
    setTeamwork(8);
    setLeadership(8);
    setComments("");
    setShowModal(true);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/interviews/${selectedInterview._id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratings: {
            technical,
            communication,
            problemSolving,
            teamwork,
            leadership,
          },
          comments,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      alert("Interview scorecard logged successfully!");
      setShowModal(false);
      fetchInterviews();
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

  // Filter scheduled loop vs completed
  const pendingInterviews = interviews.filter(i => i.status === "scheduled");
  const completedInterviews = interviews.filter(i => i.status === "feedback_submitted");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Assigned Candidates Evaluations</h1>
        <p className="text-xs text-slate-500 mt-1">Conduct video evaluations and submit performance scorecard ratings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Evaluations list */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-indigo-650" /> Pending Interview rounds
          </h2>

          {pendingInterviews.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-450 italic">
              No active candidates scheduled for evaluations.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInterviews.map((int) => (
                <div key={int._id} className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-250 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-850 dark:text-slate-100 text-sm">{int.candidateId?.name}</div>
                    <div className="text-[10px] text-indigo-650 font-bold mt-0.5">{int.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(int.dateTime).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={int.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1"
                    >
                      <Video className="h-4.5 w-4.5" /> Join Meet
                    </a>
                    <button
                      onClick={() => openFeedbackForm(int)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-800"
                    >
                      Log Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed list */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Completed Evaluations
          </h2>

          {completedInterviews.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-450 italic">
              No completed scorecards logged yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {completedInterviews.map((int) => (
                <div key={int._id} className="p-3 bg-slate-50 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-lg text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{int.candidateId?.name}</div>
                    <div className="text-[10px] text-slate-450 mt-0.5">{int.title}</div>
                    <div className="text-[9px] text-slate-450 mt-1">Evaluated on: {new Date(int.dateTime).toLocaleDateString()}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                    Scorecard Logged
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Feedback Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md z-50 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Submit Candidate Scorecard</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg text-[10.5px] leading-relaxed text-indigo-700 dark:text-indigo-300">
                Evaluate applicant capability on a scale of 1 (Low) to 10 (High). Note: Compensation and salary details are masked.
              </div>

              {/* Slider repeaters */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Technical Capabilities</span>
                    <span>{technical}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={technical}
                    onChange={(e) => setTechnical(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Communication & Articulation</span>
                    <span>{communication}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={communication}
                    onChange={(e) => setCommunication(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Problem Solving & Algorithms</span>
                    <span>{problemSolving}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={problemSolving}
                    onChange={(e) => setProblemSolving(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Teamwork alignment</span>
                    <span>{teamwork}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={teamwork}
                    onChange={(e) => setTeamwork(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>Leadership qualities</span>
                    <span>{leadership}/10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={leadership}
                    onChange={(e) => setLeadership(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Feedback Comments</label>
                <textarea
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Candidate exhibited deep React component life cycle knowledge..."
                  rows={4}
                  className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Evaluation Scorecard"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
