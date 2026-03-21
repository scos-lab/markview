import TOC from './TOC';

export default function Sidebar() {
  return (
    <div className="w-64 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col flex-shrink-0 no-print">
      <div className="flex-1 overflow-y-auto">
        <TOC />
      </div>
    </div>
  );
}
