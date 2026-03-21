import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';

export default function TOC() {
  const headings = useAppStore((s) => s.headings);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const visibleIds = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });
        // Pick the first visible heading in document order
        for (const h of headings) {
          if (visibleIds.has(h.id)) {
            setActiveId(h.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center mt-10">
        No headings found in this document.
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <div className="p-2 select-none">
      {headings.map((heading, i) => (
        <a
          key={i}
          href={`#${heading.id}`}
          onClick={(e) => handleClick(e, heading.id)}
          className={`block py-1 px-2 rounded text-sm truncate ${
            activeId === heading.id
              ? 'bg-[var(--link-color)] text-white font-medium'
              : 'hover:bg-[var(--hover-bg)] text-[var(--text-color)]'
          }`}
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
          title={heading.text}
        >
          {heading.text}
        </a>
      ))}
    </div>
  );
}
