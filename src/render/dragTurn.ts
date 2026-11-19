import type { FaceName, Move } from '../types/cube';

type Vec3 = [number, number, number];

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function faceForAxis(axis: number, coordinate: number): FaceName {
  if (axis === 0) return coordinate > 0 ? 'R' : 'L';
  if (axis === 1) return coordinate > 0 ? 'U' : 'D';
  return coordinate > 0 ? 'F' : 'B';
}

/**
 * Derive the face turn from a drag gesture on a sticker.
 *
 * @param lattice  grabbed cubie lattice position, each component -1|0|1
 * @param normal   outward normal of the grabbed face (axis-aligned unit vector)
 * @param tangent  world-space drag direction on the face plane (axis-aligned)
 *
 * The rotation axis is `normal × tangent`; the grabbed cubie's coordinate on
 * that axis selects the layer, and the sign selects clockwise vs counter.
 * Middle slices (coordinate 0) return null — the app only turns outer faces.
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
  if (coordinate === 0) return null;

  const face = faceForAxis(axis, coordinate);
  // Outward normal of that face, and the +90° rotation direction from the drag.
  const outward = Math.sign(coordinate);
  const dot = axisVector[axis] * outward;
  // Clockwise (turns = 1) is a -90° rotation about the outward normal.
  const turns: 1 | -1 = dot > 0 ? -1 : 1;
  return { face, turns };
}
