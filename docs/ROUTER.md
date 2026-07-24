# Auction Motion Studio Context Router

Use this file to select the smallest sufficient context. Read the listed sections only, then stop unless the task crosses another contract.

## How to route

1. Match the task to one or more route IDs below.
2. Open only the linked heading ranges.
3. Read the listed SDS sections only when exact constants, examples, or original intent are required.
4. Add another route only when implementation evidence shows a real dependency.

For local discovery:

```bash
rg -n '^## |^### ' docs/rules/<file>.md
rg -n '^# ' /Users/gaiyao/Downloads/Auction_Motion_Studio_Complete_SDS.md
```

## Task routes

| Route ID | Trigger | Minimum rule sections | SDS |
| --- | --- | --- | --- |
| `AMS-BOOTSTRAP` | initialize project, dependencies, base types | [Product promise](rules/01-product-scope.md#product-promise), [Pipeline](rules/02-architecture-and-data.md#pipeline), [Data boundaries](rules/02-architecture-and-data.md#data-boundaries), [Foundation](rules/06-development-workflow.md#foundation) | 0–6, 31–32, 36–38 |
| `AMS-ASSET` | upload, inspect, focal point, image metadata | [Content integrity](rules/01-product-scope.md#content-integrity), [Asset Engine](rules/02-architecture-and-data.md#asset-engine), [Image rules](rules/04-video-engine.md#image-rules), [Warnings](rules/05-quality-and-testing.md#warnings) | 4, 6, 8, 28, 34 |
| `AMS-LAYOUT` | safe area, grid, crop, collision, fallback | [Layout Engine](rules/02-architecture-and-data.md#layout-engine), [Final canvas](rules/04-video-engine.md#final-canvas-invariant), [Safe areas](rules/04-video-engine.md#safe-areas), [Collision](rules/04-video-engine.md#collision-and-fallback) | 7–14, 27–28 |
| `AMS-TYPOGRAPHY` | wrap, font size, text measurement, prices | [Typography rules](rules/04-video-engine.md#typography-rules), [Layout snapshots](rules/05-quality-and-testing.md#layout-snapshots), [D-006](DECISIONS.md#d-006--global-readable-text-floor-overrides-lower-role-minimums) | 9, 27–28, 33 |
| `AMS-MOTION` | easing, camera, transition, scene animation | [Motion Engine](rules/02-architecture-and-data.md#motion-engine), [Motion language](rules/04-video-engine.md#motion-language), [Timeline](rules/04-video-engine.md#timeline) | 15–18, 26–27 |
| `AMS-TEMPLATE` | build or change a video template | [Supported templates](rules/01-product-scope.md#supported-templates), [Template Engine](rules/02-architecture-and-data.md#template-engine), [Template invariants](rules/04-video-engine.md#template-invariants) | 19–23, 27–28 |
| `AMS-EDITOR` | editor page, panels, toolbar, timeline UI | [Editor page](rules/01-product-scope.md#editor), [Workspace layout](rules/03-ui-design-system.md#workspace-layout), [Core components](rules/03-ui-design-system.md#core-component-behavior), [State](rules/02-architecture-and-data.md#state-and-history) | 2–3, 29, 31, 33–34 |
| `AMS-UI-THEME` | color, type, spacing, radius, visual polish | [Reference boundary](rules/03-ui-design-system.md#reference-boundary), [Editor tokens](rules/03-ui-design-system.md#editor-tokens), [Typography](rules/03-ui-design-system.md#typography), [D-009](DECISIONS.md#d-009--logged-in-perplexity-ui-recalibrates-the-editor-theme) | 24, 29 |
| `AMS-ACCESSIBILITY` | keyboard, focus, contrast, errors | [Interaction states](rules/03-ui-design-system.md#interaction-states), [Accessibility](rules/03-ui-design-system.md#accessibility), [Errors](rules/02-architecture-and-data.md#errors) | 29, 34 |
| `AMS-QUALITY` | issue codes, score, export blocking | [Gate semantics](rules/05-quality-and-testing.md#gate-semantics), [Blocking issues](rules/05-quality-and-testing.md#blocking-issues), [Warnings](rules/05-quality-and-testing.md#warnings), [D-002](DECISIONS.md#d-002--blocking-errors-and-quality-score-are-independent-gates) | 27, 39–40 |
| `AMS-TEST` | unit, snapshot, visual, E2E, performance | [Automated checks](rules/05-quality-and-testing.md#automated-checks), [Media verification](rules/05-quality-and-testing.md#media-verification), [Performance](rules/05-quality-and-testing.md#performance-gates) | 33, 35, 39 |
| `AMS-EXPORT` | Remotion render, FFmpeg, MP4, progress | [Render Engine](rules/02-architecture-and-data.md#render-engine), [Remotion](rules/04-video-engine.md#remotion-rendering), [Export](rules/04-video-engine.md#export), [Media verification](rules/05-quality-and-testing.md#media-verification) | 25–27, 30, 34–35 |
| `AMS-DOCS` | change rules or resolve ambiguity | [Source precedence](rules/00-source-of-truth.md#precedence), [Ambiguity protocol](rules/00-source-of-truth.md#ambiguity-protocol), [Documentation maintenance](README.md#documentation-maintenance), [Decision log](DECISIONS.md) | relevant section only |
| `AMS-RELEASE` | final acceptance or handoff | [Operational criteria](rules/01-product-scope.md#operational-video-criteria), [Completion evidence](rules/05-quality-and-testing.md#completion-evidence), [Review checklist](rules/06-development-workflow.md#review-checklist) | 3, 39–40 |

## Cross-route rules

- Schema changes add `AMS-BOOTSTRAP` plus the owning feature route.
- Pixel changes add `AMS-TEST`.
- Export-affecting changes add `AMS-QUALITY` and `AMS-EXPORT`.
- Product-boundary changes add `AMS-DOCS`.
- UI changes do not require video-engine routes unless they alter semantic project input.
