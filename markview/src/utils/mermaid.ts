// Lazy-loaded Mermaid renderer. Keeps initial bundle small — mermaid is
// only imported on first use.

type MermaidModule = typeof import('mermaid')['default'];

let mermaidPromise: Promise<MermaidModule> | null = null;
let currentTheme: 'light' | 'dark' = 'light';
let renderCounter = 0;

async function getMermaid(theme: 'light' | 'dark'): Promise<MermaidModule> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((mod) => {
      const m = mod.default;
      m.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: 'inherit',
      });
      currentTheme = theme;
      return m;
    });
  }
  const m = await mermaidPromise;
  if (theme !== currentTheme) {
    m.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'strict',
      fontFamily: 'inherit',
    });
    currentTheme = theme;
  }
  return m;
}

/**
 * Scan the container for <code class="language-mermaid"> blocks and replace
 * their parent <pre> with rendered SVG. Safe to call multiple times —
 * already-rendered blocks are skipped via a data-rendered marker.
 */
export async function renderMermaidBlocks(
  container: HTMLElement,
  theme: 'light' | 'dark',
): Promise<void> {
  const codeBlocks = container.querySelectorAll<HTMLElement>(
    'code.language-mermaid:not([data-mermaid-rendered])',
  );
  if (codeBlocks.length === 0) return;

  const mermaid = await getMermaid(theme);

  for (const codeEl of Array.from(codeBlocks)) {
    const source = codeEl.textContent ?? '';
    const pre = codeEl.closest('pre');
    const host = pre ?? codeEl;
    const id = `mermaid-${Date.now()}-${++renderCounter}`;

    try {
      const { svg, bindFunctions } = await mermaid.render(id, source);
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram';
      wrapper.setAttribute('data-mermaid-rendered', '1');
      wrapper.setAttribute('data-mermaid-source', source);
      wrapper.innerHTML = svg;
      host.replaceWith(wrapper);
      if (bindFunctions) bindFunctions(wrapper);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const errEl = document.createElement('pre');
      errEl.className = 'mermaid-error';
      errEl.setAttribute('data-mermaid-rendered', '1');
      errEl.textContent = `Mermaid render error:\n${msg}\n\nSource:\n${source}`;
      host.replaceWith(errEl);
    }
  }
}

/**
 * Re-render already-rendered diagrams under a new theme. Reads the original
 * source from data-mermaid-source and reverts each wrapper to a <pre><code
 * class="language-mermaid"> so the normal render path handles it.
 */
export function rerenderMermaidForTheme(
  container: HTMLElement,
  theme: 'light' | 'dark',
): Promise<void> {
  container
    .querySelectorAll<HTMLElement>('.mermaid-diagram[data-mermaid-source]')
    .forEach((wrapper) => {
      const source = wrapper.getAttribute('data-mermaid-source') ?? '';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.className = 'language-mermaid';
      code.textContent = source;
      pre.appendChild(code);
      wrapper.replaceWith(pre);
    });
  return renderMermaidBlocks(container, theme);
}
