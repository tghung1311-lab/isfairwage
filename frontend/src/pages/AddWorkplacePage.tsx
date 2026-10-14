import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ApiError, createWorkplace } from "../lib/api";
import FormSection from "../components/ui/FormSection";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function AddWorkplacePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [industry, setIndustry] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors: Record<string, string> = {};
  if (touched.name && !name.trim()) errors.name = "Workplace name is required";
  if (touched.suburb && !suburb.trim()) errors.suburb = "Suburb is required";
  if (touched.industry && !industry.trim()) errors.industry = "Industry is required";

  const isValid = Boolean(name.trim() && suburb.trim() && industry.trim());

  function handleBlur(field: string) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ name: true, suburb: true, industry: true });
    setServerError("");

    if (!isValid) {
      navigate("/confirmation", {
        state: { success: false, message: "Please fill in all required fields before submitting." },
      });
      return;
    }

    setSubmitting(true);
    try {
      const workplace = await createWorkplace({
        name: name.trim(),
        suburb: suburb.trim(),
        industry,
      });
      navigate("/confirmation", {
        state: {
          success: true,
          message: `"${workplace.name}" has been added successfully. You can now search for it and leave a review.`,
          destination: `/workplace/${workplace.id}`,
          destinationLabel: "View Workplace",
        },
      });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Unable to add this workplace. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <FormSection title="Add a Workplace" subtitle="Can't find a workplace? Add it so others can leave reviews.">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="wp-name" className="block text-sm font-medium text-gray-700 mb-1">Workplace name *</label>
            <input id="wp-name" type="text" value={name} onChange={(event) => setName(event.target.value)} onBlur={() => handleBlur("name")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Bean & Brew Café" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="wp-suburb" className="block text-sm font-medium text-gray-700 mb-1">Suburb *</label>
            <input id="wp-suburb" type="text" value={suburb} onChange={(event) => setSuburb(event.target.value)} onBlur={() => handleBlur("suburb")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Carlton" />
            {errors.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
          </div>
          <div>
            <label htmlFor="wp-industry" className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
            <select id="wp-industry" value={industry} onChange={(event) => setIndustry(event.target.value)} onBlur={() => handleBlur("industry")} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select an industry</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Retail">Retail</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Construction">Construction</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
          </div>
          {serverError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
          <PrimaryButton type="submit" disabled={!isValid || submitting}>{submitting ? "Adding workplace..." : "Add Workplace"}</PrimaryButton>
        </form>
      </FormSection>
      <Link to="/search" className="inline-block text-sm text-blue-600 hover:underline">← Back to Search</Link>
    </div>
  );
}