import { getSolver } from '../solver/client';
import type { CubeState, MoveSequence } from '../types/cube';

/**
 * Hints are computed by the Kociemba solver inside a Web Worker, so the
 * ~4-5s table build never blocks the UI thread.
 */
export async function fullSolution(state: CubeState): Promise<MoveSequence> {
  return getSolver().solve(state);
}

/** The next few moves to show as a hint (not just one). */
export async function nextHint(state: CubeState, count = 3): Promise<MoveSequence> {
  const solution = await fullSolution(state);
  return solution.slice(0, count);
}

/** Kick off the one-time solver initialisation early (best effort). */
export function warmUpSolver(): void {
  getSolver()
    .init()
    .catch(() => {
      /* the next solve() call retries */
    });
}
