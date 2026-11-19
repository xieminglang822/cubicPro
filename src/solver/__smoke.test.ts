// TEMPORARY verification test for the solver worker protocol — deleted after use.
import { describe, it, expect, beforeAll } from 'vitest';

import {
  applyMoves,
  createSolvedState,
  initSolver,
  isSolved,
  randomMoveScramble,
  solve,
} from '../puzzle/engine';

interface Reply {
  type: string;
  id?: number;
  message?: string;
  moves?: unknown;
}

const replies: Reply[] = [];
let dispatch: ((event: MessageEvent) => void) | null = null;

function send(message: unknown): void {
  if (!dispatch) throw new Error('worker onmessage was never installed');
  dispatch({ data: message } as MessageEvent);
}

function take(): Reply[] {
  return replies.splice(0, replies.length);
}

beforeAll(async () => {
  const scope = {
    onmessage: null as null | ((event: MessageEvent) => void),
    postMessage: (message: Reply) => {
      replies.push(message);
    },
  };
  (globalThis as { self?: unknown }).self = scope;
  await import('./solver.worker');
  dispatch = scope.onmessage;
}, 120000);

describe('solver worker protocol', () => {
  it('init replies ready', () => {
    send({ type: 'init' });
    const out = take();
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ type: 'ready' });
  }, 120000);

  it('solves a scrambled state end-to-end', () => {
    initSolver();
    const scrambled = applyMoves(createSolvedState(), randomMoveScramble(30));

    send({ type: 'solve', id: 11, state: scrambled });
    const out = take();
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('solution');

    const moves = out[0].moves as ReturnType<typeof solve>;
    expect(moves.length).toBeGreaterThan(0);
    expect(isSolved(applyMoves(scrambled, moves))).toBe(true);

    // sanity: same solution as the direct engine call
    expect(moves).toEqual(solve(scrambled));
  }, 60000);

  it('scramble echoes the id and returns a non-empty move sequence', () => {
    send({ type: 'scramble', id: 42 });
    const out = take();
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('scramble');
    expect(out[0].id).toBe(42);
    const moves = out[0].moves as Array<{ face: string; turns: number }>;
    expect(moves.length).toBeGreaterThan(0);
    for (const move of moves) {
      expect(['U', 'R', 'F', 'D', 'L', 'B']).toContain(move.face);
      expect([1, 2, -1]).toContain(move.turns);
    }
  }, 60000);

  it('reports malformed messages as errors without an id', () => {
    send({ type: 'bogus' });
    const out = take();
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('error');
    expect(out[0].id).toBeUndefined();
    expect(typeof out[0].message).toBe('string');
  });
});
