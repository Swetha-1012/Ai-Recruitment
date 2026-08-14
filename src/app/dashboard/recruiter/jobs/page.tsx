"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Trash2, 
  Edit3, 
  Copy, 
  Power, 
  X, 
  Loader2,
  Plus 
} from "lucide-react";

export default function ManageJobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editJobId, setEditJobId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("");
  const [skills, setSkills] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [workMode, setWorkMode] = useState("remote");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs?status=all");
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

  const openDrawerForNew = () => {
    setEditJobId(null);
    setTitle("");
    setDepartment("Engineering");
    setLocation("Remote");
    setSalaryMin("");
    setSalaryMax("");
    setExperienceRequired("2");
    setSkills("React, JavaScript, Node.js");
    setEmploymentType("full-time");
    setWorkMode("remote");
    setDeadline("");
    setDescription("");
    setShowDrawer(true);
  };

  const openDrawerForEdit = (job: any) => {
    setEditJobId(job._id);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setSalaryMin(job.salaryMin?.toString() || "");
    setSalaryMax(job.salaryMax?.toString() || "");
    setExperienceRequired(job.experienceRequired?.toString() || "");
    setSkills(job.skills?.join(", ") || "");
    setEmploymentType(job.employmentType);
    setWorkMode(job.workMode);
    setDeadline(job.deadline ? new Date(job.deadline).toISOString().substring(0, 10) : "");
    setDescription(job.description);
    setShowDrawer(true);
  };

  const handleDuplicate = (job: any) => {
    setEditJobId(null); // Create as new
    setTitle(`${job.title} (Copy)`);
    setDepartment(job.department);
    setLocation(job.location);
    setSalaryMin(job.salaryMin?.toString() || "");
    setSalaryMax(job.salaryMax?.toString() || "");
    setExperienceRequired(job.experienceRequired?.toString() || "");
    setSkills(job.skills?.join(", ") || "");
    setEmploymentType(job.employmentType);
    setWorkMode(job.workMode);
    setDeadline("");
    setDescription(job.description);
    setShowDrawer(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editJobId ? `/api/jobs/${editJobId}` : "/api/jobs";
      const method = editJobId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          location,
          salaryMin: salaryMin || undefined,
          salaryMax: salaryMax || undefined,
          experienceRequired: experienceRequired || undefined,
          skills,
          employmentType,
          workMode,
          deadline: deadline || undefined,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      alert("Job posting saved successfully!");
      setShowDrawer(false);
      fetchJobs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setJobs(jobs.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting permanently?")) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        setJobs(jobs.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      console.error(err);
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
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Active Job Listings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage positions, duplicate listings, and verify candidate apply links.</p>
        </div>
        <button
          onClick={openDrawerForNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Create Job Listing
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
          No job listings created. Click the button above to publish your first position.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold text-slate-650 dark:text-slate-350">
              <tr>
                <th className="p-4">Position Title</th>
                <th className="p-4">Department</th>
                <th className="p-4">Location</th>
                <th className="p-4">Work Mode</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{job.title}</td>
                  <td className="p-4">{job.department}</td>
                  <td className="p-4">{job.location}</td>
                  <td className="p-4 capitalize">{job.workMode}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      job.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-150 text-slate-500"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                      title={job.status === "active" ? "Close Job Post" : "Open Job Post"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDrawerForEdit(job)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                      title="Edit Details"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(job)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                      title="Duplicate Listing"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded text-rose-600"
                      title="Delete Posting"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide Drawer for Job Form */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          
          <aside className="relative w-[34rem] max-w-full bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto z-50 animate-in slide-in-from-right duration-250 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-150 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {editJobId ? "Edit Job Posting" : "Publish Job Posting"}
                </h2>
                <button onClick={() => setShowDrawer(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-500 uppercase mb-1">Position Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Senior Fullstack Developer"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Engineering"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Remote / Chennai"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Work Mode</label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value)}
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Min Salary (INR)</label>
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="800000"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Max Salary (INR)</label>
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="1200000"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Min Exp (Yrs)</label>
                    <input
                      type="number"
                      value={experienceRequired}
                      onChange={(e) => setExperienceRequired(e.target.value)}
                      placeholder="2"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Required Skills (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, JavaScript, Node.js"
                    className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1">Role Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide responsibilities and requirement specifics..."
                    rows={6}
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Job Posting"}
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
