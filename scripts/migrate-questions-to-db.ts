import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createRequire } from 'node:module';
import 'dotenv/config';

const require = createRequire(import.meta.url);

interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface BundledQuestion {
  id: string;
  topic: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface QuestionRow {
  id: string;
  level: 'professional' | 'sub-professional';
  topic: string;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option_id: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  is_active: boolean;
}

function loadEnvLocal() {
  for (const path of ['.env.local', '.env']) {
    const full = resolve(process.cwd(), path);
    if (!existsSync(full)) continue;
    const raw = readFileSync(full, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

loadEnvLocal();

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Missing credentials. Set SUPABASE_URL (or VITE_SUPABASE_URL) and\n' +
      'SUPABASE_SERVICE_ROLE_KEY in your environment or .env.local.\n' +
      'The service-role key is found in Supabase Dashboard -> Project\n' +
      'Settings -> API. It is NEVER shipped to the client, so this\n' +
      'script must be run locally; it cannot run on Vercel.',
  );
  process.exit(1);
}

const profQuestions = (
  require('../src/data/questions/professionalQuestions.ts') as {
    default?: BundledQuestion[];
  }
).default ?? [];
const subProfQuestions = (
  require('../src/data/questions/subProfessionalQuestions.ts') as {
    default?: BundledQuestion[];
  }
).default ?? [];

function toRow(q: BundledQuestion, level: 'professional' | 'sub-professional'): QuestionRow {
  const opts: Record<string, string> = {};
  for (const o of q.options) opts[o.id] = o.text;
  return {
    id: q.id,
    level,
    topic: q.topic,
    prompt: q.prompt,
    options: { A: opts.A ?? '', B: opts.B ?? '', C: opts.C ?? '', D: opts.D ?? '' },
    correct_option_id: q.correctOptionId,
    explanation: q.explanation,
    is_active: true,
  };
}

const rows: QuestionRow[] = [
  ...profQuestions.map((q) => toRow(q, 'professional')),
  ...subProfQuestions.map((q) => toRow(q, 'sub-professional')),
];

console.log(
  `Loaded ${profQuestions.length} professional + ${subProfQuestions.length} sub-professional questions from the JS bundle.`,
);

if (rows.length === 0) {
  console.error('No questions found in the bundled JS. Aborting.');
  process.exit(1);
}

const client: SupabaseClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BATCH_SIZE = 50;
let inserted = 0;
let failed = 0;
const start = Date.now();

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const { error, data } = await client
    .from('questions')
    .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
  if (error) {
    failed += batch.length;
    console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
  } else {
    inserted += (data ?? batch).length;
    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(rows.length / BATCH_SIZE)} ok (${batch.length} rows).`,
    );
  }
}

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(
  `\nDone in ${elapsed}s. inserted/updated: ${inserted}, failed: ${failed}, total: ${rows.length}.`,
);
console.log(
  'Re-runs are safe: existing rows are updated in place (ignoreDuplicates: false).',
);
