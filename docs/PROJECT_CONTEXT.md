# Project context and model handoff

**Read this before changing code.** This file is the portable brief for developers and LLMs joining the project. It is designed to reduce repeated explanations; it cannot guarantee that a model's assumptions are correct. Inspect the source files named below and treat them as authoritative when they differ from this document.

## What this project is

- The repository root contains the legacy React/JavaScript RIS frontend.
- The active modernization skeleton is the nested `Frontend/` Vite app. Run commands from that folder.
- The goal is to rebuild the frontend as a modular, component-based, strict TypeScript React application while retaining the legacy product's workflows and route behavior where confirmed.
- This is a healthcare imaging/RIS/PACS interface. Use synthetic/demo data only in the skeleton. Never invent or expose real patient data, credentials, endpoints, or production secrets.

## Current state (2026-10-29)

- Vite + React 19 + TypeScript 6 + React Router 6.
- Strict TypeScript is enabled for `src/main.tsx`, `src/app`, `src/features`, `src/layouts`, `src/routes`, `src/shared`, and declaration files. Existing partial references under `src/components`, `src/pages`, `src/index.tsx`, and `src/config.ts` are outside the app typecheck include.
- Authentication is a demo adapter with six in-memory profiles. It does not call the backend or restore a real session.
- Standard authenticated pages share `AppLayout`. The admin Sidebar is shown except on `/editor`; the top-level `Header` is currently commented out in the layout.
- The route list follows the parent app. Dashboard is the only standard route currently wrapped in `RequirePermission`. Other route permission fields/menu visibility do not enforce direct navigation.
- Five standalone paths are currently outside `RequireAuth`: `/worklist-window`, `/teleRadio`, `/teleClientExt`, `/CoordinatorDashboard`, `/DoctorPoolSetup`. Confirm production access policy before wiring data.
- Worklist is the only currently interactive feature page. It uses synthetic studies, a draft/submitted filter flow, local search/modality/status filtering, a responsive desktop/mobile table, and pagination in the table component. The SearchBar shows nine modalities inline and puts the rest in a floating More popover.
- Other pages render named section placeholders. Those components are replacement boundaries based on observed page structure, not finished business functionality.
- CSS Modules are the required component/page styling method. Global CSS is intentionally limited to reset/document defaults, theme tokens, and font imports.
- Current baseline validation commands are `npm run typecheck`, `npm run lint`, and `npm run build`.

## Important source of truth files

Read the smallest relevant set before editing:

- App mount/providers: `src/main.tsx`, `src/app/App.tsx`, `src/app/providers/AppProviders.tsx`.
- Routes and URLs: `src/routes/AppRouter.tsx`, `src/routes/routePaths.ts`, `src/routes/RequireAuth.tsx`, `src/routes/RequirePermission.tsx`.
- Shell: `src/layouts/AppLayout.tsx`, `src/layouts/PublicLayout.tsx`, `src/layouts/StandaloneLayout.tsx`.
- Demo auth: `src/shared/auth/AuthProvider.tsx`, `src/features/auth/types.ts`, `src/features/auth/api/authApi.ts`.
- Worklist: `src/features/worklist/pages/WorklistPage.tsx`, `src/features/worklist/types.ts`, `src/features/worklist/data/demoStudies.ts`, and `src/features/worklist/components/`.
- Integration wiring map: `docs/INTEGRATION_GUIDE.md` (current prop contracts, state/data flow, route registration, and shell coordination).
- Placeholder composition: `src/routes/routePageSections.ts`, `src/routes/pageSectionComponents.ts`, `src/shared/ui/DemoFeaturePage.tsx`, `src/shared/ui/PageSectionPlaceholder.tsx`.
- CSS system: `src/styles/global.css`, `src/styles/tokens.css`, `src/styles/themes.css`.
- Scope of TypeScript checks: `tsconfig.app.json`; lint scope: `package.json` scripts.
- Legacy behavior reference: parent repository `src/App.js`, `src/components/SideBar.js`, and relevant parent `src/pages/*` files. Do not assume legacy code is valid TypeScript architecture or safe backend behavior.

## Architecture rules for contributions

