"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  AlertCircle, 
  CheckSquare, 
  TrendingUp, 
  Activity, 
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Sparkles
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [intelligenceStats, setIntelligenceStats] = useState<any>({});
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [appPerJobData, setAppPerJobData] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/recruiter/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
          setIntelligenceStats(data.intelligenceStats || {});
          setAiInsights(data.aiInsights || []);
          setFunnelData(data.funnelData || []);
          setAppPerJobData(data.appPerJobData || []);
          setUpcomingInterviews(data.upcomingInterviews || []);
          setPendingFeedback(data.pendingFeedback || []);
          setRecentActivities(data.recentActivities || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff", "#f1f5f9"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Recruitment Control Panel</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time indicators across your company job postings and active candidates.</p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Post New Job
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
        {/* Total Jobs */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Jobs</div>
          <div className="text-2xl font-black text-slate-850 dark:text-white mt-1">{stats.totalJobs}</div>
        </div>
        
        {/* Active Candidates */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Active Pipeline</div>
          <div className="text-2xl font-black text-slate-850 dark:text-white mt-1">{stats.activeCandidatesCount}</div>
        </div>

        {/* Interviews Today */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Interviews Today</div>
          <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-1">{stats.todayInterviewsCount}</div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Awaiting Feedback</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-500 mt-1">{stats.pendingReviewsCount}</div>
        </div>

        {/* Offer Acceptance Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Offer Accept %</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-555 mt-1">{stats.offerAcceptanceRate}%</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Conversion %</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.conversionRate}%</div>
        </div>
      </div>

      {/* Hiring Intelligence Overview Section */}
      <div className="bg-slate-50 dark:bg-slate-950/20 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Activity className="h-4.5 w-4.5 text-indigo-650" /> Hiring Intelligence Overview
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm text-center">
            <div className="text-[9px] font-extrabold text-slate-450 uppercase">Needs Review</div>
            <div className="text-xl font-black text-slate-800 dark:text-white mt-1">{intelligenceStats.needsReviewCount || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm text-center">
            <div className="text-[9px] font-extrabold text-slate-450 uppercase">Highest Fit (≥80%)</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-500 mt-1">{intelligenceStats.highestFitCount || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm text-center">
            <div className="text-[9px] font-extrabold text-slate-450 uppercase">Significant Gaps</div>
            <div className="text-xl font-black text-rose-500 mt-1">{intelligenceStats.significantGapsCount || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm text-center">
            <div className="text-[9px] font-extrabold text-slate-450 uppercase">Pending Feedback</div>
            <div className="text-xl font-black text-amber-500 mt-1">{intelligenceStats.interviewsPendingFeedback || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm text-center">
            <div className="text-[9px] font-extrabold text-slate-450 uppercase">Awaiting Offers</div>
            <div className="text-xl font-black text-indigo-650 mt-1">{intelligenceStats.pendingOffersCount || 0}</div>
          </div>
        </div>

        {aiInsights.length > 0 && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 rounded-xl space-y-2">
            <div className="text-xs font-bold text-indigo-755 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5" /> AI Hiring Insights
            </div>
            <ul className="text-xs space-y-1 pl-4 list-disc text-slate-650 dark:text-slate-400 font-medium">
              {aiInsights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Funnel Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" /> Candidate Pipeline Funnel
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications per Job Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
            <Briefcase className="h-4.5 w-4.5 text-indigo-600" /> Applicants Per Position
          </h2>
          <div className="h-64">
            {appPerJobData.length === 0 ? (
              <div className="flex justify-center items-center h-full text-xs text-slate-500">No applications data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appPerJobData} margin={{ top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="title" stroke="#94a3b8" fontSize={9} interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tables & Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Upcoming Interviews */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Calendar className="h-4.5 w-4.5 text-indigo-650" /> Upcoming Interviews
          </h3>
          {upcomingInterviews.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No upcoming interviews.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((int) => (
                <div key={int._id} className="p-3 bg-slate-50 dark:bg-slate-950/10 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{int.candidateId?.name}</span>
                    <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 px-1.5 py-0.5 rounded capitalize">{int.type}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Interviewer: {int.interviewerId?.name}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">{new Date(int.dateTime).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Pending Reviews */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertCircle className="h-4.5 w-4.5 text-amber-500" /> Pending Interview Feedback
          </h3>
          {pendingFeedback.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No feedback sheets pending.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFeedback.map((int) => (
                <div key={int._id} className="p-3 bg-slate-50 dark:bg-slate-950/10 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-850 dark:text-slate-100">{int.candidateId?.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1">Assigned: {int.interviewerId?.name}</div>
                    <div className="text-[9px] text-slate-450 mt-0.5">Date: {new Date(int.dateTime).toLocaleDateString()}</div>
                  </div>
                  
                  {/* Shortcut login selector */}
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Activity className="h-4.5 w-4.5 text-indigo-650" /> System Activities
          </h3>
          {recentActivities.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No recent audit logs recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act._id} className="text-xs leading-normal border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-450">
                    <span className="font-bold text-slate-700 dark:text-slate-350">{act.actorId?.name} ({act.actorId?.role})</span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-medium text-[11px] mt-0.5">{act.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
