import { describe, it, expect } from 'vitest';

import {
  applyMove,
  applyMoves,
  createSolvedState,
  formatNotation,
  initSolver,
  invertMoves,
  isSolved,
  parseNotation,
  randomMoveScramble,
  solve,
} from './engine';

import type { FaceName } from '../types/cube';

const ALL_FACES: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];

describe('engine core', () => {
  it('a solved state is solved', () => {
    expect(isSolved(createSolvedState())).toBe(true);
  });

  it('a move and its inverse cancel', () => {
    const s = applyMoves(createSolvedState(), parseNotation("R U F' D2 L B"));
    const back = applyMoves(s, invertMoves(parseNotation("R U F' D2 L B")));
    expect(isSolved(back)).toBe(true);
  });

  it('each face applied four times is the identity', () => {
    for (const face of ALL_FACES) {
      let s = createSolvedState();
      for (let i = 0; i < 4; i++) s = applyMove(s, { face, turns: 1 });
      expect(isSolved(s), `face ${face}`).toBe(true);
    }
  });

  it('the sexy move has order 6', () => {
    const sexy = parseNotation("R U R' U'");
    let s = createSolvedState();
    for (let i = 0; i < 6; i++) s = applyMoves(s, sexy);
    expect(isSolved(s)).toBe(true);
  });

  it('notation round-trips', () => {
    const notation = "R U2 R' F2 D' L B2";
    expect(formatNotation(parseNotation(notation))).toBe(notation);
  });

  it('a scramble followed by its inverse is solved', () => {
    for (let k = 0; k < 5; k++) {
      const scramble = randomMoveScramble(25);
      const s = applyMoves(createSolvedState(), scramble);
      expect(isSolved(applyMoves(s, invertMoves(scramble)))).toBe(true);
    }
  });

  it('the Kociemba solver solves a random state', () => {
    initSolver();
    const s = applyMoves(createSolvedState(), randomMoveScramble(30));
    const solution = solve(s);
    expect(solution.length).toBeGreaterThan(0);
    expect(isSolved(applyMoves(s, solution))).toBe(true);
  }, 60000);

  it('supports middle-slice moves and tracks centres', () => {
    const solved = createSolvedState();
    const s = applyMoves(solved, parseNotation('S'));
    expect(isSolved(s)).toBe(false);
    expect(s.center).not.toEqual(solved.center);
    expect(isSolved(applyMoves(s, parseNotation("S'")))).toBe(true);
  });

  it('the M slice has order 4', () => {
    let s = createSolvedState();
    for (let i = 0; i < 4; i++) s = applyMove(s, { face: 'M', turns: 1 });
    expect(isSolved(s)).toBe(true);
  });

  it('the solver solves a slice-scrambled cube', () => {
    initSolver();
    const s = applyMoves(createSolvedState(), parseNotation('S M E F R U'));
    const solution = solve(s);
    expect(isSolved(applyMoves(s, solution))).toBe(true);
  }, 60000);

  it('random scrambles are never reported solved', () => {
    for (let i = 0; i < 300; i++) {
      const s = applyMoves(createSolvedState(), randomMoveScramble(25));
      expect(isSolved(s), `scramble ${i}`).toBe(false);
    }
  });
});
