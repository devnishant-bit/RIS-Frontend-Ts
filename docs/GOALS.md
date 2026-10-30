# Project goals

## Product and engineering goal

Modernize the legacy RIS/PACS frontend into a maintainable React + TypeScript application with feature-owned components, clear routing and access boundaries, consistent responsive behavior, and CSS Modules. Preserve confirmed workflows while replacing monolithic pages incrementally, one reviewable feature slice at a time.

## Immediate goal

Create a trustworthy skeleton where the app flow and route inventory are visible, the shared shell is reusable, the Worklist demonstrates the intended page/component structure with synthetic data, and every other route has clearly named replaceable section components. A developer should be able to implement a feature in its feature folder without first restructuring the whole app.

## Success criteria for the modernization

- New and migrated feature code is strict TypeScript; no check suppression or `any` to mask incomplete migrations.
- Routes have explicit layouts and confirmed authentication/permission requirements.
- Shell components are mounted once at the appropriate route boundary, not duplicated page by page.
- Feature components, data types, API calls, and styles have clear ownership.
- Component styles use CSS Modules; global styling is deliberate and documented.
- Data-heavy workflows have typed API boundaries and explicit loading, empty, error, and success states.
- Backend authorization protects every real data request and operation.
- Lint, typecheck, agreed automated tests, and production build run in CI over migrated code.
- Legacy route/workflow parity is reviewed before obsolete legacy code is retired.

## Current skeleton completion criteria

- Preserve the legacy route inventory and shell behavior as currently understood.
- Keep demo sign-in local and clearly label synthetic Worklist data.
- Keep Worklist search, modality/status filters, responsive view, and pagination operable.
- Ensure placeholder section components are mounted through feature-owned files.
- Keep docs accurate enough to hand context to a new developer or LLM.

## Out of scope until explicitly agreed

- Production authentication, authorization, patient data, or real RIS/PACS API calls.
- Claiming that frontend guards alone secure the system.
- Rebuilding all legacy workflows in one unreviewable rewrite.
- Removing legacy application files before equivalent behavior and ownership are reviewed.
- Choosing security policy, backend contract, vendor integration, or deployment details by assumption.
