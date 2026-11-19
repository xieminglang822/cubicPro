import { useState } from 'react';

import { useI18n } from './i18n';
import type { Locale } from './i18n';
import { ChallengeMode } from './modes/ChallengeMode';
import { FreeMode } from './modes/FreeMode';
import { TutorialMode } from './modes/TutorialMode';
import { loadState, updateState } from './storage';

type Tab = 'tutorial' | 'free' | 'challenge' | 'settings';

const TABS: Tab[] = ['tutorial', 'free', 'challenge', 'settings'];

function SettingsView() {
  const { t, locale, setLocale } = useI18n();

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

      <div className="row">
        <button type="button" onClick={resetProgress}>
          {t('settings.resetProgress')}
        </button>
      </div>

      <p className="muted small">
        <a href="./NOTICE.md" target="_blank" rel="noreferrer">
          Attribution / Licenses
        </a>
      </p>
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
