import { initSolver, solve } from '../puzzle/engine';
import type { CubeState, MoveSequence } from '../types/cube';

let solverReady = false;

/**
 * MVP hint: the Kociemba solver runs on the main thread. It is initialised
 * lazily on first use (~4-5s). The dedicated Web Worker version will replace
 * this path; kept here so the UI has a working fallback.
 */
export function ensureSolver(): void {
  if (solverReady) return;
  initSolver();
  solverReady = true;
}

export function fullSolution(state: CubeState): MoveSequence {
  ensureSolver();
  return solve(state);
}

/** The next move(s) to show as a hint — we surface a few moves, not just one. */
export function nextHint(state: CubeState, count = 3): MoveSequence {
  return fullSolution(state).slice(0, count);
}
