# Implementation plan

This plan moves from the current skeleton toward a real application without attempting a risky all-at-once rewrite. Reorder only after recording the reason and the decision.

## Stage 0 — Preserve context and baseline (current)

- [x] Create the new Vite + React + TypeScript app under `Frontend/` beside the legacy app.
- [x] Inventory parent routes and represent them in React Router.
- [x] Create public, authenticated, and standalone layouts.
- [x] Add a demo auth provider and route guard examples.
- [x] Build an interactive synthetic-data Worklist layout.
- [x] Establish CSS Modules and global tokens/themes.
- [x] Document architecture, project state, goals, and handoff prompts.
- [ ] Keep docs aligned as code and decisions change.

## Stage 1 — Confirm product, access, and backend contracts

- Review every legacy route and identify its user roles and required permissions.
- Resolve whether each standalone route is public, authenticated, or externally launched.
- Confirm login/session restoration/logout, cookie, CSRF, CORS, timeout, and permission contracts.
- Confirm Worklist API schema, paging model, search/filter semantics, workflow actions, and error shapes.
- Record decisions in architecture and feature requirements before connecting real data.

**Exit condition:** route access matrix and backend contracts are reviewed by the responsible product/backend owners.

## Stage 2 — Establish the design and component foundation

- Confirm design references, brand/theme, responsive breakpoints, workstation/tablet/mobile support, and accessibility expectations.
- Refine tokens, typography, spacing, buttons, form fields, dialogs, feedback, and table patterns from those requirements.
- Define component ownership and naming rules; only promote components to `shared/` after repeated use is demonstrated.
- Select testing and CI approach.

**Exit condition:** shared patterns can support a feature without copying styles or creating global CSS leakage.

## Stage 3 — Complete Worklist vertical slice

- Define API request/response types separately from UI/display types.
- Add a feature-owned API module using the shared HTTP client and agreed auth behavior.
- Implement loading, empty, error, and success states; server-side/client-side filter and pagination behavior according to the API contract.
- Connect row actions and keep responsive/mobile behavior accessible.
- Add focused component/integration tests for filters, pagination, table states, and route behavior.
- Verify backend permission enforcement independently of client menu visibility.

**Exit condition:** a user can complete the approved Worklist workflow with real API data and documented failure behavior.

## Stage 4 — Migrate features incrementally

Suggested order after Worklist: authentication/session, user/permission administration, organizations/departments, modality/equipment, doctors, reports, scheduling, then specialized standalone workflows. Product priority can change this order.

For each feature:

1. Inspect the legacy page and its related API/backend behavior.
2. Record requirements, permissions, states, fields, actions, and responsive behavior.
3. Define feature types and API boundary.
4. Build the route page as composition of feature-owned components.
5. Add CSS Modules and use existing design tokens.
6. Implement accessible loading/empty/error/success behavior.
7. Add focused tests and verify typecheck/lint/build.
8. Review route/workflow parity with a product owner before retiring the legacy path.

**Exit condition:** the migrated workflow has reviewed parity, tests, and backend access controls.

## Stage 5 — Specialized integrations and production readiness

- Review DICOM/viewer, tele-radiology, editor, calendar, export, and other vendor libraries before integration.
- Document their global styles, portals, workers, network/security requirements, and licensing constraints.
- Add observability, error handling, performance budgets, deployment configuration, and CI coverage.
- Expand TypeScript/lint scope as JavaScript is migrated; remove legacy paths only after ownership and parity review.

**Exit condition:** product, backend, security, and operations owners approve production behavior and deployment readiness.

## Working rule

Keep each task small enough to review. Report what changed, which files own it, unresolved assumptions, and which validation commands were run. Do not connect live patient data or decide security policy by assumption.
