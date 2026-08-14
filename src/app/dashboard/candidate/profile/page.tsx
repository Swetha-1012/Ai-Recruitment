"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  User, 
  Briefcase, 
  GraduationCap, 
  Save, 
  Plus, 
  Trash, 
  Loader2,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function CandidateProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  
  // Skills, Education, Experience Arrays
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);

  // File Upload State
  const [file, setFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setName(data.user?.name || "");
        if (data.profile) {
          setPhone(data.profile.phone || "");
          setLocation(data.profile.location || "");
          setPortfolio(data.profile.portfolio || "");
          setGithub(data.profile.github || "");
          setLinkedin(data.profile.linkedin || "");
          setCoverLetter(data.profile.coverLetter || "");
          setSkills(data.profile.skills || []);
          setEducation(data.profile.education || []);
          
          // Re-format experience dates
          const formattedExp = (data.profile.experience || []).map((exp: any) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate).toISOString().substring(0, 7) : "",
            endDate: exp.endDate ? new Date(exp.endDate).toISOString().substring(0, 7) : "",
          }));
          setExperience(formattedExp);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/candidates/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          location,
          education,
          experience: experience.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
          skills,
          portfolio,
          github,
          linkedin,
          coverLetter,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (presetName?: string) => {
    if (!file && !presetName) {
      alert("Please select a file to upload or pick a preset resume template.");
      return;
    }

    setParsing(true);
    try {
      const formData = new FormData();
      if (presetName) {
        formData.append("preset", presetName);
      } else if (file) {
        formData.append("resume", file);
      }

      const res = await fetch("/api/candidates/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process upload");
      }

      alert("Resume parsed and synced successfully! Check updated fields.");
      setFile(null);
      fetchProfile();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setParsing(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", fieldOfStudy: "", startYear: 2021, endYear: 2025 }]);
  };
  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index: number, field: string, val: any) => {
    const updated = [...education];
    updated[index][field] = val;
    setEducation(updated);
  };

  // Experience Helpers
  const addExperience = () => {
    setExperience([...experience, { company: "", role: "", startDate: "", endDate: "", description: "" }]);
  };
  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: string, val: any) => {
    const updated = [...experience];
    updated[index][field] = val;
    setExperience(updated);
  };

  // Skills Helpers
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkill = (tag: string) => {
    setSkills(skills.filter(s => s !== tag));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Resume Sync Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5" /> AI Resume Synchronizer
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Upload your PDF or DOCX resume. Our dual-mode parser extracts contact information, degree fields, work experience, and core programming skills.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-slate-150 dark:border-slate-800 p-5 rounded-xl bg-slate-50/40 dark:bg-slate-950/10">
          {/* File Input */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="resume-file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="resume-file"
                className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-slate-350 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4" /> {file ? file.name : "Select File (PDF/DOCX max 10MB)"}
              </label>
              
              <button
                onClick={() => handleResumeUpload()}
                disabled={parsing}
                className="px-4 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold hover:bg-indigo-550 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Upload & Parse"}
              </button>
            </div>
            {file && <span className="text-[10px] font-semibold text-slate-450 block">File loaded: {file.name} (Size: {(file.size/1024/1024).toFixed(2)} MB)</span>}
          </div>

          {/* Preset Buttons */}
          <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-600" /> Presets for Hackathon Demo:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => handleResumeUpload("arun_react")}
                disabled={parsing}
                className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-1 disabled:opacity-50"
              >
                Preset: Arun (React Developer)
              </button>
              <button
                onClick={() => handleResumeUpload("sneha_backend")}
                disabled={parsing}
                className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-bold rounded shadow-sm flex items-center gap-1 disabled:opacity-50"
              >
                Preset: Sneha (Node/Cloud Developer)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Profile Details Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Contact & Links */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-650" /> Personal Details & Social Links
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-550 focus:outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-550 focus:outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Chennai, TN"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-550 focus:outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-slate-400" /> Portfolio Website
              </label>
              <input
                type="url"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://arunkumar.dev"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-550 focus:outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Github className="h-4 w-4 text-slate-400" /> GitHub URL
              </label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/arun"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-550 focus:outline-none text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Linkedin className="h-4 w-4 text-slate-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/arun"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-550 focus:outline-none text-sm transition-all"
              />
            </div>
          </div>
        </section>

        {/* Core Programming Skills */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Core Technology Skills</h2>
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. React, Docker, Mongoose)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="max-w-md p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-550"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-450 italic">No skills listed yet. Add skills or parse a resume.</span>
              ) : (
                skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 rounded-full text-xs font-bold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-indigo-400 hover:text-indigo-700 text-xs focus:outline-none font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Education Repeater */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-650" /> Academic Background
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded text-xs font-bold transition-colors flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
            >
              <Plus className="h-4 w-4" /> Add Degree
            </button>
          </div>

          <div className="space-y-5">
            {education.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-450 rounded-xl">
                No education history added yet.
              </div>
            ) : (
              education.map((edu, idx) => (
                <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => removeEducation(idx)}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">School / University</label>
                    <input
                      type="text"
                      required
                      value={edu.school}
                      onChange={(e) => updateEducation(idx, "school", e.target.value)}
                      placeholder="Karpagam Academy of Tech"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Degree</label>
                    <input
                      type="text"
                      required
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="B.E."
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Field of Study</label>
                    <input
                      type="text"
                      required
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateEducation(idx, "fieldOfStudy", e.target.value)}
                      placeholder="Computer Science"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Year</label>
                      <input
                        type="number"
                        required
                        value={edu.startYear}
                        onChange={(e) => updateEducation(idx, "startYear", parseInt(e.target.value))}
                        className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Year</label>
                      <input
                        type="number"
                        required
                        value={edu.endYear}
                        onChange={(e) => updateEducation(idx, "endYear", parseInt(e.target.value))}
                        className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Experience Repeater */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-650" /> Professional Experience
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded text-xs font-bold transition-colors flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
            >
              <Plus className="h-4 w-4" /> Add Experience
            </button>
          </div>

          <div className="space-y-6">
            {experience.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-450 rounded-xl">
                No experience listed yet.
              </div>
            ) : (
              experience.map((exp, idx) => (
                <div key={idx} className="p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl space-y-4 relative animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => removeExperience(idx)}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company / Organization</label>
                      <input
                        type="text"
                        required
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                        placeholder="Innovate Inc"
                        className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Role</label>
                      <input
                        type="text"
                        required
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, "role", e.target.value)}
                        placeholder="Software Intern"
                        className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date (YYYY-MM)</label>
                      <input
                        type="month"
                        required
                        value={exp.startDate}
                        onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                        className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date (YYYY-MM)</label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                        className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Key Responsibilities / Achievements</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, "description", e.target.value)}
                      placeholder="Developed React UI widgets..."
                      rows={3}
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Cover Letter */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Default Cover Letter</h2>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce yourself to the hiring team..."
            rows={5}
            className="w-full p-3 border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-550 resize-none"
          />
        </section>

        {/* Submit Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Candidate Profile</>}
          </button>
        </div>

      </form>
    </div>
  );
}
