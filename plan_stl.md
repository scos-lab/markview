# MarkView — Lightweight Markdown Reader for Windows (STL Plan)

> **Protocol:** STL Core v1.0 — Semantic Tension Language (knowledge representation)

[MarkView] -> [Markdown_Reader] ::mod(
  rule="definitional",
  confidence=0.99,
  domain="desktop_application",
  intent="Render .md files into beautifully typeset documents for reading (not editing)"
)

[Problem] -> [MarkView] ::mod(
  rule="causal",
  confidence=0.95,
  cause="Windows lacks lightweight Markdown readers — Notepad shows raw symbols (#, **, ```) making .md unreadable",
  effect="MarkView renders Markdown into clean, readable HTML with navigation and theming"
)

[MarkView] -> [Platform_Support] ::mod(
  rule="definitional",
  confidence=0.99,
  scope="Global",
  domain="Windows, macOS, Linux",
  intent="Cross-platform via Tauri 2, target Microsoft Store"
)

## Tech Stack

[MarkView] -> [Tauri] ::mod(rule="definitional", confidence=0.99, version="2", domain="Rust", intent="Desktop framework — uses system WebView (WebView2 on Windows), produces ~5-10MB installer")
[MarkView] -> [React] ::mod(rule="definitional", confidence=0.99, version="19", domain="TypeScript", intent="Frontend UI framework")
[MarkView] -> [Vite] ::mod(rule="definitional", confidence=0.99, version="6", intent="Build tool — dev server + production build")
[MarkView] -> [Unified_Pipeline] ::mod(rule="definitional", confidence=0.99, intent="Markdown processing pipeline: remark-parse, remark-gfm, remark-math, rehype-stringify, rehype-highlight, rehype-katex")
[MarkView] -> [HighlightJS] ::mod(rule="definitional", confidence=0.99, intent="Code block syntax highlighting")
[MarkView] -> [Zustand] ::mod(rule="definitional", confidence=0.99, intent="Lightweight state management")
[MarkView] -> [TailwindCSS] ::mod(rule="definitional", confidence=0.99, version="4", intent="Styling system")
[MarkView] -> [Tauri_Plugin_Store] ::mod(rule="definitional", confidence=0.99, intent="Local persistence — theme, font size, recent files → stored in local JSON file via @tauri-apps/plugin-store")

## Project Structure

[Dir:src-tauri] -> [File:src-tauri/Cargo.toml] ::mod(rule="definitional", confidence=0.99, intent="Rust dependencies")
[Dir:src-tauri] -> [File:src-tauri/tauri.conf.json] ::mod(rule="definitional", confidence=0.99, intent="Tauri config — window settings, permissions, bundling")
[Dir:src-tauri] -> [File:src-tauri/capabilities/default.json] ::mod(rule="definitional", confidence=0.99, intent="Permission declarations — core:default, dialog:allow-open, fs:allow-read, shell:allow-open, store:default")
[Dir:src-tauri/src] -> [File:src-tauri/src/main.rs] ::mod(rule="definitional", confidence=0.99, intent="Tauri entry point")
[Dir:src-tauri/src] -> [File:src-tauri/src/lib.rs] ::mod(rule="definitional", confidence=0.99, intent="Plugin registration + Tauri command registration")
[Dir:src-tauri/src] -> [File:src-tauri/src/commands.rs] ::mod(rule="definitional", confidence=0.99, intent="Rust commands — file reading, folder scanning, file watching via notify crate")

