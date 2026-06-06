import React from 'react';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateTitleTag = 'h1' | 'h2' | 'h3' | 'p' | 'span';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  size?: EmptyStateSize;
  titleAs?: EmptyStateTitleTag;
  className?: string;
}

interface SizeConfig {
  wrapper: string;
  icon: string;
  title: string;
  description: string;
  action: string;
}

const SIZE: Record<EmptyStateSize, SizeConfig> = {
  sm: {
    wrapper: 'py-8 text-center',
    icon: 'w-8 h-8',
    title: 'text-xs',
    description: 'text-xs opacity-70 mt-1',
    action: 'mt-6 bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded',
  },
  md: {
    wrapper: 'p-10 text-center',
    icon: 'w-10 h-10',
    title: 'text-sm',
    description: 'text-sm opacity-70 mt-2',
    action: 'mt-6 bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded',
  },
  lg: {
    wrapper: 'py-16 px-6 text-center',
    icon: 'w-12 h-12',
    title: 'text-base font-medium',
    description: 'text-sm opacity-70 mt-2 mb-6',
    action: 'bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded',
  },
};

/**
 * Centered placeholder shown when a list, page, or panel has no content.
 * Three sizes: `sm` for inline slots (e.g. an empty navigator tab),
 * `md` for cards, `lg` for full sections or whole pages. The title is a
 * `<p>` by default — pass `titleAs="h2"` when the empty state is the
 * primary heading of the page.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  titleAs = 'p',
  className = '',
}: EmptyStateProps) {
  const cfg = SIZE[size];
  const TitleTag = titleAs;
  return (
    <div className={`${cfg.wrapper} ${className}`}>
      {icon && (
        <div className={`${cfg.icon} mx-auto mb-4 text-on-surface-variant/30`}>{icon}</div>
      )}
      <TitleTag className={`text-on-surface-variant ${cfg.title}`}>{title}</TitleTag>
      {description && (
        <p className={`text-on-surface-variant ${cfg.description}`}>{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className={cfg.action}>
          {action.label}
        </button>
      )}
    </div>
  );
}