1. Work inside `Frontend/` unless the task explicitly targets the legacy app.
2. Use feature-first ownership: feature-specific page/components/types/data/hooks live under `src/features/<feature>/`. Put a component in `src/shared/` only when multiple features genuinely use it and its API is domain-neutral.
3. Keep pages focused on composing feature components. Keep business logic/data access in appropriately owned hooks/API modules as those are introduced.
4. Keep TypeScript strict. Define explicit domain and component prop types. Do not use `any`, disable checks, or weaken compiler settings to hide migration gaps.
5. Use `*.module.css` beside each component/page. Use tokens from `src/styles/tokens.css`; keep global selectors in the deliberate global entry only. Avoid `:global` unless a documented vendor integration requires it.
6. Use React Router `Link`/navigation APIs for internal navigation. Keep route strings centralized in `routePaths.ts`.
7. Treat all demo auth and frontend permission checks as presentation only. The backend must enforce access to real data and operations.
8. Preserve the existing page flows and parent route paths unless the task requests a change. If parent behavior is ambiguous, document the uncertainty rather than silently inventing a requirement.
9. Keep demo records synthetic and clearly labeled. Do not connect the UI to real patient data without an approved API contract.
10. Update these context docs when a lasting architecture, scope, or security decision changes.

## Component integration checklist

Use this whenever bringing in a component written separately or copied from the legacy app. Do not paste it in and assume its previous app contract still fits.

1. **Check the export.** Is it a named or default export? Does the import path and filename/casing match the actual file?
2. **Check the props contract.** List required/optional props, callback names and argument types, and defaults. Compare them with the parent call site. Type the component invocation before styling it.
3. **Check who owns state.** Decide whether the parent or child controls values such as filters, pagination, selected rows, collapsed state, and theme. For child-owned state that changes parent layout, expose a typed callback (for example `onCollapsedChange`). Avoid two competing owners for the same state.
4. **Check the data shape.** Compare the component row/model type to the feature/API type. Add an explicit adapter at the page or feature boundary instead of renaming fields throughout unrelated code. Map status enums deliberately.
5. **Check dependencies.** Verify every component, icon, hook, stylesheet, and CSS module import exists and is installed. Confirm internal links use the app's route constants and any required Router/provider context is present.
6. **Check layout and styling assumptions.** Identify parent display mode (grid/flex), fixed widths, positioning, overflow, z-index, and responsive breakpoints. Make the parent track/flow respond to the child's collapsed/expanded state. Replace old CSS variables with the app's tokens; missing variables can make UI look broken even if the page renders.
7. **Check states and behavior.** Render normal data, empty data, loading/error states, callback behavior, keyboard/focus behavior, and action disabled states as relevant.
8. **Validate the integration.** Run `npm run typecheck`, `npm run lint`, and `npm run build`. Then open the exact route and manually check desktop and mobile widths, browser console, and layout before considering it integrated.
9. **Update the docs** if this integration establishes a shared API, layout rule, or lasting architectural decision.

When asking an LLM to integrate a component, provide both the component code and the existing parent page/layout files. Ask it to compare the contracts and wire it into the app rather than simply replacing a file.

## Known caveats to keep visible

- Route permission properties are not automatically enforced. Only Dashboard is behind the permission boundary today.
- Standalone route accessibility is inherited from the legacy route tree and remains an unresolved security/product decision.
- The demo auth API currently uses a browser timer and has no production persistence.
- `features/worklist/components/WorklistPagination` exists but is not mounted; the attached `WorklistTable` renders pagination itself.
- Worklist tag and report-content filters are not applied because synthetic records do not currently include those fields.
- The top-level `Header` in `AppLayout` is commented out; do not assume it is visible in the current shell.
- The `lint` and TypeScript project include exclude partial/legacy paths. Passing commands do not mean all repository JavaScript is migrated or checked.
- Current placeholders establish composition points only. Avoid describing placeholder pages as implemented workflows.

## Open decisions

- Which standalone routes require authentication and which permissions protect each route/action?
- What backend login/session, CSRF/CORS, logout, and session restoration contract is available?
- What API schemas and permission vocabulary are canonical?
- Which Worklist actions, fields, filters, and status transitions are required for the first real integration?
- What design references, supported viewport sizes, workstation constraints, accessibility target, and theme behavior are required?
- Which test framework, CI system, and deployment target should be adopted?
- Which parent-only files are active, obsolete, or safe to remove after migration?

## If two sources disagree

Use this order: explicit user decision in the current task, current source code and configuration, approved product/backend contract, then these docs, then assumptions. Tell the user when a conflict changes scope or security. Do not include `.env` contents in prompts or documentation.
