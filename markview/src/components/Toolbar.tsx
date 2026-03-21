import { useState } from 'react';
import { FolderOpen, Moon, Sun, ZoomIn, ZoomOut, Search, Info } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { tauriCommands } from '../utils/tauriCommands';
import AboutModal from './AboutModal';

interface ToolbarProps {
  loadFile: (path: string) => void;
}

export default function Toolbar({ loadFile }: ToolbarProps) {
  const [showAbout, setShowAbout] = useState(false);
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    setSearchVisible,
    searchVisible,
  } = useAppStore();

  const handleOpenFile = async () => {
    const result = await tauriCommands.openFileDialog();
    if (result) loadFile(result.path);
  };

  return (
    <div className="flex items-center gap-1 px-2 shrink-0">
      <button
        onClick={handleOpenFile}
        className="p-1.5 rounded hover:bg-[var(--tab-hover)] text-[var(--text-color)]"
        title="Open File (Ctrl+O)"
      >
        <FolderOpen size={16} />
      </button>

      <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />

      <button
        onClick={() => setSearchVisible(!searchVisible)}
        className="p-1.5 rounded hover:bg-[var(--tab-hover)] text-[var(--text-color)]"
        title="Search (Ctrl+F)"
      >
        <Search size={16} />
      </button>

      <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />

      <div className="flex items-center bg-[var(--bg-color)] rounded border border-[var(--border-color)]">
        <button
          onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
          className="p-1 hover:bg-[var(--hover-bg)] text-[var(--text-color)] border-r border-[var(--border-color)]"
          title="Decrease Font Size (Ctrl+-)"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => setFontSize(16)}
          className="p-1 hover:bg-[var(--hover-bg)] text-[var(--text-color)] border-r border-[var(--border-color)] font-medium text-[10px] px-2"
          title="Reset Font Size (Ctrl+0)"
        >
          {fontSize}px
        </button>
        <button
          onClick={() => setFontSize(Math.min(fontSize + 2, 28))}
          className="p-1 hover:bg-[var(--hover-bg)] text-[var(--text-color)]"
          title="Increase Font Size (Ctrl+=)"
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="p-1.5 rounded hover:bg-[var(--tab-hover)] text-[var(--text-color)]"
        title="Toggle Theme (Ctrl+Shift+T)"
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      <div className="w-px h-4 bg-[var(--border-color)] mx-0.5" />

      <button
        onClick={() => setShowAbout(true)}
        className="p-1.5 rounded hover:bg-[var(--tab-hover)] text-[var(--text-color)]"
        title="About MarkView"
      >
        <Info size={16} />
      </button>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
