import { Link } from "react-router-dom";
import BrandIcon from "../components/BrandIcon";

export default function WelcomePage() {
  return (
    <div className="space-y-12 py-4 sm:space-y-16 sm:py-10">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-12 sm:py-14">
        <BrandIcon className="mx-auto mb-5 h-16 w-16 text-blue-600" />
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">IsFairWage</h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Check if you&apos;re being paid fairly before accepting casual work.
        </p>

        <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/signup" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            Create an account
          </Link>
          <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            Log in
          </Link>
        </div>
        <Link to="/home" className="mt-5 inline-block text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
            Browse workplaces without an account
        </Link>
      </section>

      <section aria-label="How it works" className="mx-auto max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Search a workplace"],
            ["02", "Read anonymous reviews"],
            ["03", "Share your own pay"],
          ].map(([number, title]) => (
            <div key={number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-5 text-sm font-bold text-blue-600">{number}</p>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
