import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { WorkplaceSummary } from "../types";
import { getWorkplaces } from "../lib/api";
import SafetyBadge from "../components/ui/SafetyBadge";
import FlowButton from "../components/ui/FlowButton";

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
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">IsFairWage</h1>
        <p className="text-gray-600">See what other international students are reporting about workplace pay.</p>
      </header>

      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Understanding the badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["green", "amber", "red", "not-enough-data"] as const).map((badge) => (
            <SafetyBadge key={badge} status={badge} size="md" />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Badges are based on the average hourly pay reported by users compared to the Australian national minimum wage ($33.05/hr).
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Workplaces</h2>
          <div className="space-x-3">
            <Link to="/search" className="text-sm text-blue-600 hover:underline">Search</Link>
            <FlowButton text="+ Add Workplace" onClick={() => navigate("/add-workplace")} />
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading workplaces...</p>
        ) : error ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-md">
            <p className="mb-4 text-gray-600">{error}</p>
            <button type="button" onClick={() => void loadWorkplaces()} className="font-medium text-blue-600 hover:underline">Retry</button>
          </div>
        ) : (
          <div className="space-y-3">
            {workplaces.map((workplace) => (
              <Link
                key={workplace.id}
                to={`/workplace/${workplace.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
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
      </section>
    </div>
  );
}