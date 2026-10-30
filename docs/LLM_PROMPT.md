# Reusable LLM prompt

Copy this prompt into ChatGPT, another coding LLM, or an IDE assistant. Fill in the task section at the bottom. Keep the repository docs available to the model or paste the linked docs if it cannot inspect local files.

```text
You are helping build the RIS Frontend modernization.

CONTEXT
- The repository root contains a legacy React/JavaScript application.
- The new application is the nested `Frontend/` Vite + React + TypeScript project. All commands and normal changes belong there unless I say otherwise.
- Before proposing or editing code, read `Frontend/README.md`, `Frontend/docs/PROJECT_CONTEXT.md`, `Frontend/docs/architecture.md`, and the relevant source files. The current source is authoritative if docs have drifted.
- For component wiring, read `Frontend/docs/INTEGRATION_GUIDE.md`; after a substantial integration or feature change, update it and any affected architecture/context docs so the next developer/model can wire the next piece correctly.
- When integrating copied or separately authored components, follow the Component integration checklist in `Frontend/docs/PROJECT_CONTEXT.md`; compare exports, props, state ownership, data shape, CSS tokens, layout widths, and breakpoints with the parent call site.
- The goal is an incremental, feature-first, component-based TypeScript application. The current Worklist is an interactive synthetic-data demo; most other pages are placeholders, not completed workflows.

NON-NEGOTIABLE ENGINEERING RULES
- Use strict TypeScript with explicit types. Do not use `any`, disable checks, or loosen tsconfig to conceal errors.
- Organize domain code under `Frontend/src/features/<feature>/`. Keep page-specific pieces with their feature. Put code in `shared/` only when it is genuinely cross-feature and domain-neutral.
- Keep route paths centralized in `src/routes/routePaths.ts`; use React Router links/navigation for internal navigation.
- Use a colocated CSS Module for component/page styling. Use existing theme tokens. Do not add broad global CSS, `:global`, or component-level vendor stylesheet imports without documenting why.
- Preserve current routes and parent workflow behavior unless the requested task explicitly changes them. Identify uncertainty; do not invent requirements.
- Auth and permission checks in this frontend are demo/presentation behavior. Backend authorization must protect real API calls. Do not connect real patient data or credentials without an approved contract.
- Do not expose `.env` values, secrets, or patient data in output, code, screenshots, or prompts.
- Prefer focused, reviewable changes. Do not replace unrelated files or redesign the architecture as part of a feature task.

TASK METHOD
1. Restate the requested outcome briefly and identify the relevant route/feature files.
2. Inspect the existing component props, data types, theme tokens, and route composition before writing code.
3. Implement the request in the appropriate feature folder. Keep page composition separate from reusable feature components and API/data logic.
4. Handle loading, empty, error, and success states when the task involves data. Keep demo data clearly synthetic.
5. Run the relevant existing validation commands from `Frontend/`: `npm run typecheck`, `npm run lint`, and `npm run build`. Do not claim a command passed unless it was actually run. Do not add or run tests unless I ask; if a change needs tests, propose which tests should be added.
6. Update architecture/project docs if a lasting decision or project state changed.
7. Summarize changed files, behavior, validation results, and remaining assumptions. If you cannot edit the local repository, provide complete code with exact destination paths and explain any required wiring.

TASK
[Describe one feature, bug, or design change here. Include expected behavior and constraints.]
```

## Quick task brief template

When a task needs more detail, add:

```text
Feature/route:
User problem:
Expected behavior:
Roles/permissions (if known):
Data/API contract (if known; never include secrets):
Responsive/accessibility requirements:
Files I believe are involved (optional):
What should remain unchanged:
```

The prompt is a starting context, not a substitute for checking the current repository. Models can miss details, and architecture docs can become stale; ask the model to name assumptions and verify source files.
