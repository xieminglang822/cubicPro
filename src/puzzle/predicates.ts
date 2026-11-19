import { stateToFacelets } from './engine';
import { SOLVED_FACELETS } from '../types/cube';
import type { CubeState } from '../types/cube';

/**
 * Target predicates from the tutorial curriculum. They grade a cube *state*
 * (not the learner's keystrokes), using Kociemba facelet order:
 * U(0-8) R(9-17) F(18-26) D(27-35) L(36-44) B(45-53).
 */
export type TargetPredicate =
  | 'daisy'
  | 'cross'
  | 'first_layer'
  | 'two_layers'
  | 'll_edges_oriented'
  | 'll_corners_oriented'
  | 'll_corners_placed'
  | 'solved';

const U_CENTER = 4;
const U_EDGES = [1, 3, 5, 7];
const U_CORNERS = [0, 2, 6, 8];

const D_FACE = [27, 28, 29, 30, 31, 32, 33, 34, 35];
const D_EDGES = [28, 30, 32, 34];

const F_TOP = [18, 19, 20];
const R_TOP = [9, 10, 11];
const B_TOP = [45, 46, 47];
const L_TOP = [36, 37, 38];
const F_MID = [21, 22, 23];
const R_MID = [12, 13, 14];
const B_MID = [48, 49, 50];
const L_MID = [39, 40, 41];
const F_BOTTOM = [24, 25, 26];
const R_BOTTOM = [15, 16, 17];
const B_BOTTOM = [51, 52, 53];
const L_BOTTOM = [42, 43, 44];

const F_BOTTOM_MID = 25;
const R_BOTTOM_MID = 16;
const B_BOTTOM_MID = 52;
const L_BOTTOM_MID = 43;

function allAre(f: string, indices: number[], letter: string): boolean {
  return indices.every((index) => f[index] === letter);
}

function setEquals(f: string, indices: number[], letters: string): boolean {
  const actual = indices.map((index) => f[index]).sort().join('');
  const expected = letters.split('').sort().join('');
  return actual === expected;
}

export function evaluate(target: TargetPredicate, state: CubeState): boolean {
  const f = stateToFacelets(state);
  switch (target) {
    case 'daisy':
      return f[U_CENTER] === 'U' && allAre(f, U_EDGES, 'D');
    case 'cross':
      return (
        allAre(f, D_EDGES, 'D') &&
        f[F_BOTTOM_MID] === 'F' &&
        f[R_BOTTOM_MID] === 'R' &&
        f[B_BOTTOM_MID] === 'B' &&
        f[L_BOTTOM_MID] === 'L'
      );
    case 'first_layer':
      return (
        allAre(f, D_FACE, 'D') &&
        allAre(f, F_BOTTOM, 'F') &&
        allAre(f, R_BOTTOM, 'R') &&
        allAre(f, B_BOTTOM, 'B') &&
        allAre(f, L_BOTTOM, 'L')
      );
    case 'two_layers':
      return (
        allAre(f, D_FACE, 'D') &&
        allAre(f, F_BOTTOM, 'F') &&
        allAre(f, R_BOTTOM, 'R') &&
        allAre(f, B_BOTTOM, 'B') &&
        allAre(f, L_BOTTOM, 'L') &&
        allAre(f, F_MID, 'F') &&
        allAre(f, R_MID, 'R') &&
        allAre(f, B_MID, 'B') &&
        allAre(f, L_MID, 'L')
      );
    case 'll_edges_oriented':
      return allAre(f, U_EDGES, 'U');
    case 'll_corners_oriented':
      return allAre(f, U_CORNERS, 'U');
    case 'll_corners_placed':
      return (
        setEquals(f, [8, 9, 20], 'URF') &&
        setEquals(f, [6, 18, 38], 'UFL') &&
        setEquals(f, [0, 36, 47], 'ULB') &&
        setEquals(f, [2, 11, 45], 'UBR')
      );
    case 'solved':
      return f === SOLVED_FACELETS;
  }
}
