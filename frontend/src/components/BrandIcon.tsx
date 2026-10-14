interface BrandIconProps {
  className?: string;
}

export default function BrandIcon({ className }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
    >
      <path d="M32 4 55 13v17c0 15-9.7 25.5-23 30C18.7 55.5 9 45 9 30V13L32 4Z" fill="currentColor" />
      <path d="M32 10 49 17v13c0 11.2-6.8 20.1-17 24.2C21.8 50.1 15 41.2 15 30V17l17-7Z" fill="#dbeafe" />
      <path d="M34.8 20.4c-1.1-.6-2.4-.9-3.8-.9-3.9 0-6.5 2.1-6.5 5.4 0 3 2.1 4.4 5.7 5.5 2.5.8 3.3 1.3 3.3 2.5 0 1.1-1 1.9-2.9 1.9-1.7 0-3.4-.6-4.8-1.6l-2 4c1.6 1.2 3.6 1.9 5.8 2.1V43h4v-3.9c3.8-.8 6-3.1 6-6.5 0-3.5-2.3-5.1-6-6.3-2.2-.7-3.1-1.2-3.1-2.3 0-.9.8-1.6 2.5-1.6 1.4 0 2.7.4 4 1.1l1.8-3.8Z" fill="currentColor" />
    </svg>
  );
}