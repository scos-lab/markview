import { useEffect, useRef, useMemo } from 'react';
import { open } from '@tauri-apps/plugin-shell';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useAppStore } from '../stores/appStore';
import { rerenderMermaidForTheme } from '../utils/mermaid';
import { rerenderVegaForTheme } from '../utils/vega';

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function MarkdownView() {
  const renderedHTML = useAppStore((s) => s.renderedHTML);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const currentMatch = useAppStore((s) => s.currentMatch);
  const theme = useAppStore((s) => s.theme);
  const contentRef = useRef<HTMLDivElement>(null);

  // Compute highlighted HTML from string (no DOM manipulation)
  const { displayHTML, matchCount } = useMemo(() => {
    if (!searchQuery || !renderedHTML) return { displayHTML: renderedHTML, matchCount: 0 };

    let count = 0;
    const escaped = escapeRegex(searchQuery);
    const regex = new RegExp(escaped, 'gi');

    // Split HTML into tags and text, only highlight in text segments
    const parts = renderedHTML.split(/(<[^>]*>)/);
    const highlighted = parts.map(part => {
      if (part.startsWith('<')) return part;
      return part.replace(regex, (match) => {
        count++;
        const bg = count === currentMatch ? '#f97316' : '#fbbf24';
        return `<mark data-search="${count}" style="background-color:${bg};color:#000;border-radius:2px;padding:1px 2px">${match}</mark>`;
      });
    }).join('');

    return { displayHTML: highlighted, matchCount: count };
  }, [renderedHTML, searchQuery, currentMatch]);

  // Sync match count to store
  useEffect(() => {
    const state = useAppStore.getState();
    if (state.searchMatches !== matchCount) {
      state.setSearchMatches(matchCount);
    }
    if (matchCount > 0 && state.currentMatch === 0) {
      state.setCurrentMatch(1);
    }
    if (matchCount === 0 && state.currentMatch !== 0) {
      state.setCurrentMatch(0);
    }
  }, [matchCount]);

  // Scroll to current match
  useEffect(() => {
    if (currentMatch < 1) return;
    requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector(`mark[data-search="${currentMatch}"]`) as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }, [currentMatch, displayHTML]);

  // Link click handler
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleLinkClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href) {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          e.preventDefault();
          try {
            await open(href);
          } catch (err) {
            console.error('Failed to open external link', err);
          }
        } else if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    container.addEventListener('click', handleLinkClick);
    return () => container.removeEventListener('click', handleLinkClick);
  }, [displayHTML]);

  // Image src conversion
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        try {
          img.src = convertFileSrc(src);
        } catch (e) {
          console.warn("Could not convert image src", src);
        }
      }
    });
  }, [displayHTML]);

  // Render Mermaid + Vega diagrams on content or theme change. Both utils
  // revert already-rendered wrappers (using stored source) then run a fresh
  // render pass — same handler works for initial render and theme switch.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    let cancelled = false;
    rerenderMermaidForTheme(container, theme).catch((e) => {
      if (!cancelled) console.error('Mermaid render failed', e);
    });
    rerenderVegaForTheme(container, theme).catch((e) => {
      if (!cancelled) console.error('Vega render failed', e);
    });
    return () => { cancelled = true; };
  }, [renderedHTML, theme]);

  return (
    <div className="p-8 max-w-4xl mx-auto pb-32">
      <div
        ref={contentRef}
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: displayHTML }}
      />
    </div>
  );
}
