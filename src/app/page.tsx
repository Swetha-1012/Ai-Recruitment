"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  BrainCircuit, 
  Zap, 
  Calendar, 
  Code2, 
  FileCheck, 
  Check, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ArrowRight, 
  ChevronDown,
  Star,
  Users,
  Trophy,
  Activity
} from "lucide-react";

export default function LandingPage() {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Initialize theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("dark");
      localStorage.theme = "dark";
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      localStorage.theme = "light";
      setTheme("light");
    }
  };

  const faqs = [
    {
      q: "How does the AI Resume Parsing work?",
      a: "Our system uses advanced entity recognition models to read PDF/DOCX resumes, extract key information (skills, work history, education), and populate candidate profiles in seconds."
    },
    {
      q: "Can candidates take coding assessments directly on the platform?",
      a: "Yes! Recruiters can build custom assessments including MCQs, coding challenges, SQL queries, and debugging tasks. Candidates can take them in our integrated editor with tab-switch fraud detection."
    },
    {
      q: "How does the AI matching score help recruiters?",
      a: "It compares the candidate's verified skills and experience with the job description to calculate an overall percentage match. It lists strong matches, missing skills, and provides objective hiring suggestions."
    },
    {
      q: "Is there a limit on file size for resume uploads?",
      a: "Candidates can upload standard PDF and DOCX files up to 10 MB. Files are scanned, hashed, and stored securely with duplication prevention."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300 bg-clip-text text-transparent">
              HireNova
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/10"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Btn */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 font-medium">Features</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 font-medium">How it works</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 font-medium">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-600 dark:text-slate-300 font-medium">FAQ</a>
            <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>
            <div className="flex gap-4">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 text-slate-700 dark:text-slate-200 font-medium rounded-lg border border-slate-200 dark:border-slate-800">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-indigo-600 text-white font-medium rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 bg-slate-50 dark:bg-slate-950">
        {/* Floating tech background SVG grid */}
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-200 dark:text-indigo-900/60" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            <circle cx="50%" cy="30%" r="200" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-300/40 dark:text-indigo-855/20" />
            <circle cx="50%" cy="30%" r="400" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-300/20 dark:text-indigo-855/10" strokeDasharray="5 5" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/60 rounded-full mb-6 border border-indigo-200/50 dark:border-indigo-800/50 animate-pulse">
            <Zap className="h-3 w-3" /> HireNova Talent Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-none">
            AI-Powered Talent Intelligence for{" "}
            <span className="bg-gradient-to-r from-indigo-650 via-purple-600 to-emerald-500 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-450 bg-clip-text text-transparent">
              Smarter Hiring.
            </span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-350 max-w-3xl mx-auto font-medium leading-relaxed">
            From resume to hiring decision — one intelligent candidate profile. Track evidence, missing skills, coding scores, and feedback in a unified 360° Hiring Intelligence view.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link 
              href="/register" 
              className="px-6 py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 group transition-all"
            >
              Sign Up Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="px-6 py-3.5 font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all"
            >
              Explore Features
            </a>
          </div>

          {/* Differentiation Statement Box */}
          <div className="mt-12 max-w-4xl mx-auto p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-indigo-150/70 dark:border-indigo-900/40 text-left shadow-xl hover:border-indigo-300 dark:hover:border-indigo-850 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="p-3 bg-indigo-600 rounded-xl text-white shrink-0 shadow-md">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                  How We Differ
                </span>
                <p className="text-slate-850 dark:text-white font-bold text-sm">
                  Traditional ATS platforms primarily track candidates through the recruitment pipeline.
                </p>
                <p className="leading-relaxed">
                  HireNova adds a <strong className="text-indigo-650 dark:text-indigo-400 font-bold">Candidate 360° Hiring Intelligence layer</strong> that connects resume evidence, job requirements, skill gaps, coding performance, interview feedback, and hiring history into one explainable decision-support profile.
                </p>
              </div>
            </div>
          </div>

          {/* Core Metrics Banner */}
          <div className="mt-16 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">98%</div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-450 mt-1">AI Parse Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">4.5x</div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-450 mt-1">Faster Hiring Loop</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">89%</div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-450 mt-1">Average Match Fit</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-450 mt-1">Safe and Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-950/20 border-y border-slate-200/30 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              SaaS Engine Packed with Modern AI
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Go from job creation to offer signature in days, not weeks. Streamline candidate evaluation with automated tools built for modern teams.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Resume Parsing & Profiling</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Upload resumes in PDF or DOCX format. Our matching models parse entity information to fill candidate profiles instantly, leaving no manual inputs behind.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Resume Matching Score</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Evaluate match percentage automatically. Extract strong matching skills, pinpoint missing requirements, and read clear development recommendations in your browser.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Kanban Application Pipeline</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Move applicants across workflow stages: Applied, Screening, Shortlisted, Technical, HR, and Offer. Visualize recruiting speeds and keep logs synced.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Interview Scheduler</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Select candidates, assign interviewers, configure times, and generate online meeting links. Keep candidate dashboards updated with real-time feedback forms.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Coding Assessment Engine</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Evaluate candidates directly. Support MCQs, SQL queries, debugging challenges, and custom timer playgrounds. Tab switch security alerts help ensure integrity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Offer Letter Generator</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Create structured offer letters using system templates. Review, generate PDFs, and allow candidates to accept or reject offers in their portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            The Complete Recruitment Workflow
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            A single narrative linking recruiters, hiring managers, interviewers, and candidates.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="flex-1 text-right hidden md:block">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Step 1</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">Recruiter Creates Job</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Define roles, locations, work modes, and required tech skills like React, Node.js, and MongoDB.
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold relative z-10">
                1
              </div>
              <div className="flex-1 md:hidden">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Step 1</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">Recruiter Creates Job</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Define roles, locations, work modes, and required tech skills like React, Node.js, and MongoDB.
                </p>
              </div>
              <div className="flex-1 hidden md:block"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="flex-1 hidden md:block"></div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold relative z-10">
                2
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Step 2</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">Candidate Applies & Uploads Resume</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  The AI parsing engine extracts candidate education, skills, and work history automatically into profiles.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="flex-1 text-right hidden md:block">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Step 3</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">AI Match Scoring & Kanban screening</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Recruiters view detailed match reports. Shortlist candidates using a drag-and-drop Kanban workflow interface.
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold relative z-10">
                3
              </div>
              <div className="flex-1 md:hidden">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Step 3</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">AI Match Scoring & Kanban screening</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Recruiters view detailed match reports. Shortlist candidates using a drag-and-drop Kanban workflow interface.
                </p>
              </div>
              <div className="flex-1 hidden md:block"></div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center gap-8 relative">
              <div className="flex-1 hidden md:block"></div>
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold relative z-10">
                4
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Step 4</span>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">Evaluation & Offer Management</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Complete technical coding tests and interviewer feedback loops. Generate professional offers for candidate acceptance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-100/50 dark:bg-slate-950/20 border-y border-slate-200/30 dark:border-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Start parsing resumes and scheduling interviews for free. Scale your hiring capabilities as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Perfect for startups and simple recruiters.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="mt-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Up to 3 Active Jobs</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>50 AI Resume Parsers / mo</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Basic Kanban Board</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>In-app Notifications</span>
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 w-full py-3 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold rounded-lg text-slate-800 dark:text-slate-200 transition-colors block">
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border-2 border-indigo-600 shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">
                POPULAR
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Professional</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Complete suite for fast-growing companies.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$79</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="mt-8 space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Unlimited Active Jobs & Users</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Unlimited AI Parsers & Match Scoring</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Custom Coding Assessment Playground</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Automatic Offer PDF Generator</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Email Triggering & Real-time Webhooks</span>
                  </li>
                </ul>
              </div>
              <Link href="/register" className="mt-8 w-full py-3 text-center bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg text-white shadow-md shadow-indigo-600/10 transition-colors block">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${activeFaq === i ? "rotate-180" : ""}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-4 pt-1 text-slate-500 dark:text-slate-450 border-t border-slate-100 dark:border-slate-800 text-sm leading-relaxed animate-in slide-in-from-top-1 duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded text-white">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-850 dark:text-white">HireNova</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; 2026 HireNova. Built for Hackathon Excellence. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400 dark:text-slate-500">
            <a href="#" className="hover:text-slate-650 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-650 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-650 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
