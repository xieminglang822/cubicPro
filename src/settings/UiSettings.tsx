import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { loadState, updateState } from '../storage';

interface UiSettingsValue {
  assistMode: boolean;
  setAssistMode: (value: boolean) => void;
  toggleAssist: () => void;
}

const UiSettingsContext = createContext<UiSettingsValue | null>(null);

export function UiSettingsProvider({ children }: { children: ReactNode }) {
  const [assistMode, setAssistModeState] = useState<boolean>(() => loadState().settings.assistMode);

  const persist = useCallback((value: boolean) => {
    updateState((state) => ({ ...state, settings: { ...state.settings, assistMode: value } }));
  }, []);

  const setAssistMode = useCallback(
    (value: boolean) => {
      setAssistModeState(value);
      persist(value);
    },
    [persist],
  );

  const toggleAssist = useCallback(() => {
    setAssistModeState((previous) => {
      const next = !previous;
      persist(next);
      return next;
    });
  }, [persist]);

  const value = useMemo<UiSettingsValue>(
    () => ({ assistMode, setAssistMode, toggleAssist }),
    [assistMode, setAssistMode, toggleAssist],
  );

  return <UiSettingsContext.Provider value={value}>{children}</UiSettingsContext.Provider>;
}

export function useUiSettings(): UiSettingsValue {
  const value = useContext(UiSettingsContext);
  if (!value) throw new Error('useUiSettings must be used inside <UiSettingsProvider>');
  return value;
}
