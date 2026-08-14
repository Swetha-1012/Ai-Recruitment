"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Check, 
  X, 
  Loader2, 
  ArrowLeft, 
  BarChart, 
  Sparkles, 
  Building,
  CheckCircle2,
  AlertTriangle,
  Award
} from "lucide-react";
import Link from "next/link";

export default function CandidateComparison() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState<any[]>([]);

  // Selection states
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [comparisonDetails, setComparisonDetails] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.jobs?.length > 0) {
          setSelectedJobId(data.jobs[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const fetchApplications = async () => {
      try {
        setComparisonDetails([]);
        setSelectedAppIds([]);
        const res = await fetch(`/api/applications?jobId=${selectedJobId}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchApplications();
  }, [selectedJobId]);

  const handleCheckboxToggle = (appId: string) => {
    if (selectedAppIds.includes(appId)) {
      setSelectedAppIds(selectedAppIds.filter(id => id !== appId));
    } else {
      if (selectedAppIds.length >= 4) {
        alert("You can compare up to 4 candidates at a time.");
        return;
      }
      setSelectedAppIds([...selectedAppIds, appId]);
    }
  };

  const executeComparison = async () => {
    if (selectedAppIds.length < 2) {
      alert("Please select at least 2 candidates to compare.");
      return;
    }

    setLoadingDetails(true);
    try {
      // Load Candidate 360 data for all selected applications in parallel
      const details = await Promise.all(
        selectedAppIds.map(async (appId) => {
          const res = await fetch(`/api/applications/${appId}/360`);
          if (res.ok) {
            const data = await res.json();
            return data;
          }
          return null;
        })
      );
      setComparisonDetails(details.filter(d => d !== null));
    } catch (err) {
      console.error("Comparison load error:", err);
    } finally {
      setLoadingDetails(false);
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
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Candidate Comparison Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">Select and compare 2 to 4 candidates side-by-side across coding, matching, and interviewer grades.</p>
        </div>
      </div>

      {/* Selector Area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Job Opening</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500"
          >
            {jobs.map(job => (
              <option key={job._id} value={job._id}>{job.title} ({job.department})</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={executeComparison}
            disabled={selectedAppIds.length < 2 || loadingDetails}
            className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            {loadingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart className="h-4 w-4" />}
            Compare Selected Profiles ({selectedAppIds.length})
          </button>
        </div>
      </div>

      {/* Candidate Checkboxes Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="h-4.5 w-4.5 text-indigo-650" /> Check Candidates to Compare
        </h2>

        {applications.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-450 italic">
            No active candidates applied for this job listing.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {applications.map((app) => {
              const isChecked = selectedAppIds.includes(app._id);
              return (
                <div 
                  key={app._id}
                  onClick={() => handleCheckboxToggle(app._id)}
                  className={`p-3 border rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-850 transition-all flex items-center gap-3 select-none ${
                    isChecked 
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500" 
                      : "bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850"
                  }`}
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center text-white ${
                    isChecked ? "bg-indigo-600 border-indigo-600" : "bg-white dark:bg-slate-900 border-slate-300"
                  }`}>
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-850 dark:text-slate-100">{app.candidateId?.name}</div>
                    <div className="text-[10px] text-slate-450 mt-0.5 capitalize">{app.stage} &bull; Match: {app.resumeMatchScore}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Grid Results */}
      {loadingDetails ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        </div>
      ) : comparisonDetails.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto animate-in fade-in duration-200">
          <table className="w-full text-left text-xs divide-y divide-slate-150 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold text-slate-650 dark:text-slate-350">
              <tr>
                <th className="p-4 min-w-[10rem]">Comparison Metrics</th>
                {comparisonDetails.map(c => (
                  <th key={c.application._id} className="p-4 text-center min-w-[12rem] border-l border-slate-150 dark:border-slate-800">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">{c.candidate.name}</div>
                    <div className="text-[10px] text-indigo-650 font-bold uppercase mt-1">{c.application.stage} Stage</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-medium">
              
              {/* Fit Score */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Overall Hiring Fit</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 text-center border-l border-slate-150 dark:border-slate-800">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {c.hiringIntelligence.overallFit}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Skills Match */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Resume/Skills Match</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 text-center border-l border-slate-150 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{c.hiringIntelligence.resumeMatch}%</span>
                      <span className="text-[10px] text-slate-400">({c.aiReport.strongSkills.length} matches)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Experience Alignment</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 text-center border-l border-slate-150 dark:border-slate-800">
                    <div>{c.hiringIntelligence.experienceFit}% Fit</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{c.candidate.profile.totalExperience || 2} Years Total</div>
                  </td>
                ))}
              </tr>

              {/* Coding Grade */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Coding Test Score</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 text-center border-l border-slate-150 dark:border-slate-800">
                    {c.hiringIntelligence.codingScore !== null ? (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-450">{c.hiringIntelligence.codingScore}%</span>
                    ) : (
                      <span className="text-slate-400 italic">Not Attempted</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Interview score */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Interview Ratings Avg</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 text-center border-l border-slate-150 dark:border-slate-800">
                    {c.hiringIntelligence.feedbackAverage !== null ? (
                      <span className="font-extrabold text-amber-500">{c.hiringIntelligence.feedbackAverage}/10</span>
                    ) : (
                      <span className="text-slate-400 italic">Feedback Pending</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Strong Skills */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Strong Skill Signals</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 border-l border-slate-150 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1 justify-center max-w-[14rem] mx-auto">
                      {c.aiReport.strongSkills.slice(0, 4).map((s: string) => (
                        <span key={s} className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded text-[9px] font-bold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Skill Gaps */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Priority Skill Gaps</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 border-l border-slate-150 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1 justify-center max-w-[14rem] mx-auto">
                      {c.aiReport.missingSkills.length > 0 ? (
                        c.aiReport.missingSkills.slice(0, 3).map((s: string) => (
                          <span key={s} className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded text-[9px] font-bold">
                            ✗ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold italic">No gaps detected!</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action Link */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300">Actions</td>
                {comparisonDetails.map(c => (
                  <td key={c.application._id} className="p-4 text-center border-l border-slate-150 dark:border-slate-800">
                    <Link 
                      href={`/dashboard/recruiter/candidates/${c.application._id}/360`}
                      className="px-3.5 py-1.5 border border-indigo-200 dark:border-indigo-850 bg-indigo-50/20 text-indigo-650 hover:bg-indigo-50 font-bold rounded-lg text-[10px] transition-all inline-block"
                    >
                      View 360° Profile &rarr;
                    </Link>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
