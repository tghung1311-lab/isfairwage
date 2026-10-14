import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Workplace, Review } from "../types";
import { computeBadge, averageHourlyPay } from "../utils/badgeLogic";
import SafetyBadge from "../components/ui/SafetyBadge";
import FormSection from "../components/ui/FormSection";

interface Props {
  workplaces: Workplace[];
  reviews: Review[];
}

export default function SearchPage({ workplaces, reviews }: Props) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [safeOnly, setSafeOnly] = useState(false);

  const industries = useMemo(
    () => Array.from(new Set(workplaces.map((w) => w.industry))).sort(),
    [workplaces]
  );

  const filtered = useMemo(() => {
    return workplaces.filter((wp) => {
      const matchesQuery =
        query.trim() === "" ||
        wp.name.toLowerCase().includes(query.toLowerCase()) ||
        wp.suburb.toLowerCase().includes(query.toLowerCase());

      const matchesIndustry = industry === "" || wp.industry === industry;

      let matchesSafe = true;
      if (safeOnly) {
        const pays = reviews
          .filter((r) => r.workplaceId === wp.id)
          .map((r) => r.hourlyPay);
        const avg = averageHourlyPay(pays);
        matchesSafe = computeBadge(avg) === "green";
      }

      return matchesQuery && matchesIndustry && matchesSafe;
    });
  }, [workplaces, reviews, query, industry, safeOnly]);

  return (
    <div className="space-y-6">
      <FormSection title="Search Workplaces" subtitle="Find a workplace and check its pay-safety status.">
        <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search by name or suburb
          </label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Bean & Brew or Carlton"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={safeOnly}
            onChange={(e) => setSafeOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Show only "Likely Fair Pay" workplaces</span>
        </label>
        </div>
      </FormSection>

      {/* Results */}
      <section>
        <p className="text-sm text-gray-500 mb-3">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No workplaces match your search.</p>
            <Link
              to="/add-workplace"
              className="inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add a Workplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((wp) => {
              const pays = reviews
                .filter((r) => r.workplaceId === wp.id)
                .map((r) => r.hourlyPay);
              const avg = averageHourlyPay(pays);
              const badge = computeBadge(avg);

              return (
                <Link
                  key={wp.id}
                  to={`/workplace/${wp.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{wp.name}</h3>
                      <p className="text-sm text-gray-500">{wp.suburb} · {wp.industry}</p>
                    </div>
                    <SafetyBadge status={badge} size="sm" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Link to="/home" className="inline-block text-sm text-blue-600 hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
