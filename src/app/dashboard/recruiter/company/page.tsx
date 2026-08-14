"use client";

import { useState, useEffect } from "react";
import { Building, Save, Plus, Trash, Loader2 } from "lucide-react";

export default function CompanyManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [size, setSize] = useState("10-50");
  const [description, setDescription] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        if (res.ok) {
          const data = await res.json();
          const comp = data.company;
          setName(comp.name || "");
          setLogo(comp.logo || "");
          setWebsite(comp.website || "");
          setIndustry(comp.industry || "Technology");
          setSize(comp.size || "10-50");
          setDescription(comp.description || "");
          setLocations(comp.locations || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setLocations(locations.filter(l => l !== loc));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          logo,
          website,
          industry,
          size,
          description,
          locations,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      alert("Company details updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-extrabold text-slate-850 dark:text-white">Company Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure company profiles, office locations, and description summaries.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core Profile */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-indigo-650" /> Profile Metrics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://hirenova.tech"
                className="w-full p-2.5 rounded-lg border border-slate-355 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Software Engineering & Cloud"
                className="w-full p-2.5 rounded-lg border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Size (Employees)</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value="1-10">1-10 employees</option>
                <option value="10-50">10-50 employees</option>
                <option value="100-500">100-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">About the Company</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a company description..."
              rows={4}
              className="w-full p-2.5 border border-slate-350 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-950 text-xs resize-none"
            />
          </div>
        </section>

        {/* Office Locations */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Office Locations</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add location (e.g. Remote, Bangalore, London)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLocation())}
              className="max-w-md p-2 rounded-lg border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-850 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {locations.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No locations configured.</span>
            ) : (
              locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 rounded-full text-xs font-bold"
                >
                  {loc}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="text-indigo-400 hover:text-indigo-700 text-xs"
                  >
                    &times;
                  </button>
                </span>
              ))
            )}
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Company Details</>}
          </button>
        </div>

      </form>
    </div>
  );
}
