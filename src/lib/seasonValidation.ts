import type { SeasonFormValues } from '../types';

export interface SeasonValidation {
  ok: boolean;
  error?: string;
}

const LABEL_MAX = 60;
const LABEL_MIN = 3;
const WINDOW_MIN_DAYS = 1;
const WINDOW_MAX_DAYS = 365;

export function validateSeasonForm(values: SeasonFormValues): SeasonValidation {
  const label = values.label.trim();
  if (label.length < LABEL_MIN) {
    return { ok: false, error: `Label must be at least ${LABEL_MIN} characters.` };
  }
  if (label.length > LABEL_MAX) {
    return { ok: false, error: `Label must be at most ${LABEL_MAX} characters.` };
  }

  const exam = Date.parse(values.examDate);
  const starts = Date.parse(values.startsAt);
  const ends = Date.parse(values.endsAt);
  if (Number.isNaN(exam)) return { ok: false, error: 'Exam date is required.' };
  if (Number.isNaN(starts)) return { ok: false, error: 'Start date is required.' };
  if (Number.isNaN(ends)) return { ok: false, error: 'End date is required.' };

  if (ends <= starts) {
    return { ok: false, error: 'End date must be after the start date.' };
  }
  if (exam < starts) {
    return { ok: false, error: 'Exam date must be on or after the start date.' };
  }
  if (exam > ends) {
    return { ok: false, error: 'Exam date must be on or before the end date.' };
  }

  const days = (ends - starts) / 86_400_000;
  if (days < WINDOW_MIN_DAYS) {
    return { ok: false, error: `Window must be at least ${WINDOW_MIN_DAYS} day.` };
  }
  if (days > WINDOW_MAX_DAYS) {
    return { ok: false, error: `Window must be at most ${WINDOW_MAX_DAYS} days.` };
  }

  return { ok: true };
}

/**
 * Suggest smart defaults for a new season: 60 days from now until the day
 * after the exam. The exam date itself defaults to 61 days out.
 */
export function defaultSeasonValues(now: Date = new Date()): SeasonFormValues {
  const isoDate = (d: Date) => d.toISOString().slice(0, 10);
  const isoDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00`;
  };
  const exam = new Date(now);
  exam.setDate(exam.getDate() + 61);
  const start = new Date(now);
  start.setDate(start.getDate() + 60);
  const end = new Date(exam);
  end.setDate(end.getDate() + 1);
  return {
    label: '',
    examDate: isoDate(exam),
    startsAt: isoDateTimeLocal(start),
    endsAt: isoDateTimeLocal(end),
  };
}
