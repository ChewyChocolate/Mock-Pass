import type { QuestionTopic } from '../types';

interface TopicAccentClasses {
  /** Solid button (active topic tab in exam navigator). */
  active: string;
  /** Soft pill (counter badge inside the tab). */
  badge: string;
  /** Focus ring color. */
  ring: string;
  /** Border accent for outlined chips (review screen). */
  border: string;
  /** Foreground color that pairs with `border`. */
  text: string;
}

/**
 * Single source of truth for per-topic color tiers. Keep the old per-topic
 * `bg-X / text-X` pairings stable; both `topicAccentClasses` (used by the
 * exam navigator's active tabs) and `topicAccentBorderText` (used by the
 * review screen's question chips) read from this map.
 */
const ACCENTS: Record<QuestionTopic, TopicAccentClasses> = {
  'Verbal Ability': {
    active: 'bg-primary text-on-primary border-primary',
    badge: 'bg-primary-container text-primary',
    ring: 'ring-primary',
    border: 'border-primary/40',
    text: 'text-primary',
  },
  'Analytical Reasoning': {
    active: 'bg-tertiary text-on-tertiary border-tertiary',
    badge: 'bg-tertiary-container text-tertiary',
    ring: 'ring-tertiary',
    border: 'border-tertiary/40',
    text: 'text-tertiary',
  },
  'Numerical Ability': {
    active: 'bg-terracotta text-white border-terracotta',
    badge: 'bg-terracotta/15 text-terracotta',
    ring: 'ring-terracotta',
    border: 'border-terracotta/40',
    text: 'text-terracotta',
  },
  'General Information': {
    active: 'bg-secondary text-on-secondary border-secondary',
    badge: 'bg-secondary-container text-secondary',
    ring: 'ring-secondary',
    border: 'border-secondary/40',
    text: 'text-secondary',
  },
  'Clerical Ability': {
    active: 'bg-secondary text-on-secondary border-secondary',
    badge: 'bg-secondary-container text-secondary',
    ring: 'ring-secondary',
    border: 'border-secondary/40',
    text: 'text-secondary',
  },
};

export function topicAccentClasses(topic: QuestionTopic): TopicAccentClasses {
  return ACCENTS[topic];
}

export function topicAccentBorderText(topic: QuestionTopic): string {
  const a = ACCENTS[topic];
  return `${a.border} ${a.text}`;
}
