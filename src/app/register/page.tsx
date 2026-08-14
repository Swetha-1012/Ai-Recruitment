"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, User, Mail, Lock, Building, ArrowRight, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // OTP Verification States
  const [verificationStep, setVerificationStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName: ["recruiter", "manager", "interviewer"].includes(role) ? companyName : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === "candidate") {
        setRegisteredUserId(data.user.id);
        setSuccess("Account registered! A 6-digit verification OTP has been sent to your email.");
        setVerificationStep(true);
      } else {
        setSuccess("Account registered successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: registeredUserId,
          token: otp,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(35rem_35rem_at_center,theme(colors.indigo.100/30),transparent)] dark:bg-[radial-gradient(35rem_35rem_at_center,theme(colors.indigo.900/10),transparent)]"></div>

      <div className="max-w-md w-full space-y-8 backdrop-blur-md bg-white/80 dark:bg-slate-900/70 p-8 rounded-3xl border border-indigo-100/50 dark:border-indigo-950/50 shadow-2xl hover:border-indigo-500/20 transition-all duration-300">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300 bg-clip-text text-transparent">
              HireNova
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {verificationStep ? "Verify your email" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {verificationStep ? (
              "Please enter the 6-digit verification code."
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/30 border border-rose-250 dark:border-rose-900/50 rounded-lg text-rose-700 dark:text-rose-455 text-sm font-medium animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-450 text-sm font-medium animate-in fade-in duration-200">
            {success}
          </div>
        )}

        {verificationStep ? (
          /* OTP VERIFICATION VIEW */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/50 rounded-xl text-xs leading-relaxed text-indigo-755 dark:text-indigo-300">
              <span className="font-bold flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-indigo-650" /> Local Hackathon Verification Notice</span>
              The 6-digit OTP verification code is saved to your account. You can inspect the email body inside the **Email Logs** tab on the Admin panel or console shell logs!
            </div>

            <div>
              <label htmlFor="otp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Verification OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder=""
                className="w-full p-3 text-center tracking-widest font-mono text-xl rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code & Register"}
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationStep(false);
                setError("");
                setSuccess("");
                setOtp("");
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block text-center mx-auto"
            >
              Go Back to Form
            </button>
          </form>
        ) : (
          /* STANDARD REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="pl-10 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                Email Address
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="pl-10 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="pl-10 pr-10 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                Account Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
              >
                <option value="candidate">Candidate (Apply & Take assessments)</option>
                <option value="recruiter">Recruiter (Post jobs & Manage candidate pipeline)</option>
                <option value="manager">Hiring Manager (Review shortlisted & analytics)</option>
                <option value="interviewer">Interviewer (Log feedback on candidate)</option>
                <option value="admin">Platform Admin (Manage settings & logs)</option>
              </select>
            </div>

            {["recruiter", "manager", "interviewer"].includes(role) && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Company Name
                </label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    id="companyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder=""
                    className="pl-10 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:shadow-indigo-600/10 transition-all text-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
