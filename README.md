# MarkView

A clean, fast, lightweight Markdown reader for Windows.

## Download

| Version | Link |
|---------|------|
| Microsoft Store | [Get it from Microsoft Store](https://apps.microsoft.com/detail/9NV09JZ3X052) |
| Portable (.exe) | [MarkView_v1.0.3_portable.exe](https://github.com/scos-lab/markview/releases/download/v1.0.3/MarkView_v1.0.3_portable.exe) |
| Installer (MSI) | [MarkView_v1.0.3_x64.msi](https://github.com/scos-lab/markview/releases/download/v1.0.3/MarkView.-.Markdown.Reader_1.0.3_x64_en-US.msi) |

> **Note:** Windows SmartScreen may warn about downloaded `.exe` / `.msi` files because they are not code-signed. To bypass: click **"More info"** → **"Run anyway"**. Alternatively, right-click the file → **Properties** → check **"Unblock"** → OK. The **Microsoft Store** version does not have this issue.

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

MarkView was born from a controlled experiment: **does the format of a specification affect the quality of LLM-generated code?**

We wrote the same app spec in three formats — Natural Language (NL), STL, and STLC — and gave each to a separate Google Gemini instance. Same 19 features, same tech stack, same prompt. The results:

| Metric | Natural Language | STL | STLC |
|--------|:---:|:---:|:---:|
| **Feature Completion** | 8.5/19 (45%) | **13/19 (68%)** | 10/19 (53%) |
| **Compiles?** | NO | **YES** | YES |
| **Fully Autonomous?** | NO | **YES** | NO |
| **Human Interventions** | 1+ | **0** | 1 |

**STL was the only format that compiled on the first attempt with zero human intervention.** The NL version didn't even compile (missing `build.rs`, broken regex). The STLC version compiled but missed practical details like CSS imports — correct logic, broken visuals.

### The Process

1. **Planning (Claude)** — Claude wrote the full application specification in STL format ([`plan_stl.md`](plan_stl.md)), encoding every feature, component, and dependency as typed semantic edges with explicit confidence scores.

2. **Implementation (Gemini)** — The STL plan was passed to Google Gemini, which generated the complete working codebase — Rust backend, React frontend, styling, and configuration — autonomously in a single pass.

### What Is STL?

**STL (Semantic Tension Language)** encodes knowledge as **typed, weighted semantic edges**:

```
[MarkView] -> [Markdown_Reader] ::mod(
  rule="definitional",
  confidence=0.99,
  intent="Render .md files into beautifully typeset documents for reading (not editing)"
)
```

Each edge carries:
- **`rule`** — relationship type (causal, definitional, empirical, logical)
- **`confidence`** — certainty level (0.0–1.0). `0.99` = hard requirement. `0.7` = nice to have.
- **`intent`** — what this actually means in context

Natural language buries priorities between the lines. STL makes them explicit — and transferable between any AI model (Claude, Gemini, GPT) with near-zero information loss.

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
