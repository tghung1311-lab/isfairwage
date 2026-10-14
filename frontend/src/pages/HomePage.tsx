import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { WorkplaceSummary } from "../types";
import { getWorkplaces } from "../lib/api";
import SafetyBadge from "../components/ui/SafetyBadge";
import FlowButton from "../components/ui/FlowButton";
import WorkplaceImage from "../components/WorkplaceImage";

export default function HomePage() {
  const navigate = useNavigate();
  const [workplaces, setWorkplaces] = useState<WorkplaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkplaces() {
    setLoading(true);
    setError("");
    try {
      setWorkplaces(await getWorkplaces());
    } catch {
      setError("We could not load workplaces right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkplaces();
  }, []);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-600">Workplace pay reports</p>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">IsFairWage</h1>
            <p className="text-slate-600">See what other international students are reporting about workplace pay.</p>
          </div>
          <Link to="/search" className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto">Search workplaces</Link>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Understanding the badges</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["green", "amber", "red", "not-enough-data"] as const).map((badge) => (
            <SafetyBadge key={badge} status={badge} size="md" />
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Badges are based on the average hourly pay reported by users compared to the Australian national minimum wage ($33.05/hr).
        </p>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-900">Workplaces</h2>
          <div className="flex items-center gap-3">
            <Link to="/search" className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Search</Link>
            <FlowButton text="+ Add Workplace" onClick={() => navigate("/add-workplace")} className="rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2" />
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-500">Loading workplaces...</p>
        ) : error ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-slate-600">{error}</p>
            <button type="button" onClick={() => void loadWorkplaces()} className="rounded-xl px-3 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Retry</button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workplaces.map((workplace) => (
              <Link
                key={workplace.id}
                to={`/workplace/${workplace.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <WorkplaceImage imageUrl={workplace.image_url} name={workplace.name} industry={workplace.industry} className="mb-4 aspect-[16/9] w-full" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-700">{workplace.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{workplace.suburb} · {workplace.industry}</p>
                  </div>
                  <SafetyBadge status={workplace.badge} size="sm" />
                </div>
                <p className="mt-5 border-t border-slate-100 pt-4 text-sm font-medium text-slate-500">{workplace.review_count} review{workplace.review_count !== 1 ? "s" : ""}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}