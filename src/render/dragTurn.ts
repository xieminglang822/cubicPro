import type { Move, MoveFace } from '../types/cube';

type Vec3 = [number, number, number];

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function outerFaceForAxis(axis: number, coordinate: number): MoveFace {
  if (axis === 0) return coordinate > 0 ? 'R' : 'L';
  if (axis === 1) return coordinate > 0 ? 'U' : 'D';
  return coordinate > 0 ? 'F' : 'B';
}

// Slice moves follow their reference face: M follows L (-x), E follows D (-y),
// S follows F (+z). `sliceReference[axis]` is the sign of that reference normal.
const SLICE_FOR_AXIS: Record<number, MoveFace> = { 0: 'M', 1: 'E', 2: 'S' };
const SLICE_REFERENCE: Record<number, number> = { 0: -1, 1: -1, 2: 1 };

/**
 * Derive the turn from a drag gesture on a sticker.
 *
 * @param lattice  grabbed cubie lattice position, each component -1|0|1
 * @param normal   outward normal of the grabbed face (axis-aligned unit vector)
 * @param tangent  world-space drag direction on the face plane (axis-aligned)
 *
 * The rotation axis is `normal × tangent`; the grabbed cubie's coordinate on
 * that axis selects the layer. Coordinate ±1 is an outer face turn; coordinate
 * 0 is the middle slice (M/E/S). The sign of the cross product selects
 * clockwise vs counter-clockwise.
 */
export function dragToMove(lattice: Vec3, normal: Vec3, tangent: Vec3): Move | null {
  const axisVector = cross(normal, tangent);
  let axis = -1;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(axisVector[i]) > 0.5) {
      axis = i;
      break;
    }
  }
  if (axis < 0) return null;

  const coordinate = lattice[axis];

  if (coordinate === 0) {
    // Middle slice. A clockwise slice turn is -90° about its reference normal,
    // so a +90° rotation about `axisVector` is clockwise when the dot is < 0.
    const dot = axisVector[axis] * SLICE_REFERENCE[axis];
    return { face: SLICE_FOR_AXIS[axis], turns: dot > 0 ? -1 : 1 };
  }

  const face = outerFaceForAxis(axis, coordinate);
  const outward = Math.sign(coordinate);
  const dot = axisVector[axis] * outward;
  // Clockwise (turns = 1) is a -90° rotation about the outward normal.
  const turns: 1 | -1 = dot > 0 ? -1 : 1;
  return { face, turns };
}
