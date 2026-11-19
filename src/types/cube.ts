/**
 * Core cube types shared across the engine, solver, renderer and modes.
 *
 * Cubie-state convention (Kociemba / cubejs compatible):
 *  - cp[i] = home-index of the corner piece occupying corner position i
 *  - co[i] = corner orientation (0..2) at position i
 *  - ep[i] = home-index of the edge piece occupying edge position i
 *  - eo[i] = edge orientation (0..1) at position i
 * Solved state is cp=[0..7], co=0, ep=[0..11], eo=0.
 */

export type FaceName = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

/** A single face turn. turns: 1 = clockwise 90, 2 = 180, -1 = counter-clockwise 90. */
export interface Move {
  face: FaceName;
  turns: 1 | 2 | -1;
}

export type MoveSequence = Move[];

export interface CubeState {
  cp: number[];
  co: number[];
  ep: number[];
  eo: number[];
}

export const FACES: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];

/** Standard Kociemba facelet order: U(0-8) R(9-17) F(18-26) D(27-35) L(36-44) B(45-53). */
export const SOLVED_FACELETS = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB';
