import { describe, expect, it } from 'vitest';

import { dragToMove } from './dragTurn';

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

  it('middle slices are ignored', () => {
    expect(dragToMove([0, 0, 1], [0, 0, 1], [1, 0, 0])).toBeNull();
  });
});
