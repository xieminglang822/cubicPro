import { useState } from 'react';

import { useI18n } from './i18n';
import type { Locale } from './i18n';
import { ChallengeMode } from './modes/ChallengeMode';
import { FreeMode } from './modes/FreeMode';
import { TutorialMode } from './modes/TutorialMode';
import { useUiSettings } from './settings/UiSettings';
import { loadState, updateState } from './storage';

type Tab = 'tutorial' | 'free' | 'challenge' | 'settings';

const TABS: Tab[] = ['tutorial', 'free', 'challenge', 'settings'];

function SettingsView() {
  const { t, locale, setLocale } = useI18n();
  const { assistMode, setAssistMode } = useUiSettings();

  const changeLocale = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as Locale);
  };

  const resetProgress = () => {
    if (typeof window !== 'undefined' && !window.confirm(t('settings.resetProgress') + '?')) return;
    updateState((state) => ({
      ...state,
      bestTimeMs: null,
      records: [],
      tutorialProgress: {},
    }));
    window.location.reload();
  };

  return (
    <section className="panel">
      <h2>{t('settings.title')}</h2>

      <label className="field">
        {t('settings.language')}
        <select value={locale} onChange={changeLocale}>
          <option value="en">{t('lang.en')}</option>
          <option value="zh">{t('lang.zh')}</option>
        </select>
      </label>

      <label className="field toggle-row">
        <input
          type="checkbox"
          checked={assistMode}
          onChange={(event) => setAssistMode(event.target.checked)}
        />
        {t('settings.assist')}
      </label>
      <p className="muted small">{t('settings.assistDesc')}</p>

      <div className="row">
        <button type="button" onClick={resetProgress}>
          {t('settings.resetProgress')}
        </button>
      </div>

      <div className="credits">
        <h3>{t('tutorial.credits')}</h3>
        <p className="small">
          {locale === 'zh'
            ? '课程章节结构参考 learn-cube（MIT 许可，© 2025 ramkrishna-js）。转动记号遵循 Singmaster 标准。'
            : 'Curriculum structure adapted from learn-cube (MIT License, © 2025 ramkrishna-js). Move notation follows the Singmaster standard.'}
        </p>
        <p className="small muted">
          {locale === 'zh'
            ? '术语与步骤顺序核对参考：维基教科书《三阶魔方解法》、《How to Solve the Rubik\u2019s Cube》、Speedsolving.com Wiki（均为 CC BY-SA 4.0）；本课程文字为 cubicPro 原创，未复制上述来源的文字或图片。'
            : 'Terminology and step ordering cross-checked against Wikibooks, Wikibooks \u201cHow to Solve the Rubik\u2019s Cube\u201d, and the Speedsolving.com Wiki (all CC BY-SA 4.0). Lesson text is original to cubicPro; no text or images from those sources are reproduced.'}
        </p>
        <p className="small">
          <a href="./NOTICE.md" target="_blank" rel="noreferrer">
            NOTICE.md
          </a>
        </p>
      </div>
    </section>
  );
}

export function App() {
  const { t, locale, setLocale } = useI18n();
  const [tab, setTab] = useState<Tab>('tutorial');
  const [version] = useState(() => loadState().version);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="logo" aria-hidden>
            ◼
          </span>
          <div>
            <strong>{t('app.title')}</strong>
            <div className="muted small">{t('app.subtitle')}</div>
          </div>
        </div>

        <nav className="tabs" aria-label="main">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              className={tab === key ? 'tab active' : 'tab'}
              onClick={() => setTab(key)}
            >
              {t(`nav.${key}`)}
            </button>
          ))}
        </nav>

        <div className="lang">
          <button type="button" onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}>
            {locale === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>

      <main>
        {tab === 'tutorial' && <TutorialMode />}
        {tab === 'free' && <FreeMode />}
        {tab === 'challenge' && <ChallengeMode />}
        {tab === 'settings' && <SettingsView />}
      </main>

      <footer className="app-footer muted small">
        <span>
          cubicPro v0.x ·{' '}
          <a href="https://github.com/ldez/cubejs" target="_blank" rel="noreferrer">
            cubejs
          </a>{' '}
          (MIT) · {t('app.subtitle')}
        </span>
        <span>state v{version}</span>
      </footer>
    </div>
  );
}
