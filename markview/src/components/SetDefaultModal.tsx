import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { tauriCommands } from '../utils/tauriCommands';

interface SetDefaultModalProps {
  onClose: (dontShowAgain: boolean) => void;
}

const isLinux = typeof navigator !== 'undefined' && /Linux/i.test(navigator.userAgent);

export default function SetDefaultModal({ onClose }: SetDefaultModalProps) {
  const [dontShow, setDontShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleAction = async () => {
    setStatus('working');
    try {
      await tauriCommands.openDefaultAppsSettings();
      if (isLinux) {
        setStatus('ok');
        setTimeout(() => onClose(true), 1200);
      } else {
        onClose(true);
      }
    } catch (e) {
      setStatus('err');
      setErrMsg(String(e));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => onClose(dontShow)}
    >
      <div
        className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl shadow-2xl w-[380px] p-6 relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onClose(dontShow)}
          className="absolute top-3 right-3 p-1 rounded hover:bg-[var(--hover-bg)] text-[var(--text-color)] opacity-50 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--sidebar-bg)] flex items-center justify-center mb-4">
            <Settings size={24} className="text-[var(--link-color)]" />
          </div>

          <h2 className="text-lg font-bold mb-2">Set as default Markdown viewer?</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Open <code className="text-xs bg-[var(--sidebar-bg)] px-1.5 py-0.5 rounded">.md</code> files directly with MarkView by setting it as your default app.
          </p>

          <div className="flex gap-3 w-full mb-4">
            <button
              onClick={() => onClose(dontShow)}
              className="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleAction}
              disabled={status === 'working' || status === 'ok'}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-[var(--link-color)] text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-70"
            >
              {status === 'working' ? 'Working…' :
               status === 'ok'     ? 'Done ✓' :
               isLinux             ? 'Set as default' : 'Open Settings'}
            </button>
          </div>

          {status === 'err' && (
            <p className="text-xs text-red-600 mb-2 break-words">
              {errMsg ?? 'Failed to set default'}
            </p>
          )}

          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="rounded"
            />
            Don't show again
          </label>
        </div>
      </div>
    </div>
  );
}
