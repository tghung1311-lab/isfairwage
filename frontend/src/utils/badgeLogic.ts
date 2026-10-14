/* ============================================================
 *  utils/badgeLogic.ts
 *
 *  Pure function that computes a pay-safety badge by comparing
 *  a workplace's average reported hourly pay against the
 *  Australian national minimum wage.
 *
 *  Badge meanings:
 *    green           — avg pay ≥ 110 % of minimum wage
 *    amber           — avg pay ≥ 90 % and < 110 %
 *    red             — avg pay < 90 %
 *    not-enough-data — no reviews yet
 * ============================================================ */

export type Badge = "green" | "amber" | "red" | "not-enough-data";

/** 2025-26 Australian casual minimum wage (national min wage $26.44 + 25% casual loading; per hour, AUD) */
export const MINIMUM_WAGE = 33.05;

export function computeBadge(averageHourlyPay: number | null): Badge {
  if (averageHourlyPay === null || averageHourlyPay <= 0) {
    return "not-enough-data";
  }

  const ratio = averageHourlyPay / MINIMUM_WAGE;

  if (ratio >= 1.1) return "green";
  if (ratio >= 0.9) return "amber";
  return "red";
}

/** Helper: calculate average hourly pay from an array of hourlyPay values */
export function averageHourlyPay(pays: number[]): number | null {
  if (pays.length === 0) return null;
  const sum = pays.reduce((acc, p) => acc + p, 0);
  return sum / pays.length;
}

/** Human-readable label for a badge */
export function badgeLabel(badge: Badge): string {
  switch (badge) {
    case "green":
      return "Likely Fair Pay";
    case "amber":
      return "Possibly Underpaid";
    case "red":
      return "Likely Underpaid";
    case "not-enough-data":
      return "Not Enough Data";
  }
}

/** Tailwind background/text colour classes for each badge */
export function badgeClasses(badge: Badge): string {
  switch (badge) {
    case "green":
      return "bg-green-100 text-green-800 border border-green-300";
    case "amber":
      return "bg-amber-100 text-amber-800 border border-amber-300";
    case "red":
      return "bg-red-100 text-red-800 border border-red-300";
    case "not-enough-data":
      return "bg-gray-100 text-gray-600 border border-gray-300";
  }
}
