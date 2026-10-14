import type { Badge } from "../../types";

interface SafetyBadgeProps {
  status: Badge;
  size?: "sm" | "md";
}

const sizeClasses: Record<"sm" | "md", string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

const statusStyles: Record<Badge, { label: string; classes: string }> = {
  green:             { label: "Likely Fair Pay",    classes: "bg-green-100 text-green-800 border border-green-300" },
  amber:             { label: "Possibly Underpaid", classes: "bg-amber-100 text-amber-800 border border-amber-300" },
  red:               { label: "Likely Underpaid",   classes: "bg-red-100 text-red-800 border border-red-300" },
  "not-enough-data": { label: "Not Enough Data",    classes: "bg-gray-100 text-gray-600 border border-gray-300" },
};

export default function SafetyBadge({ status, size = "md" }: SafetyBadgeProps) {
  const { label, classes } = statusStyles[status];
  return (
    <span className={`inline-block rounded-full font-semibold ${sizeClasses[size]} ${classes}`}>
      {label}
    </span>
  );
}
