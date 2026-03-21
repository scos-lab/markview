import { create } from 'zustand';

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface Tab {
  id: string;
  path: string;
  name: string;
  rawMarkdown: string;
  renderedHTML: string;
  headings: Heading[];
  scrollTop: number;
}

export interface AppState {
  // Tab state
  tabs: Tab[];
  activeTabId: string | null;

  // Active tab mirrors (flat fields for easy consumption)
  currentFile: string | null;
  rawMarkdown: string;
  renderedHTML: string;
  headings: Heading[];

  // App state
  recentFiles: string[];
  theme: 'light' | 'dark';
  fontSize: number;
  sidebarVisible: boolean;
  searchVisible: boolean;
  searchQuery: string;
  searchMatches: number;
  currentMatch: number;
  showSetDefault: boolean;

  // Tab actions
  addTab: (path: string, content: string) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateActiveTab: (updates: Partial<Pick<Tab, 'rawMarkdown' | 'renderedHTML' | 'headings' | 'scrollTop'>>) => void;

  // Setters
  addRecentFile: (file: string) => void;
  setRecentFiles: (files: string[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: number) => void;
  setSidebarVisible: (visible: boolean) => void;
  setSearchVisible: (visible: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchMatches: (count: number) => void;
  setCurrentMatch: (index: number) => void;
  setShowSetDefault: (show: boolean) => void;
}

let nextTabId = 1;

function syncFromTab(tab: Tab | undefined) {
  if (!tab) {
    return { currentFile: null, rawMarkdown: '', renderedHTML: '', headings: [] };
  }
  return {
    currentFile: tab.path,
    rawMarkdown: tab.rawMarkdown,
    renderedHTML: tab.renderedHTML,
    headings: tab.headings,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  currentFile: null,
  rawMarkdown: '',
  renderedHTML: '',
  headings: [],
  recentFiles: [],
  theme: 'light',
  fontSize: 16,
  sidebarVisible: true,
  searchVisible: false,
  searchQuery: '',
  searchMatches: 0,
  currentMatch: 0,
  showSetDefault: false,

  addTab: (path, content) => {
    const id = `tab-${nextTabId++}`;
    const name = path.split(/[/\\]/).pop() || 'untitled';
    const newTab: Tab = {
      id, path, name,
      rawMarkdown: content,
      renderedHTML: '',
      headings: [],
      scrollTop: 0,
    };
    set({
      tabs: [...get().tabs, newTab],
      activeTabId: id,
      ...syncFromTab(newTab),
    });
    return id;
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;

    const newTabs = tabs.filter(t => t.id !== tabId);
    let newActiveId = activeTabId;

    if (activeTabId === tabId) {
      if (newTabs.length === 0) {
        newActiveId = null;
      } else if (idx >= newTabs.length) {
        newActiveId = newTabs[newTabs.length - 1].id;
      } else {
        newActiveId = newTabs[idx].id;
      }
    }

    const activeTab = newTabs.find(t => t.id === newActiveId);
    set({
      tabs: newTabs,
      activeTabId: newActiveId,
      ...syncFromTab(activeTab),
    });
  },

  setActiveTab: (tabId) => {
    // Save current scroll position before switching
    const { tabs } = get();
    const activeTab = tabs.find(t => t.id === tabId);
    set({
      activeTabId: tabId,
      ...syncFromTab(activeTab),
    });
  },

  updateActiveTab: (updates) => {
    const { tabs, activeTabId } = get();
    if (!activeTabId) return;

    const newTabs = tabs.map(t =>
      t.id === activeTabId ? { ...t, ...updates } : t
    );
    // Sync flat fields
    const sync: Record<string, any> = { tabs: newTabs };
    if (updates.rawMarkdown !== undefined) sync.rawMarkdown = updates.rawMarkdown;
    if (updates.renderedHTML !== undefined) sync.renderedHTML = updates.renderedHTML;
    if (updates.headings !== undefined) sync.headings = updates.headings;

    set(sync);
  },

  addRecentFile: (file) => set((state) => {
    const files = state.recentFiles.filter(f => f !== file);
    return { recentFiles: [file, ...files].slice(0, 10) };
  }),
  setRecentFiles: (files) => set({ recentFiles: files }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setSearchVisible: (visible) => set({ searchVisible: visible }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchMatches: (count) => set({ searchMatches: count }),
  setCurrentMatch: (index) => set({ currentMatch: index }),
  setShowSetDefault: (show) => set({ showSetDefault: show }),
}));
