/**
 * Cube engine — a thin, typed wrapper around cubejs (MIT, Petri Lehtinen /
 * Ludovic Fernandez, https://github.com/ldez/cubejs). See NOTICE.md for
 * attribution. cubejs already implements Kociemba's two-phase solver.
 */
import Cube from 'cubejs';
import 'cubejs/lib/solve';

import type { CubeState, FaceName, Move, MoveFace, MoveSequence } from '../types/cube';

const Ctor = Cube as unknown as typeof Cube;
type CubeInstance = InstanceType<typeof Cube>;

// CubeState mirrors cubejs's cubie representation, including the centre
// permutation (slice moves like M/E/S rotate centres).
function toCube(state: CubeState): CubeInstance {
  return new Ctor({
    center: state.center.slice(),
    cp: state.cp.slice(),
    co: state.co.slice(),
    ep: state.ep.slice(),
    eo: state.eo.slice(),
  });
}

function toState(cube: CubeInstance): CubeState {
  const j = cube.toJSON();
  return {
    center: j.center.slice(),
    cp: j.cp.slice(),
    co: j.co.slice(),
    ep: j.ep.slice(),
    eo: j.eo.slice(),
  };
}

export function createSolvedState(): CubeState {
  return toState(new Ctor());
}

export function applyMove(state: CubeState, move: Move): CubeState {
  const c = toCube(state);
  c.move(formatMove(move));
  return toState(c);
}

export function applyMoves(state: CubeState, moves: MoveSequence): CubeState {
  if (moves.length === 0) return state;
  const c = toCube(state);
  c.move(formatNotation(moves));
  return toState(c);
}

/**
 * A cube is solved when all six faces are single-coloured. This is orientation
 * independent, so a slice / whole-cube turn that leaves every face uniform
 * still counts as solved.
 */
export function isSolved(state: CubeState): boolean {
  const facelets = stateToFacelets(state);
  for (let face = 0; face < 6; face++) {
    const first = facelets[face * 9];
    for (let i = 1; i < 9; i++) {
      if (facelets[face * 9 + i] !== first) return false;
    }
  }
  return true;
}

export function parseMoveToken(token: string): Move {
  const m = /^([URFDLBMES])(2|')?$/.exec(token.trim());
  if (!m) throw new Error(`Invalid move token: "${token}"`);
  const face = m[1] as MoveFace;
  const turns = m[2] === '2' ? 2 : m[2] === "'" ? -1 : 1;
  return { face, turns };
}

export function parseNotation(notation: string): MoveSequence {
  return notation
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseMoveToken);
}

export function formatMove(move: Move): string {
  return move.face + (move.turns === 2 ? '2' : move.turns === -1 ? "'" : '');
}

export function formatNotation(moves: MoveSequence): string {
  return moves.map(formatMove).join(' ');
}

export function invertMove(move: Move): Move {
  return { face: move.face, turns: move.turns === 2 ? 2 : (-move.turns as 1 | -1) };
}

export function invertMoves(moves: MoveSequence): MoveSequence {
  return moves
    .slice()
    .reverse()
    .map(invertMove);
}

/** Cubie state -> 54-char facelet string (Kociemba order). Used by the renderer. */
export function stateToFacelets(state: CubeState): string {
  return toCube(state).asString();
}

/**
 * Cheap scramble: a random move sequence that avoids an immediately repeating
 * face. Good enough for difficulty tiers; not a uniform random state.
 */
export function randomMoveScramble(
  length: number,
  rng: () => number = Math.random,
): MoveSequence {
  const moves: MoveSequence = [];
  const faces: FaceName[] = ['U', 'D', 'L', 'R', 'F', 'B'];
  let lastFace: FaceName | null = null;
  for (let i = 0; i < length; i++) {
    let face: FaceName;
    do {
      face = faces[Math.floor(rng() * faces.length)];
    } while (face === lastFace);
    lastFace = face;
    const r = rng();
    const turns: 1 | 2 | -1 = r < 0.25 ? 2 : r < 0.6 ? 1 : -1;
    moves.push({ face, turns });
  }
  return moves;
}

/**
 * Uniform random-state scramble via cubejs. Requires the solver to be
 * initialised (several seconds) — call from a Web Worker, not the main thread.
 */
export function randomStateScramble(): MoveSequence {
  const scramble = (Ctor as unknown as { scramble(): string }).scramble();
  return scramble ? parseNotation(scramble) : [];
}

/** Initialise the Kociemba solver tables (~4-5s). Call once, in a Worker. */
export function initSolver(): void {
  (Ctor as unknown as { initSolver(): void }).initSolver();
}

export function solve(state: CubeState): MoveSequence {
  const c = toCube(state);
  return parseNotation(c.solve());
}
