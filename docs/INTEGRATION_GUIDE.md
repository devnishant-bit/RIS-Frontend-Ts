# Component integration and wiring guide

Use this as the practical wiring map when replacing a placeholder, copying a component, or connecting two feature pieces. It describes the current skeleton, including the latest Worklist and Sidebar integrations. Source files remain authoritative if this guide gets stale.

## General feature wiring pattern

```text
routePaths.ts
  -> AppRouter.tsx chooses access boundary and shell
    -> Layout renders shared shell + <Outlet />
      -> Feature page composes feature components
        -> API/data adapter supplies typed props
          -> Components emit typed callbacks to the page
```

For a real feature, keep the composition page in `src/features/<feature>/pages/`. Put feature-specific UI in `src/features/<feature>/components/`, domain types in `types.ts`, API calls in `api/`, and reusable state logic in feature-owned hooks. The page is the normal place to translate API/domain data for a display component. Promote code to `src/shared/` only when multiple features truly share it.

To put the page on a route, update `src/routes/routePaths.ts`, add the page to `src/routes/AppRouter.tsx` inside the correct layout/access boundary, and update sidebar configuration in `src/layouts/components/Sidebar/menuItems.tsx` if it belongs in admin navigation. Do not treat sidebar visibility as route authorization.

## Current Worklist wiring

```text
WorklistPage
  ├── SearchBar (draft filter state)
  │     ├── onSearch(SearchFilters) -> WorklistPage applies filters
  │     └── onClear() -> WorklistPage clears applied filters
  └── WorklistTable (display rows + pagination state)
        ├── onPageChange(page) -> WorklistPage
        └── onRowsPerPageChange(size) -> WorklistPage
```

| Piece | File | Current contract / responsibility |
| --- | --- | --- |
| Route page | `src/features/worklist/pages/WorklistPage.tsx` | Owns applied filter state, filtering, page/page-size state, and composition. |
| Search UI | `src/features/worklist/components/WorklistFilters/WorklistFilters.tsx` | Default export `SearchBar`; props: optional `theme`, `onSearch(filters)`, `onClear()`. It owns editable/draft form state and submits it to the page. |
| Filter model/options | `src/features/worklist/components/WorklistFilters/worklistFiltersData.ts` | Exports `SearchFilters`, `StudyStatus`, `ModalityCode`, filter option lists, defaults, and date presets. |
| Search icons | `src/features/worklist/components/WorklistFilters/worklistFiltersIcon.tsx` | Local SVG icon component used by SearchBar; no external icon dependency. |
| Search styles | `src/features/worklist/components/WorklistFilters/WorklistFilters.module.css` | CSS Module for both filter views and the More popover. |
| Demo domain model/data | `src/features/worklist/types.ts`, `src/features/worklist/data/demoStudies.ts` | `WorklistStudy` records are synthetic; dates are generated relative to the current day. |
| Results table | `src/features/worklist/components/WorklistTable/WorklistTable.tsx` | Default export `WorklistTable`; receives `rows`, pagination values, and callbacks. Renders desktop table or mobile cards and owns the visible pagination controls. |
| Results table types/styles | `WorklistTable.tsx`, `Table.module.css`, `useMediaQuery.ts` | `WorklistTableRow` is a display model; styles map legacy visual variables to current theme values; media hook switches table/card presentation. |

### Worklist data path

