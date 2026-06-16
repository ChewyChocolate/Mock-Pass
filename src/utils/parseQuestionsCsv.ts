import { QUESTION_TOPICS_BY_LEVEL, type ExamLevel, type QuestionTopic } from '../types';

/**
 * Result of parsing one row of a bulk-import CSV. The parser is
 * deliberately strict: rows with any validation error are
 * reported in `errors` and excluded from `rows`, so the caller
 * can surface a preview ("12 of 15 rows valid") and let the
 * admin confirm before any DB write happens.
 */
export interface ParsedImportRow {
  /** 1-based line number in the original CSV (header = 1). */
  line: number;
  /** The raw CSV row, in column order, trimmed. */
  cells: string[];
  /** Parsed values; present iff the row passed all checks. The
   * `id` field is the user-supplied id (or empty string when the
   * row had no id column / empty id); bulkInsertQuestions assigns
   * a fresh id from the q-adm-* namespace when the value is the
   * empty string. */
  values?: {
    id: string;
    level: ExamLevel;
    topic: QuestionTopic;
    prompt: string;
    options: { A: string; B: string; C: string; D: string };
    correct_option_id: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    is_active: boolean;
    difficulty: number | null;
    tags: string[];
  };
  /** Empty array on success; one entry per validation failure. */
  errors: string[];
}

export interface ParseQuestionsCsvResult {
  rows: ParsedImportRow[];
  /** True iff the input had a parseable header row. */
  headerOk: boolean;
  /** True iff the header has the required minimum columns. */
  hasRequiredColumns: boolean;
  /** The list of column names detected (header cells, trimmed). */
  detectedColumns: string[];
}

const REQUIRED_COLUMNS = [
  'level',
  'topic',
  'prompt',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'correct_option_id',
  'explanation',
] as const;
const OPTIONAL_COLUMNS = [
  'id',
  'is_active',
  'difficulty',
  'tags',
] as const;

const VALID_LEVELS: ReadonlySet<ExamLevel> = new Set<ExamLevel>([
  'professional',
  'sub-professional',
]);

function isValidLevel(s: string): s is ExamLevel {
  return VALID_LEVELS.has(s as ExamLevel);
}

function isValidTopic(level: ExamLevel, s: string): s is QuestionTopic {
  const allowed = QUESTION_TOPICS_BY_LEVEL[level];
  return (allowed as readonly string[]).includes(s);
}

/**
 * Parse a single CSV physical line, honoring RFC 4180 quoted
 * fields. The returned array may have length < or > the column
 * count: short rows get empty strings appended, long rows have
 * the extras joined into the last cell (caller is responsible
 * for flagging the row as having too many columns).
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          // Escaped quote inside a quoted field.
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

/**
 * Split a CSV body into physical lines, respecting RFC 4180
 * quoted newlines. The returned lines do not include the
 * trailing newline.
 */
function splitCsvLines(body: string): string[] {
  const lines: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (ch === '"') {
      const next = body[i + 1];
      if (inQuotes && next === '"') {
        // Escaped quote: keep both, stay inQuotes.
        cur += '""';
        i += 1;
      } else {
        // Quote start/end.
        cur += ch;
        inQuotes = !inQuotes;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && body[i + 1] === '\n') i += 1;
      lines.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.length > 0) lines.push(cur);
  return lines;
}

/**
 * Parse the body of a CSV file into per-row validation results.
 * The first non-empty line is treated as the header. Every
 * subsequent non-empty line is one data row. Empty lines are
 * skipped (line numbers in errors refer to the original 1-based
 * CSV line including blanks).
 */
