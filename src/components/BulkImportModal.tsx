import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileUp, Upload } from 'lucide-react';
import { Modal } from './Modal';
import {
  parseQuestionsCsv,
  type ParsedImportRow,
  type ParseQuestionsCsvResult,
} from '../utils/parseQuestionsCsv';
import {
  bulkInsertQuestions,
  type BulkInsertProgress,
} from '../lib/questions';
import { getSupabaseClient } from '../lib/supabase';
import { useToast } from './Toast';

type Phase = 'idle' | 'parsed' | 'importing' | 'done';

const EXAMPLE_CSV = [
  'id,level,topic,prompt,option_a,option_b,option_c,option_d,correct_option_id,explanation,is_active,difficulty,tags',
  ',professional,Verbal Ability,What is the largest island in the Philippines?,Luzon,Mindanao,Palawan,Visayas,A,Luzon is the largest island.,true,2,geography',
  ',sub-professional,Numerical Ability,What is 12 x 12?,100,120,144,200,C,12 squared is 144.,true,1,',
].join('\n');

export function BulkImportModal({
  open,
  onClose,
  onAfterImport,
}: {
  open: boolean;
  onClose: () => void;
  onAfterImport: () => Promise<void> | void;
}) {
  const { show } = useToast();
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [parseResult, setParseResult] = useState<ParseQuestionsCsvResult | null>(null);
  const [progress, setProgress] = useState<BulkInsertProgress | null>(null);
  const [importSummary, setImportSummary] = useState<{
    inserted: number;
    failed: number;
  } | null>(null);

  // Reset internal state when the modal closes so reopening
  // starts fresh.
  useEffect(() => {
    if (!open) {
      setText('');
      setPhase('idle');
      setParseResult(null);
      setProgress(null);
      setImportSummary(null);
    }
  }, [open]);

  const handleFile = async (file: File) => {
    const body = await file.text();
    setText(body);
    runParse(body);
  };

  const runParse = (body: string) => {
    const result = parseQuestionsCsv(body);
    setParseResult(result);
    setPhase('parsed');
  };

  const validRows = useMemo(
    () => (parseResult?.rows ?? []).filter((r) => r.values),
    [parseResult],
  );
  const errorRows = useMemo(
    () => (parseResult?.rows ?? []).filter((r) => !r.values),
    [parseResult],
  );

  const onImport = async () => {
    if (!parseResult || validRows.length === 0) return;
    setPhase('importing');
    setProgress(null);
    try {
      const client = getSupabaseClient();
      const result = await bulkInsertQuestions(
        client,
        validRows.map((r) => r.values as NonNullable<ParsedImportRow['values']>),
        {
          onProgress: (p) => setProgress(p),
        },
      );
      setImportSummary({ inserted: result.inserted, failed: result.failed });
      if (result.ok) {
        show(
          `Imported ${result.inserted} question${result.inserted === 1 ? '' : 's'}.`,
          'success',
        );
      } else {
        show(
          `Imported ${result.inserted}, ${result.failed} failed. See the modal for details.`,
          'error',
          8000,
        );
      }
      setPhase('done');
      await onAfterImport();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed.';
      show(`Import failed: ${msg}`, 'error');
      setPhase('parsed');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk import questions"
      panelClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-on-surface-variant">
          Paste CSV below, or pick a .csv file. Rows are validated
          before any database write — the import button is enabled
          only when at least one row is valid. Use the Export CSV
          button on the list to download a sample template.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1 cursor-pointer">
            <FileUp className="w-4 h-4" />
            Choose CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                // Reset so picking the same file twice re-triggers onChange.
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => runParse(text)}
            disabled={text.trim() === ''}
            className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all disabled:opacity-50"
          >
            Re-validate
          </button>
          <button
            type="button"
            onClick={() => {
              setText(EXAMPLE_CSV);
              runParse(EXAMPLE_CSV);
            }}
            className="text-xs text-on-surface-variant hover:text-on-surface underline self-center"
          >
            Load example
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (phase === 'parsed' || phase === 'done') {
              setPhase('idle');
              setParseResult(null);
            }
          }}
          rows={6}
          placeholder={'id,level,topic,prompt,option_a,option_b,option_c,option_d,correct_option_id,explanation\n,professional,Verbal Ability,Your question here?,Choice 1,Choice 2,Choice 3,Choice 4,A,Brief explanation…'}
          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-on-surface font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          aria-label="CSV input"
        />

        {parseResult && !parseResult.hasRequiredColumns && (
          <div className="bg-error-container/30 border border-error/30 rounded p-3 text-sm text-error">
            The header is missing one or more required columns:
            {' '}
            {errorRows[0]?.errors.join('; ')}
          </div>
        )}

        {parseResult && parseResult.hasRequiredColumns && phase !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-tertiary-container text-tertiary font-bold">
                <CheckCircle2 className="w-3 h-3" />
                {validRows.length} valid
              </span>
              {errorRows.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container text-error font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  {errorRows.length} invalid
                </span>
              )}
              {parseResult.detectedColumns.length > 0 && (
                <span className="text-on-surface-variant ml-auto">
                  Detected columns: {parseResult.detectedColumns.join(', ')}
                </span>
              )}
            </div>

            {errorRows.length > 0 && (
              <div className="bg-surface-container-low border border-outline-variant rounded max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-surface-container-high">
                    <tr className="text-left">
                      <th className="px-2 py-1">Line</th>
                      <th className="px-2 py-1">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorRows.map((r) => (
                      <tr key={r.line} className="border-t border-outline-variant/30">
                        <td className="px-2 py-1 font-mono">{r.line}</td>
                        <td className="px-2 py-1 text-error">
                          {r.errors.join('; ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {phase === 'importing' && progress && (
              <div className="text-xs text-on-surface-variant">
                Importing batch {progress.batchIndex + 1} of{' '}
                {progress.totalBatches} ({progress.insertedSoFar} inserted,{' '}
                {progress.failedSoFar} failed so far)…
              </div>
            )}

            {phase === 'done' && importSummary && (
              <div className="text-sm">
                {importSummary.failed === 0 ? (
                  <span className="text-tertiary">
                    Imported {importSummary.inserted} questions.
                  </span>
                ) : (
                  <span className="text-error">
                    Imported {importSummary.inserted}, {importSummary.failed} failed.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-surface-container-high border border-outline-variant text-on-surface px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all"
          >
            {phase === 'done' ? 'Close' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={
              !parseResult ||
              validRows.length === 0 ||
              phase === 'importing' ||
              phase === 'done'
            }
            aria-busy={phase === 'importing'}
            className="bg-primary text-on-primary px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            {phase === 'importing'
              ? 'Importing…'
              : phase === 'done'
              ? 'Done'
              : `Import ${validRows.length} question${validRows.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
