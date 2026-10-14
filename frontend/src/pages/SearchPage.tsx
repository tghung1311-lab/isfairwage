import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { WorkplaceSummary } from "../types";
import { getWorkplaces } from "../lib/api";
import SafetyBadge from "../components/ui/SafetyBadge";
import WorkplaceImage from "../components/WorkplaceImage";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [safeOnly, setSafeOnly] = useState(false);
  const [workplaces, setWorkplaces] = useState<WorkplaceSummary[]>([]);
  const [allIndustries, setAllIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkplaces(search = query, selectedIndustry = industry) {
    setLoading(true);
    setError("");
    try {
      const results = await getWorkplaces({ search, industry: selectedIndustry });
      setWorkplaces(results);
      if (!search && !selectedIndustry) {
        setAllIndustries(Array.from(new Set(results.map((workplace) => workplace.industry))).sort());
      }
    } catch {
      setError("We could not load workplaces right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkplaces("", "");
  }, []);

  const filtered = useMemo(
    () => workplaces.filter((workplace) => !safeOnly || workplace.badge === "green"),
    [workplaces, safeOnly]
  );

  function handleSearchChange(value: string) {
    setQuery(value);
    void loadWorkplaces(value, industry);
  }

  function handleIndustryChange(value: string) {
    setIndustry(value);
    void loadWorkplaces(query, value);
  }

  return (
    <div className="space-y-6">
      <section aria-label="Search Workplaces" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Search Workplaces</h1>
          <p className="mt-2 text-sm text-slate-600">Find a workplace and check its pay-safety status.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="mb-1.5 block text-sm font-semibold text-slate-700">Search by name or suburb</label>
            <input
              id="search"
              type="text"
              value={query}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Bean & Brew or Carlton"
            />
          </div>
          <div>
            <label htmlFor="industry" className="mb-1.5 block text-sm font-semibold text-slate-700">Industry</label>
            <select
              id="industry"
              value={industry}
              onChange={(event) => handleIndustryChange(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All industries</option>
              {allIndustries.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
            <input type="checkbox" checked={safeOnly} onChange={(event) => setSafeOnly(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-slate-700">Show only "Likely Fair Pay" workplaces</span>
          </label>
        </div>
      </section>

      <section>
        {loading ? (
          <p className="py-8 text-center text-slate-500">Loading workplaces...</p>
        ) : error ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-slate-600">{error}</p>
            <button type="button" onClick={() => void loadWorkplaces()} className="rounded-xl px-3 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Retry</button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm font-medium text-slate-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="mb-4 text-slate-600">No workplaces match your search.</p>
                <Link to="/add-workplace" className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Add a Workplace</Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((workplace) => (
                  <Link key={workplace.id} to={`/workplace/${workplace.id}`} className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
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
          </>
        )}
      </section>

      <Link to="/home" className="inline-block rounded-lg px-2 py-1 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">← Back to Home</Link>
    </div>
  );
}