[Dir:src] -> [File:src/main.tsx] ::mod(rule="definitional", confidence=0.99, intent="React entry point")
[Dir:src] -> [File:src/App.tsx] ::mod(rule="definitional", confidence=0.99, intent="Main layout — three columns: sidebar + content + optional search")
[Dir:src/stores] -> [File:src/stores/appStore.ts] ::mod(rule="definitional", confidence=0.99, intent="Zustand global state store")
[Dir:src/components] -> [File:src/components/Sidebar.tsx] ::mod(rule="definitional", confidence=0.99, intent="Sidebar container — toggle between FolderTree and TOC via tabs")
[Dir:src/components] -> [File:src/components/FolderTree.tsx] ::mod(rule="definitional", confidence=0.99, intent="Folder browser — tree view of .md files in opened folder")
[Dir:src/components] -> [File:src/components/TOC.tsx] ::mod(rule="definitional", confidence=0.99, intent="Table of contents — auto-generated from headings, click to scroll, scroll spy highlights current section")
[Dir:src/components] -> [File:src/components/MarkdownView.tsx] ::mod(rule="definitional", confidence=0.99, intent="Main content area — displays rendered HTML")
[Dir:src/components] -> [File:src/components/Toolbar.tsx] ::mod(rule="definitional", confidence=0.99, intent="Top toolbar — open file, theme toggle, font size controls")
[Dir:src/components] -> [File:src/components/SearchBar.tsx] ::mod(rule="definitional", confidence=0.99, intent="In-document search — Ctrl+F trigger, highlight matches with yellow background, navigate with Enter/Shift+Enter")
[Dir:src/components] -> [File:src/components/WelcomePage.tsx] ::mod(rule="definitional", confidence=0.99, intent="Welcome page when no file open — recent files list (max 10) + drag-drop hint")
[Dir:src/hooks] -> [File:src/hooks/useMarkdown.ts] ::mod(rule="definitional", confidence=0.99, intent="Markdown processing hook — raw text → HTML + headings extraction")
[Dir:src/hooks] -> [File:src/hooks/useTheme.ts] ::mod(rule="definitional", confidence=0.99, intent="Theme management hook — dark/light toggle + persistence via plugin-store")
[Dir:src/utils] -> [File:src/utils/markdown.ts] ::mod(rule="definitional", confidence=0.99, intent="Unified pipeline configuration")
[Dir:src/utils] -> [File:src/utils/fileTypes.ts] ::mod(rule="definitional", confidence=0.99, intent="File type detection — .md, .mdx, .markdown")
[Dir:src/utils] -> [File:src/utils/tauriCommands.ts] ::mod(rule="definitional", confidence=0.99, intent="Type-safe invoke() wrappers for Rust commands")
[Dir:src/styles] -> [File:src/styles/globals.css] ::mod(rule="definitional", confidence=0.99, intent="Global styles + Tailwind directives")
[Dir:src/styles] -> [File:src/styles/markdown.css] ::mod(rule="definitional", confidence=0.99, intent="Typography styles for rendered Markdown content")
[Dir:src/styles] -> [File:src/styles/themes.css] ::mod(rule="definitional", confidence=0.99, intent="CSS variables for dark/light themes")
[Dir:resources] -> [File:resources/icon.png] ::mod(rule="definitional", confidence=0.99, intent="Application icon")

## Rust Backend Commands

[RustCommand:open_file_dialog] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Opens native file picker dialog, filters .md/.mdx/.markdown, reads selected file content and returns {path, content}"
)

[RustCommand:open_folder_dialog] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Opens native folder picker, recursively scans .md files, returns folder path and file tree structure"
)

[RustCommand:read_file] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Reads file content by path, returns UTF-8 string"
)

[RustCommand:scan_folder] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Recursively scans folder, returns all .md files as tree structure preserving folder hierarchy"
)

[RustCommand:watch_file] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Uses notify crate to watch file for changes, emits 'file-changed' event via app.emit() to notify frontend"
)

[RustCommand:unwatch_file] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Stops current file watcher, releases resources"
)

[RustCommand:get_initial_file] -> [Behavior] ::mod(
  rule="definitional", confidence=0.99,
  intent="Returns and clears the file path from InitialFileState (one-shot). Used by frontend on mount to load OS file-association launched file without timing dependency."
)

## Feature 1: File Opening

[Feature:FileOpen] -> [Method:FileDialog] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+O opens native file picker, filtered to .md/.mdx/.markdown")
[Feature:FileOpen] -> [Method:DragDrop] ::mod(rule="definitional", confidence=0.99, intent="Drag .md file onto window anywhere to open, listens to tauri://drag-drop event")
[Feature:FileOpen] -> [Method:FolderMode] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+Shift+O opens folder, shows all .md files in sidebar tree")
[Feature:FileOpen] -> [Method:RecentFiles] ::mod(rule="definitional", confidence=0.99, intent="Welcome page shows last 10 opened files, click to open directly, stored via @tauri-apps/plugin-store")
[Feature:FileOpen] -> [Method:FileAssociation] ::mod(
  rule="causal",
  confidence=0.99,
  intent="OS file association double-click: Rust setup stores argv path into InitialFileState, frontend queries via get_initial_file() on mount — no timing dependency. Second instance handled by single-instance plugin emitting file-association-open event."
)

