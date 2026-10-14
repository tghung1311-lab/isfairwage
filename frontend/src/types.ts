/* ============================================================
 *  types.ts — Shared TypeScript interfaces
 * ============================================================ */

export type Badge = "green" | "amber" | "red" | "not-enough-data";

export interface WorkplaceSummary {
  id: string;
  name: string;
  suburb: string;
  industry: string;
  review_count: number;
  average_hourly_pay: number | null;
  badge: Badge;
}

export interface WorkplaceReview {
  id: string;
  hourly_pay: number;
  hours_worked: number;
  payslip_provided: boolean;
  is_anonymous: boolean;
  created_at: string;
  reviewer_label: string;
}

export interface WorkplaceDetail extends WorkplaceSummary {
  minimum_wage: number;
  reviews: WorkplaceReview[];
}

export interface CreateWorkplaceData {
  name: string;
  suburb: string;
  industry: string;
}

export interface CreateReviewData {
  hourly_pay: number;
  hours_worked: number;
  payslip_provided: boolean;
  is_anonymous: boolean;
}

export interface CreateReviewResponse {
  review: WorkplaceReview;
  review_count: number;
  average_hourly_pay: number | null;
  badge: Badge;
}
