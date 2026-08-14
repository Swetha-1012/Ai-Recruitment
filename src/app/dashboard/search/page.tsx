"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Briefcase, 
  Users, 
  Building, 
  Calendar, 
  MapPin, 
  Mail, 
  Loader2, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({
    jobs: [],
    candidates: [],
    recruiters: [],
    companies: [],
    interviews: []
  });
  const [searchInput, setSearchInput] = useState(query);

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchInput(query);
    if (query) {
      executeSearch(query);
    }
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.history.pushState(null, "", `/dashboard/search?query=${encodeURIComponent(searchInput)}`);
      executeSearch(searchInput);
    }
  };

  const hasResults = 
    results.jobs.length > 0 || 
    results.candidates.length > 0 || 
    results.recruiters.length > 0 || 
    results.companies.length > 0 || 
    results.interviews.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Global Search Index</h1>
        <p className="text-xs text-slate-500 mt-1">Unified query index across candidate profiles, active jobs, and scheduled interviews.</p>
      </div>

      {/* Query input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            required
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search candidates, tech skills, jobs, companies..."
            className="pl-10 w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow transition-colors"
        >
          Search
        </button>
      </form>

      {/* Loading panel */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
        </div>
      ) : !query ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Enter keywords above to start searching.
        </div>
      ) : !hasResults ? (
        <div className="text-center py-12 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          No records found matching &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. Jobs Found */}
          {results.jobs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-indigo-650 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> Matched Job Listings ({results.jobs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.jobs.map((job: any) => (
                  <div key={job._id} className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                    <div className="font-bold text-slate-850 dark:text-slate-100">{job.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{job.companyId?.name} &bull; {job.department}</div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-[10px] flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <Link href={`/jobs/${job._id}`} className="text-indigo-600 font-bold hover:underline">View Post &rarr;</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Candidates Found */}
          {results.candidates.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-indigo-650 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Matched Candidates ({results.candidates.length})
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.candidates.map((c: any) => (
                  <div key={c.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{c.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({c.email})</span>
                    </div>
                    <Link href="/dashboard/recruiter/kanban" className="text-indigo-600 font-bold hover:underline">View in Pipeline &rarr;</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Companies Found */}
          {results.companies.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-indigo-650 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="h-4 w-4" /> Companies Found ({results.companies.length})
              </h2>
              <div className="space-y-3">
                {results.companies.map((comp: any) => (
                  <div key={comp._id} className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                    <div className="font-bold text-slate-850 dark:text-slate-100">{comp.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{comp.industry} &bull; {comp.website}</div>
                    <div className="text-[10px] text-slate-450 mt-1">Locations: {comp.locations?.join(", ")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Interviews Found */}
          {results.interviews.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-indigo-650 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Matched Interviews ({results.interviews.length})
              </h2>
              <div className="space-y-3">
                {results.interviews.map((int: any) => (
                  <div key={int._id} className="p-3 bg-slate-50 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-800 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{int.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Candidate: {int.candidateId?.name} | Interviewer: {int.interviewerId?.name}</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">Date: {new Date(int.dateTime).toLocaleString()}</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase">{int.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
