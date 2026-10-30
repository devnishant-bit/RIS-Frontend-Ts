# Architecture

This document describes the **implemented skeleton**, then records the intended direction for replacing demo behavior. The app is not yet a production RIS frontend: backend authentication, API data, and most real page workflows are not implemented.

## Application composition

`src/main.tsx` mounts the app under React Strict Mode, the error boundary, shared providers, and BrowserRouter. `src/app/App.tsx` composes the route tree and global application state. The current layers are:

```text
main.tsx
└── AppErrorBoundary
    └── AppProviders (includes demo AuthProvider)
        └── BrowserRouter
            └── App / AppRouter
                ├── PublicLayout → LoginPage
                ├── RequireAuth → AppLayout → protected application routes
                ├── StandaloneLayout → legacy standalone routes
                └── fallback route
```

`AppLayout` owns the authenticated shell and renders page routes through its `<Outlet />`. The Sidebar is rendered only for the demo admin profile and is hidden on `/editor`. The top-level `Header` component is currently commented out in `AppLayout`; the current Sidebar contains its own profile/notification header area. Do not describe the top-level Header as mounted until it is restored. `PublicLayout` and `StandaloneLayout` do not render the standard shell.

The Sidebar owns its collapsed toggle state and notifies `AppLayout` through `onCollapsedChange`. The shell adjusts its grid track between 17.5rem and 4.5rem; at 1023px and below, both switch to a single-column/top-panel layout. Keep the two components' width and breakpoint rules aligned. See the [integration guide](./INTEGRATION_GUIDE.md) for exact props and wiring.

## Routing and access behavior

`src/routes/routePaths.ts` is the central URL constant list. `src/routes/AppRouter.tsx` currently declares:

- `/login` in `PublicLayout`.
- The regular app route set behind `RequireAuth` and `AppLayout`.
- `/dashboard` (the path is `/master/mis/reports/dashboard`) inside `RequirePermission`.
- Five legacy standalone paths outside `RequireAuth` and inside `StandaloneLayout`: `/worklist-window`, `/teleRadio`, `/teleClientExt`, `/CoordinatorDashboard`, `/DoctorPoolSetup`.
- A catch-all route for missing paths.

**Only Dashboard is currently protected by a permission guard.** `PageRoute.permission` values in the route inventory are annotations and do not automatically enforce access. Other standard routes currently require authentication only; permission-aware sidebar link visibility is separate presentation behavior. Do not assume a route is protected just because it has a `permission` field or a hidden menu link.

The standalone paths are currently reachable without the demo sign-in flow because that matches the observed parent `src/App.js` route tree. This does not establish that public access is correct. Confirm intended access with the product/backend owners before real data or production release. Backend authorization must enforce every API request and resource operation; frontend guards are not a security boundary.

The legacy parent app includes additional session quirks, including special handling for `/worklist-window`. The new skeleton preserves the route's standalone placement, not its complete legacy session implementation.

## Authentication and authorization status

`src/shared/auth/AuthProvider.tsx` uses `authApi` to restore a **demo** session and exposes a user, login/logout actions, and `hasPermission`. Demo login selects an in-memory profile. There is no real token/session persistence, backend login, session validation, idle timeout, or password-expiry flow in this skeleton. `RequireAuth` and `RequirePermission` are examples of client-side navigation behavior only.

Before replacing the demo auth adapter, agree on the backend contract: session or token model, restore/login/logout endpoints, cookie attributes, CSRF, CORS, expiry, permission payload, and failure behavior. Do not put secrets in Vite client environment variables.

## Feature-first module structure

Use feature folders for domain-specific pages and components. Current examples include `features/worklist`, `features/users`, `features/reports`, `features/scheduling`, and `features/dashboard`. Components that serve one feature belong with that feature. Place a component in `shared/` only when it is genuinely reused across features and has a stable, domain-neutral API.

