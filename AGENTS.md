# Repository Guidelines

## Project Structure & Module Organization
Pile is an Electron + React desktop app. Main-process code lives in `src/main`, renderer UI lives in `src/renderer`, tests live in `src/__tests__`, and static assets live in `assets/`. Keep Electron IPC handlers, filesystem logic, indexing, and AI integration separated by responsibility. Avoid adding new cross-cutting logic directly into large context files or page components.

## Build, Test, and Development Commands
- `pnpm start` — run the app in development mode.
- `pnpm build` — build main and renderer bundles.
- `pnpm lint` — run ESLint across `.js`, `.jsx`, `.ts`, and `.tsx`.
- `pnpm test` — run Jest tests.
- `pnpm package` — create distributable desktop builds.
Use `pnpm lint && pnpm test` before opening a PR.

## Coding Style & Naming Conventions
Use 2-space indentation, LF line endings, and UTF-8 encoding per `.editorconfig`. Follow existing ESLint rules from `.eslintrc.js`. Prefer small modules with a single responsibility. New business logic should live in dedicated utilities, hooks, or context helpers rather than inside page components. Reuse existing naming patterns: `useX` for hooks, `XContext` for contexts, `pileX` for main-process utilities, and `index.tsx` or `index.jsx` for component entry files.

## Modular Design Rules
Keep modules focused, composable, and replaceable. UI components must not contain filesystem or IPC logic. Renderer contexts should orchestrate state, while low-level operations belong in hooks or utility modules. Main-process handlers should stay thin and delegate to utilities. When editing an oversized file, prefer extracting a new module instead of adding more branching.

## Testing Guidelines
Jest is the test runner with `jsdom` environment. Place tests under `src/__tests__` or beside modules using `*.test.ts(x)` or `*.test.js(x)`. Add tests for indexing, file operations, and new business logic where practical.

## Commit & Pull Request Guidelines
Follow the existing concise commit style seen in history, e.g. `Disable AI buttons if AI API key is invalid (#106)`. Keep commits focused and descriptive. PRs should explain why the change is needed, summarize affected areas, link issues when relevant, and include screenshots for UI changes.
