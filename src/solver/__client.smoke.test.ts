// TEMPORARY verification test for SolverClient — deleted after use.
// A fake Worker routes messages into the real solver.worker module in-process.
import { describe, it, expect, beforeAll } from 'vitest';

import { applyMoves, createSolvedState, isSolved, randomMoveScramble } from '../puzzle/engine';
import { SolverClient, getSolver } from './client';
import type { CubeState } from '../types/cube';

// --- fake Worker ------------------------------------------------------------
type Handler<T> = ((event: T) => void) | null;
let current: FakeWorker | null = null;
let alive = 0;

const workerScope = {
  onmessage: null as Handler<MessageEvent>,
  postMessage(message: unknown): void {
    const target = current;
    queueMicrotask(() => target?.onmessage?.({ data: message } as MessageEvent));
  },
};

class FakeWorker {
  onmessage: Handler<MessageEvent> = null;
  onerror: Handler<ErrorEvent> = null;
  onmessageerror: Handler<MessageEvent> = null;
  terminated = false;

  constructor(_url: URL, _options?: { type: 'module' }) {
    current = this;
    alive += 1;
  }

  postMessage(message: unknown): void {
    if (this.terminated) throw new Error('FakeWorker: postMessage after terminate');
    workerScope.onmessage?.({ data: message } as MessageEvent);
  }

  terminate(): void {
    this.terminated = true;
    alive -= 1;
    if (current === this) current = null;
  }
}

(globalThis as { Worker?: unknown }).Worker = FakeWorker;
(globalThis as { self?: unknown }).self = workerScope;

beforeAll(async () => {
  await import('./solver.worker');
}, 120000);

function scrambled(): CubeState {
  return applyMoves(createSolvedState(), randomMoveScramble(25));
}

describe('SolverClient', () => {
  it('init is idempotent and resolves on ready', async () => {
    const client = new SolverClient();
    expect(client.isReady).toBe(false);
    const first = client.init();
    const second = client.init();
    expect(second).toBe(first);
    await first;
    expect(client.isReady).toBe(true);
    await expect(client.init()).resolves.toBeUndefined();
    client.terminate();
  }, 120000);

  it('solve and scramble round-trip through the worker', async () => {
    const client = new SolverClient();
    const state = scrambled();
    const moves = await client.solve(state);
    expect(moves.length).toBeGreaterThan(0);
    expect(isSolved(applyMoves(state, moves))).toBe(true);

    const scrambleMoves = await client.scramble();
    expect(scrambleMoves.length).toBeGreaterThan(0);
    for (const move of scrambleMoves) {
      expect(['U', 'R', 'F', 'D', 'L', 'B']).toContain(move.face);
      expect([1, 2, -1]).toContain(move.turns);
    }
    client.terminate();
  }, 120000);

  it('handles concurrent requests with distinct ids', async () => {
    const client = new SolverClient();
    const a = scrambled();
    const b = scrambled();
    const [ra, rb] = await Promise.all([client.solve(a), client.solve(b), client.scramble()]);
    expect(isSolved(applyMoves(a, ra))).toBe(true);
    expect(isSolved(applyMoves(b, rb))).toBe(true);
    client.terminate();
  }, 120000);

  it('rejects in-flight work and refuses new work after terminate', async () => {
    const client = new SolverClient();
    const pending = client.solve(scrambled());
    client.terminate();
    await expect(pending).rejects.toThrow(/terminated/);
    await expect(client.solve(scrambled())).rejects.toThrow(/terminated/);
    await expect(client.init()).rejects.toThrow(/terminated/);
    client.terminate(); // idempotent
  }, 60000);

  it('getSolver returns a stable singleton', () => {
    const a = getSolver();
    expect(getSolver()).toBe(a);
    expect(a.isReady).toBe(false);
  });
});
