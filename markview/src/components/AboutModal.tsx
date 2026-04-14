import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useAppStore } from '../stores/appStore';
import { tauriCommands } from '../utils/tauriCommands';

const isLinux = typeof navigator !== 'undefined' && /Linux/i.test(navigator.userAgent);

interface AboutModalProps {
  onClose: () => void;
}

function countStats(raw: string) {
  if (!raw) return null;

  // Characters (excluding whitespace)
  const chars = raw.replace(/\s/g, '').length;

  // Chinese characters
  const chineseMatches = raw.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  const chineseChars = chineseMatches ? chineseMatches.length : 0;

  // English words (consecutive latin letters/numbers)
  const englishMatches = raw.match(/[a-zA-Z0-9]+/g);
  const englishWords = englishMatches ? englishMatches.length : 0;

  // Total words = chinese chars + english words
  const words = chineseChars + englishWords;

  // Lines
  const lines = raw.split('\n').length;

  // Token estimate:
  // - English: ~1 token per 0.75 words (GPT-like), so words / 0.75
  // - Chinese: ~1.5 tokens per character
  const tokenEstimate = Math.round(englishWords / 0.75 + chineseChars * 1.5);

  return { chars, words, chineseChars, englishWords, lines, tokenEstimate };
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const rawMarkdown = useAppStore((s) => s.rawMarkdown);
  const currentFile = useAppStore((s) => s.currentFile);
  const [defaultStatus, setDefaultStatus] = useState<'idle' | 'working' | 'ok' | 'err'>('idle');
  const [defaultErr, setDefaultErr] = useState<string | null>(null);

  const handleSetDefault = async () => {
    setDefaultStatus('working');
    setDefaultErr(null);
    try {
      await tauriCommands.openDefaultAppsSettings();
      setDefaultStatus('ok');
    } catch (e) {
      setDefaultStatus('err');
      setDefaultErr(String(e));
    }
  };

  const stats = useMemo(() => countStats(rawMarkdown), [rawMarkdown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl shadow-2xl w-[360px] p-6 relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-[var(--hover-bg)] text-[var(--text-color)] opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="text-3xl mb-2">M</div>
          <h2 className="text-lg font-bold mb-1">MarkView</h2>
          <p className="text-xs text-gray-500 mb-4">Version 1.0.5</p>

          <p className="text-sm text-[var(--text-color)] mb-4 leading-relaxed">
            The simplest Markdown viewer.
          </p>

          <button
            onClick={handleSetDefault}
            disabled={defaultStatus === 'working' || defaultStatus === 'ok'}
            className="w-full px-4 py-2 mb-3 text-sm rounded-lg border border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors disabled:opacity-70"
          >
            {defaultStatus === 'working' ? 'Working…' :
             defaultStatus === 'ok'     ? 'Set as default ✓' :
             isLinux                    ? 'Set MarkView as default .md handler'
                                        : 'Open Default Apps settings'}
          </button>
          {defaultStatus === 'err' && (
            <p className="text-xs text-red-600 mb-3 break-words w-full text-left">
              {defaultErr ?? 'Failed'}
            </p>
          )}

          {stats && currentFile && (
            <div className="w-full border-t border-[var(--border-color)] pt-4 mt-2 space-y-1.5 text-sm">
              <p className="text-xs text-gray-500 mb-2 font-medium">Document Stats</p>
              <div className="flex justify-between">
                <span className="text-gray-500">Words</span>
                <span>{stats.words.toLocaleString()}</span>
              </div>
              {stats.chineseChars > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 pl-3 text-xs">Chinese</span>
                  <span className="text-xs">{stats.chineseChars.toLocaleString()} chars</span>
                </div>
              )}
              {stats.englishWords > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 pl-3 text-xs">English</span>
                  <span className="text-xs">{stats.englishWords.toLocaleString()} words</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Characters</span>
                <span>{stats.chars.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lines</span>
                <span>{stats.lines.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tokens (est.)</span>
                <span>~{stats.tokenEstimate.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className={`w-full border-t border-[var(--border-color)] pt-4 ${stats && currentFile ? 'mt-3' : 'mt-2'} space-y-1.5 text-sm`}>
            <div className="flex justify-between">
              <span className="text-gray-500">Developer</span>
              <span>Wuko-Syn DEV</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Website</span>
              <a href="#" onClick={(e) => { e.preventDefault(); openUrl('https://stl-lang.org'); }} className="text-blue-500 hover:underline cursor-pointer">stl-lang.org</a>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-6">
            &copy; 2026 Wuko-Syn DEV. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
