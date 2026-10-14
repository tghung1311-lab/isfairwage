import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { WorkplaceSummary } from "../types";
import { getWorkplaces } from "../lib/api";
import SafetyBadge from "../components/ui/SafetyBadge";
import FormSection from "../components/ui/FormSection";

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
      <FormSection title="Search Workplaces" subtitle="Find a workplace and check its pay-safety status.">
        <div className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search by name or suburb</label>
            <input
              id="search"
              type="text"
              value={query}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Bean & Brew or Carlton"
            />
          </div>
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              id="industry"
              value={industry}
              onChange={(event) => handleIndustryChange(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All industries</option>
              {allIndustries.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={safeOnly} onChange={(event) => setSafeOnly(event.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Show only "Likely Fair Pay" workplaces</span>
          </label>
        </div>
      </FormSection>

      <section>
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading workplaces...</p>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="mb-4 text-gray-600">{error}</p>
            <button type="button" onClick={() => void loadWorkplaces()} className="font-medium text-blue-600 hover:underline">Retry</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">No workplaces match your search.</p>
                <Link to="/add-workplace" className="inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Add a Workplace</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((workplace) => (
                  <Link key={workplace.id} to={`/workplace/${workplace.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{workplace.name}</h3>
                        <p className="text-sm text-gray-500">{workplace.suburb} · {workplace.industry}</p>
                      </div>
                      <SafetyBadge status={workplace.badge} size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <Link to="/home" className="inline-block text-sm text-blue-600 hover:underline">← Back to Home</Link>
    </div>
  );
}