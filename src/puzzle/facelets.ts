import type { FaceName } from '../types/cube';

/**
 * Mapping between Kociemba facelet indices (U,R,F,D,L,B order) and 3D cubie
 * lattice coordinates. Lattice coords are in {-1,0,1}; the sticker normal is
 * the outward unit axis of the face it sits on.
 */
export interface FaceletCell {
  index: number;
  face: FaceName;
  pos: [number, number, number];
  normal: [number, number, number];
}

export const FACE_ORDER: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];

const NORMALS: Record<FaceName, [number, number, number]> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

export function faceletCell(index: number): FaceletCell {
  const face = FACE_ORDER[Math.floor(index / 9)];
  const k = index % 9;
  const row = Math.floor(k / 3);
  const col = k % 3;
  let pos: [number, number, number];
  switch (face) {
    case 'U':
      pos = [col - 1, 1, row - 1];
      break;
    case 'D':
      pos = [col - 1, -1, 1 - row];
      break;
    case 'F':
      pos = [col - 1, 1 - row, 1];
      break;
    case 'B':
      pos = [1 - col, 1 - row, -1];
      break;
    case 'R':
      pos = [1, 1 - row, 1 - col];
      break;
    case 'L':
      pos = [-1, 1 - row, col - 1];
      break;
  }
  return { index, face, pos, normal: NORMALS[face] };
}

/** Standard sticker palette (letter -> css color). */
export const STANDARD_PALETTE: Record<string, string> = {
  U: '#f8fafc',
  R: '#dc2626',
  F: '#16a34a',
  D: '#facc15',
  L: '#f97316',
  B: '#2563eb',
};

export function stickerColor(letter: string, palette: Record<string, string> = STANDARD_PALETTE): string {
  return palette[letter] ?? '#475569';
}
