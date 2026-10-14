/* ============================================================
 *  App.tsx — Central state, localStorage sync, and router
 *
 *  DATA-FLOW OVERVIEW
 *  ==================
 *  All shared data lives here in two arrays:
 *    workplaces : Workplace[]     — list of known workplaces
 *    reviews    : Review[]        — user-submitted pay reviews
 *
 *  Three communication patterns are used:
 *
 *  1. PROPS DOWN  — Each page receives the data it needs
 *     via props (workplaces, reviews, etc.).
 *
 *  2. CALLBACKS UP — Mutations happen through callback
 *     functions (handleAddWorkplace, handleSubmitReview)
 *     defined here and passed down as props. Pages call
 *     these callbacks; App.tsx updates the central arrays.
 *
 *  3. ROUTER STATE — After a submission, pages use
 *     navigate("/confirmation", { state: { success, message } })
 *     to hand a result message to ConfirmationPage without
 *     touching global state.
 * ============================================================ */

import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Workplace, Review } from "./types";
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

/* Seed data — used only when localStorage is empty */
const SEED_WORKPLACES: Workplace[] = [
  { id: "wp-001", name: "Bean & Brew Café", suburb: "Carlton", industry: "Hospitality" },
  { id: "wp-002", name: "Golden Dragon Restaurant", suburb: "Melbourne CBD", industry: "Hospitality" },
  { id: "wp-003", name: "QuickMart Convenience", suburb: "Footscray", industry: "Retail" },
  { id: "wp-004", name: "SparkleClean Services", suburb: "Box Hill", industry: "Cleaning" },
];

const SEED_REVIEWS: Review[] = [
  { id: "rv-001", workplaceId: "wp-001", hourlyPay: 24.0, hoursWorked: 20, payslipProvided: true, isAnonymous: true, reviewerEmail: "", createdAt: "2024-06-10T09:00:00Z" },
  { id: "rv-002", workplaceId: "wp-001", hourlyPay: 22.0, hoursWorked: 15, payslipProvided: false, isAnonymous: false, reviewerEmail: "student@example.com", createdAt: "2024-07-02T14:30:00Z" },
  { id: "rv-003", workplaceId: "wp-002", hourlyPay: 18.5, hoursWorked: 25, payslipProvided: false, isAnonymous: true, reviewerEmail: "", createdAt: "2024-05-20T11:00:00Z" },
  { id: "rv-004", workplaceId: "wp-003", hourlyPay: 23.5, hoursWorked: 10, payslipProvided: true, isAnonymous: false, reviewerEmail: "another@example.com", createdAt: "2024-08-01T16:45:00Z" },
];

/* localStorage helpers */
const WP_KEY = "isfairwage_workplaces";
const RV_KEY = "isfairwage_reviews";

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* corrupt data — fall through to seed */ }
  return fallback;
}

export default function App() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>(() =>
    loadFromStorage(WP_KEY, SEED_WORKPLACES)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage(RV_KEY, SEED_REVIEWS)
  );

  useEffect(() => { localStorage.setItem(WP_KEY, JSON.stringify(workplaces)); }, [workplaces]);
  useEffect(() => { localStorage.setItem(RV_KEY, JSON.stringify(reviews)); }, [reviews]);

  /** PATTERN: Callbacks Up — called by AddWorkplacePage */
  function handleAddWorkplace(wp: Workplace) { setWorkplaces((prev) => [...prev, wp]); }

  /** PATTERN: Callbacks Up — called by SubmitReviewPage */
  function handleSubmitReview(rv: Review) { setReviews((prev) => [...prev, rv]); }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* PATTERN: Props Down — workplaces & reviews passed in */}
          <Route path="/home" element={<HomePage workplaces={workplaces} reviews={reviews} />} />
          {/* PATTERN: Props Down */}
          <Route path="/search" element={<SearchPage workplaces={workplaces} reviews={reviews} />} />
          {/* PATTERN: Props Down */}
          <Route path="/workplace/:id" element={<WorkplaceDetailPage workplaces={workplaces} reviews={reviews} />} />
          {/* PATTERN: Props Down + Callbacks Up */}
          <Route path="/submit-review/:id" element={<ProtectedRoute><SubmitReviewPage workplaces={workplaces} onSubmitReview={handleSubmitReview} /></ProtectedRoute>} />
          {/* PATTERN: Callbacks Up */}
          <Route path="/add-workplace" element={<ProtectedRoute><AddWorkplacePage onAddWorkplace={handleAddWorkplace} /></ProtectedRoute>} />
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
