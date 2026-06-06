import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  id: string;
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * Click-to-expand panel with a rotating chevron. Centralises the
 * `aria-expanded`/`aria-controls`, the `rotate-180` swap, and the
 * `overflow-hidden transition-all duration-300` collapse.
 */
export function Accordion({ id, title, open, onToggle, children }: AccordionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        <span className="font-semibold text-on-surface pr-4">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        id={id}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
