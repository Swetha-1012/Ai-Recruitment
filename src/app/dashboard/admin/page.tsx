"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Database, 
  Users, 
  Briefcase, 
  Building, 
  Settings, 
  Loader2,
  Trash2,
  UserCheck
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    usersCount: 0,
    companiesCount: 0,
    jobsCount: 0,
    applicationsCount: 0,
  });

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        
        // Calculate counts
        const recruiters = usersData.users.filter((u: any) => u.role === "recruiter").length;
        const candidates = usersData.users.filter((u: any) => u.role === "candidate").length;
        
        setStats({
          usersCount: usersData.users.length,
          companiesCount: 1, // HireNova Tech
          jobsCount: 1, // Frontend Developer
          applicationsCount: candidates,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedDatabase = async () => {
    if (!confirm("Are you sure you want to completely reset and seed the database? This deletes all current profiles and attempts.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (res.ok) {
        alert("Database seeded successfully!");
        fetchData();
      } else {
        alert("Database seed failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Admin Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">Manage system configurations, check database health, and view log directories.</p>
        </div>
        <button
          onClick={handleSeedDatabase}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
        >
          <Database className="h-4 w-4" /> Reset & Re-Seed DB
        </button>
      </div>

      {/* System Health stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 rounded-lg"><Users className="h-5 w-5" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-450 uppercase">Registered Users</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.usersCount}</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 rounded-lg"><Building className="h-5 w-5" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-450 uppercase">Registered Companies</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.companiesCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 rounded-lg"><Briefcase className="h-5 w-5" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-450 uppercase">Total Job Listings</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.jobsCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 rounded-lg"><Settings className="h-5 w-5" /></div>
          <div>
            <div className="text-[10px] font-bold text-slate-450 uppercase">Active Pipelines</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.applicationsCount}</div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registered System Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-150 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold text-slate-650 dark:text-slate-350">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Company Name</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                  <td className="p-3 font-semibold text-slate-850 dark:text-slate-100">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === "admin" ? "bg-red-100 text-red-750" :
                      u.role === "recruiter" ? "bg-indigo-100 text-indigo-755" :
                      u.role === "candidate" ? "bg-emerald-100 text-emerald-700" :
                      "bg-slate-150 text-slate-600"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{u.companyId ? "HireNova Tech" : "N/A (Candidate)"}</td>
                  <td className="p-3 text-right flex justify-end gap-1.5">
                    <button
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-indigo-650"
                      title="Adjust Role"
                      onClick={() => alert("Role adjustment is configured in seeding configurations.")}
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
