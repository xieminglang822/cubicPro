import { describe, expect, it } from 'vitest';

import { applyMoves, createSolvedState, parseNotation } from './engine';
import { evaluate } from './predicates';

describe('target predicates', () => {
  it('a solved cube satisfies the layer-oriented predicates', () => {
    const state = createSolvedState();
    for (const target of [
      'cross',
      'first_layer',
      'two_layers',
      'll_edges_oriented',
      'll_corners_oriented',
      'll_corners_placed',
      'solved',
    ] as const) {
      expect(evaluate(target, state), target).toBe(true);
    }
    expect(evaluate('daisy', state)).toBe(false);
  });

  it('a scrambled cube is not solved', () => {
    const state = applyMoves(createSolvedState(), parseNotation("R U R' U' F2 D"));
    expect(evaluate('solved', state)).toBe(false);
    expect(evaluate('two_layers', state)).toBe(false);
  });

  it('the daisy demo produces the daisy predicate', () => {
    const state = applyMoves(createSolvedState(), parseNotation('F2 R2 B2 L2'));
    expect(evaluate('daisy', state)).toBe(true);
  });

  it('the four-move trigger returns to solved after six runs', () => {
    const sexy = parseNotation("R U R' U'");
    let state = createSolvedState();
    for (let i = 0; i < 6; i++) state = applyMoves(state, sexy);
    expect(evaluate('solved', state)).toBe(true);
  });
});
