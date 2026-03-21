import { useEffect, useCallback } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Menu } from 'lucide-react';
import { useAppStore } from './stores/appStore';
import { useTheme, useRecentFilesPersistence, saveHasPromptedDefault } from './hooks/useTheme';
import { useMarkdown } from './hooks/useMarkdown';
import { tauriCommands } from './utils/tauriCommands';
import Toolbar from './components/Toolbar';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import MarkdownView from './components/MarkdownView';
import WelcomePage from './components/WelcomePage';
import SearchBar from './components/SearchBar';
import SetDefaultModal from './components/SetDefaultModal';

function App() {
  useTheme();
  useRecentFilesPersistence();
  useMarkdown();

  const {
    activeTabId,
    sidebarVisible,
    setSidebarVisible,
    setSearchVisible,
    setTheme,
    theme,
    setFontSize,
    fontSize,
    setSearchQuery,
    setSearchMatches,
    setCurrentMatch,
    searchVisible,
    addTab,
    closeTab,
    setActiveTab,
    addRecentFile,
    showSetDefault,
    setShowSetDefault,
  } = useAppStore();

  const hasActiveFile = activeTabId !== null;

  const loadFile = useCallback(async (path: string) => {
    try {
      const state = useAppStore.getState();

      // Check if file already open
      const existing = state.tabs.find(t => t.path === path);
      if (existing) {
        state.setActiveTab(existing.id);
        await tauriCommands.unwatchFile();
        await tauriCommands.watchFile(path);
        return;
      }

      await tauriCommands.unwatchFile();
      const content = await tauriCommands.readFile(path);
      addTab(path, content);
      addRecentFile(path);
      await tauriCommands.watchFile(path);
    } catch (e) {
      console.error("Failed to load file", e);
    }
  }, [addTab, addRecentFile]);

  // File change listener
  useEffect(() => {
    const unlistenFileChanged = listen<string>('file-changed', async (event) => {
      const state = useAppStore.getState();
      const tab = state.tabs.find(t => t.id === state.activeTabId);
      if (tab && event.payload === tab.path) {
        try {
          const content = await tauriCommands.readFile(tab.path);
          state.updateActiveTab({ rawMarkdown: content });
        } catch (e) {
          console.error("Failed to reload file", e);
        }
      }
    });

    const unlistenFileAssoc = listen<string>('file-association-open', async (event) => {
      const path = event.payload;
      if (path && path.toLowerCase().match(/\.(md|mdx|markdown)$/)) {
        loadFile(path);
      }
    });

    const appWindow = getCurrentWebviewWindow();
    const unlistenDragDrop = appWindow.onDragDropEvent(async (event) => {
      if (event.payload.type === 'drop') {
        const paths = (event.payload as any).paths;
        if (paths && paths.length > 0) {
          const path = paths[0];
          if (path.toLowerCase().match(/\.(md|mdx|markdown)$/)) {
            loadFile(path);
          }
        }
      }
    });

    return () => {
      unlistenFileChanged.then(f => f());
      unlistenFileAssoc.then(f => f());
      unlistenDragDrop.then(f => f());
    };
  }, [loadFile]);

  // Check for file passed via OS file association (first instance launch)
  useEffect(() => {
    tauriCommands.getInitialFile().then((path) => {
      if (path) loadFile(path);
    });
  }, [loadFile]);

  // Re-watch when active tab changes
  useEffect(() => {
    const state = useAppStore.getState();
    const tab = state.tabs.find(t => t.id === state.activeTabId);
    if (tab) {
      tauriCommands.unwatchFile().then(() => {
        tauriCommands.watchFile(tab.path);
      });
    }
  }, [activeTabId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'o' && !e.shiftKey) {
          e.preventDefault();
          const result = await tauriCommands.openFileDialog();
          if (result) loadFile(result.path);
        } else if (e.key === 'w') {
          e.preventDefault();
          const { activeTabId } = useAppStore.getState();
          if (activeTabId) closeTab(activeTabId);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const state = useAppStore.getState();
          if (state.tabs.length > 1 && state.activeTabId) {
            const idx = state.tabs.findIndex(t => t.id === state.activeTabId);
            if (e.shiftKey) {
              const prev = (idx - 1 + state.tabs.length) % state.tabs.length;
              setActiveTab(state.tabs[prev].id);
            } else {
              const next = (idx + 1) % state.tabs.length;
              setActiveTab(state.tabs[next].id);
            }
          }
        } else if (e.key === 'f') {
          e.preventDefault();
          setSearchVisible(true);
        } else if (e.key === 'p') {
          e.preventDefault();
          window.print();
        } else if (e.key === 't' && e.shiftKey) {
          e.preventDefault();
          setTheme(theme === 'light' ? 'dark' : 'light');
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setFontSize(Math.min(fontSize + 2, 28));
        } else if (e.key === '-') {
          e.preventDefault();
          setFontSize(Math.max(fontSize - 2, 12));
        } else if (e.key === '0') {
          e.preventDefault();
          setFontSize(16);
        } else if (e.key === 'b') {
          e.preventDefault();
          setSidebarVisible(!sidebarVisible);
        }
      } else if (e.key === 'Escape') {
        if (searchVisible) {
          setSearchVisible(false);
          setSearchQuery('');
          setSearchMatches(0);
          setCurrentMatch(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadFile, theme, setTheme, fontSize, setFontSize, sidebarVisible, setSidebarVisible, searchVisible, setSearchVisible, setSearchQuery, setSearchMatches, setCurrentMatch, closeTab, setActiveTab]);


  return (
    <div className="flex flex-col h-screen bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden">
      {/* Top row: sidebar toggle + tab bar + toolbar */}
      <div className="flex items-center h-10 bg-[var(--tab-bar-bg)] border-b border-[var(--border-color)] no-print shrink-0">
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          className="p-2 hover:bg-[var(--tab-hover)] transition-colors shrink-0"
          title="Toggle Sidebar (Ctrl+B)"
        >
          <Menu size={16} />
        </button>
        <div className="w-px h-5 bg-[var(--border-color)] shrink-0" />
        <TabBar />
        <div className="w-px h-5 bg-[var(--border-color)] shrink-0" />
        <Toolbar loadFile={loadFile} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {sidebarVisible && <Sidebar />}

        <main className="flex-1 relative overflow-hidden flex flex-col">
          {searchVisible && <SearchBar />}

          <div className="flex-1 overflow-y-auto w-full relative">
            {hasActiveFile ? <MarkdownView /> : <WelcomePage loadFile={loadFile} />}
          </div>
        </main>
      </div>
      {showSetDefault && (
        <SetDefaultModal onClose={(dontShow) => {
          setShowSetDefault(false);
          if (dontShow) saveHasPromptedDefault();
        }} />
      )}
    </div>
  );
}

export default App;