## Feature 2: Markdown Rendering

[Feature:Rendering] -> [Unified_Pipeline] ::mod(
  rule="causal", confidence=0.99,
  intent="Processing pipeline: raw text → remark-parse → remark-gfm → remark-math → rehype-stringify → rehype-highlight → rehype-katex → HTML"
)

[Feature:Rendering] -> [Support:Headings] ::mod(rule="definitional", confidence=0.99, intent="h1-h6 with auto-generated anchor IDs")
[Feature:Rendering] -> [Support:Inline] ::mod(rule="definitional", confidence=0.99, intent="Bold, italic, strikethrough, inline code")
[Feature:Rendering] -> [Support:Lists] ::mod(rule="definitional", confidence=0.99, intent="Ordered, unordered, task lists with checkboxes")
[Feature:Rendering] -> [Support:Tables] ::mod(rule="definitional", confidence=0.99, intent="GFM table syntax with column alignment")
[Feature:Rendering] -> [Support:CodeBlocks] ::mod(rule="definitional", confidence=0.99, intent="Syntax highlighting via highlight.js, display language label")
[Feature:Rendering] -> [Support:Blockquotes] ::mod(rule="definitional", confidence=0.99)
[Feature:Rendering] -> [Support:Links] ::mod(rule="definitional", confidence=0.99, intent="External links open in default browser via Tauri shell.open()")
[Feature:Rendering] -> [Support:Images] ::mod(rule="definitional", confidence=0.99, intent="Local file paths via Tauri convertFileSrc() and remote URLs")
[Feature:Rendering] -> [Support:HorizontalRule] ::mod(rule="definitional", confidence=0.99)
[Feature:Rendering] -> [Support:Math] ::mod(rule="definitional", confidence=0.99, intent="KaTeX — inline $...$ and block $$...$$")

## Feature 3: Table of Contents (TOC)

[Feature:TOC] -> [AutoGenerate] ::mod(rule="definitional", confidence=0.99, intent="Extract headings from rendered HTML automatically")
[Feature:TOC] -> [TreeIndent] ::mod(rule="definitional", confidence=0.99, intent="Indentation reflects heading hierarchy h1 > h2 > h3...")
[Feature:TOC] -> [ClickScroll] ::mod(rule="definitional", confidence=0.99, intent="Click TOC item → smooth scroll to corresponding position")
[Feature:TOC] -> [ScrollSpy] ::mod(rule="definitional", confidence=0.99, intent="Scrolling content highlights current TOC item")
[Feature:TOC] -> [Collapsible] ::mod(rule="definitional", confidence=0.99, intent="TOC sections can be collapsed/expanded")

## Feature 4: Folder Browser

[Feature:FolderBrowser] -> [RecursiveScan] ::mod(rule="definitional", confidence=0.99, intent="Rust backend recursively scans all .md files after opening folder")
[Feature:FolderBrowser] -> [TreeView] ::mod(rule="definitional", confidence=0.99, intent="Display as tree preserving folder structure")
[Feature:FolderBrowser] -> [ClickOpen] ::mod(rule="definitional", confidence=0.99, intent="Click filename to open in content area via invoke('read_file')")
[Feature:FolderBrowser] -> [HighlightCurrent] ::mod(rule="definitional", confidence=0.99, intent="Currently opened file is highlighted")
[Feature:FolderBrowser] -> [Sidebar] ::mod(rule="definitional", confidence=0.99, intent="Shares sidebar with TOC, switch via tabs")

## Feature 5: In-Document Search

[Feature:Search] -> [Trigger] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+F opens search bar sliding down from top of content area")
[Feature:Search] -> [RealtimeHighlight] ::mod(rule="definitional", confidence=0.99, intent="Highlight all matches with yellow background in real-time as user types")
[Feature:Search] -> [MatchCount] ::mod(rule="definitional", confidence=0.99, intent="Display match count like '3/12'")
[Feature:Search] -> [Navigate] ::mod(rule="definitional", confidence=0.99, intent="Enter → next match, Shift+Enter → previous match, scroll to current")
[Feature:Search] -> [Close] ::mod(rule="definitional", confidence=0.99, intent="Escape closes search bar and clears all highlights")
[Feature:Search] -> [CaseSensitive] ::mod(rule="definitional", confidence=0.99, intent="Toggle button for case-sensitive search")

