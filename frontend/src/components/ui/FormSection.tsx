import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function FormSection({ title, subtitle, icon, children }: FormSectionProps) {
  return (
    <section aria-label={title} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg shrink-0">{icon}</span>}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {subtitle && <p className="text-gray-600 text-sm -mt-3">{subtitle}</p>}
      {children}
    </section>
  );
}
