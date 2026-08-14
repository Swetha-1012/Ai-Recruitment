"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Code2, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Loader2 
} from "lucide-react";

export default function CandidateAssessments() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAttempt, setActiveAttempt] = useState<any>(null);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  
  // Test Taking States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOption?: string; codeSubmitted?: string }>>({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [tabSwitches, setTabSwitches] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  async function submitAnswers() {
    if (!activeAssessment || !activeAttempt) return;
    setSubmitting(true);

    try {
      const payloadAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        selectedOption: ans.selectedOption,
        codeSubmitted: ans.codeSubmitted,
      }));

      const res = await fetch(`/api/assessments/${activeAssessment._id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          answers: payloadAnswers,
          tabSwitches,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSubmittedScore(data.score);
      // Clean up test states
      setActiveAssessment(null);
      setActiveAttempt(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function autoSubmitTest() {
    alert("Time limit reached! Submitting your answers automatically.");
    submitAnswers();
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Listen to Window Blur / Visibility Change for Anti-Cheating
  useEffect(() => {
    if (!activeAssessment) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          setWarningMessage(`WARNING: Tab switch detected! (Count: ${next}). Any attempt to search solutions will be flagged to recruiters.`);
          setTimeout(() => setWarningMessage(""), 6000);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitches((prev) => {
        const next = prev + 1;
        setWarningMessage(`WARNING: Focus lost! (Count: ${next}). Keep your focus on the assessment panel.`);
        setTimeout(() => setWarningMessage(""), 6000);
        return next;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [activeAssessment]);

  // Countdown timer logic
  useEffect(() => {
    if (activeAssessment && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            autoSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAssessment, timeLeft]);

  const handleStartTest = async (assessmentId: string) => {
    try {
      // Find candidate's application to link the assessment
      const appRes = await fetch("/api/applications");
      const appData = await appRes.json();
      const firstApp = appData.applications?.[0];

      if (!firstApp) {
        alert("You must apply for a job position before attempting assessments!");
        return;
      }

      // Fetch masked assessment details
      const assRes = await fetch(`/api/assessments/${assessmentId}`);
      const assData = await assRes.json();

      if (!assRes.ok) throw new Error(assData.error);

      // Initialize attempt on API
      const attemptRes = await fetch(`/api/assessments/${assessmentId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          applicationId: firstApp._id,
        }),
      });

      const attemptData = await attemptRes.json();
      if (!attemptRes.ok) throw new Error(attemptData.error);

      // Setup editor starter codes
      const initialAnswers: any = {};
      assData.assessment.questions.forEach((q: any) => {
        initialAnswers[q._id] = {
          selectedOption: "",
          codeSubmitted: q.starterCode || "",
        };
      });

      setAnswers(initialAnswers);
      setActiveAssessment(assData.assessment);
      setActiveAttempt(attemptData.attempt);
      setTimeLeft(assData.assessment.durationMinutes * 60);
      setCurrentQuestionIndex(0);
      setTabSwitches(0);
      setSubmittedScore(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAnswerChange = (qId: string, field: string, val: string) => {
    setAnswers({
      ...answers,
      [qId]: {
        ...answers[qId],
        [field]: val,
      },
    });
  };

  const handleSubmitTest = async () => {
    if (!confirm("Are you sure you want to finish and submit the assessment now?")) return;
    submitAnswers();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  // Submitted Screen
  if (submittedScore !== null) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white">Assessment Submitted!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your answers were graded automatically on our compilation runtime.
        </p>

        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="text-xs text-slate-450 uppercase font-semibold">Your Score</div>
          <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{submittedScore}%</div>
          <div className="text-[10px] text-slate-400 mt-2">
            Status: {submittedScore >= 60 ? "Qualified (Pass)" : "Awaiting Review"} | Warnings: {tabSwitches}
          </div>
        </div>

        <button
          onClick={() => {
            setSubmittedScore(null);
            fetchData();
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow"
        >
          Return to Assessments List
        </button>
      </div>
    );
  }

  // Active Test-Taking Panel
  if (activeAssessment) {
    const q = activeAssessment.questions[currentQuestionIndex];
    return (
      <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col animate-in fade-in duration-200">
        
        {/* Test Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-650" />
            <span className="font-bold text-slate-850 dark:text-white text-sm md:text-base">{activeAssessment.title}</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Countdown Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-lg text-xs font-bold">
              <Clock className="h-4 w-4 text-rose-500" />
              <span>Time Left: {formatTime(timeLeft)}</span>
            </div>

            {/* Anti-cheat flag indicator */}
            {tabSwitches > 0 && (
              <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Warnings: {tabSwitches}</span>
              </div>
            )}

            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit Test"}
            </button>
          </div>
        </header>

        {/* Warnings alert banner */}
        {warningMessage && (
          <div className="bg-amber-500 text-white text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-2 animate-bounce">
            <AlertTriangle className="h-4 w-4" /> {warningMessage}
          </div>
        )}

        {/* Test Content Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel questions list */}
          <aside className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 p-4 space-y-2 hidden md:block">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Questions list</span>
            {activeAssessment.questions.map((item: any, idx: number) => (
              <button
                key={item._id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all ${
                  idx === currentQuestionIndex 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                Question {idx + 1} ({item.type.toUpperCase()})
              </button>
            ))}
          </aside>

          {/* Core Playground Pane */}
          <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded uppercase">
                  Question {currentQuestionIndex + 1} &bull; {q.type}
                </span>

                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                  {q.questionText}
                </h2>

                {/* MCQ Question UI */}
                {q.type === "mcq" && (
                  <div className="grid grid-cols-1 gap-3 max-w-xl">
                    {q.options.map((option: string) => {
                      const isSelected = answers[q._id]?.selectedOption === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswerChange(q._id, "selectedOption", option)}
                          className={`w-full text-left p-3 border rounded-xl text-xs font-semibold transition-all ${
                            isSelected 
                              ? "border-indigo-600 bg-indigo-50/20 text-indigo-650" 
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Coding/Debugging/SQL Question UI */}
                {["code", "sql", "debug"].includes(q.type) && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-t-lg border-x border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500">Source Editor (JavaScript/SQL)</span>
                      <span className="text-[10px] font-semibold text-slate-450 italic">Compilation sandbox active</span>
                    </div>
                    <textarea
                      value={answers[q._id]?.codeSubmitted || ""}
                      onChange={(e) => handleAnswerChange(q._id, "codeSubmitted", e.target.value)}
                      rows={14}
                      className="w-full p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-b-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6 mt-8">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="text-xs text-slate-500">
                  Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                </div>

                {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-850"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold transition-all shadow"
                  >
                    Finish Test
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Assessments List Screen
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Coding Assessments Board</h1>
      <p className="text-xs text-slate-500 leading-normal max-w-xl">
        Complete your assigned assessments. You will have a ticking countdown timer. Closing or switching browser tabs triggers security logs which are shared directly with recruitment managers.
      </p>

      {assessments.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
          No coding assessments currently available for your profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((ass) => (
            <div key={ass._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded uppercase">
                  Technical Test
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-3">{ass.title}</h2>
                <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {ass.description || "Evaluate candidate tech qualifications across programming syntax, algorithms, and logic."}
                </p>

                <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
                  <span>Questions: {ass.questions.length}</span>
                  <span>Duration: {ass.durationMinutes} mins</span>
                </div>
              </div>

              <button
                onClick={() => handleStartTest(ass._id)}
                className="mt-6 w-full py-2 text-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Launch Assessment Playground
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
