import { useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ApiError, createReview } from "../lib/api";
import FormSection from "../components/ui/FormSection";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function SubmitReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hourlyPay, setHourlyPay] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [payslipProvided, setPayslipProvided] = useState<boolean | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const hourlyPayNumber = Number(hourlyPay);
  const hoursWorkedNumber = Number(hoursWorked);
  const errors: Record<string, string> = {};

  if (touched.hourlyPay) {
    if (!hourlyPay.trim()) errors.hourlyPay = "Hourly pay is required";
    else if (!Number.isFinite(hourlyPayNumber) || hourlyPayNumber <= 0) errors.hourlyPay = "Must be a positive number";
  }
  if (touched.hoursWorked) {
    if (!hoursWorked.trim()) errors.hoursWorked = "Hours worked is required";
    else if (!Number.isFinite(hoursWorkedNumber) || hoursWorkedNumber <= 0) errors.hoursWorked = "Must be a positive number";
  }
  if (touched.payslipProvided && payslipProvided === null) errors.payslipProvided = "Please select an option";

  const isValid = Boolean(
    hourlyPay.trim() && Number.isFinite(hourlyPayNumber) && hourlyPayNumber > 0 &&
    hoursWorked.trim() && Number.isFinite(hoursWorkedNumber) && hoursWorkedNumber > 0 &&
    payslipProvided !== null
  );

  function handleBlur(field: string) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ hourlyPay: true, hoursWorked: true, payslipProvided: true });
    setServerError("");

    if (!isValid || !id) {
      navigate("/confirmation", { state: { success: false, message: "Please fill in all required fields correctly." } });
      return;
    }

    setSubmitting(true);
    try {
      await createReview(id, {
        hourly_pay: hourlyPayNumber,
        hours_worked: hoursWorkedNumber,
        payslip_provided: payslipProvided!,
        is_anonymous: isAnonymous,
      });
      navigate("/confirmation", {
        state: {
          success: true,
          message: "Thank you! Your review has been submitted successfully.",
          destination: `/workplace/${id}`,
          destinationLabel: "View Workplace",
        },
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === "PAY_TOO_HIGH") {
        navigate("/confirmation", {
          state: {
            success: false,
            message: "This pay rate looks unusual and needs manual review before it can be added. Please double-check the amount, or contact support if this is correct.",
          },
        });
      } else {
        setServerError(error instanceof ApiError ? error.message : "Unable to submit this review. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <FormSection title="Submit a Review" subtitle="Your experience can help other students make safer choices.">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="hourlyPay" className="block text-sm font-medium text-gray-700 mb-1">Hourly pay (AUD) *</label>
            <input id="hourlyPay" type="number" step="0.01" value={hourlyPay} onChange={(event) => setHourlyPay(event.target.value)} onBlur={() => handleBlur("hourlyPay")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 23.50" />
            {errors.hourlyPay && <p className="mt-1 text-sm text-red-600">{errors.hourlyPay}</p>}
          </div>
          <div>
            <label htmlFor="hoursWorked" className="block text-sm font-medium text-gray-700 mb-1">Hours worked per week *</label>
            <input id="hoursWorked" type="number" step="0.01" value={hoursWorked} onChange={(event) => setHoursWorked(event.target.value)} onBlur={() => handleBlur("hoursWorked")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 20" />
            {errors.hoursWorked && <p className="mt-1 text-sm text-red-600">{errors.hoursWorked}</p>}
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Were you given a payslip? *</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="payslip" checked={payslipProvided === true} onChange={() => { setPayslipProvided(true); handleBlur("payslipProvided"); }} className="h-4 w-4" /><span className="text-sm">Yes</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="payslip" checked={payslipProvided === false} onChange={() => { setPayslipProvided(false); handleBlur("payslipProvided"); }} className="h-4 w-4" /><span className="text-sm">No</span></label>
            </div>
            {errors.payslipProvided && <p className="mt-1 text-sm text-red-600">{errors.payslipProvided}</p>}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700">Submit anonymously</span>
          </label>
          {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
          <PrimaryButton type="submit" disabled={!isValid || submitting}>{submitting ? "Submitting review..." : "Submit Review"}</PrimaryButton>
        </form>
      </FormSection>
      <Link to={`/workplace/${id}`} className="inline-block text-sm text-blue-600 hover:underline">← Back to Workplace</Link>
    </div>
  );
}