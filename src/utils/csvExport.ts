import type { AdminQuestion } from '../lib/questions';

/**
 * Escape a single CSV cell. Wraps in double quotes if the value
 * contains a comma, double-quote, CR, or LF; doubles embedded
 * double-quotes. Returns the original value otherwise (cheaper).
 */
function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Serialize a list of AdminQuestion rows to a CSV string. The
 * header row uses human-readable column names. Options are emitted
 * as four separate columns (option_a, option_b, option_c, option_d)
 * for spreadsheet compatibility; the JSON form is also kept as
 * option_json for round-tripping.
 */
export function questionsToCsv(rows: AdminQuestion[]): string {
  const header = [
    'id',
    'level',
    'topic',
    'prompt',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_option_id',
    'explanation',
    'is_active',
  ];
  const lines = [header.map(csvCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.level,
        r.topic,
        r.prompt,
        r.options.A,
        r.options.B,
        r.options.C,
        r.options.D,
        r.correct_option_id,
        r.explanation,
        r.is_active ? 'true' : 'false',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // Trailing newline is friendlier to most spreadsheet importers.
  return lines.join('\r\n') + '\r\n';
}

/**
 * Trigger a browser download of `content` as a file with the
 * given name. Works in modern browsers via a temporary <a> with a
 * blob: URL. No-op in non-browser test environments.
 */
export function downloadCsv(filename: string, content: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Append to body so Firefox respects the click; remove after.
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revocation so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
