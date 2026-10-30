# RIS Frontend

This directory contains the **new React + TypeScript frontend skeleton** for the RIS application. The legacy JavaScript/React app is in the parent repository. The skeleton preserves its route inventory and shell flow while providing a working demo Worklist and replaceable page sections elsewhere.

## Start here

For a new developer or LLM, read these documents in order:

1. [Project context](./docs/PROJECT_CONTEXT.md) — purpose, current state, constraints, and rules for making changes.
2. [Integration guide](./docs/INTEGRATION_GUIDE.md) — concrete wiring map for routes, shell, Worklist filters/table, props, and state callbacks.
3. [Architecture](./docs/architecture.md) — how routing, shells, auth demo, features, and styling currently fit together.
4. [Goals](./docs/GOALS.md) — intended outcome and scope boundaries.
5. [Implementation plan](./docs/IMPLEMENTATION_PLAN.md) — proposed sequence from skeleton to real features.
6. [Reusable LLM prompt](./docs/LLM_PROMPT.md) — copy this into a coding model when starting a task.

These documents describe the current repository state as of their last update. Source code is authoritative if it changes later; update the docs when architecture or project decisions change.

## Run locally

Run commands from this `Frontend` directory:

```sh
npm install
npm run dev
```

Vite is configured to use port `3001` so it can run beside the legacy app on port `3000`. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` when a backend is ready. Never put credentials or secrets in a `VITE_` variable; Vite exposes those values to browser code.

## Validate changes

```sh
npm run typecheck
npm run lint
npm run build
```

The scripts currently cover the new skeleton folders, not all remaining legacy JavaScript files under the parent `src/` tree or the partial migration references under this app's `src/components`, `src/pages/Login`, `src/index.tsx`, and `src/config.ts`.

## Current application status

- Demo authentication has six selectable in-memory profiles. It does not authenticate with the backend or persist a real session.
- Public login and authenticated app shells are implemented. The admin Sidebar is conditionally mounted; the top-level Header is currently commented out in `AppLayout`. See the [integration guide](./docs/INTEGRATION_GUIDE.md) before changing their wiring.
- The Worklist is an interactive layout demo backed by synthetic records. It has search/filter controls, a responsive desktop table/mobile card view, and table pagination. It is not connected to RIS/PACS data.
- Other routed pages use named, feature-grouped section components that currently render replaceable placeholders.
- Five legacy standalone routes remain reachable outside the authentication boundary to match the observed parent route flow. This is a compatibility observation, not a production security decision.

After a substantial feature or integration change, update the wiring guide and relevant architecture/context docs so they continue to match the code.

## Project structure

```text
src/
  app/          bootstrap, providers, and error boundary
  routes/       URL constants, route composition, and access boundaries
  layouts/      public, authenticated, and standalone shells
  features/     feature-owned pages, components, data, and types
  shared/       cross-feature infrastructure and shared UI
  styles/       global reset, design tokens, theme, and fonts entrypoints
  components/   partial migration references; not the main feature structure
```

Styles for app-owned components belong in colocated `*.module.css` files. See [architecture](./docs/architecture.md) for CSS and component boundaries.
