import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useI18n } from '../i18n';
import {
  applyMove,
  applyMoves,
  createSolvedState,
  isSolved,
  randomMoveScramble,
  stateToFacelets,
} from '../puzzle/engine';
import { CubeView } from '../render/CubeView';
import { useUiSettings } from '../settings/UiSettings';
import { loadState, updateState } from '../storage';
import type { CubeState, FaceName, Move } from '../types/cube';
import { AssistToggle } from '../ui/AssistToggle';
import { MovePad, useKeyboardMoves } from '../ui/controls';

function formatTime(ms: number): string {
  const total = Math.max(0, ms);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const hundredths = Math.floor((total % 1000) / 10);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

export function ChallengeMode() {
  const { t } = useI18n();
  const { assistMode } = useUiSettings();
  const [state, setState] = useState<CubeState>(createSolvedState);
  const [scrambled, setScrambled] = useState(false);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(() => loadState().bestTimeMs);
  const [elapsed, setElapsed] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [newRecord, setNewRecord] = useState(false);

  const stateRef = useRef<CubeState>(state);
  const scrambledRef = useRef(false);
  const runningRef = useRef(false);
  const startRef = useRef<number | null>(null);

  const facelets = useMemo(() => stateToFacelets(state), [state]);
  const assistLabels = {
    layer: (face: FaceName) => `${t(`face.${face}`)} ${t('assist.layer')}`,
    cw: t('assist.cw'),
    ccw: t('assist.ccw'),
  };

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (startRef.current != null) setElapsed(performance.now() - startRef.current);
    }, 50);
    return () => window.clearInterval(timer);
  }, [running]);

  const finish = useCallback(() => {
    if (startRef.current == null) return;
    const time = performance.now() - startRef.current;
    runningRef.current = false;
    setRunning(false);
    setFinished(time);
    setElapsed(time);
    const isRecord = best == null || time < best;
    setNewRecord(isRecord);
    if (isRecord) setBest(time);
    const snapshot = stateRef.current;
    void snapshot;
    updateState((current) => ({
      ...current,
      bestTimeMs: current.bestTimeMs == null || time < current.bestTimeMs ? time : current.bestTimeMs,
      records: [{ timeMs: time, scramble: '', date: new Date().toISOString() }, ...current.records].slice(0, 50),
    }));
  }, [best]);

  const onUserMove = useCallback(
    (move: Move) => {
      if (finished != null) return;
      const next = applyMove(stateRef.current, move);
      stateRef.current = next;
      setState(next);
      setMoveCount((count) => count + 1);
      if (startRef.current == null) {
        startRef.current = performance.now();
        runningRef.current = true;
        setRunning(true);
      }
      if (scrambledRef.current && isSolved(next)) {
        finish();
      }
    },
    [finish, finished],
  );

  useKeyboardMoves(onUserMove);

  const doScramble = () => {
    const scramble = randomMoveScramble(25);
    const start = applyMoves(createSolvedState(), scramble);
    stateRef.current = start;
    setState(start);
    scrambledRef.current = true;
    setScrambled(true);
    setFinished(null);
    setFinished(null);
    setNewRecord(false);
    setMoveCount(0);
    setElapsed(0);
    runningRef.current = false;
    setRunning(false);
    startRef.current = null;
  };

  return (
    <section className="panel">
      <h2>{t('challenge.title')}</h2>
      <p className="muted">{t('challenge.desc')}</p>

      <div className="row wrap">
        <button type="button" onClick={doScramble}>
          {t('common.scramble')}
        </button>
        <div className="stat">
          <span className="stat-label">{t('challenge.timer')}</span>
          <span className="stat-value">{formatTime(elapsed)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('challenge.best')}</span>
          <span className="stat-value">{best == null ? '—' : formatTime(best)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">{t('common.moves')}</span>
          <span className="stat-value">{moveCount}</span>
        </div>
      </div>

      <div className="stage">
        <CubeView
          facelets={facelets}
          onMove={onUserMove}
          assistEnabled={assistMode}
          assistLabels={assistLabels}
        />
        <AssistToggle />
      </div>

      {scrambled && !running && finished == null && (
        <div className="banner hint">{t('common.firstMoveStarts')}</div>
      )}
      {finished != null && (
        <div className={`banner ${newRecord ? 'ok' : 'hint'}`}>
          {newRecord ? t('challenge.newRecord') : t('common.solved')} · {formatTime(finished)}
        </div>
      )}

      <MovePad onMove={onUserMove} disabled={finished != null} />
      <p className="muted small">{t('common.spaceHint')}</p>
    </section>
  );
}
