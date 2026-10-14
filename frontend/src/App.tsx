import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import WorkplaceDetailPage from "./pages/WorkplaceDetailPage";
import SubmitReviewPage from "./pages/SubmitReviewPage";
import AddWorkplacePage from "./pages/AddWorkplacePage";
import ConfirmationPage from "./pages/ConfirmationPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AppHeader from "./components/AppHeader";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/workplace/:id" element={<WorkplaceDetailPage />} />
          <Route path="/submit-review/:id" element={<ProtectedRoute><SubmitReviewPage /></ProtectedRoute>} />
          <Route path="/add-workplace" element={<ProtectedRoute><AddWorkplacePage /></ProtectedRoute>} />
          {/* PATTERN: Router State — reads useLocation().state */}
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-400">
        IsFairWage MVP — A coursework project. Not legal advice.
      </footer>
    </div>
  );
}
