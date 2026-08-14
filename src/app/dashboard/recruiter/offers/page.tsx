"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Plus, X, Loader2, DollarSign, Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

function OffersContent() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get("appId") || "";

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [applicationId, setApplicationId] = useState(initialAppId);
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [location, setLocation] = useState("");
  const [benefits, setBenefits] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch offers
      const offRes = await fetch("/api/offers");
      if (offRes.ok) {
        const offData = await offRes.json();
        setOffers(offData.offers || []);
      }

      // Fetch applications (for dropdown selection)
      const appRes = await fetch("/api/applications");
      if (appRes.ok) {
        const appData = await appRes.json();
        // Allow sending offers to active candidates
        const activeApps = (appData.applications || []).filter(
          (a: any) => !["rejected", "hired"].includes(a.stage)
        );
        setApplications(activeApps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (initialAppId) {
      setApplicationId(initialAppId);
      setShowModal(true);
    }
  }, [initialAppId]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          salary: parseFloat(salary),
          joiningDate,
          location,
          benefits,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create offer");
      }

      alert("Offer letter generated and sent successfully!");
      setShowModal(false);
      fetchData();
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
          <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Offer Letter Center</h1>
          <p className="text-xs text-slate-500 mt-1">Review compensation packages, generate contracts, and track candidate acceptances.</p>
        </div>
        <button
          onClick={() => {
            setApplicationId(initialAppId);
            setSalary("900000");
            setJoiningDate("");
            setLocation("Remote");
            setBenefits("Standard health cover, 21 days annual leaves, performance bonuses.");
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Generate Offer Letter
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500">
          No offer letters generated. Click the button above to generate your first job offer.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold text-slate-650 dark:text-slate-350">
              <tr>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Job Role</th>
                <th className="p-4">Base Package</th>
                <th className="p-4">Joining Date</th>
                <th className="p-4">Location</th>
                <th className="p-4">Offer Status</th>
                <th className="p-4 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {offers.map((off) => (
                <tr key={off._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{off.candidateId?.name}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{off.jobId?.title}</td>
                  <td className="p-4 font-semibold text-slate-600">INR {off.salary.toLocaleString()}/yr</td>
                  <td className="p-4">{new Date(off.joiningDate).toLocaleDateString()}</td>
                  <td className="p-4">{off.location}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      off.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                      off.status === "rejected" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {off.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end">
                    <Link
                      href={`/dashboard/candidate/offers/${off._id}`}
                      className="p-1.5 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                      title="Preview Letter"
                    >
                      <ExternalLink className="h-4 w-4 text-indigo-650" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Offer Letter Creator Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-md z-50 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Generate Job Offer</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Select Candidate Application</label>
                <select
                  required
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Candidate --</option>
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.candidateId?.name} - {app.jobId?.title} (AI Match: {app.resumeMatchScore}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1 flex items-center gap-0.5">
                    <DollarSign className="h-4 w-4" /> Base Salary (INR/yr)
                  </label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="900000"
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase mb-1 flex items-center gap-0.5">
                    <MapPin className="h-4 w-4" /> Work Location
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote"
                    className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1 flex items-center gap-0.5">
                  <Calendar className="h-4 w-4" /> Expected Joining Date
                </label>
                <input
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase mb-1">Company Benefits & Perks</label>
                <textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="health insurance, leaves..."
                  rows={3}
                  className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Offer Contract"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookOffers() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    }>
      <OffersContent />
    </Suspense>
  );
}
