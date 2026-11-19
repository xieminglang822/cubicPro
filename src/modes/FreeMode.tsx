import { useCallback, useEffect, useMemo, useState } from 'react';

import { useI18n } from '../i18n';
import {
  applyMove,
  applyMoves,
  createSolvedState,
  formatNotation,
  isSolved,
  parseNotation,
  randomMoveScramble,
  stateToFacelets,
} from '../puzzle/engine';
import { CubeView } from '../render/CubeView';
import type { CubeState, Move, MoveSequence } from '../types/cube';
import { MovePad, useKeyboardMoves } from '../ui/controls';
import { nextHint, warmUpSolver } from './hint';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_LENGTH: Record<Difficulty, number> = { easy: 8, medium: 15, hard: 25 };

export function FreeMode() {
  const { t } = useI18n();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [state, setState] = useState<CubeState>(createSolvedState);
  const [moves, setMoves] = useState<Move[]>([]);
  const [scrambled, setScrambled] = useState(false);
  const [hint, setHint] = useState<MoveSequence | null>(null);
  const [hintBusy, setHintBusy] = useState(false);

  const facelets = useMemo(() => stateToFacelets(state), [state]);
  const solved = scrambled && isSolved(state);

  const onUserMove = useCallback((move: Move) => {
    setState((s) => applyMove(s, move));
    setMoves((prev) => [...prev, move]);
    setHint(null);
  }, []);

  useKeyboardMoves(onUserMove);

  // Build the solver tables in the worker while the user is still scrambling.
  useEffect(() => {
    warmUpSolver();
  }, []);

  const doScramble = () => {
    const scramble = randomMoveScramble(DIFFICULTY_LENGTH[difficulty]);
    setState(applyMoves(createSolvedState(), scramble));
    setMoves([]);
    setScrambled(true);
    setHint(null);
  };

  const reset = () => {
    setState(createSolvedState());
    setMoves([]);
    setScrambled(false);
    setHint(null);
  };

  const askHint = () => {
    setHintBusy(true);
    nextHint(state, 3)
      .then((moves) => setHint(moves))
      .catch(() => setHint(null))
      .finally(() => setHintBusy(false));
  };

  return (
    <section className="panel">
      <h2>{t('free.title')}</h2>
      <p className="muted">{t('free.desc')}</p>

      <div className="row wrap">
        <label className="field">
          {t('free.difficulty')}
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
            <option value="easy">{t('free.easy')}</option>
            <option value="medium">{t('free.medium')}</option>
            <option value="hard">{t('free.hard')}</option>
          </select>
        </label>
        <button type="button" onClick={doScramble}>
          {t('common.scramble')}
        </button>
        <button type="button" onClick={reset}>
          {t('common.reset')}
        </button>
        <button type="button" onClick={askHint} disabled={hintBusy || !scrambled}>
          {hintBusy ? t('common.solving') : t('common.hint')}
        </button>
      </div>

      <div className="stage">
        <CubeView facelets={facelets} />
      </div>

      {solved && (
        <div className="banner ok">
          {t('common.solved')} · {t('common.movesCount', { n: moves.length })}
        </div>
      )}
      {hint && hint.length > 0 && (
        <div className="banner hint">
          {t('common.hint')}: <code>{formatNotation(hint)}</code>
        </div>
      )}

      <MovePad onMove={onUserMove} />
      <p className="muted small">{t('common.spaceHint')}</p>
    </section>
  );
}