## Feature 6: Theming

[Feature:Theme] -> [Implementation] ::mod(rule="definitional", confidence=0.99, intent="CSS variables on :root / [data-theme='dark']")
[Feature:Theme] -> [Toggle] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+Shift+T or toolbar button to switch")
[Feature:Theme] -> [Persistence] ::mod(rule="definitional", confidence=0.99, intent="Persists across restarts via @tauri-apps/plugin-store")

[Theme:Light] -> [Colors] ::mod(
  rule="definitional", confidence=0.99,
  intent="bg=#FFFFFF, text=#1A1A2E, sidebar=#F5F5F5, code_bg=#F8F8F8, blockquote_border=#E0E0E0, link=#2563EB"
)

[Theme:Dark] -> [Colors] ::mod(
  rule="definitional", confidence=0.99,
  intent="bg=#1E1E2E, text=#CDD6F4, sidebar=#181825, code_bg=#313244, blockquote_border=#45475A, link=#89B4FA"
)

## Feature 7: Font Control

[Feature:FontControl] -> [Increase] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+= increases by 2px")
[Feature:FontControl] -> [Decrease] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+- decreases by 2px")
[Feature:FontControl] -> [Reset] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+0 resets to 16px default")
[Feature:FontControl] -> [Range] ::mod(rule="definitional", confidence=0.99, intent="Clamped to 12px - 28px range")
[Feature:FontControl] -> [Persistence] ::mod(rule="definitional", confidence=0.99, intent="Persists via @tauri-apps/plugin-store")
[Feature:FontControl] -> [Font:Body] ::mod(rule="definitional", confidence=0.99, intent="Font stack: -apple-system, Segoe UI, system sans-serif")
[Feature:FontControl] -> [Font:Code] ::mod(rule="definitional", confidence=0.99, intent="Font stack: Cascadia Code, Consolas, monospace")

## Feature 8: File Watching

[Feature:FileWatch] -> [Mechanism] ::mod(rule="causal", confidence=0.99, intent="Rust notify crate watches file, app.emit('file-changed') notifies frontend")
[Feature:FileWatch] -> [AutoReload] ::mod(rule="causal", confidence=0.95, intent="File modified externally → auto-reload content and re-render")
[Feature:FileWatch] -> [PreserveScroll] ::mod(rule="definitional", confidence=0.95, intent="Maintain current scroll position after reload")
[Feature:FileWatch] -> [SwitchFile] ::mod(rule="definitional", confidence=0.95, intent="When switching files, call unwatch_file first then watch_file on new path")

## Feature 9: Print

[Feature:Print] -> [Trigger] ::mod(rule="definitional", confidence=0.99, intent="Ctrl+P triggers window.print()")
[Feature:Print] -> [ContentOnly] ::mod(rule="definitional", confidence=0.99, intent="@media print CSS hides sidebar and toolbar, only prints rendered Markdown content")

## Feature 10: External Links

[Feature:Links] -> [ExternalBrowser] ::mod(rule="definitional", confidence=0.95, intent="External links (http/https) open in default system browser via Tauri shell.open()")
[Feature:Links] -> [AnchorScroll] ::mod(rule="definitional", confidence=0.90, intent="Anchor links (#heading-id) scroll to corresponding position within document")
[Feature:Links] -> [LocalImages] ::mod(rule="definitional", confidence=0.85, intent="Local image paths converted via Tauri convertFileSrc() for asset:// protocol")

## Feature 11: Document Statistics (About Modal)

[Feature:DocStats] -> [AboutModal] ::mod(rule="definitional", confidence=0.99, intent="Displayed in About modal when a document is open, computed from rawMarkdown via useMemo")
[Feature:DocStats] -> [Stat:Words] ::mod(rule="definitional", confidence=0.99, intent="Total words = Chinese characters + English words")
[Feature:DocStats] -> [Stat:ChineseChars] ::mod(rule="definitional", confidence=0.99, intent="CJK character count via Unicode range \\u4e00-\\u9fff, shown only when > 0")
[Feature:DocStats] -> [Stat:EnglishWords] ::mod(rule="definitional", confidence=0.99, intent="Consecutive latin letter/number sequences, shown only when > 0")
[Feature:DocStats] -> [Stat:Characters] ::mod(rule="definitional", confidence=0.99, intent="Total characters excluding whitespace")
[Feature:DocStats] -> [Stat:Lines] ::mod(rule="definitional", confidence=0.99, intent="Line count via newline split")
[Feature:DocStats] -> [Stat:TokenEstimate] ::mod(rule="definitional", confidence=0.95, intent="Approximate LLM token count: English words / 0.75 + Chinese chars * 1.5")

