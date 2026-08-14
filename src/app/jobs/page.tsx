"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  ChevronRight, 
  Loader2,
  DollarSign,
  ArrowLeft
} from "lucide-react";

export default function JobSearchDirectory() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      if (workMode) params.append("workMode", workMode);
      if (employmentType) params.append("employmentType", employmentType);
      if (experience) params.append("experience", experience);
      if (skills) params.append("skills", skills);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
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

  const handleReset = () => {
    setSearch("");
    setLocation("");
    setWorkMode("");
    setEmploymentType("");
    setExperience("");
    setSkills("");
    setTimeout(fetchJobs, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link href="/dashboard/candidate" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Candidate Panel
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Active Software Jobs</h1>
          <p className="text-xs text-slate-500 mt-1">Explore job posts and matching skills parsed automatically by AI.</p>
        </div>
      </div>

      {/* Filters Form Card */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Filter className="h-4.5 w-4.5 text-indigo-650" /> Search & Filter Directory
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Title, dept, etc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Remote, Chennai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Skills REQUIRED (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, Docker"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Experience (years)</label>
            <input
              type="number"
              placeholder="e.g. 3"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 items-end">
            <button
              onClick={fetchJobs}
              className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded text-xs font-bold transition-colors shadow"
            >
              Search Jobs
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Jobs Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500">
          No job listings found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{job.title}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{job.companyId?.name || "HireNova Tech"}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded uppercase">
                    {job.workMode}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.employmentType}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salaryMin ? `INR ${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}` : "Not listed"}</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-655 dark:text-slate-400">Exp: {job.experienceRequired} yrs+</span>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.map((skill: string) => (
                      <span key={skill} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-end">
                <Link
                  href={`/jobs/${job._id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow shadow-indigo-600/5 flex items-center gap-1 group"
                >
                  View Details & Apply <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
