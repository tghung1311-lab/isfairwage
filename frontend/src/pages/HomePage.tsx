import { Link, useNavigate } from "react-router-dom";
import type { Workplace, Review } from "../types";
import { computeBadge, averageHourlyPay } from "../utils/badgeLogic";
import SafetyBadge from "../components/ui/SafetyBadge";
import FlowButton from "../components/ui/FlowButton";

interface Props {
  workplaces: Workplace[];
  reviews: Review[];
}

export default function HomePage({ workplaces, reviews }: Props) {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-2">IsFairWage</h1>
        <p className="text-gray-600">
          See what other international students are reporting about workplace pay.
        </p>
      </header>

      {/* Badge legend */}
      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Understanding the badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["green", "amber", "red", "not-enough-data"] as const).map((b) => (
            <SafetyBadge key={b} status={b} size="md" />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Badges are based on the average hourly pay reported by users compared to the Australian
          national minimum wage ($33.05/hr).
        </p>
      </section>

      {/* Workplace list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Workplaces</h2>
          <div className="space-x-3">
            <Link to="/search" className="text-sm text-blue-600 hover:underline">
              Search
            </Link>
            <FlowButton
              text="+ Add Workplace"
              onClick={() => navigate("/add-workplace")}
            />
          </div>
        </div>

        <div className="space-y-3">
          {workplaces.map((wp) => {
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
                    <p className="text-sm text-gray-500">
                      {wp.suburb} · {wp.industry}
                    </p>
                  </div>
                  <SafetyBadge status={badge} size="sm" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