1. SearchBar edits a local `SearchFilters` draft. It does not change results on every keystroke.
2. Pressing Search invokes `onSearch(filters)`. WorklistPage stores that as applied filters and resets the page to 1.
3. WorklistPage filters `demoStudies`, normalizing field values where they differ from UI option values (for example `XRAY` to the demo model's `XR`).
4. The current status mapping is `Ready`/`Draft` -> `Unread`, `Preliminary` -> `In Progress`, and `Final` -> `Reported`.
5. The page slices filtered rows for the current page and adapts each `WorklistStudy` into `WorklistTableRow` (`examId` -> `examid`, etc.). Preserve this boundary when replacing demo data with an API model.
6. The table invokes page callbacks for pagination. Page size changes reset the page to 1.
7. Clear in SearchBar resets its own draft and invokes `onClear`, which clears the applied filter state in WorklistPage.

**Current filter limitation:** the synthetic studies do not contain tags or report text, so the Tags and Report Content controls are not applied to demo results yet. Before implementing those filters, add agreed fields to the data/API model and define their matching semantics.

### Modality More popover

`ModalityChips` shows the first nine codes inline. Remaining codes are shown by the More button in a popover positioned below it. The popover is portaled into the SearchBar root so card/scroll overflow cannot clip it. All chips read/write the same `filters.modalities` array, whether shown inline or in the popover. Outside click, Escape, scroll, resize, or choosing a code closes it. If changing chip counts, keep `WorklistPage`'s select-all detection based on `MODALITIES.length` rather than a hard-coded number.

## Current application shell wiring

```text
RequireAuth
  -> AppLayout
      ├── Header: currently commented out in AppLayout
      ├── Sidebar: only when demo user is admin and path is not /editor
      │     ├── user { name, role }
      │     ├── onLogout -> AuthProvider.logout
      │     └── onCollapsedChange -> AppLayout grid width
      └── <Outlet /> -> selected page   
```

`src/layouts/components/Sidebar/Sidebar.tsx` currently has a **default export**. Its required prop is `user: { name, role, email?, initials? }`; `theme`, `onToggleTheme`, `notifications`, `menu`, `onLogout`, and `onCollapsedChange` are optional. AppLayout maps `AppUser.displayName/isAdmin` into this component's presentation user shape and supplies `logout`.

Sidebar owns its collapsed interaction state and reports changes through `onCollapsedChange`. AppLayout uses that signal to change the desktop grid track from 17.5rem expanded to 4.5rem collapsed. At 1023px and below, both sidebar and shell switch to a single-column top-panel layout. If you change the Sidebar width or breakpoint, update the matching `AppLayout.module.css` grid tracks/breakpoint at the same time. The root `--sidebar-width` token is not currently the source of these two component widths.

The top-level `Header` import/render is currently commented out in `src/layouts/AppLayout.tsx`; the new Sidebar itself contains a profile/notification header area. Restore the app Header only after deciding whether that creates a duplicate top bar and adjusting the shell layout deliberately.

## Placeholder pages

`src/routes/routePageSections.ts` maps route paths to named section specs. `src/routes/pageSectionComponents.ts` resolves those names to feature-owned section components. `DemoFeaturePage` composes them, and the current section files delegate to `PageSectionPlaceholder` for a shared demo box. Replace a placeholder's implementation in its own feature file when building that part; retain the route page as the composition owner.

## Scheduling page component wiring

`src/routes/AppRouter.tsx` mounts `src/features/scheduling/pages/Calendar1.tsx` for the scheduling route. `Calendar1` is a function component: React state is held with hooks, and a merge helper preserves the partial-state update behavior used by the original implementation. A mount effect fetches initial data and initializes CalendarJS; cleanup clears its host element. A state effect keeps the former patient/doctor synchronization behavior. Use hooks and feature-owned child components for new scheduling work; do not add class-based page or UI components.

The only app-owned exception to the function-component rule is none: `AppErrorBoundary` is a function wrapper around the `react-error-boundary` package, which supplies the class-based React boundary behavior internally.

## Integration sequence for a pasted component

1. Put the files in the feature folder and check the export (default/named) and actual CSS/hook/icon import names.
2. Read the component's exported props/type definitions; compare them with the parent call site. Update the parent and component together.
3. Decide who owns each state value. Pass child events up with typed callbacks when parent composition/layout/data needs to react.
4. Adapt data shape and enums at the feature/page boundary; do not silently change unrelated domain types.
5. Check `position`, `overflow`, grid/flex sizing, z-index, theme variables, and responsive breakpoints against parent CSS.
6. Run from `Frontend/`: `npm run typecheck`, `npm run lint`, `npm run build`.
7. Open the affected route and inspect desktop/mobile layouts, console output, empty/loading states, and actual callback behavior.
8. Update this guide if the component contract or connection flow changed. For a substantial feature change, also update `PROJECT_CONTEXT.md` and `architecture.md`.
