import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import FormSection from "../components/ui/FormSection";
import PrimaryButton from "../components/ui/PrimaryButton";

interface RedirectState {
  from?: { pathname: string; search?: string; hash?: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailError = touched.email && !/^\S+@\S+\.\S+$/.test(email.trim())
    ? "Please enter a valid email address."
    : "";
  const passwordError = touched.password && !password ? "Password is required." : "";
  const isValid = /^\S+@\S+\.\S+$/.test(email.trim()) && password.length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setError("");

    if (!isValid) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const state = location.state as RedirectState | null;
      const from = state?.from;
      navigate(from ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}` : "/home", { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <FormSection title="Log in" subtitle="Sign in to add workplaces and submit reviews.">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((previous) => ({ ...previous, password: true }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
              placeholder="••••••••"
            />
            {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <PrimaryButton type="submit" disabled={!isValid || submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </PrimaryButton>
        </form>
        <p className="text-sm text-gray-600">
          Need an account? <Link to="/signup" state={location.state} className="font-medium text-blue-600 hover:underline">Sign up</Link>
        </p>
      </FormSection>
    </div>
  );
}