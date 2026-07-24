# Editor UI Design System

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-UI-REFERENCE` | understand visual direction | Reference boundary and Separation of themes |
| `AMS-UI-TOKENS` | color, radius, shadow | Editor tokens |
| `AMS-UI-TYPE` | UI typography | Typography |
| `AMS-UI-LAYOUT` | panels and responsive behavior | Workspace layout |
| `AMS-UI-COMPONENT` | toolbar, assets, preview, inspector, timeline | Core component behavior |
| `AMS-UI-STATE` | loading, progress, failures | Interaction states |
| `AMS-UI-A11Y` | keyboard, contrast, focus | Accessibility |
| `AMS-UI-COPY` | Chinese messages | Copy style |

## Reference boundary

The application chrome takes directional cues from the current logged-in Perplexity product language:

- content-first hierarchy
- warm-white content with a barely tinted navigation/panel layer
- near-black text and primary actions
- teal limited to focus, progress, links, and selected semantic status
- thin separators and quiet controls
- generous whitespace and compact navigation
- one prominent input or primary action per state
- progressive disclosure instead of dense toolbars

Reference review date: 2026-07-24. The final calibration uses screenshots from the authenticated home, expanded menu, and answer views. Public official sources remain secondary context.

This is inspiration, not a clone. Do not copy the Perplexity logo, name, exact iconography, proprietary illustrations, wording, or screen composition.

Reference sources:

- [Perplexity official Hub](https://www.perplexity.ai/hub)
- [Perplexity Account Settings help](https://www.perplexity.ai/help-center/en/articles/10352993-account-settings)
- [Perplexity official resource example describing teal, navy, and off-white brand colors](https://www.perplexity.ai/resource-library/queries/generate-creative-assets-from-existing-pages)
- [Authenticated UI audit evidence](../audits/perplexity-ui-2026-07-24/README.md)

## Separation of themes

Editor theme and video theme are separate systems:

- Editor theme controls the web workspace only.
- Video theme controls rendered MP4 pixels only.
- Switching editor appearance MUST NOT change `project.themeId`.
- The MVP editor SHOULD ship light-first. A dark editor mode MAY be added only if it does not delay video-engine work.
- Video themes remain exactly `Classic Light` and `Classic Dark`.

## Editor tokens

Start with CSS variables; component code MUST use semantic tokens.

```css
:root {
  --ui-bg: #fdfcfa;
  --ui-surface: #ffffff;
  --ui-surface-subtle: rgb(39 26 0 / 3.5%);
  --ui-surface-selected: rgb(39 26 0 / 7%);
  --ui-text: #27251e;
  --ui-text-muted: rgb(39 37 30 / 65%);
  --ui-border: rgb(39 26 0 / 7%);
  --ui-border-strong: rgb(39 26 0 / 14%);
  --ui-action: #27251e;
  --ui-action-hover: #171612;
  --ui-action-text: #fdfbfa;
  --ui-accent: #287f88;
  --ui-accent-soft: #e4f0f0;
  --ui-danger: #b3433f;
  --ui-warning: #9a6818;
  --ui-success: #2f765b;
  --ui-focus: #287f88;
  --ui-radius-sm: 8px;
  --ui-radius-md: 12px;
  --ui-radius-lg: 16px;
  --ui-radius-pill: 9999px;
  --ui-shadow-floating: 0 8px 24px rgb(39 37 30 / 10%);
}
```

Rules:

- Near-black is the default filled primary action.
- Teal is for focus, progress, links, and meaningful selected semantic status; it is not the default button fill.
- Soft neutral fill communicates navigation hover/selection.
- Pills are reserved for filters, modes, short status, and compact selectors. Panels and standard buttons do not use pill radii.
- Do not use decorative gradients.
- Borders carry most surface separation; shadows are reserved for floating overlays.
- Avoid excessive rounded cards. Prefer grouped regions and separators.

## Typography

- UI sans: `Inter`, with system sans fallback; bundle or pin the font.
- Chinese UI fallback: `PingFang SC`, `Noto Sans SC`, system sans.
- Use one UI family; video typography is configured separately.
- Default UI text: 14px / 20px.
- Secondary/meta: 12px / 18px.
- Section title: 16px / 24px, semibold.
- Page title: 24–28px / 32–36px, semibold.
- Use tabular numerals for durations, frame counts, prices, and progress.

Perplexity uses serif typography for long-form answer content, but Auction Motion Studio MUST NOT apply that serif to editor controls, inspector fields, timeline labels, or quality messages. A serif MAY appear only in a non-interactive editorial introduction after Chinese/English coverage is verified.

Do not use oversized marketing headings inside the editor.

## Workspace layout

Application-level routing:

```text
Home → Workbench → Create Project → Project Detail Editor → Export
```

- Workbench is the project index; it MUST NOT open directly into an arbitrary demo lot.
- Workbench uses a lightweight top brand bar and content-level type filters.
  Do not show a persistent global navigation rail until at least two independent,
  implemented destinations require it. In-page anchors and unavailable features
  never appear as primary navigation.
- Project cards use project cover imagery, not an unrelated selected lot thumbnail.
- The project-detail editor uses a lot master list at left. The right inspector keeps the selected lot's images and semantic fields on the same scroll surface.
- Project information remains editable through progressive disclosure and is never mixed into an unrelated lot.
- Project Settings exposes a visible project-cover preview with a direct Replace action and explains its Workbench/Opening/Ending scope.

Desktop baseline:

```text
Top command bar: 56px
Left assets rail: 256px
Center preview: flexible, never below 480px
Right inspector: 304px
Bottom timeline: 192–240px resizable range
```

- Preview is the visual center and gets the largest area.
- A future global navigation rail, if added, uses a compact 200px expanded width and remains separate from the 256px asset rail.
- Panels use borders, not disconnected floating cards.
- The final-canvas aspect ratio is preserved and centered.
- The canvas is uniformly scaled; do not use responsive layout inside the rendered frame.
- At narrower widths, inspector becomes a drawer before the preview becomes unusable.
- Below 1024px, the editor may reduce to review-oriented behavior; full mobile authoring is not an MVP promise.

## Core component behavior

### Command bar

- Project identity at left.
- Aspect and video-theme controls remain near context. The template is chosen during project creation and is not switchable in the editor.
- Undo/Redo are icon buttons with labels/tooltips and disabled states.
- Generate is the primary editor action before a resolved timeline exists.
- Export becomes primary only after generation and a passing quality state.
- The current primary action uses near-black fill with warm-white text; destructive actions remain semantic red.
- Never show Generate, Preview, and Export as three equally loud buttons.

### Assets panel

- Uses compact rows/thumbnails with upload, reorder, remove, focal-point edit, and resolution status.
- Focal-point editing is a direct subject picker on the uncropped image. Copy explains that it controls which part remains visible when a later video layout crops the lot image.
- Low-resolution state uses warning color and plain corrective text.
- Empty state explains the minimum required asset.

### Preview

- Provides play/pause, current time, total duration, scene navigation, and fit-to-view.
- Does not expose zoom as a content-layout control.
- Quality overlays may highlight bounds in debug/review mode but MUST NOT enter rendered output.

### Inspector

- Uses grouped semantic sections with labels above fields.
- Reveals fields based on selected project, lot, or scene.
- Duration input displays seconds but stores validated frames.
- No coordinate, font-size, crop-transform, keyframe, or transition-type inputs.

### Timeline

- Single scene lane only.
- Each scene card shows thumbnail, type, duration, enabled state, and warning/error marker.
- Reorder uses a visible handle and keyboard-accessible alternative.
- Disabled scenes remain inspectable and are excluded from resolved output.

## Interaction states

Every asynchronous action has:

- idle
- active/progress
- success
- user-correctable failure
- retryable technical failure

Generate and Export prevent accidental duplicate submission. Export progress uses named stages from the SDS, not a spinner with no context.

## Accessibility

- Meet WCAG 2.1 AA contrast for UI text and controls.
- Visible focus ring on every interactive element.
- Minimum control target 36×36px desktop; icon-only controls require accessible names and tooltips.
- All drag operations have keyboard alternatives.
- Color never carries quality status alone; pair icon, label, and message.
- Respect `prefers-reduced-motion` in editor chrome. This does not alter exported video motion unless the user changes the project.
- Error summaries link focus to the affected field, lot, asset, or scene.

## Copy style

- Chinese-first, concise, corrective, and free of technical stack details.
- Name the exact object: `Lot 18 的主图无法读取`, not `资源错误`.
- Tell the user the next valid action.
- Avoid playful copy in blocking export states.
