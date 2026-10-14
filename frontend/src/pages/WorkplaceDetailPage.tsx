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
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-extrabold tracking-tight text-slate-900">{workplace.name}</h1>
            <p className="text-slate-600">{workplace.suburb} · {workplace.industry}</p>
          </div>
          <SafetyBadge status={workplace.badge} size="md" />
        </div>

        {workplace.average_hourly_pay !== null && (
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-extrabold text-slate-900">${workplace.average_hourly_pay.toFixed(2)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Avg hourly pay</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-extrabold text-slate-900">${workplace.minimum_wage.toFixed(2)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Minimum wage</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-extrabold text-slate-900">{workplace.review_count}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Reviews</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-xl font-extrabold text-slate-900">{workplace.reviews.filter((review) => review.payslip_provided).length}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Got payslip</p>
            </div>
          </div>
        )}
      </div>

      <FlowButton text="Submit a Review" onClick={() => navigate(`/submit-review/${id}`)} />

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Reviews ({workplace.review_count})</h2>
        {workplace.reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-4">
            {workplace.reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-base font-bold text-slate-900">${review.hourly_pay.toFixed(2)}/hr · {review.hours_worked} hrs</span>
                  <span className="text-xs font-medium text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                  <span>{review.payslip_provided ? "✅ Payslip provided" : "❌ No payslip"}</span>
                  <span>{review.reviewer_label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link to="/home" className="inline-block rounded-lg px-2 py-1 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">← Back to Home</Link>
    </div>
  );
}