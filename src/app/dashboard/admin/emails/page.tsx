"use client";

import { useState, useEffect } from "react";
import { Mail, Clock, Loader2, ArrowLeft, Eye, X } from "lucide-react";
import Link from "next/link";

export default function EmailLogsViewer() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const fetchEmails = async () => {
    try {
      const res = await fetch("/api/emails");
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
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
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Sent Email Log Index</h1>
        <p className="text-xs text-slate-500 mt-1">Review all automated email notifications triggered by stage transitions, schedulers, and resets.</p>
      </div>

      {emails.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-450 italic">
          No email notifications recorded in this session. Move candidates across stages to trigger automated dispatches.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-700 dark:text-slate-300">
            Simulated Emails dispatches (showing up to 100 entries)
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {emails.map((email) => (
              <div key={email._id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-850 dark:text-slate-100">To: {email.recipient}</span>
                  </div>
                  <p className="text-indigo-650 dark:text-indigo-400 font-bold text-[12px]">{email.subject}</p>
                  <p className="text-slate-500 line-clamp-1 text-[10.5px] font-medium">{email.body.substring(0, 100)}...</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-slate-450 flex items-center gap-1 font-semibold shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(email.sentAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => setSelectedEmail(email)}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-655 flex items-center gap-1 font-bold text-[10px]"
                  >
                    <Eye className="h-4 w-4 text-indigo-650" /> View Body
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Email Content Dialog */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedEmail(null)}></div>
          
          <div className="relative bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg z-50 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Simulated Email View</span>
                <h2 className="text-sm font-bold text-indigo-750">{selectedEmail.subject}</h2>
              </div>
              <button onClick={() => setSelectedEmail(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-normal">
              <div>
                <span className="font-bold text-slate-500">Recipient: </span>
                <span className="font-bold text-slate-800">{selectedEmail.recipient}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Sent Date: </span>
                <span className="font-semibold">{new Date(selectedEmail.sentAt).toLocaleString()}</span>
              </div>
              
              <div className="border border-slate-150 bg-slate-50/50 p-4 rounded-xl font-mono text-[11px] whitespace-pre-line text-slate-700 max-h-80 overflow-y-auto leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
