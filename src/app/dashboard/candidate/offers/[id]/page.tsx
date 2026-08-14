"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Printer, Check, X, ShieldCheck, Loader2 } from "lucide-react";

export default function OfferLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchOffer = async () => {
    try {
      const res = await fetch(`/api/offers/${id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load offer");
      }
      const data = await res.json();
      setOffer(data.offer);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffer();
  }, [id]);

  const handleResponse = async (action: "accept" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this job offer?`)) return;

    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      alert(`You have successfully ${action}ed the offer!`);
      router.push("/dashboard/candidate");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm max-w-md mx-auto mt-12">
        {error}
      </div>
    );
  }

  const company = offer.jobId.companyId || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Action Header - Hidden on Print */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm print:hidden">
        <Link
          href="/dashboard/candidate"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-350"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
          
          {offer.status === "sent" && (
            <>
              <button
                onClick={() => handleResponse("accept")}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Check className="h-4 w-4" /> Accept Offer
              </button>
              <button
                onClick={() => handleResponse("reject")}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Offer Status Banner - Hidden on Print */}
      {offer.status !== "sent" && (
        <div className={`p-4 rounded-xl border print:hidden flex items-center gap-2.5 ${
          offer.status === "accepted" 
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-350"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-450"
        }`}>
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span className="text-xs font-bold">
            You have already <span className="uppercase font-black">{offer.status}</span> this employment offer.
          </span>
        </div>
      )}

      {/* Document Sheet - Styled for Print */}
      <article className="bg-white text-slate-900 p-8 md:p-12 border border-slate-200 rounded-xl shadow-lg relative min-h-[10.5in] flex flex-col justify-between print:border-none print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-indigo-750">{company.name || "HireNova Tech"}</h1>
              <p className="text-xs text-slate-500 mt-1">{company.industry} &bull; {company.website}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Date: {new Date(offer.createdAt).toLocaleDateString()}</div>
              <div>Ref: DFT-OFF-{offer._id.substring(18).toUpperCase()}</div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="text-xs space-y-1 pt-4">
            <div className="font-bold text-slate-800">To:</div>
            <div className="font-bold text-sm text-slate-900">{offer.candidateId.name}</div>
            <div className="text-slate-500">{offer.candidateId.email}</div>
            <div className="text-slate-500">{offer.location}</div>
          </div>

          {/* Letter Body */}
          <div className="text-xs leading-relaxed text-slate-700 space-y-4 pt-6">
            <p className="font-bold text-slate-900">Dear {offer.candidateId.name},</p>
            
            <p>
              We are pleased to offer you employment with <strong>{company.name || "HireNova Tech"}</strong> in the position of <strong>{offer.jobId.title}</strong>. We were exceptionally impressed with your skills and evaluations during our recruitment cycle, and we are excited to invite you to join our engineering division.
            </p>

            <p>
              In this role, you will be reporting to the Engineering Manager. The details of your employment package are outlined below:
            </p>

            {/* Compensation Table */}
            <div className="my-6 border border-slate-200 rounded-lg overflow-hidden max-w-md">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 font-bold text-slate-700">Employment Terms</th>
                    <th className="p-3 font-bold text-slate-700 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">Job Role</td>
                    <td className="p-3 text-right font-bold text-slate-950">{offer.jobId.title}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Base Compensation</td>
                    <td className="p-3 text-right font-bold text-indigo-700">INR {offer.salary.toLocaleString()}/yr</td>
                  </tr>
                  <tr>
                    <td className="p-3">Joining Date</td>
                    <td className="p-3 text-right font-bold text-slate-950">{new Date(offer.joiningDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3">Work Location</td>
                    <td className="p-3 text-right font-bold text-slate-950">{offer.location}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Benefits section */}
            {offer.benefits && (
              <div className="space-y-1.5 pt-2">
                <div className="font-bold text-slate-900">Employment Benefits:</div>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-slate-650 italic">
                  {offer.benefits}
                </p>
              </div>
            )}

            <p className="pt-4">
              To accept this offer, please execute by clicking the Accept Offer button in your online dashboard panel. We look forward to welcome you to the {company.name || "HireNova Tech"} team.
            </p>

            <p className="pt-2">Sincerely,</p>
          </div>
        </div>

        {/* Signature Footer */}
        <div className="flex justify-between items-end border-t border-slate-200 pt-8 mt-12 text-xs">
          <div>
            <div className="font-bold text-slate-900">Sarah Jenkins</div>
            <div className="text-slate-500">Recruitment Division</div>
            <div className="text-slate-500">{company.name || "HireNova Tech"}</div>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-400 w-40 h-10 mx-auto mb-1"></div>
            <div className="text-slate-400">Authorized Signature</div>
          </div>
        </div>

      </article>
    </div>
  );
}
