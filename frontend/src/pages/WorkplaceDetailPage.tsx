import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { WorkplaceDetail } from "../types";
import { ApiError, getWorkplace } from "../lib/api";
import SafetyBadge from "../components/ui/SafetyBadge";
import FlowButton from "../components/ui/FlowButton";

export default function WorkplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workplace, setWorkplace] = useState<WorkplaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  async function loadWorkplace() {
    if (!id) return;
    setLoading(true);
    setError("");
    setNotFound(false);
    try {
      setWorkplace(await getWorkplace(id));
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 404) {
        setNotFound(true);
      } else {
        setError("We could not load this workplace right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkplace();
  }, [id]);

  if (loading) {
    return <p className="py-12 text-center text-gray-500">Loading workplace...</p>;
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Workplace not found</h1>
        <Link to="/home" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  if (error || !workplace) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">{error || "We could not load this workplace."}</p>
        <button type="button" onClick={() => void loadWorkplace()} className="font-medium text-blue-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{workplace.name}</h1>
            <p className="text-gray-600">{workplace.suburb} · {workplace.industry}</p>
          </div>
          <SafetyBadge status={workplace.badge} size="md" />
        </div>

        {workplace.average_hourly_pay !== null && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">${workplace.average_hourly_pay.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Avg hourly pay</p>
            </div>
            <div>
              <p className="text-2xl font-bold">${workplace.minimum_wage.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Minimum wage</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{workplace.review_count}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{workplace.reviews.filter((review) => review.payslip_provided).length}</p>
              <p className="text-xs text-gray-500">Got payslip</p>
            </div>
          </div>
        )}
      </div>

      <FlowButton text="Submit a Review" onClick={() => navigate(`/submit-review/${id}`)} />

      <section>
        <h2 className="text-lg font-semibold mb-3">Reviews ({workplace.review_count})</h2>
        {workplace.reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-500">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-3">
            {workplace.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">${review.hourly_pay.toFixed(2)}/hr · {review.hours_worked} hrs</span>
                  <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{review.payslip_provided ? "✅ Payslip provided" : "❌ No payslip"}</span>
                  <span>{review.reviewer_label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link to="/home" className="inline-block text-sm text-blue-600 hover:underline">← Back to Home</Link>
    </div>
  );
}