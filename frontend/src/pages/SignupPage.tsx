import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import FormSection from "../components/ui/FormSection";
import PrimaryButton from "../components/ui/PrimaryButton";

interface RedirectState {
  from?: { pathname: string; search?: string; hash?: string };
}

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fullNameError = touched.fullName && !fullName.trim() ? "Full name is required." : "";
  const emailError = touched.email && !/^\S+@\S+\.\S+$/.test(email.trim())
    ? "Please enter a valid email address."
    : "";
  const passwordError = touched.password && password.length < 8
    ? "Password must be at least 8 characters long."
    : "";
  const isValid = fullName.trim().length > 0 && /^\S+@\S+\.\S+$/.test(email.trim()) && password.length >= 8;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ fullName: true, email: true, password: true });
    setError("");

    if (!isValid) return;

    setSubmitting(true);
    try {
      await signup(fullName.trim(), email.trim(), password);
      const state = location.state as RedirectState | null;
      const from = state?.from;
      navigate(from ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}` : "/home", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Unable to create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <FormSection title="Create an account" subtitle="Create an account to add workplaces and submit reviews.">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              onBlur={() => setTouched((previous) => ({ ...previous, fullName: true }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="name"
              placeholder="Your name"
            />
            {fullNameError && <p className="mt-1 text-sm text-red-600">{fullNameError}</p>}
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setTouched((previous) => ({ ...previous, email: true }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="email"
              placeholder="you@example.com"
            />
            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((previous) => ({ ...previous, password: true }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <PrimaryButton type="submit" disabled={!isValid || submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </PrimaryButton>
        </form>
        <p className="text-sm text-gray-600">
          Already have an account? <Link to="/login" state={location.state} className="font-medium text-blue-600 hover:underline">Log in</Link>
        </p>
      </FormSection>
    </div>
  );
}