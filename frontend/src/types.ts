/* ============================================================
 *  types.ts — Shared TypeScript interfaces
 * ============================================================ */

import type { Badge } from "./utils/badgeLogic";

export interface LocalWorkplace {
  id: string;
  name: string;
  suburb: string;
  industry: string;
}

export interface LocalReview {
  id: string;
  workplaceId: string;
  hourlyPay: number;
  hoursWorked: number;
  payslipProvided: boolean;
  isAnonymous: boolean;
  /** Only shown when isAnonymous is false */
  reviewerEmail: string;
  createdAt: string; // ISO date string
}

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
