import { useMemo, useState } from 'react';

import { TUTORIAL_CHAPTERS } from '../content/tutorial';
import { useI18n } from '../i18n';
import { applyMoves, createSolvedState, parseNotation, stateToFacelets } from '../puzzle/engine';
import { CubeView } from '../render/CubeView';
import { loadState, updateState } from '../storage';
import type { CubeState } from '../types/cube';

export function TutorialMode() {
  const { t, locale } = useI18n();
  const [chapterIndex, setChapterIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<CubeState>(createSolvedState);
  const [progress, setProgress] = useState<Record<string, string[]>>(() => loadState().tutorialProgress);

  const chapter = TUTORIAL_CHAPTERS[chapterIndex];
  const step = chapter.steps[Math.min(stepIndex, chapter.steps.length - 1)];
  const facelets = useMemo(() => stateToFacelets(state), [state]);

  const completed = progress[chapter.id] ?? [];
  const isDone = completed.includes(step.id);

  const selectChapter = (index: number) => {
    setChapterIndex(index);
    setStepIndex(0);
  };

  const demo = () => {
    const moves = step.moves ? parseNotation(step.moves) : [];
    setState(applyMoves(createSolvedState(), moves));
  };

  const reset = () => setState(createSolvedState());

  const markDone = () => {
    const next = {
      ...progress,
      [chapter.id]: Array.from(new Set([...(progress[chapter.id] ?? []), step.id])),
    };
    setProgress(next);
    updateState((current) => ({ ...current, tutorialProgress: next }));
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
            {TUTORIAL_CHAPTERS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={index === chapterIndex ? 'chapter active' : 'chapter'}
                  onClick={() => selectChapter(index)}
                >
                  <span className="chapter-no">{index + 1}</span>
                  <span>{locale === 'zh' ? item.titleZh : item.titleEn}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="lesson">
          <h3>{locale === 'zh' ? chapter.titleZh : chapter.titleEn}</h3>
          <p className="muted">{locale === 'zh' ? chapter.goalZh : chapter.goalEn}</p>

          <div className="step-card">
            <div className="step-head">
              {t('tutorial.step', { n: stepIndex + 1 })} / {chapter.steps.length}
              {isDone && <span className="badge">✓</span>}
            </div>
            <p className="step-text">{locale === 'zh' ? step.zh : step.en}</p>
            {step.moves && <code className="step-moves">{step.moves}</code>}
          </div>

          <div className="row wrap">
            <button type="button" onClick={demo}>
              {t('common.demo')}
            </button>
            <button type="button" onClick={reset}>
              {t('common.reset')}
            </button>
            <button type="button" onClick={markDone}>
              {t('common.done')}
            </button>
          </div>

          <div className="stage">
            <CubeView facelets={facelets} />
          </div>

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
