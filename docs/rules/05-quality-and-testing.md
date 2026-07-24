# Quality Gates and Testing

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-QA-GATE` | can this export? | Gate semantics, Blocking issues, and Warnings |
| `AMS-QA-UNIT` | pure engine tests | Automated checks / Unit |
| `AMS-QA-LAYOUT` | layout fixtures | Automated checks / Layout snapshots |
| `AMS-QA-VISUAL` | pixel changes | Automated checks / Visual regression |
| `AMS-QA-E2E` | user journey | Automated checks / E2E |
| `AMS-QA-MEDIA` | exported MP4 | Media verification |
| `AMS-QA-PERF` | speed or cache | Performance gates |
| `AMS-QA-HANDOFF` | report completion | Completion evidence |

## Gate semantics

Formal export is allowed only when:

```text
schema and assets valid
AND no blocking quality issue
AND quality score >= 80
AND render preflight passes
```

Named blocking issues override score. Warnings never become hidden; they remain visible in the report and export confirmation.

Recommended publish state is score `>= 90`.

## Blocking issues

At minimum, preserve the SDS codes:

- `ELEMENT_OUT_OF_BOUNDS`
- `CRITICAL_OVERLAP`
- `TITLE_TOO_SMALL`
- `TITLE_OVER_TWO_LINES`
- `IMAGE_MISSING`
- `INVALID_ASPECT_RATIO`
- `RESULT_PRICE_MISSING`
- `EMPTY_SCENE`
- `RENDER_ASSET_LOAD_FAILED`

Add new public codes only with a decision entry and tests.

## Warnings

At minimum:

- `LOW_RESOLUTION_IMAGE`
- `LONG_TITLE_TRUNCATED`
- `LOGO_MISSING`
- `METADATA_INCOMPLETE`
- `SHORT_HOLD_TIME`
- `HIGH_CROP_RATIO`
- `TITLE_MISSING_USING_UNTITLED`

Warnings identify the exact project, lot, scene, or asset when applicable.

## Automated checks

### Unit

Cover:

- schemas and normalization
- image classification and crop math
- safe areas and platform overlays
- grid snapping
- text tokenization, measurement cache, fit, and estimate formatting
- global 2.2% readable-text floor combined with role-specific minimums
- logo sizing
- intersection, severity calculation, collision ordering, iteration bounds
- optical offsets
- each template builder and missing-data behavior
- duration bounds and transition overlap
- motion limits
- score calculation, blocking behavior, and each fallback
- cache invalidation and deterministic IDs

### Layout snapshots

For each relevant layout preset, include:

- short/long Chinese
- short/long English
- mixed Chinese/English/currency
- panorama, landscape, square, portrait, ultra portrait
- missing artist, estimate, metadata, and logo
- low-resolution image
- focal points near all four boundaries
- opening and ending cover preservation for landscape, square, portrait, and elongated assets
- elongated Hero detail scale and meaningful long-axis travel; reject fixtures that effectively show the complete work with only decorative drift
- ultra-portrait `16:9` visual balance: image viewport width, text separation,
  and metadata presence

Snapshot resolved JSON, diagnostics, and issue codes. Do not use snapshots as the only assertion for safety boundaries.

### Visual regression

Matrix:

```text
3 templates × 3 aspect ratios × 2 video themes
```

Within the matrix, cover at least three image orientations and capture first, middle, and final meaningful frames.

Compare:

- safe-area containment
- geometric centering of bounded media under asymmetric `9:16` text safe areas
- crop and focal subject preservation
- intrinsic aspect-ratio preservation when resolved `cover` dimensions overflow
  the image viewport in either axis
- title wrapping and hierarchy
- logo bounds
- color/contrast
- first/middle/last-frame continuity
- transition overlap

Use fixed local assets and pinned fonts. Baseline changes require an intentional visual review; never auto-accept them after engine changes.

### E2E

Required happy path:

```text
Home
→ choose Artwork Showcase
→ add artwork
→ fill catalog
→ Generate
→ Preview
→ Export
→ download and probe MP4
```

Also cover:

- Auction Result without sale price is blocked and recoverable.
- Low-resolution image warns but can proceed if no other gate fails.
- Reorder, disable, duration edit, Undo, and Redo update the timeline correctly.
- Unchanged field blur and unchanged focal-point commits do not create Undo entries.
- Direct focal-point selection changes only crop-based lot-image placements and is reversible with Undo/Redo.
- Aspect/theme change invalidates stale resolution and regenerates.
- Render failure shows stage, safe message, and retry.

## Media verification

An export test is not complete at file existence.

Verify with FFmpeg/ffprobe:

- codec, dimensions, pixel format, FPS, and duration
- file is decodable from beginning to end
- no unexpected audio stream
- expected first and final frames are not blank

Sample frames SHOULD be visually inspected for every release candidate.

## Performance gates

- first preview ready under 4s on the agreed reference machine/data set
- scene selection response under 150ms
- semantic inspector edit reflected under 500ms
- layout never recalculates per playback frame
- text measurement and image metadata caches demonstrate hits in tests or instrumentation

Record the reference environment when reporting performance.

## Completion evidence

Every implementation handoff states:

- changed contracts and behavior
- tests run and their result
- unrun checks and why
- visual fixtures inspected
- export artifact/probe result when render-related
- remaining warnings or known limitations

“Build passes” alone is not acceptance evidence.
