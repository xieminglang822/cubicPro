import { useEffect } from 'react';

import type { FaceName, Move } from '../types/cube';

const FACE_KEYS: Record<string, FaceName> = {
  u: 'U',
  d: 'D',
  l: 'L',
  r: 'R',
  f: 'F',
  b: 'B',
};

const ORDER: FaceName[] = ['U', 'D', 'L', 'R', 'F', 'B'];

/** Map a keyboard event to a Move, or null. Shift = counter-clockwise. */
export function keyToMove(event: KeyboardEvent): Move | null {
  const target = event.target as HTMLElement | null;
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return null;
  const face = FACE_KEYS[event.key.toLowerCase()];
  if (!face) return null;
  return { face, turns: event.shiftKey ? -1 : 1 };
}

export function useKeyboardMoves(onMove: (move: Move) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      const move = keyToMove(event);
      if (move) {
        event.preventDefault();
        onMove(move);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onMove, enabled]);
}

export function MovePad({ onMove, disabled }: { onMove: (move: Move) => void; disabled?: boolean }) {
  return (
    <div className="movepad">
      {ORDER.map((face) => (
        <div className="movepad-pair" key={face}>
          <button type="button" disabled={disabled} onClick={() => onMove({ face, turns: 1 })}>
            {face}
          </button>
          <button type="button" disabled={disabled} onClick={() => onMove({ face, turns: -1 })}>
            {face}&apos;
          </button>
        </div>
      ))}
    </div>
  );
}
