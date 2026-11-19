import { useMemo, useState } from 'react';

import { CURRICULUM } from '../content/curriculum';
import type { Bilingual } from '../content/curriculum';
import { useI18n } from '../i18n';
import { applyMove, applyMoves, createSolvedState, parseNotation, stateToFacelets } from '../puzzle/engine';
import { evaluate } from '../puzzle/predicates';
import type { TargetPredicate } from '../puzzle/predicates';
import { CubeView } from '../render/CubeView';
import { loadState, updateState } from '../storage';
import type { CubeState, Move } from '../types/cube';
import { MovePad, useKeyboardMoves } from '../ui/controls';

const TARGET_LABELS: Record<TargetPredicate, Bilingual> = {
  daisy: { zh: '小花', en: 'Daisy' },
  cross: { zh: '白十字', en: 'White cross' },
  first_layer: { zh: '第一层', en: 'First layer' },
  two_layers: { zh: '前两层', en: 'Two layers' },
  ll_edges_oriented: { zh: '顶面十字', en: 'Yellow cross' },
  ll_corners_oriented: { zh: '顶面全黄', en: 'Yellow corners oriented' },
  ll_corners_placed: { zh: '顶角归位', en: 'Corners placed' },
  solved: { zh: '复原', en: 'Solved' },
};

type Notice = 'idle' | 'notyet' | 'done';

export function TutorialMode() {
  const { t, locale } = useI18n();
  const [chapterIndex, setChapterIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<CubeState>(createSolvedState);
  const [progress, setProgress] = useState<Record<string, string[]>>(() => loadState().tutorialProgress);
  const [notice, setNotice] = useState<Notice>('idle');

  const chapter = CURRICULUM[chapterIndex];
  const step = chapter.steps[Math.min(stepIndex, chapter.steps.length - 1)];
  const facelets = useMemo(() => stateToFacelets(state), [state]);
  const completed = progress[chapter.id] ?? [];
  const isDone = completed.includes(step.id);
  const bilingual = (value: Bilingual) => (locale === 'zh' ? value.zh : value.en);

  const onUserMove = (move: Move) => {
    setState((current) => applyMove(current, move));
    setNotice('idle');
  };
  useKeyboardMoves(onUserMove);

  const selectChapter = (index: number) => {
    setChapterIndex(index);
    setStepIndex(0);
    setState(createSolvedState());
    setNotice('idle');
  };

  const demo = () => {
    const moves = step.demo.moves ? parseNotation(step.demo.moves) : [];
    setState((current) => applyMoves(current, moves));
    setNotice('idle');
  };

  const reset = () => {
    setState(createSolvedState());
    setNotice('idle');
  };

  const check = () => {
    const ok = step.target == null ? true : evaluate(step.target, state);
    if (!ok) {
      setNotice('notyet');
      return;
    }
    const next = {
      ...progress,
      [chapter.id]: Array.from(new Set([...(progress[chapter.id] ?? []), step.id])),
    };
    setProgress(next);
    updateState((current) => ({ ...current, tutorialProgress: next }));
    setNotice('done');
    if (stepIndex + 1 < chapter.steps.length) setStepIndex(stepIndex + 1);
  };

  return (
    <section className="panel">
      <h2>{t('tutorial.title')}</h2>
      <p className="muted">{t('tutorial.desc')}</p>

      <div className="tutorial-layout">
        <aside className="chapters">
          <h3>{t('tutorial.chapters')}</h3>
          <ul>
            {CURRICULUM.map((item, index) => {
              const doneCount = (progress[item.id] ?? []).length;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={index === chapterIndex ? 'chapter active' : 'chapter'}
                    onClick={() => selectChapter(index)}
                  >
                    <span className="chapter-no">{index + 1}</span>
                    <span>{bilingual(item.title)}</span>
                    <span className="chapter-progress">
                      {doneCount}/{item.steps.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="lesson">
          <h3>{bilingual(chapter.title)}</h3>
          <p className="muted">{bilingual(chapter.goal)}</p>

          <div className="step-card">
            <div className="step-head">
              {t('tutorial.step', { n: stepIndex + 1 })} / {chapter.steps.length}
              {isDone && <span className="badge">✓</span>}
            </div>
            <h4 className="step-title">{bilingual(step.title)}</h4>
            <p className="step-text">{bilingual(step.explain)}</p>

            {step.notation && (
              <div className="step-row">
                <span className="muted small">Notation</span>
                <code className="step-moves">{step.notation}</code>
              </div>
            )}

            <div className="step-row">
              <span className="muted small">{t('tutorial.expect')}</span>
              <span className="step-expect">{bilingual(step.demo.expect)}</span>
            </div>

            {step.target && (
              <div className="step-row">
                <span className="muted small">{t('tutorial.target')}</span>
                <span className="badge-target">{bilingual(TARGET_LABELS[step.target])}</span>
              </div>
            )}
          </div>

          <div className="row wrap">
            <button type="button" onClick={demo}>
              {t('common.demo')}
            </button>
            <button type="button" onClick={reset}>
              {t('common.reset')}
            </button>
            <button type="button" onClick={check}>
              {t('tutorial.check')}
            </button>
          </div>

          {notice === 'notyet' && <div className="banner hint">{t('tutorial.targetNotMet')}</div>}
          {notice === 'done' && <div className="banner ok">{t('tutorial.targetMet')}</div>}

          <div className="stage">
            <CubeView facelets={facelets} onMove={onUserMove} />
          </div>

          <MovePad onMove={onUserMove} />
          <p className="muted small">{t('common.spaceHint')}</p>

          <div className="row">
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
            >
              {t('common.prev')}
            </button>
            <button
              type="button"
              disabled={stepIndex >= chapter.steps.length - 1}
              onClick={() => setStepIndex(Math.min(chapter.steps.length - 1, stepIndex + 1))}
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
