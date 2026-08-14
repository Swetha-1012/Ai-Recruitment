"use client";

import { useState, useEffect } from "react";
import { Activity, Clock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminAuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      <div className="flex items-center gap-2 justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <Link href="/dashboard/admin" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-750 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">Chronological feed of all actions logged across applicant matches, login tokens, and evaluations.</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-450 italic">
          No audit logs recorded in this session.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-700 dark:text-slate-300">
            Action Trail logs (showing up to 100 entries)
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <div key={log._id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-850 dark:text-slate-100">{log.actorId?.name || "System"}</span>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">({log.actorId?.role || "service"})</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 rounded uppercase">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-medium">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-450 flex items-center gap-1 font-semibold shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
