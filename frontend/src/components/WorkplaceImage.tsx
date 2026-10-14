import { useEffect, useState } from "react";

interface WorkplaceImageProps {
  imageUrl: string | null;
  name: string;
  industry: string;
  className?: string;
}

const fallbackClasses: Record<string, string> = {
  Hospitality: "bg-amber-100 text-amber-800",
  Retail: "bg-blue-100 text-blue-800",
  Cleaning: "bg-emerald-100 text-emerald-800",
};

export default function WorkplaceImage({ imageUrl, name, industry, className = "" }: WorkplaceImageProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const fallbackClass = fallbackClasses[industry] ?? "bg-slate-100 text-slate-700";

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!imageUrl || hasImageError) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl text-4xl font-extrabold ${fallbackClass} ${className}`}
        aria-label={`${name} placeholder`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${name} workplace`}
      loading="lazy"
      onError={() => setHasImageError(true)}
      className={`rounded-xl object-cover ${className}`}
    />
  );
}