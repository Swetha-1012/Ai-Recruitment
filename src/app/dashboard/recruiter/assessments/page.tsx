"use client";

import { useState, useEffect } from "react";
import { Code2, Clock, Trash, Plus, X, Loader2 } from "lucide-react";

export default function ManageAssessments() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [questions, setQuestions] = useState<any[]>([
    { type: "mcq", questionText: "", options: ["", "", ""], correctAnswer: "", starterCode: "" }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssessments = async () => {
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

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { type: "mcq", questionText: "", options: ["", "", ""], correctAnswer: "", starterCode: "" }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    updated[idx][field] = value;
    setQuestions(updated);
  };

  const handleMcqOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const handleAddMcqOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push("");
    setQuestions(updated);
  };

  const handleRemoveMcqOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_: any, idx: number) => idx !== optIdx);
    setQuestions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          durationMinutes: parseInt(durationMinutes),
          questions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create assessment");
      }

      alert("Assessment created successfully!");
      setShowDrawer(false);
      fetchAssessments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Coding Assessments Board</h1>
          <p className="text-xs text-slate-500 mt-1">Configure evaluation tests, code playgrounds, and custom SQL compilation scenarios.</p>
        </div>
        <button
          onClick={() => {
            setTitle("");
            setDescription("");
            setDurationMinutes("15");
            setQuestions([{ type: "mcq", questionText: "", options: ["", "", ""], correctAnswer: "", starterCode: "" }]);
            setShowDrawer(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Create Test Quiz
        </button>
      </div>

      {assessments.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
          No coding assessments created. Click the button above to build your first test.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((ass) => (
            <div key={ass._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-655 dark:text-indigo-400 rounded uppercase">
                  Technical Test
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-3">{ass.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{ass.description || "General coding evaluation challenge."}</p>
                
                <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-450 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="flex items-center gap-1"><Code2 className="h-3.5 w-3.5 text-indigo-550" /> {ass.questions.length} Questions</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-rose-500" /> {ass.durationMinutes} Mins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assessment Creator Slide Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          
          <aside className="relative w-[38rem] max-w-full bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto z-50 animate-in slide-in-from-right duration-250 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-150 dark:border-slate-800 pb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Assessment Test</h2>
                <button onClick={() => setShowDrawer(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6 text-xs">
                
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-500 uppercase mb-1">Assessment Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Node.js & Backend SQL Challenge"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 uppercase mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      placeholder="15"
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block font-bold text-slate-500 uppercase mb-1">Instructions Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Test covers API architecture, REST routes, SQL tables."
                      rows={2}
                      className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs resize-none"
                    />
                  </div>
                </div>

                {/* Questions list repeater */}
                <div className="space-y-6 pt-2 border-t border-slate-150 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Challenge Questions</h3>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-650 rounded font-bold"
                    >
                      + Add Question
                    </button>
                  </div>

                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 rounded-xl space-y-4 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-700"
                        title="Remove Question"
                      >
                        <Trash className="h-4 w-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-slate-500 uppercase mb-1">Question Type</label>
                          <select
                            value={q.type}
                            onChange={(e) => handleQuestionChange(qIdx, "type", e.target.value)}
                            className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950"
                          >
                            <option value="mcq">Multiple Choice (MCQ)</option>
                            <option value="sql">SQL Query challenge</option>
                            <option value="code">Algorithm Coding</option>
                            <option value="debug">Debugging Bug-Fix</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-500 uppercase mb-1">Question Prompt Text</label>
                        <textarea
                          required
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                          placeholder="Write the question prompt here..."
                          rows={3}
                          className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Options block for MCQ */}
                      {q.type === "mcq" && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="block font-bold text-slate-500 uppercase">Answer Options</label>
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleMcqOptionChange(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                                className="flex-1 p-2 border border-slate-300 dark:border-slate-800 rounded bg-white dark:bg-slate-950 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveMcqOption(qIdx, optIdx)}
                                className="text-rose-500 font-bold hover:underline text-[10px]"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddMcqOption(qIdx)}
                            className="text-indigo-650 hover:underline text-[10px] font-bold"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}

                      {/* Correct answer check */}
                      <div>
                        <label className="block font-bold text-slate-500 uppercase mb-1">
                          {q.type === "mcq" ? "Correct Option Value" : "Expected Correct Content / Key Output"}
                        </label>
                        <input
                          type="text"
                          required
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(qIdx, "correctAnswer", e.target.value)}
                          placeholder={q.type === "mcq" ? "Must exactly match one option" : "e.g. SELECT * FROM users;"}
                          className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-955 text-xs"
                        />
                      </div>

                      {/* Starter code for coding problem */}
                      {["code", "sql", "debug"].includes(q.type) && (
                        <div>
                          <label className="block font-bold text-slate-500 uppercase mb-1">Starter Boilerplate Code</label>
                          <textarea
                            value={q.starterCode}
                            onChange={(e) => handleQuestionChange(qIdx, "starterCode", e.target.value)}
                            placeholder="function solution() {\n  // Write code\n}"
                            rows={4}
                            className="w-full p-2 border border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950 font-mono text-xs resize-none"
                          />
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Assessment Test"}
                </button>

              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
