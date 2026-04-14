// Lazy-loaded Vega-Lite / Vega renderer. Handles ```vega-lite and ```vega code
// blocks. Parses the JSON spec, calls vega-embed, replaces the <pre> with the
// resulting SVG. Theme-aware via config override.

type EmbedFn = typeof import('vega-embed').default;

let embedPromise: Promise<EmbedFn> | null = null;

async function getEmbed(): Promise<EmbedFn> {
  if (!embedPromise) {
    embedPromise = import('vega-embed').then((mod) => mod.default);
  }
  return embedPromise;
}

function vegaThemeFor(theme: 'light' | 'dark') {
  // vega-embed's built-in `dark` theme works. Light uses default.
  return theme === 'dark' ? 'dark' : undefined;
}

/**
 * Scan container for <code class="language-vega-lite"> and <code class="language-vega">.
 * Replace parent <pre> with an SVG rendering of the spec. Skips already-rendered
 * blocks via data-vega-rendered. `isCancelled` aborts between async steps so a
 * later effect run can supersede an in-flight one without partial DOM damage.
 */
export async function renderVegaBlocks(
  container: HTMLElement,
  theme: 'light' | 'dark',
  isCancelled: () => boolean = () => false,
): Promise<void> {
  if (isCancelled()) return;
  const initial = container.querySelectorAll<HTMLElement>(
    'code.language-vega-lite:not([data-vega-rendered]), code.language-vega:not([data-vega-rendered])',
  );
  if (initial.length === 0) return;

  const embed = await getEmbed();
  if (isCancelled()) return;

  // Re-query after the await; mark each block to keep concurrent runs from
  // racing on the same <pre>.
  const blocks = Array.from(
    container.querySelectorAll<HTMLElement>(
      'code.language-vega-lite:not([data-vega-rendered]):not([data-vega-claimed]), code.language-vega:not([data-vega-rendered]):not([data-vega-claimed])',
    ),
  );
  blocks.forEach((b) => b.setAttribute('data-vega-claimed', '1'));

  for (const codeEl of blocks) {
    if (isCancelled()) return;
    if (!codeEl.isConnected) continue;
    const source = codeEl.textContent ?? '';
    const pre = codeEl.closest('pre');
    const host = pre ?? codeEl;
    if (!host.isConnected) continue;
    const mode = codeEl.classList.contains('language-vega') ? 'vega' : 'vega-lite';

    let spec: unknown;
    try {
      spec = JSON.parse(source);
    } catch (err) {
      renderError(host, source, `Invalid JSON: ${(err as Error).message}`);
      continue;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'vega-chart';
    wrapper.setAttribute('data-vega-rendered', '1');
    wrapper.setAttribute('data-vega-source', source);
    wrapper.setAttribute('data-vega-mode', mode);
    host.replaceWith(wrapper);

    try {
      await embed(wrapper, spec as any, {
        mode: mode as any,
        actions: false,
        renderer: 'svg',
        theme: vegaThemeFor(theme),
      });
      if (isCancelled() || !wrapper.isConnected) continue;
    } catch (err) {
      if (isCancelled() || !wrapper.isConnected) continue;
      renderError(wrapper, source, (err as Error).message);
    }
  }
}

function renderError(host: Element, source: string, msg: string) {
  const errEl = document.createElement('pre');
  errEl.className = 'vega-error';
  errEl.setAttribute('data-vega-rendered', '1');
  errEl.textContent = `Vega render error:\n${msg}\n\nSource:\n${source}`;
  host.replaceWith(errEl);
}

/**
 * Re-render already-rendered charts under a new theme. Reverts wrappers back
 * to <pre><code class="language-vega-lite"> using stored source, then calls
 * renderVegaBlocks.
 */
export function rerenderVegaForTheme(
  container: HTMLElement,
  theme: 'light' | 'dark',
  isCancelled: () => boolean = () => false,
): Promise<void> {
  if (isCancelled()) return Promise.resolve();
  container
    .querySelectorAll<HTMLElement>('.vega-chart[data-vega-source]')
    .forEach((wrapper) => {
      const source = wrapper.getAttribute('data-vega-source') ?? '';
      const mode = wrapper.getAttribute('data-vega-mode') ?? 'vega-lite';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.className = `language-${mode}`;
      code.textContent = source;
      pre.appendChild(code);
      wrapper.replaceWith(pre);
    });
  return renderVegaBlocks(container, theme, isCancelled);
}
