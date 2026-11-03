import type { ReactNode } from "react";

interface PageHeadingProps {
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function PageHeading({
  label,
  title,
  description,
  actions,
}: PageHeadingProps) {
  return (
    <header className="panel flex flex-col items-start justify-between gap-5 p-6 lg:flex-row lg:items-end">
      <div className="min-w-0">
        <span className="console-label">{label}</span>
        <h1 className="font-display mt-2 break-words text-3xl font-extrabold leading-none text-[#f1fff6] sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-2.5 max-w-[62ch] text-lg font-bold leading-relaxed text-[#a6c6b3]">
          {description}
        </p>
      </div>
      {actions && (
        <nav className="grid w-full gap-2.5 sm:flex sm:w-auto">{actions}</nav>
      )}
    </header>
  );
}