`src/routes/routePageSections.ts` describes the visible section composition for placeholder routes. `src/routes/pageSectionComponents.ts` maps component names to their feature-owned section components. Those components currently delegate to the shared `PageSectionPlaceholder` renderer. They are named code-replacement boundaries, not finished forms/tables or a claim that the legacy monolithic pages had matching internal components.

The Worklist is the first functional UI slice:

- `features/worklist/pages/WorklistPage.tsx` owns the page composition, demo search/filter state, status/modality filters, and paging state.
- `features/worklist/components/WorklistFilters` owns search and filter controls.
- `features/worklist/components/WorklistTable` renders the attached desktop table/mobile cards and its own pagination; `useMediaQuery.ts` observes the mobile breakpoint.
- `features/worklist/data/demoStudies.ts` contains synthetic rows; `types.ts` defines the app's worklist model.
- The page adapts its `WorklistStudy` records into the table component's display-row shape. Keep this adapter explicit when the API model is introduced; do not silently conflate API and display types.
- `features/worklist/components/WorklistPagination` remains in the tree but is not currently mounted because the table contains its own pagination controls.
- Worklist SearchBar owns draft filter state and submits through `onSearch`; `WorklistPage` owns applied filters and maps demo-domain records into table display rows.
- The SearchBar's More modality popover shows codes after the first nine. It is portaled into the filter root so the card's overflow does not clip it.

When replacing a section placeholder, keep the route page responsible for composition and move substantial behavior into appropriately owned feature components/hooks. Define explicit props and domain types; avoid turning one generic component into a cross-feature dependency that knows every page.

## Styling and responsive behavior

- Use CSS Modules (`*.module.css`) for component and page selectors. Co-locate styles with the component/page.
- `src/styles/global.css` is the deliberate global entry for document defaults and imports of tokens, themes, and fonts.
- Shared design values belong in `src/styles/tokens.css`; theme overrides belong in `src/styles/themes.css`.
- Avoid broad global selectors, `:global`, and importing vendor CSS from feature components. If an integration needs global vendor CSS, import it once from the app entry and document its scope and side effects.
- CSS Modules scope class names, but do not scope element selectors, custom properties, inherited styles, portal content, or third-party global CSS.
- The attached Worklist table CSS originated with a different theme-token vocabulary; `Table.module.css` maps those variables locally to the skeleton's theme tokens. Prefer the skeleton tokens for new components.
- The responsive Worklist uses `useSyncExternalStore` in `useMediaQuery` to subscribe to `matchMedia`; CSS handles the rest of the layout changes.

## TypeScript and validation boundary

The app aims to use TypeScript for all new and migrated frontend code. Keep strict checking enabled and model API/domain data explicitly. Do not use `any`, weaken TypeScript settings, or enable JavaScript checking shortcuts to make a migration appear complete.

Current scripts:

```sh
npm run typecheck
npm run lint
npm run build
```

These checks currently target the new skeleton's listed directories, not every legacy or partial migration file. Extend the checks when migrating each area; do not claim the whole repository has been converted to TypeScript while legacy JavaScript remains.

## Suggested production evolution

1. Confirm route access and permission requirements; make the route configuration enforce them consistently.
2. Confirm backend authentication, API, error, and permission contracts.
3. Establish shared design tokens, form controls, feedback states, and accessibility patterns from product requirements.
4. Complete Worklist as the first real vertical slice: typed API boundary, loading/empty/error states, filters, pagination, action behavior, and authorization.
5. Migrate one feature at a time, with feature-owned API/types/hooks/components and route-level composition.
6. Migrate viewer, tele-radiology, scheduling, and other integrations only after documenting their data, access, and vendor constraints.
7. Add automated tests and CI according to the agreed test runner and deployment environment; then expand lint/typecheck coverage and retire legacy files after parity is reviewed.

See [implementation plan](./IMPLEMENTATION_PLAN.md) for staged work and [open decisions](./PROJECT_CONTEXT.md#open-decisions) for unresolved inputs.