## State Management (Zustand)

[AppState] -> [State:currentFile] ::mod(rule="definitional", confidence=0.99, intent="string | null — Currently opened file path")
[AppState] -> [State:currentFolder] ::mod(rule="definitional", confidence=0.99, intent="string | null — Currently opened folder path")
[AppState] -> [State:folderFiles] ::mod(rule="definitional", confidence=0.99, intent="FileNode[] — File tree of folder contents")
[AppState] -> [State:recentFiles] ::mod(rule="definitional", confidence=0.99, intent="string[] — Recent files list, max 10")
[AppState] -> [State:rawMarkdown] ::mod(rule="definitional", confidence=0.99, intent="string — Raw Markdown text")
[AppState] -> [State:renderedHTML] ::mod(rule="definitional", confidence=0.99, intent="string — Rendered HTML output")
[AppState] -> [State:headings] ::mod(rule="definitional", confidence=0.99, intent="Heading[] — {level: 1-6, text: string, id: string(slugified)}")
[AppState] -> [State:theme] ::mod(rule="definitional", confidence=0.99, intent="'light' | 'dark'")
[AppState] -> [State:fontSize] ::mod(rule="definitional", confidence=0.99, intent="number (px), range 12-28, default 16")
[AppState] -> [State:sidebarTab] ::mod(rule="definitional", confidence=0.99, intent="'toc' | 'files'")
[AppState] -> [State:sidebarVisible] ::mod(rule="definitional", confidence=0.99, intent="boolean")
[AppState] -> [State:searchVisible] ::mod(rule="definitional", confidence=0.99, intent="boolean")
[AppState] -> [State:searchQuery] ::mod(rule="definitional", confidence=0.99, intent="string")
[AppState] -> [State:searchMatches] ::mod(rule="definitional", confidence=0.99, intent="number — total match count")
[AppState] -> [State:currentMatch] ::mod(rule="definitional", confidence=0.99, intent="number — currently highlighted match index")

[Type:FileNode] -> [Fields] ::mod(rule="definitional", confidence=0.99, intent="{name: string, path: string, isFolder: boolean, children?: FileNode[]}")
[Type:Heading] -> [Fields] ::mod(rule="definitional", confidence=0.99, intent="{level: number(1-6), text: string, id: string}")

## Frontend → Rust Invocation Wrapper (tauriCommands.ts)

[TauriCommands] -> [openFileDialog] ::mod(rule="definitional", confidence=0.99, intent="invoke<FileResult | null>('open_file_dialog')")
[TauriCommands] -> [openFolderDialog] ::mod(rule="definitional", confidence=0.99, intent="invoke<FolderResult | null>('open_folder_dialog')")
[TauriCommands] -> [readFile] ::mod(rule="definitional", confidence=0.99, intent="invoke<string>('read_file', { path })")
[TauriCommands] -> [scanFolder] ::mod(rule="definitional", confidence=0.99, intent="invoke<FileNode[]>('scan_folder', { path })")
[TauriCommands] -> [watchFile] ::mod(rule="definitional", confidence=0.99, intent="invoke<void>('watch_file', { path })")
[TauriCommands] -> [unwatchFile] ::mod(rule="definitional", confidence=0.99, intent="invoke<void>('unwatch_file')")

[Type:FileResult] -> [Fields] ::mod(rule="definitional", confidence=0.99, intent="{path: string, content: string}")
[Type:FolderResult] -> [Fields] ::mod(rule="definitional", confidence=0.99, intent="{path: string, files: FileNode[]}")

## Keyboard Shortcuts

