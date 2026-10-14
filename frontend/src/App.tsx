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
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
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
      <footer className="text-center text-xs text-gray-400 py-4">
        IsFairWage MVP — A coursework project. Not legal advice.
      </footer>
    </div>
  );
}
