### Adjusting Global Spacing and Typography Density

Use these touchpoints to tighten or loosen spacing across the app. All are safe to tweak and reflect immediately.

- Main layout
  - File: `src/components/MainLayout.tsx`
  - Header padding: search for `header` with `p-4` and adjust (e.g., `p-3` for tighter, `p-5` for looser).
  - Header control gaps: container `gap-2` near the right actions.

- Project browser
  - File: `src/components/ProjectBrowser.tsx`
  - Top header: container `p-4` (tighten/loosen globally for this screen).
  - Title block and toolbar: `mb-2`, `gap-2` under the header row.
  - Left/Right panes: section titles `text-lg font-semibold mb-2` (reduce/increase `mb-*`), lists use `space-y-2`.
  - Pane paddings: both columns use `p-4` and `overflow-y-auto`.

- Project settings (modal)
  - File: `src/components/ProjectSettings.tsx`
  - Root stack: `space-y-4 py-3` controls overall vertical rhythm (change to `space-y-3`/`space-y-5`, `py-2`/`py-4`).
  - Section stacks: `space-y-3` for dense grouping; inner items commonly `space-y-2`.

- Project templates (modal)
  - File: `src/components/ProjectTemplates.tsx`
  - Root: `space-y-4 py-3` for overall vertical density.
  - Form grid: `gap-3` (use `gap-2` to compress further).
  - Templates grid: `gap-3` (increase/decrease for card spacing).

- Advanced search (modal)
  - File: `src/components/AdvancedSearch.tsx`
  - Root: `space-y-4 py-3` for global spacing in the modal.
  - Grids for date and sorting: `gap-3` (adjust for tighter/looser rows).
  - Chip rows and history: `flex flex-wrap gap-2`.

- Editor card (per element)
  - File: `src/components/StructuralElementCard.tsx`
  - Card header: `pb-2`, row `gap-2`.
  - Content spacing: text area `mb-2`, controls heading `mb-2`.

- Controls panel (inline fields)
  - File: `src/components/ControlPanel.tsx`
  - Field groups: `space-y-2` for label + input; lists of fields `space-y-2`.

Tip: If you prefer a single global lever, we can introduce CSS variables in `src/globals.css` (e.g., `--space-1`, `--space-2`) and swap utility classes for style bindings, enabling global density tuning from one place.


