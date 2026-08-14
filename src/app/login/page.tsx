"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, Key, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Forgot Password States
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Passwordless Login States
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [loginOtpStep, setLoginOtpStep] = useState(1);
  const [loginOtp, setLoginOtp] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setSuccess("Logged in successfully! Redirecting...");
      setTimeout(() => {
        // Redirect to dashboard root which automatically forwards based on roles
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_otp", email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message);
      setLoginOtpStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", email, otp: loginOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("OTP verified successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message);
      setResetStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Password reset successfully! Please log in.");
      setTimeout(() => {
        setForgotMode(false);
        setResetStep(1);
        setPassword("");
        setOtp("");
        setNewPassword("");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMockLogin = () => {
    window.location.href = "/api/auth/google";
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
            {forgotMode ? "Reset Password" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {forgotMode ? (
              "Retrieve access to your hiring dashboard."
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Sign up for free
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

        {/* FORGOT PASSWORD WORKFLOW */}
        {forgotMode ? (
          <div>
            {resetStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <div>
                  <label htmlFor="email-forgot" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      id="email-forgot"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="pl-10 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-lg shadow-md transition-all text-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Reset OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/50 rounded-lg text-xs leading-relaxed text-indigo-755 dark:text-indigo-350">
                  We sent a 6-digit verification OTP code. In our local database, this OTP prints in the server logs or registers as an in-app notice under Admin Email Logs.
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
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
                    className="w-full mt-1 p-2.5 text-center tracking-widest font-mono text-lg rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder=""
                    className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-semibold rounded-lg shadow-md transition-all text-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save New Password"}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setForgotMode(false);
                setResetStep(1);
                setError("");
                setSuccess("");
              }}
              className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block text-center mx-auto"
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* STANDARD / OTP LOGIN WORKFLOWS */
          <div>
            {/* Login Mode Toggle Buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("password");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  loginMethod === "password" 
                    ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white" 
                    : "text-slate-450 hover:text-slate-900"
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("otp");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  loginMethod === "otp" 
                    ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white" 
                    : "text-slate-450 hover:text-slate-900"
                }`}
              >
                Passwordless OTP
              </button>
            </div>

            {loginMethod === "password" ? (
              /* 1. PASSWORD SIGN IN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-650 hover:bg-indigo-550 text-white font-semibold rounded-lg shadow-md transition-all text-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              /* 2. PASSWORDLESS OTP SIGN IN FORM */
              <div className="space-y-4 animate-in fade-in duration-200">
                {loginOtpStep === 1 ? (
                  <form onSubmit={handleRequestLoginOtp} className="space-y-4">
                    <div>
                      <label htmlFor="email-otp-login" className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                        Email Address
                      </label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                          id="email-otp-login"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder=""
                          className="pl-10 w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-555 text-white font-semibold rounded-lg shadow-md transition-all text-sm disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Request Login OTP <ArrowRight className="h-4 w-4" /></>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/50 rounded-xl text-xs leading-relaxed text-indigo-755 dark:text-indigo-300">
                      <span className="font-bold flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-indigo-650" /> OTP Verification</span>
                      Please check the **Email Logs** on the Admin dashboard or server standard console logs to copy the login OTP code.
                    </div>

                    <div>
                      <label htmlFor="login-otp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        6-Digit Login OTP
                      </label>
                      <input
                        id="login-otp"
                        type="text"
                        required
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        placeholder=""
                        className="w-full p-3 text-center tracking-widest font-mono text-xl rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-550 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code & Sign In"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginOtpStep(1);
                        setError("");
                        setSuccess("");
                        setLoginOtp("");
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline block text-center mx-auto"
                    >
                      Change Email
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-550">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleMockLogin}
              className="w-full py-2.5 rounded-lg border border-slate-250 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google OAuth Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
