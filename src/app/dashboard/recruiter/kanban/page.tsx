"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeftRight, 
  ChevronRight, 
  MapPin, 
  Trash2, 
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";

const STAGES = [
  { id: "applied", label: "Applied", color: "border-slate-300" },
  { id: "screening", label: "Screening", color: "border-blue-400" },
  { id: "shortlisted", label: "Shortlisted", color: "border-indigo-400" },
  { id: "technical", label: "Technical", color: "border-violet-400" },
  { id: "hr", label: "HR", color: "border-amber-400" },
  { id: "offer", label: "Offer", color: "border-purple-400" },
  { id: "hired", label: "Hired", color: "border-emerald-400" },
  { id: "rejected", label: "Rejected", color: "border-rose-450" }
];

export default function KanbanBoard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  
  // Drawer/Details State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedAppProfile, setSelectedAppProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStageChange = async (appId: string, newStage: string, notes?: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, notes }),
      });

      if (res.ok) {
        // Optimistic UI updates
        setApplications(prev => prev.map(app => 
          app._id === appId ? { ...app, stage: newStage } : app
        ));
        
        // If drawer is open, sync details
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(prev => ({ ...prev, stage: newStage }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAppDetails = async (app: any) => {
    setSelectedApp(app);
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/applications/${app._id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAppProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
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
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="shrink-0 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Hiring Kanban Board</h1>
          <p className="text-xs text-slate-500 mt-1">Move applicants across different hiring phases from screening to hired.</p>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4 items-start select-none">
        
        {STAGES.map((col) => {
          const colApps = applications.filter(app => app.stage === col.id);
          return (
            <div 
              key={col.id} 
              className={`w-72 max-h-full flex flex-col bg-white dark:bg-slate-900 border-t-4 ${col.color} border border-slate-200 dark:border-slate-800 rounded-xl p-3 shrink-0 shadow-sm overflow-hidden`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 px-1 shrink-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{col.label}</span>
                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                {colApps.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-slate-400 italic border border-dashed border-slate-150 dark:border-slate-800 rounded-lg">
                    No applicants
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div 
                      key={app._id}
                      onClick={() => openAppDetails(app)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-400 dark:hover:border-indigo-850 transition-all duration-200 cursor-pointer space-y-3 relative overflow-hidden group shadow-sm"
                    >
                      {/* Quality indicator bar on the left edge */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        app.resumeMatchScore >= 80 ? "bg-emerald-500" :
                        app.resumeMatchScore >= 60 ? "bg-indigo-500" : "bg-amber-400"
                      }`} />

                      <div className="pl-1">
                        <div className="font-bold text-xs text-slate-850 dark:text-slate-100 truncate pr-4 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">{app.candidateId?.name}</div>
                        <div className="text-[9px] font-semibold text-slate-400 truncate mt-0.5">{app.jobId?.title}</div>
                      </div>

                      <div className="flex justify-between items-center pl-1 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          app.resumeMatchScore >= 80 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700" :
                          app.resumeMatchScore >= 60 ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700" : "bg-amber-50 dark:bg-amber-950/20 text-amber-700"
                        }`}>
                          ★ Fit: {app.resumeMatchScore}%
                        </span>
                        
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageChange(app._id, e.target.value)}
                            className="text-[9px] font-bold p-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          >
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Slide-Over Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          
          <aside className="relative w-[30rem] max-w-full bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 z-50">
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-slate-150 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedApp.candidateId?.name}</h2>
                  <p className="text-xs text-indigo-650 font-semibold">{selectedApp.jobId?.title}</p>
                </div>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  &times;
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Pipeline Stage:</span>
                <select
                  value={selectedApp.stage}
                  onChange={(e) => handleStageChange(selectedApp._id, e.target.value)}
                  className="text-xs font-bold p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              {/* AI Report Card */}
              {selectedApp.aiAnalysis && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 space-y-3.5">
                  <h3 className="text-xs font-extrabold text-indigo-750 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5" /> AI Compatibility Match Report ({selectedApp.resumeMatchScore}%)
                  </h3>

                  <div className="text-xs">
                    <div className="font-bold text-slate-700 dark:text-slate-350">Strong Match:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApp.aiAnalysis.strongSkills.map((s: string) => (
                        <span key={s} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-450 px-2 py-0.5 rounded text-[10px] font-bold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedApp.aiAnalysis.missingSkills.length > 0 && (
                    <div className="text-xs">
                      <div className="font-bold text-slate-700 dark:text-slate-350">Missing Skills:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedApp.aiAnalysis.missingSkills.map((s: string) => (
                          <span key={s} className="bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450 px-2 py-0.5 rounded text-[10px] font-bold">
                            ✗ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    <div className="font-bold text-slate-700 dark:text-slate-305 text-xs mb-1">Hiring Recommendation:</div>
                    {selectedApp.aiAnalysis.recommendations}
                  </div>

                  <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50">
                    <Link
                      href={`/dashboard/recruiter/candidates/${selectedApp._id}/360`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-lg transition-all text-xs shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> View Candidate 360° Intelligence
                    </Link>
                  </div>
                </div>
              )}

              {/* Profile details */}
              <div className="space-y-4 pt-2 border-t border-slate-150 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Candidate Profile</h3>
                
                {loadingProfile ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-650" />
                  </div>
                ) : !selectedAppProfile ? (
                  <div className="text-xs text-slate-500 italic">Profile fields have not been created.</div>
                ) : (
                  <div className="text-xs space-y-4 text-slate-650 dark:text-slate-350 leading-relaxed">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Phone</div>
                        <div className="font-semibold text-slate-850 dark:text-slate-100 mt-0.5">{selectedAppProfile.phone || "Not listed"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Location</div>
                        <div className="font-semibold text-slate-850 dark:text-slate-100 mt-0.5">{selectedAppProfile.location || "Not listed"}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Academic Background</div>
                      {(selectedAppProfile.education || []).map((edu: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-950/20 p-2 border border-slate-200 dark:border-slate-800 rounded mt-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{edu.degree} in {edu.fieldOfStudy}</span>
                          <div className="text-[10px] text-slate-450">{edu.school} ({edu.startYear} - {edu.endYear})</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Work History</div>
                      {(selectedAppProfile.experience || []).map((exp: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-950/20 p-2 border border-slate-200 dark:border-slate-800 rounded mt-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{exp.role} at {exp.company}</span>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-3">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scheduled Interview Action panel */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-4 mt-6 flex gap-3 shrink-0 print:hidden">
              <Link
                href={`/dashboard/recruiter/interviews?appId=${selectedApp._id}`}
                className="flex-1 py-2 text-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Schedule Interview
              </Link>
              <Link
                href={`/dashboard/recruiter/offers?appId=${selectedApp._id}`}
                className="flex-1 py-2 text-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Generate Offer
              </Link>
            </div>

          </aside>
        </div>
      )}
    </div>
  );
}
