import { useRef } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(tabId);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="flex-1 flex items-end overflow-x-auto tab-scroll-hide"
      onWheel={handleWheel}
    >
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`group flex items-center gap-1.5 px-3 h-9 min-w-[100px] max-w-[200px] cursor-pointer select-none border-r border-[var(--border-color)] text-sm shrink-0 transition-colors ${
            tab.id === activeTabId
              ? 'bg-[var(--bg-color)] text-[var(--text-color)] tab-active'
              : 'bg-[var(--tab-bg)] text-[var(--text-color)] opacity-60 hover:opacity-90 hover:bg-[var(--tab-hover)]'
          }`}
          onClick={() => setActiveTab(tab.id)}
          onMouseDown={(e) => handleMouseDown(e, tab.id)}
          title={tab.path}
        >
          <span className="truncate flex-1 text-xs">{tab.name}</span>
          <button
            className={`p-0.5 rounded transition-opacity hover:bg-[var(--hover-bg)] ${
              tab.id === activeTabId ? 'opacity-40 hover:opacity-100' : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
