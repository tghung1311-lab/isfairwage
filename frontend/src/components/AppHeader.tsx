import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandIcon from "./BrandIcon";

export default function AppHeader() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.full_name || user?.email || "Account";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="w-full border-b border-slate-200 bg-white/95 shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-lg">
          <BrandIcon className="h-8 w-8 shrink-0 text-blue-600" />
          <span>IsFairWage</span>
        </Link>
        {!loading && (
          user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="max-w-32 truncate font-medium text-slate-600 sm:max-w-40" title={displayName}>
                {displayName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg px-2 py-1 font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Link to="/login" className="rounded-xl px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Log in</Link>
              <Link to="/signup" className="rounded-xl bg-blue-600 px-3.5 py-2 text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Sign up</Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}