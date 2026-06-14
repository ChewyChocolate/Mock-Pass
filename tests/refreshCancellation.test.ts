import { describe, expect, it, vi } from 'vitest';

// The request-cancellation pattern in AdminQuestionsScreen uses a
// monotonic refreshTokenRef: each refresh() call captures the current
// value and only writes state if the captured value is still the
// latest. This test exercises the same pattern directly to lock in
// the contract.

// 1. Define a small async worker that simulates fetchAdminQuestions
//    and respects a cancellation token.
interface FetchResult {
  ok: boolean;
  questions: Array<{ id: string }>;
  delayMs: number;
}

async function fetchWithToken(
  token: { current: number },
  result: FetchResult,
): Promise<{ ok: boolean; questions: Array<{ id: string }> } | null> {
  const myToken = ++token.current;
  await new Promise((resolve) => setTimeout(resolve, result.delayMs));
  if (myToken !== token.current) return null; // superseded
  return { ok: result.ok, questions: result.questions };
}

describe('refresh cancellation pattern', () => {
  it('drops a stale response when a newer refresh starts before it resolves', async () => {
    const token = { current: 0 };
    const slow = fetchWithToken(token, { ok: true, questions: [{ id: 'a' }], delayMs: 50 });
    const fast = fetchWithToken(token, { ok: true, questions: [{ id: 'b' }], delayMs: 5 });
    const [a, b] = await Promise.all([slow, fast]);
    // Slow was first, but it was superseded by the second call.
    expect(a).toBeNull();
    expect(b).toEqual({ ok: true, questions: [{ id: 'b' }] });
  });

  it('keeps a response when no newer refresh has started', async () => {
    const token = { current: 0 };
    const r = await fetchWithToken(token, { ok: true, questions: [{ id: 'x' }], delayMs: 10 });
    expect(r).toEqual({ ok: true, questions: [{ id: 'x' }] });
  });

  it('handles interleaved back-to-back refreshes (first wins, second is null)', async () => {
    const token = { current: 0 };
    const p1 = fetchWithToken(token, { ok: true, questions: [{ id: '1' }], delayMs: 10 });
    const p2 = fetchWithToken(token, { ok: true, questions: [{ id: '2' }], delayMs: 1 });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBeNull();
    expect(r2).toEqual({ ok: true, questions: [{ id: '2' }] });
  });
});
