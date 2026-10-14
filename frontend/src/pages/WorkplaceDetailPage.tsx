import { useParams, Link, useNavigate } from "react-router-dom";
import type { Workplace, Review } from "../types";
import { computeBadge, averageHourlyPay, MINIMUM_WAGE } from "../utils/badgeLogic";
import SafetyBadge from "../components/ui/SafetyBadge";
import FlowButton from "../components/ui/FlowButton";

interface Props {
  workplaces: Workplace[];
  reviews: Review[];
}

export default function WorkplaceDetailPage({ workplaces, reviews }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workplace = workplaces.find((w) => w.id === id);

  if (!workplace) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Workplace not found</h1>
        <Link to="/home" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const workplaceReviews = reviews.filter((r) => r.workplaceId === id);
  const pays = workplaceReviews.map((r) => r.hourlyPay);
  const avg = averageHourlyPay(pays);
  const badge = computeBadge(avg);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{workplace.name}</h1>
            <p className="text-gray-600">{workplace.suburb} · {workplace.industry}</p>
          </div>
          <SafetyBadge status={badge} size="md" />
        </div>

        {avg !== null && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">${avg.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Avg hourly pay</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${MINIMUM_WAGE.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Minimum wage</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{workplaceReviews.length}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {workplaceReviews.filter((r) => r.payslipProvided).length}
              </p>
              <p className="text-xs text-gray-500">Got payslip</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <FlowButton
        text="Submit a Review"
        onClick={() => navigate(`/submit-review/${id}`)}
      />

      {/* Reviews */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Reviews ({workplaceReviews.length})</h2>
        {workplaceReviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-3">
            {workplaceReviews
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((rv) => (
                <div key={rv.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      ${rv.hourlyPay.toFixed(2)}/hr · {rv.hoursWorked} hrs
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(rv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>
                      {rv.payslipProvided ? "✅ Payslip provided" : "❌ No payslip"}
                    </span>
                    <span>
                      {rv.isAnonymous ? "Anonymous" : rv.reviewerEmail}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <Link to="/home" className="inline-block text-sm text-blue-600 hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
