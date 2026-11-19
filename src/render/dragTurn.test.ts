import { describe, expect, it } from 'vitest';

import { dragToMove } from './dragTurn';

type Vec3 = [number, number, number];

const AXES: Vec3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

describe('dragToMove', () => {
  it('dragging the front-top-right sticker right is U′', () => {
    expect(dragToMove([1, 1, 1], [0, 0, 1], [1, 0, 0])).toEqual({ face: 'U', turns: -1 });
  });

  it('dragging the front-top-left sticker right is also U′', () => {
    expect(dragToMove([-1, 1, 1], [0, 0, 1], [1, 0, 0])).toEqual({ face: 'U', turns: -1 });
  });

  it('dragging the front-right sticker up turns R', () => {
    expect(dragToMove([1, 0, 1], [0, 0, 1], [0, 1, 0])).toEqual({ face: 'R', turns: 1 });
  });

  it('dragging the front-top-right sticker down turns R′', () => {
    expect(dragToMove([1, 1, 1], [0, 0, 1], [0, -1, 0])).toEqual({ face: 'R', turns: -1 });
  });

  it('dragging the bottom-front sticker right turns D', () => {
    expect(dragToMove([1, -1, 1], [0, 0, 1], [1, 0, 0])).toEqual({ face: 'D', turns: 1 });
  });

  it('dragging the top centre right turns the S slice', () => {
    expect(dragToMove([0, 1, 0], [0, 1, 0], [1, 0, 0])).toEqual({ face: 'S', turns: 1 });
  });

  it('dragging the front centre right turns the E slice', () => {
    expect(dragToMove([0, 0, 1], [0, 0, 1], [1, 0, 0])).toEqual({ face: 'E', turns: 1 });
  });

  it('dragging the front centre up turns the M slice counter-clockwise', () => {
    expect(dragToMove([0, 0, 1], [0, 0, 1], [0, 1, 0])).toEqual({ face: 'M', turns: -1 });
  });

  it('never returns null for any grabbed cubie, outward face and in-plane drag', () => {
    const positions: Vec3[] = [];
    for (const x of [-1, 0, 1]) {
      for (const y of [-1, 0, 1]) {
        for (const z of [-1, 0, 1]) {
          if (x === 0 && y === 0 && z === 0) continue;
          positions.push([x, y, z]);
        }
      }
    }

    let checked = 0;
    for (const pos of positions) {
      for (const axis of AXES) {
        for (const sign of [-1, 1]) {
          const normal: Vec3 = [axis[0] * sign, axis[1] * sign, axis[2] * sign];
          if (dot(pos, normal) !== 1) continue; // normal must be the grabbed face's normal
          for (const tangentAxis of AXES) {
            if (dot(tangentAxis, normal) !== 0) continue;
            for (const tangentSign of [-1, 1]) {
              const tangent: Vec3 = [
                tangentAxis[0] * tangentSign,
                tangentAxis[1] * tangentSign,
                tangentAxis[2] * tangentSign,
              ];
              const move = dragToMove(pos, normal, tangent);
              expect(move, JSON.stringify({ pos, normal, tangent })).not.toBeNull();
              checked += 1;
            }
          }
        }
      }
    }
    // 8 corners * 3 normals * 4 drags + 12 edges * 2 * 4 + 6 centres * 1 * 4
    expect(checked).toBe(216);
  });
});
