"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BrainCircuit,
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Code,
  FileSpreadsheet,
  Settings,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Search,
  Building,
  Mail,
  Trash2
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
  isEmailVerified: boolean;
}

interface NotificationItem {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardShellClient({
  children,
  user,
  initialNotifications,
}: {
  children: React.ReactNode;
  user: User;
  initialNotifications: NotificationItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  // Initialize theme from HTML class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Poll for new notifications in development to make flows feel real-time
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read", { method: "POST" });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "POST" });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Demo fast login shortcut
  const handleQuickLogin = async (targetRole: string) => {
    try {
      const emailMap: Record<string, string> = {
        candidate: "candidate1@example.com",
        recruiter: "recruiter1@hirenova.tech",
        manager: "manager1@hirenova.tech",
        interviewer: "interviewer1@hirenova.tech",
        admin: "admin@hirenova.tech",
      };

      const targetEmail = emailMap[targetRole];
      if (!targetEmail) return;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: "password123" }),
      });

      if (res.ok) {
        router.push(`/dashboard/${targetRole}`);
        router.refresh();
      } else {
        alert(`Seed user not found. Please click 'Create Seed Data' first!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sidebar Links based on role
  const getLinks = () => {
    const role = user.role;
    const base = "/dashboard";
    const links = [];

    if (role === "candidate") {
      links.push(
        { label: "Overview", href: `${base}/candidate`, icon: LayoutDashboard },
        { label: "Find Jobs", href: `/jobs`, icon: Briefcase },
        { label: "My Profile", href: `${base}/candidate/profile`, icon: Users },
        { label: "Assessments", href: `${base}/candidate/assessments`, icon: Code },
        { label: "Global Search", href: `${base}/search`, icon: Search }
      );
    } else if (role === "recruiter") {
      links.push(
        { label: "Overview", href: `${base}/recruiter`, icon: LayoutDashboard },
        { label: "Kanban Board", href: `${base}/recruiter/kanban`, icon: FileSpreadsheet },
        { label: "Compare Profiles", href: `${base}/recruiter/compare`, icon: ShieldCheck },
        { label: "Manage Jobs", href: `${base}/recruiter/jobs`, icon: Briefcase },
        { label: "Interviews", href: `${base}/recruiter/interviews`, icon: Calendar },
        { label: "Assessments", href: `${base}/recruiter/assessments`, icon: Code },
        { label: "Offer Letters", href: `${base}/recruiter/offers`, icon: ShieldCheck },
        { label: "Company Profile", href: `${base}/recruiter/company`, icon: Building },
        { label: "Global Search", href: `${base}/search`, icon: Search }
      );
    } else if (role === "manager") {
      links.push(
        { label: "Dashboard", href: `${base}/manager`, icon: LayoutDashboard },
        { label: "Hiring Funnel", href: `${base}/manager?view=analytics`, icon: FileSpreadsheet },
        { label: "Global Search", href: `${base}/search`, icon: Search }
      );
    } else if (role === "interviewer") {
      links.push(
        { label: "Dashboard", href: `${base}/interviewer`, icon: LayoutDashboard },
        { label: "Global Search", href: `${base}/search`, icon: Search }
      );
    } else if (role === "admin") {
      links.push(
        { label: "Control Center", href: `${base}/admin`, icon: LayoutDashboard },
        { label: "System Audit Logs", href: `${base}/admin/logs`, icon: Settings },
        { label: "Sent Email Logs", href: `${base}/admin/emails`, icon: Mail },
        { label: "Global Search", href: `${base}/search`, icon: Search }
      );
    }
    return links;
  };

  const navLinks = getLinks();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-1.5 bg-indigo-600 rounded text-white">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-300 bg-clip-text text-transparent">
            HireNova
          </span>
        </div>

        {/* User Badge */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
            {user.role} {user.companyName ? `@ ${user.companyName}` : ""}
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative flex flex-col w-64 bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-250 z-50">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded text-white">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">HireNova</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role}</div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg ${
                      active
                        ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 relative z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-semibold text-lg text-slate-800 dark:text-slate-100 capitalize">
              {pathname.split("/").pop() === "dashboard" ? "Dashboard" : pathname.split("/").pop()?.replace("-", " ")}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-650 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-200">
                  <div className="p-3 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                    <div className="flex gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Read All
                      </button>
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 text-xs leading-normal transition-colors ${
                            item.isRead ? "bg-white dark:bg-slate-900" : "bg-indigo-50/30 dark:bg-indigo-950/10 font-medium"
                          }`}
                        >
                          <div className="text-slate-700 dark:text-slate-300">{item.message}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark/Light mode button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-650" />}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm"
              >
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-150 dark:border-slate-800 text-xs">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                    <div className="text-slate-450 truncate mt-0.5">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}

          {/* Quick Demo Helper Panel (Fixed Bottom-Right) */}
          {showDemoPanel ? (
            <div className="fixed bottom-4 right-4 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 w-72 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Demo Helper Panel
                </span>
                <button
                  onClick={() => setShowDemoPanel(false)}
                  className="p-1 text-slate-400 hover:text-slate-650"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                Click any role to log in instantly. Switch dynamically to run the 16-step recruitment loop.
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => handleQuickLogin("candidate")}
                  className={`text-[10px] font-semibold p-1.5 rounded text-left border hover:bg-slate-50 dark:hover:bg-slate-950 ${
                    user.role === "candidate" ? "border-indigo-600 bg-indigo-50/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Candidate
                </button>
                <button
                  onClick={() => handleQuickLogin("recruiter")}
                  className={`text-[10px] font-semibold p-1.5 rounded text-left border hover:bg-slate-50 dark:hover:bg-slate-950 ${
                    user.role === "recruiter" ? "border-indigo-600 bg-indigo-50/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Recruiter
                </button>
                <button
                  onClick={() => handleQuickLogin("manager")}
                  className={`text-[10px] font-semibold p-1.5 rounded text-left border hover:bg-slate-50 dark:hover:bg-slate-950 ${
                    user.role === "manager" ? "border-indigo-600 bg-indigo-50/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Manager
                </button>
                <button
                  onClick={() => handleQuickLogin("interviewer")}
                  className={`text-[10px] font-semibold p-1.5 rounded text-left border hover:bg-slate-50 dark:hover:bg-slate-950 ${
                    user.role === "interviewer" ? "border-indigo-600 bg-indigo-50/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  Interviewer
                </button>
              </div>

              <button
                onClick={() => handleQuickLogin("admin")}
                className={`w-full text-center text-[10px] font-bold p-1.5 rounded border mb-2 hover:bg-slate-550 ${
                  user.role === "admin" ? "border-indigo-650 bg-indigo-50/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                Admin Control
              </button>

              <button
                onClick={async () => {
                  if (confirm("Reset and re-seed the local MongoDB database?")) {
                    const res = await fetch("/api/admin/seed", { method: "POST" });
                    if (res.ok) {
                      alert("Database successfully seeded! Logging out...");
                      handleLogout();
                    } else {
                      alert("Seed failed. Please make sure MongoDB is active.");
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-500 shadow"
              >
                <CheckCircle2 className="h-3 w-3" /> Re-Seed Demo Data
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDemoPanel(true)}
              className="fixed bottom-4 right-4 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-2xl flex items-center gap-1 animate-bounce"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold pr-1">Demo Panel</span>
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
