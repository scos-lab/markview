import { useEffect } from 'react';
import { load, Store } from '@tauri-apps/plugin-store';
import { useAppStore } from '../stores/appStore';

// Single store instance, loaded once
let storePromise: Promise<Store> | null = null;
function getStore() {
  if (!storePromise) {
    storePromise = load('store.json', { autoSave: false, defaults: {} });
  }
  return storePromise;
}

export function useTheme() {
  const { theme, setTheme, fontSize, setFontSize, setRecentFiles, setShowSetDefault } = useAppStore();

  useEffect(() => {
    async function initStore() {
      try {
        const store = await getStore();

        const savedTheme = await store.get<{value: string}>('theme');
        if (savedTheme && (savedTheme.value === 'light' || savedTheme.value === 'dark')) {
          setTheme(savedTheme.value as 'light' | 'dark');
        }

        const savedFontSize = await store.get<{value: number}>('fontSize');
        if (savedFontSize && typeof savedFontSize.value === 'number') {
          setFontSize(savedFontSize.value);
        }

        const savedRecent = await store.get<{value: string[]}>('recentFiles');
        if (savedRecent && Array.isArray(savedRecent.value)) {
          setRecentFiles(savedRecent.value);
        }

        const prompted = await store.get<{value: boolean}>('hasPromptedDefault');
        if (!prompted || !prompted.value) {
          setShowSetDefault(true);
        }
      } catch (e) {
        console.error("Failed to load store", e);
      }
    }
    initStore();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }

    getStore().then(async (store) => {
      await store.set('theme', { value: theme });
      await store.save();
    }).catch(() => {});
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);

    getStore().then(async (store) => {
      await store.set('fontSize', { value: fontSize });
      await store.save();
    }).catch(() => {});
  }, [fontSize]);
}

export async function saveHasPromptedDefault() {
  try {
    const store = await getStore();
    await store.set('hasPromptedDefault', { value: true });
    await store.save();
  } catch (e) {}
}

export function useRecentFilesPersistence() {
  const recentFiles = useAppStore((state) => state.recentFiles);

  useEffect(() => {
    if (recentFiles.length > 0) {
      getStore().then(async (store) => {
        await store.set('recentFiles', { value: recentFiles });
        await store.save();
      }).catch(() => {});
    }
  }, [recentFiles]);
}
