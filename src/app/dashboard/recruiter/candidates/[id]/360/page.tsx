"use client";

import { useState, useEffect, use } from "react";
import { 
  ArrowLeft, 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Users, 
  Clock, 
  Play, 
  ShieldAlert, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  FileText,
  Loader2,
  RefreshCw,
  Compass,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Candidate360Props {
  params: Promise<{ id: string }>;
}

const CircularProgress = ({ value, label, colorClass }: { value: number; label: string; colorClass: string }) => {
  const radius = 38;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 rounded-2xl transition-all hover:scale-[1.02] duration-200">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            className="text-slate-100 dark:text-slate-800/40"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            className={colorClass}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[11px] font-black text-slate-800 dark:text-white">{value}%</span>
      </div>
      <span className="text-[9px] font-bold text-slate-450 uppercase mt-2.5 tracking-wider text-center line-clamp-1">{label}</span>
    </div>
  );
};

export default function Candidate360Page({ params }: Candidate360Props) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [regeneratingQuestions, setRegeneratingQuestions] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [expandedSkillEvidence, setExpandedSkillEvidence] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/applications/${id}/360`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        alert("Failed to load Candidate 360 profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAction = async (action: "reanalyze" | "regenerate_questions") => {
    if (action === "reanalyze") setReanalyzing(true);
    if (action === "regenerate_questions") setRegeneratingQuestions(true);

    try {
      const res = await fetch(`/api/applications/${id}/360`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        const json = await res.json();
        alert(action === "reanalyze" ? "AI match analysis updated!" : "AI interview questions regenerated!");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
      setRegeneratingQuestions(false);
    }
  };

  const toggleEvidence = (skillName: string) => {
    setExpandedSkillEvidence(prev => ({ ...prev, [skillName]: !prev[skillName] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white border rounded-2xl">
        Hiring Intelligence Profile not found. Please verify the Application ID.
      </div>
    );
  }

  const { candidate, job, hiringIntelligence, aiReport, interviews, feedback, assessments } = data;
  const isFailedAI = !aiReport || !aiReport.strongSkills;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/recruiter/kanban" 
            className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-655 dark:text-indigo-400 rounded uppercase">
              Candidate 360° Hiring Intelligence
            </span>
            <h1 className="text-xl font-extrabold text-slate-850 dark:text-white mt-1">
              Hiring Intelligence Panel
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleAction("reanalyze")}
            disabled={reanalyzing}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center gap-1.5"
          >
            {reanalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Re-Analyze Profile
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center font-black text-2xl border-2 border-white/20 shadow-md">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black">{candidate.name}</h2>
            <div className="text-xs text-indigo-200 font-semibold mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1"><Compass className="h-3.5 w-3.5" /> {job.title} ({job.department})</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {candidate.profile?.location || "Remote"}</span>
            </div>
            <div className="flex gap-2 mt-3.5">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-white/10 text-white rounded-full uppercase tracking-wider border border-white/5">
                Stage: {data.application.stage}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/20">
                Completed: {candidate.profileCompletion}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-center md:min-w-[12rem] flex flex-col justify-center items-center shadow-inner">
          <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider mb-1">Overall Hiring Fit</div>
          <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {hiringIntelligence.overallFit}%
          </div>
          <div className="text-[9px] text-slate-400 mt-2 flex items-center gap-0.5">
            <Sparkles className="h-3 w-3 text-indigo-400" /> AI-generated decision support
          </div>
        </div>
      </div>

      {/* Grid: Scores & Explainable AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fit Score Breakdown Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider">Hiring Score breakdown</h3>
          
          <div className="grid grid-cols-2 gap-3.5">
            <CircularProgress 
              value={hiringIntelligence.resumeMatch} 
              label="Resume Match" 
              colorClass="text-indigo-650" 
            />
            <CircularProgress 
              value={hiringIntelligence.experienceFit} 
              label="Experience Fit" 
              colorClass="text-violet-500" 
            />
            <CircularProgress 
              value={hiringIntelligence.codingScore !== null ? hiringIntelligence.codingScore : 0} 
              label="Coding Test" 
              colorClass="text-emerald-500" 
            />
            <CircularProgress 
              value={hiringIntelligence.feedbackAverage !== null ? Math.round(hiringIntelligence.feedbackAverage * 10) : 0} 
              label="Interview Ratings" 
              colorClass="text-amber-500" 
            />
          </div>
          
          {hiringIntelligence.codingSwitches > 0 && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl text-[10px] text-rose-600 dark:text-rose-455 font-bold flex items-center gap-1.5 mt-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Tab exits tracked: {hiringIntelligence.codingSwitches} exits
            </div>
          )}
        </div>

        {/* Explainable AI Decision Support (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> Explainable AI Insights
          </h3>

          {isFailedAI ? (
            <div className="p-4 bg-rose-50 border border-dashed border-rose-200 rounded-xl text-center text-xs text-rose-700">
              AI analysis temporarily unavailable. Candidate matching fallback enabled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Why this candidate matches
                  </h4>
                  <ul className="space-y-1.5 pl-5 list-disc text-slate-600 dark:text-slate-400 font-medium">
                    {aiReport.strongSkills.slice(0, 4).map((s: string) => (
                      <li key={s}>Professional skills match found: <strong className="text-slate-850 dark:text-white font-bold">{s}</strong>.</li>
                    ))}
                    <li>Experience profile matches minimum expectations.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-850 dark:text-white mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Identified Skill Gaps
                  </h4>
                  {aiReport.missingSkills.length === 0 ? (
                    <div className="text-slate-500 italic">No major skill gaps identified!</div>
                  ) : (
                    <ul className="space-y-1.5 pl-5 list-disc text-slate-600 dark:text-slate-400 font-medium">
                      {aiReport.missingSkills.slice(0, 3).map((s: string) => (
                        <li key={s}>No direct evidence found for: <strong className="text-rose-500 font-extrabold">{s}</strong>.</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-850 dark:text-white mb-1">AI Recommendation</h4>
                  <p className="italic text-slate-500 leading-relaxed">&ldquo;{aiReport.recommendations}&rdquo;</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Skill Readiness & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Skill Intelligence Graph (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider">Skill Gap Readiness</h3>
            <p className="text-[10px] text-slate-450 mt-1">Computed alignment based on skill matching vectors.</p>
          </div>
          
          <div className="space-y-3 pt-2">
            {job.skills.map((skill: string, idx: number) => {
              const isStrong = aiReport?.strongSkills?.includes(skill);
              const isPartial = aiReport?.partialSkills?.includes(skill);
              const pct = isStrong ? 100 : isPartial ? 70 : 15;
              const barColor = isStrong ? "bg-emerald-500" : isPartial ? "bg-indigo-500" : "bg-rose-400";
              
              return (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span>{skill}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-450 uppercase mb-2">Priority Skill Gaps</div>
            <div className="flex flex-wrap gap-1.5">
              {aiReport?.missingSkills?.length > 0 ? (
                aiReport.missingSkills.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded font-bold text-[10px]">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-600 italic">No missing skills! Candidate possesses full tech stack.</span>
              )}
            </div>
          </div>
        </div>

        {/* Skill Evidence Panel (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Skill Evidence Panel</h3>
            <p className="text-[10px] text-slate-450 mt-1">Inspect context sentences extracted directly from projects and work experience.</p>
          </div>

          {!aiReport?.evidence || aiReport.evidence.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              No skill evidence mapped for this candidate.
            </div>
          ) : (
            <div className="space-y-2.5">
              {aiReport.evidence.map((ev: any, idx: number) => {
                const isExpanded = !!expandedSkillEvidence[ev.skill];
                const badgeColor = ev.level === "Strong Match" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700";
                
                return (
                  <div key={idx} className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                    <button 
                      type="button"
                      onClick={() => toggleEvidence(ev.skill)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-955/20 transition-all flex items-center justify-between gap-3 text-left font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-850 dark:text-white">{ev.skill}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${badgeColor}`}>
                          {ev.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[10px] font-semibold text-slate-450">Source: {ev.source}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Confidence: High</div>
                        <p className="italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-200">
                          &ldquo;{ev.text}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid: AI Interview Questions & Interview Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personalized AI Questions Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <BrainCircuit className="h-4.5 w-4.5 text-indigo-650" /> Personalized Interview Guide
              </h3>
              <p className="text-[10px] text-slate-450 mt-1">AI-generated questions targeting project statements and skills.</p>
            </div>
            <button
              onClick={() => handleAction("regenerate_questions")}
              disabled={regeneratingQuestions}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
              title="Regenerate Questions"
            >
              {regeneratingQuestions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="space-y-3.5">
            {aiReport.interviewQuestions?.map((q: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-xl text-xs space-y-1 leading-relaxed">
                <div className="font-extrabold text-indigo-650 text-[10px] uppercase">{q.category} Question</div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{q.question}</p>
              </div>
            )) || (
              <div className="text-xs text-slate-500 italic text-center py-6">No personalized questions generated.</div>
            )}
          </div>
        </div>

        {/* Interview Intelligence Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Interviews Intelligence Summary</h3>
            <p className="text-[10px] text-slate-450 mt-1">Unified consensus overview from technical, hr, and coding assessments.</p>
          </div>

          {!aiReport.interviewSummary || !aiReport.interviewSummary.consensus ? (
            <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-955/20 rounded-xl">
              No interview feedback submitted yet. schedule interviews and log ratings to build the summary.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-850 rounded-lg">
                <div className="font-bold text-indigo-750 dark:text-indigo-400">Consensus Theme:</div>
                <p className="mt-1 leading-relaxed font-semibold">{aiReport.interviewSummary.consensus}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Strengths
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-slate-550 leading-relaxed font-medium">
                    {aiReport.interviewSummary.strengths.map((str: string, i: number) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-0.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Concerns
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-slate-550 leading-relaxed font-medium">
                    {aiReport.interviewSummary.concerns.map((con: string, i: number) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Recommended Next Step</div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 italic">&ldquo;{aiReport.interviewSummary.recommendation}&rdquo;</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Application Timeline & AI Hiring Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Log (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-indigo-650" /> Application Chronology
          </h3>

          <div className="relative pl-5 border-l border-slate-200 dark:border-slate-800 space-y-6 text-xs">
            {data.application.timeline?.map((evt: any, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900 shadow"></div>
                <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">{evt.stage} stage</div>
                <div className="text-[10px] text-slate-400 font-semibold">{new Date(evt.timestamp).toLocaleString()}</div>
                {evt.notes && <p className="text-[10px] italic text-slate-500 mt-1 leading-relaxed">{evt.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* AI Hiring Brief Summary (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-indigo-650" /> AI Hiring Brief Overview
          </h3>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-xl space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="text-[10px] text-slate-450 uppercase font-bold">Overall Fit</div>
                <div className="text-lg font-black text-indigo-650 mt-1">{hiringIntelligence.overallFit}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-450 uppercase font-bold">Skills Match</div>
                <div className="text-lg font-black text-indigo-650 mt-1">{hiringIntelligence.resumeMatch}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-450 uppercase font-bold">Coding Grade</div>
                <div className="text-lg font-black text-indigo-650 mt-1">{hiringIntelligence.codingScore !== null ? `${hiringIntelligence.codingScore}%` : "N/A"}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-450 uppercase font-bold">Feedback</div>
                <div className="text-lg font-black text-indigo-650 mt-1">{hiringIntelligence.feedbackAverage !== null ? `${hiringIntelligence.feedbackAverage}/10` : "N/A"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
              <div className="space-y-3">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Strongest Signal Indicators
                  </div>
                  <ul className="pl-4 list-disc text-slate-600 dark:text-slate-400 mt-1 text-[11px] font-medium">
                    {aiReport.strongSkills.slice(0, 3).map((s: string) => (
                      <li key={s}>Technical proficiency matching required skill: <strong className="text-slate-800 dark:text-slate-100">{s}</strong>.</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-0.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Potential Risk Signals
                  </div>
                  <ul className="pl-4 list-disc text-slate-600 dark:text-slate-400 mt-1 text-[11px] font-medium">
                    {aiReport.missingSkills.length > 0 ? (
                      aiReport.missingSkills.slice(0, 2).map((s: string) => (
                        <li key={s}>No direct skill evidence quote mapped for: <strong className="text-rose-500 font-extrabold">{s}</strong>.</li>
                      ))
                    ) : (
                      <li>No major technical skill gaps detected in resume comparison.</li>
                    )}
                    {hiringIntelligence.codingSwitches > 0 && (
                      <li className="text-rose-500 font-bold">Tab cheating switches detected: {hiringIntelligence.codingSwitches} switches.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 font-bold flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Recommended Final Next Action</span>
                <p className="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{aiReport.interviewSummary?.recommendation || "Proceed to subsequent evaluation stages while validating gaps."}</p>
              </div>
              
              {["technical", "hr", "shortlisted"].includes(data.application.stage) && (
                <Link 
                  href={`/dashboard/recruiter/offers?appId=${data.application._id}`} 
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow"
                >
                  Create Offer Contract <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
