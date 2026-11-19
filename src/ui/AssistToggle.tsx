import { useI18n } from '../i18n';
import { useUiSettings } from '../settings/UiSettings';

/** Small on-stage switch for the beginner assist overlay. */
export function AssistToggle() {
  const { t } = useI18n();
  const { assistMode, toggleAssist } = useUiSettings();
  return (
    <button
      type="button"
      className={assistMode ? 'assist-toggle on' : 'assist-toggle'}
      onClick={toggleAssist}
      aria-pressed={assistMode}
      title={t('assist.hint')}
    >
      {assistMode ? t('assist.on') : t('assist.off')}
    </button>
  );
}
