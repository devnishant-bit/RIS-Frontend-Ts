# Frontend implementation rules

Use this checklist for every UI or feature change in this frontend. Read it before editing, inspect the closest existing implementation, and check each applicable item before finishing.

## Before editing

- Confirm the route, owning feature, shared layout, and existing components involved.
- Inspect nearby code and styles for established behavior, design tokens, theme handling, and responsive breakpoints.
- Keep changes within the requested scope. Preserve unrelated working-tree edits and existing user changes.
- Identify which data is real, mocked, or local-only. Do not imply that mock state is persisted by an API.

## UI implementation checklist

- [ ] **Theme:** Check both light and dark themes. The app sets `data-theme="light|dark"` on the document root. Use existing CSS variables or add scoped dark-theme rules; do not leave hard-coded light surfaces, text, borders, inputs, tables, buttons, badges, menus, or dialogs unreadable in dark mode.
- [ ] **Theme control:** Verify the UI follows the actual theme provider/toggle, including system mode when relevant. Do not add a separate theme state that can drift from the app theme.
- [ ] **Responsive layout:** Check narrow phone, tablet, and desktop widths against the project’s breakpoints. Ensure content remains usable and navigation/actions do not disappear without an alternative.
- [ ] **State coverage:** For data-driven pages, account for initial, loading, success, empty, and error states. Disable or guard actions while an operation is pending where appropriate.
- [ ] **State ownership:** Keep state in the smallest component that owns the behavior. Make parent/child data and callbacks explicit; avoid controls that only update unused state.
- [ ] **Data boundary:** Keep API calls in the feature’s API/service layer and use the shared HTTP client/configuration where appropriate. Handle rejected requests and unsuccessful API responses visibly. Keep mock data clearly marked and easy to replace.
- [ ] **Forms:** Use labels connected to controls, correct input types, keyboard submission where appropriate, and clear validation/error feedback.
- [ ] **Accessibility:** Use semantic elements, accessible names, visible keyboard focus, and keyboard-operable controls. Dialogs should support Escape and sensible focus behavior.
- [ ] **Routing:** Use the existing route constants and layouts. Keep page rendering, permission checks, and standalone/public access behavior consistent with neighboring routes.
- [ ] **Visual consistency:** Reuse the feature’s established spacing, typography, colors, buttons, cards, and table patterns. Avoid introducing a parallel design system for one page.
- [ ] **Dependencies and scope:** Prefer existing dependencies and components. Do not remove or rewrite unrelated code to make the change easier.

## Before finishing

- [ ] Review the final diff for accidental or unrelated edits.
- [ ] Run the project typecheck and production build when available; report any pre-existing failures separately from failures caused by the change.
- [ ] Do not add or run tests unless the user asks for tests or verification.
- [ ] In the final update, state what changed, how it was connected, what validation ran, and any mock/API or responsive limitations that remain.

## Required self-review

Before returning implementation work, explicitly review the applicable checklist items above. Theme and responsive checks are required for every UI change, even when the request does not mention them.
