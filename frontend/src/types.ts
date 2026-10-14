/* ============================================================
 *  types.ts — Shared TypeScript interfaces
 * ============================================================ */

export interface Workplace {
  id: string;
  name: string;
  suburb: string;
  industry: string;
}

export interface Review {
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