[Shortcuts] -> [Key:Ctrl+O] ::mod(rule="definitional", confidence=0.99, intent="Open file")
[Shortcuts] -> [Key:Ctrl+Shift+O] ::mod(rule="definitional", confidence=0.99, intent="Open folder")
[Shortcuts] -> [Key:Ctrl+F] ::mod(rule="definitional", confidence=0.99, intent="Search")
[Shortcuts] -> [Key:Ctrl+P] ::mod(rule="definitional", confidence=0.99, intent="Print")
[Shortcuts] -> [Key:Ctrl+Shift+T] ::mod(rule="definitional", confidence=0.99, intent="Toggle theme")
[Shortcuts] -> [Key:Ctrl+=] ::mod(rule="definitional", confidence=0.99, intent="Increase font size")
[Shortcuts] -> [Key:Ctrl+-] ::mod(rule="definitional", confidence=0.99, intent="Decrease font size")
[Shortcuts] -> [Key:Ctrl+0] ::mod(rule="definitional", confidence=0.99, intent="Reset font size")
[Shortcuts] -> [Key:Ctrl+B] ::mod(rule="definitional", confidence=0.99, intent="Toggle sidebar")
[Shortcuts] -> [Key:Escape] ::mod(rule="definitional", confidence=0.99, intent="Close search")

## Build & Packaging

[Build:Dev] -> [Commands] ::mod(rule="definitional", confidence=0.99, intent="npm install → npm run tauri dev (frontend hot-reload + Rust backend)")
[Build:Prod] -> [Commands] ::mod(rule="definitional", confidence=0.99, intent="npm run tauri build → output in src-tauri/target/release/bundle/")

[TauriConf] -> [App] ::mod(rule="definitional", confidence=0.99, intent="productName=MarkView, identifier=com.markview.app")
[TauriConf] -> [Window] ::mod(rule="definitional", confidence=0.99, intent="title=MarkView, width=1200, height=800, minWidth=600, minHeight=400")
[TauriConf] -> [Bundle] ::mod(rule="definitional", confidence=0.99, intent="targets: msi + nsis, icon: resources/icon.png")
[TauriConf] -> [FileAssociations] ::mod(rule="definitional", confidence=0.99, intent="ext: md/mdx/markdown, mimeType: text/markdown")

## Microsoft Store

[Store:MSIX] -> [Config] ::mod(
  rule="definitional", confidence=0.85,
  intent="Add 'appx' to bundle targets, set webviewInstallMode=downloadBootstrapper, submit MSIX via Microsoft Partner Center"
)

## Validation Checklist

[Validation] -> [Test:OpenFile] ::mod(rule="definitional", confidence=0.99, intent="Open .md file → correctly renders all Markdown elements")
[Validation] -> [Test:DragDrop] ::mod(rule="definitional", confidence=0.95, intent="Drag .md file → opens and renders")
[Validation] -> [Test:OpenFolder] ::mod(rule="definitional", confidence=0.95, intent="Open folder → sidebar shows .md file tree, click to switch")
[Validation] -> [Test:TOC] ::mod(rule="definitional", confidence=0.90, intent="TOC generated from headings, click to jump, scroll spy works")
[Validation] -> [Test:Search] ::mod(rule="definitional", confidence=0.90, intent="Ctrl+F search → highlight matches, Enter/Shift+Enter navigation")
[Validation] -> [Test:Theme] ::mod(rule="definitional", confidence=0.95, intent="Light/dark toggle works correctly, persists after restart")
[Validation] -> [Test:FontSize] ::mod(rule="definitional", confidence=0.95, intent="Increase/decrease effective, persists after restart")
[Validation] -> [Test:FileWatch] ::mod(rule="definitional", confidence=0.85, intent="External file modification → auto-reload, maintain scroll position")
[Validation] -> [Test:Print] ::mod(rule="definitional", confidence=0.90, intent="Ctrl+P → prints content only, no UI elements")
[Validation] -> [Test:RecentFiles] ::mod(rule="definitional", confidence=0.95, intent="Welcome page shows recent files, click to open")
[Validation] -> [Test:Build] ::mod(rule="definitional", confidence=0.90, intent="npm run tauri build → no errors")
[Validation] -> [Test:Package] ::mod(rule="definitional", confidence=0.85, intent="Installer runs correctly, .md file association works")
[Validation] -> [Test:LocalImages] ::mod(rule="definitional", confidence=0.80, intent="Local images display correctly via convertFileSrc()")
[Validation] -> [Test:ExternalLinks] ::mod(rule="definitional", confidence=0.95, intent="External links open in default system browser")
