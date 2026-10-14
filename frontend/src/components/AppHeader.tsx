import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppHeader() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.full_name || user?.email || "Account";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold text-gray-900 hover:text-blue-700">
          IsFairWage
        </Link>
        {!loading && (
          user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="max-w-40 truncate text-gray-600" title={displayName}>
                {displayName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-medium text-blue-600 hover:underline"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Link to="/login" className="hover:underline">Log in</Link>
              <span className="text-gray-300">/</span>
              <Link to="/signup" className="hover:underline">Sign up</Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}