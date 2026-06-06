import type { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standard "panel" used for grouped content across dashboard, performance,
 * and support screens. Centralises the Tailwind chain so spacing/styling
 * stays in sync.
 */
export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <section
      className={`bg-surface-container-low border border-outline-variant rounded p-6 md:p-8 ${className}`}
    >
      {children}
    </section>
  );
}
