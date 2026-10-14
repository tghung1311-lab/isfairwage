import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { LocalWorkplace } from "../types";
import FormSection from "../components/ui/FormSection";
import PrimaryButton from "../components/ui/PrimaryButton";

interface Props {
  onAddWorkplace: (workplace: LocalWorkplace) => void;
}

export default function AddWorkplacePage({ onAddWorkplace }: Props) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [suburb, setSuburb] = useState("");
  const [industry, setIndustry] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* Validation */
  const errors: Record<string, string> = {};
  if (touched.name && name.trim() === "") errors.name = "Workplace name is required";
  if (touched.suburb && suburb.trim() === "") errors.suburb = "Suburb is required";
  if (touched.industry && industry.trim() === "") errors.industry = "Industry is required";

  const isValid =
    name.trim() !== "" && suburb.trim() !== "" && industry.trim() !== "";

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    /* Full revalidation — marks all fields touched */
    const allTouched: Record<string, boolean> = {
      name: true, suburb: true, industry: true,
    };
    setTouched(allTouched);

    if (!isValid) {
      /* Pattern: Router State — pass failure to ConfirmationPage */
      navigate("/confirmation", {
        state: { success: false, message: "Please fill in all required fields before submitting." },
      });
      return;
    }

    const newWorkplace: LocalWorkplace = {
      id: `wp-${Date.now()}`,
      name: name.trim(),
      suburb: suburb.trim(),
      industry: industry.trim(),
    };

    /* Pattern: Callbacks Up — report new workplace to App.tsx */
    onAddWorkplace(newWorkplace);

    /* Pattern: Router State — pass success to ConfirmationPage */
    navigate("/confirmation", {
      state: { success: true, message: `"${newWorkplace.name}" has been added successfully. You can now search for it and leave a review.` },
    });
  }

  return (
    <div className="space-y-6">
      <FormSection title="Add a Workplace" subtitle="Can't find a workplace? Add it so others can leave reviews.">
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="wp-name" className="block text-sm font-medium text-gray-700 mb-1">
            Workplace name *
          </label>
          <input
            id="wp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Bean & Brew Café"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Suburb */}
        <div>
          <label htmlFor="wp-suburb" className="block text-sm font-medium text-gray-700 mb-1">
            Suburb *
          </label>
          <input
            id="wp-suburb"
            type="text"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            onBlur={() => handleBlur("suburb")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Carlton"
          />
          {errors.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="wp-industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry *
          </label>
          <select
            id="wp-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            onBlur={() => handleBlur("industry")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
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

        <PrimaryButton type="submit" disabled={!isValid}>
          Add Workplace
        </PrimaryButton>
      </form>
      </FormSection>

      <Link to="/search" className="inline-block text-sm text-blue-600 hover:underline">
        ← Back to Search
      </Link>
    </div>
  );
}
