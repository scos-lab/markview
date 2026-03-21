# MarkView

A clean, fast, lightweight Markdown reader for Windows.

## Download

| Version | Link |
|---------|------|
| Microsoft Store | [Get it from Microsoft Store](https://apps.microsoft.com/detail/9NV09JZ3X052) |
| Portable (.exe) | [MarkView_v1.0.3_portable.exe](https://github.com/scos-lab/markview/releases/download/v1.0.3/MarkView_v1.0.3_portable.exe) |
| Installer (NSIS) | [MarkView_v1.0.3_x64-setup.exe](https://github.com/scos-lab/markview/releases/download/v1.0.3/MarkView.-.Markdown.Reader_1.0.3_x64-setup.exe) |

## Features

- **Markdown Rendering** — GFM tables, task lists, math/KaTeX, code syntax highlighting
- **Table of Contents** — Auto-generated from headings with scroll spy
- **Folder Browser** — Open a folder and browse all `.md` files in a tree view
- **In-Document Search** — Ctrl+F with highlight and navigation
- **Dark / Light Theme** — Follows system preference or manual toggle
- **Font Size Control** — Adjustable (12–28px), persisted across sessions
- **File Watching** — Auto-reloads when the file is modified externally
- **Drag & Drop** — Drop `.md` files directly into the window
- **Print** — Clean print output (content only)
- **Token Estimation** — Document stats with word count and estimated token count

## Tech Stack

- **Tauri 2** (Rust) — Desktop framework using system WebView2
- **React 19** + TypeScript — Frontend UI
- **Vite 6** — Build tooling
- **TailwindCSS 4** — Styling
- **Zustand** — State management
- **Unified/Remark/Rehype** — Markdown processing pipeline

## How This Project Was Built

MarkView was built using **STL (Semantic Tension Language)** — a structured knowledge representation language designed for precise communication between AI models and between humans and AI.

### The Process

1. **Planning (Claude)** — The full application specification was written in STL format ([`plan_stl.md`](plan_stl.md)). STL encodes requirements, architecture decisions, component relationships, and implementation details as a graph of semantic edges with explicit confidence scores, rules, and intent.

2. **Implementation (Gemini)** — The STL plan was passed to Google Gemini, which read the structured specification and generated the complete working codebase — Rust backend, React frontend, styling, and configuration — in a single pass.

### Why STL?

Traditional natural language specs are ambiguous. When you hand a 2,000-word requirements doc to an LLM, the model must guess intent, infer priorities, and fill in gaps. Information degrades at every handoff.

STL solves this by encoding knowledge as **typed, weighted semantic edges**:

```
[MarkView] -> [Markdown_Reader] ::mod(
  rule="definitional",
  confidence=0.99,
  intent="Render .md files into beautifully typeset documents for reading (not editing)"
)
```

Each edge carries:
- **`rule`** — the type of relationship (causal, definitional, empirical, logical)
- **`confidence`** — how certain this statement is (0.0–1.0)
- **`intent`** — what this means in context

This means STL plans can be transferred between different AI models (Claude, Gemini, GPT, etc.) with **higher fidelity** than prose. The structured format eliminates ambiguity, preserves confidence levels, and lets the receiving model know exactly what is a hard requirement (`confidence=0.99`) versus a suggestion (`confidence=0.7`).

**MarkView is a proof of concept**: one model architects, another implements, and STL is the lossless wire format between them.

Learn more about STL at [stl-lang.org](https://stl-lang.org).

## Development

```bash
cd markview
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## License

MIT

## Developed by

[SCOS-LAB](https://github.com/scos-lab)