export function parseQuestionsCsv(body: string): ParseQuestionsCsvResult {
  const lines = splitCsvLines(body);
  const result: ParseQuestionsCsvResult = {
    rows: [],
    headerOk: false,
    hasRequiredColumns: false,
    detectedColumns: [],
  };

  let header: string[] | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    if (raw.trim() === '') continue;
    if (header === null) {
      header = parseCsvLine(raw).map((c) => c.trim().toLowerCase());
      result.detectedColumns = header;
      result.headerOk = true;
      result.hasRequiredColumns = REQUIRED_COLUMNS.every((c) => header!.includes(c));
      if (!result.hasRequiredColumns) {
        // Surface the missing required columns via the first
        // error row so the UI can render a clear message.
        result.rows.push({
          line: i + 1,
          cells: header,
          errors: REQUIRED_COLUMNS.filter((c) => !header!.includes(c)).map(
            (c) => `Missing required column: ${c}`,
          ),
        });
      }
      continue;
    }
    const cells = parseCsvLine(raw);
    const errors: string[] = [];
    const row: ParsedImportRow = { line: i + 1, cells, errors };
    result.rows.push(row);

    if (cells.length < REQUIRED_COLUMNS.length + OPTIONAL_COLUMNS.length - 2) {
      // Loose minimum: at least the required columns worth of cells.
      if (cells.length < REQUIRED_COLUMNS.length) {
        errors.push(
          `Row has ${cells.length} cells, expected at least ${REQUIRED_COLUMNS.length}.`,
        );
      }
    }

    const get = (name: string) => {
      const idx = header!.indexOf(name);
      if (idx < 0) return undefined;
      return cells[idx]?.trim() ?? '';
    };

    const level = get('level') ?? '';
    if (!isValidLevel(level)) {
      errors.push(`Invalid level: "${level}". Must be professional or sub-professional.`);
    }
    const topic = get('topic') ?? '';
    if (!level || !isValidLevel(level)) {
      // skip topic validation when level is already wrong
    } else if (!isValidTopic(level, topic)) {
      errors.push(
        `Invalid topic "${topic}" for level "${level}". Allowed: ${QUESTION_TOPICS_BY_LEVEL[level].join(', ')}.`,
      );
    }
    const prompt = get('prompt') ?? '';
    if (prompt.length < 10) {
      errors.push('Prompt must be at least 10 characters.');
    } else if (prompt.length > 4000) {
      errors.push('Prompt must be at most 4000 characters.');
    }
    const optA = get('option_a') ?? '';
    const optB = get('option_b') ?? '';
    const optC = get('option_c') ?? '';
    const optD = get('option_d') ?? '';
    for (const [letter, value] of [
      ['A', optA],
      ['B', optB],
      ['C', optC],
      ['D', optD],
    ] as const) {
      if (value.length === 0) errors.push(`Option ${letter} is empty.`);
      else if (value.length > 1000) errors.push(`Option ${letter} exceeds 1000 characters.`);
    }
    const correct = get('correct_option_id') ?? '';
    if (!['A', 'B', 'C', 'D'].includes(correct)) {
      errors.push(`correct_option_id must be one of A, B, C, D (got "${correct}").`);
    }
    const explanation = get('explanation') ?? '';
    if (explanation.length === 0) {
      errors.push('Explanation is required.');
    } else if (explanation.length > 4000) {
      errors.push('Explanation must be at most 4000 characters.');
    }

    // Optional is_active. Default true; only "false" disables.
    const isActiveRaw = get('is_active');
    if (isActiveRaw === undefined || isActiveRaw === '') {
      // ok, default true
    } else if (!/^(true|false)$/i.test(isActiveRaw)) {
      errors.push(`is_active must be true or false (got "${isActiveRaw}").`);
    }

    // Optional difficulty: 1-5 or empty.
    const difficultyRaw = get('difficulty');
    let difficulty: number | null = null;
    if (difficultyRaw !== undefined && difficultyRaw !== '') {
      const n = Number(difficultyRaw);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        errors.push(`difficulty must be an integer 1-5 (got "${difficultyRaw}").`);
      } else {
        difficulty = n;
      }
    }

    // Optional tags: comma-separated list.
    const tagsRaw = get('tags') ?? '';
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (errors.length === 0 && isValidLevel(level) && isValidTopic(level, topic)) {
      const id = get('id') ?? '';
      row.values = {
        id,
        level,
        topic,
        prompt,
        options: { A: optA, B: optB, C: optC, D: optD },
        correct_option_id: correct as 'A' | 'B' | 'C' | 'D',
        explanation,
        is_active: isActiveRaw === undefined || isActiveRaw === '' ? true : /^true$/i.test(isActiveRaw),
        difficulty,
        tags,
      };
    }
  }

  return result;
}
