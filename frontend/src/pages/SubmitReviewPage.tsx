import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { LocalWorkplace, LocalReview } from "../types";
import FormSection from "../components/ui/FormSection";
import PrimaryButton from "../components/ui/PrimaryButton";

interface Props {
  workplaces: LocalWorkplace[];
  onSubmitReview: (review: LocalReview) => void;
}

export default function SubmitReviewPage({ workplaces, onSubmitReview }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workplace = workplaces.find((w) => w.id === id);

  const [hourlyPay, setHourlyPay] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [payslipProvided, setPayslipProvided] = useState<boolean | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  const hp = parseFloat(hourlyPay);
  const hw = parseFloat(hoursWorked);

  if (touched.hourlyPay) {
    if (hourlyPay.trim() === "") errors.hourlyPay = "Hourly pay is required";
    else if (isNaN(hp) || hp <= 0) errors.hourlyPay = "Must be a positive number";
  }
  if (touched.hoursWorked) {
    if (hoursWorked.trim() === "") errors.hoursWorked = "Hours worked is required";
    else if (isNaN(hw) || hw <= 0) errors.hoursWorked = "Must be a positive number";
  }
  if (touched.payslipProvided && payslipProvided === null) {
    errors.payslipProvided = "Please select an option";
  }
  if (!isAnonymous && touched.reviewerEmail && reviewerEmail.trim() === "") {
    errors.reviewerEmail = "Email is required when not anonymous";
  }

  const isValid =
    hourlyPay.trim() !== "" && !isNaN(hp) && hp > 0 &&
    hoursWorked.trim() !== "" && !isNaN(hw) && hw > 0 &&
    payslipProvided !== null &&
    (isAnonymous || reviewerEmail.trim() !== "");

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {
      hourlyPay: true, hoursWorked: true, payslipProvided: true, reviewerEmail: true,
    };
    setTouched(allTouched);

    if (!isValid) {
      navigate("/confirmation", {
        state: { success: false, message: "Please fill in all required fields correctly." },
      });
      return;
    }

    /* Business-rule: flag unrealistic pay rates for manual review */
    if (hp > 80) {
      navigate("/confirmation", {
        state: {
          success: false,
          message:
            "This pay rate looks unusual and needs manual review before it can be added. Please double-check the amount, or contact support if this is correct.",
        },
      });
      return;
    }

    /* PATTERN: Callbacks Up — report review to App.tsx */
    const review: LocalReview = {
      id: `rv-${Date.now()}`,
      workplaceId: id!,
      hourlyPay: hp,
      hoursWorked: hw,
      payslipProvided: payslipProvided!,
      isAnonymous,
      reviewerEmail: isAnonymous ? "" : reviewerEmail,
      createdAt: new Date().toISOString(),
    };
    onSubmitReview(review);

    /* PATTERN: Router State — pass result to ConfirmationPage */
    navigate("/confirmation", {
      state: { success: true, message: "Thank you! Your review has been submitted successfully." },
    });
  }

  if (!workplace) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Workplace not found</h1>
        <Link to="/home" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormSection title="Submit a Review" subtitle={`Share your pay experience at ${workplace.name} (${workplace.suburb}).`}>
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hourly Pay */}
        <div>
          <label htmlFor="hourlyPay" className="block text-sm font-medium text-gray-700 mb-1">Hourly pay (AUD) *</label>
          <input id="hourlyPay" type="number" step="0.01" value={hourlyPay}
            onChange={(e) => setHourlyPay(e.target.value)}
            onBlur={() => handleBlur("hourlyPay")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 23.50" />
          {errors.hourlyPay && <p className="mt-1 text-sm text-red-600">{errors.hourlyPay}</p>}
        </div>

        {/* Hours Worked */}
        <div>
          <label htmlFor="hoursWorked" className="block text-sm font-medium text-gray-700 mb-1">Hours worked per week *</label>
          <input id="hoursWorked" type="number" step="0.5" value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
            onBlur={() => handleBlur("hoursWorked")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 20" />
          {errors.hoursWorked && <p className="mt-1 text-sm text-red-600">{errors.hoursWorked}</p>}
        </div>

        {/* Payslip */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Were you given a payslip? *</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="payslip" checked={payslipProvided === true}
                onChange={() => { setPayslipProvided(true); handleBlur("payslipProvided"); }} className="h-4 w-4" />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="payslip" checked={payslipProvided === false}
                onChange={() => { setPayslipProvided(false); handleBlur("payslipProvided"); }} className="h-4 w-4" />
              <span className="text-sm">No</span>
            </label>
          </div>
          {errors.payslipProvided && <p className="mt-1 text-sm text-red-600">{errors.payslipProvided}</p>}
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
          <span className="text-sm text-gray-700">Submit anonymously</span>
        </label>

        {/* Email (only if not anonymous) */}
        {!isAnonymous && (
          <div>
            <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700 mb-1">Your email *</label>
            <input id="reviewerEmail" type="email" value={reviewerEmail}
              onChange={(e) => setReviewerEmail(e.target.value)}
              onBlur={() => handleBlur("reviewerEmail")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com" />
            {errors.reviewerEmail && <p className="mt-1 text-sm text-red-600">{errors.reviewerEmail}</p>}
          </div>
        )}

        <PrimaryButton type="submit" disabled={!isValid}>
          Submit Review
        </PrimaryButton>
      </form>
      </FormSection>

      <Link to={`/workplace/${id}`} className="inline-block text-sm text-blue-600 hover:underline">
        ← Back to {workplace?.name ?? "Workplace"}
      </Link>
    </div>
  );
}
