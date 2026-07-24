# Architecture and Data Rules

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-ARCH-PIPELINE` | orchestration order | Pipeline |
| `AMS-ARCH-OWNER` | decide where logic belongs | Module ownership and Layering rule |
| `AMS-ARCH-DATA` | schemas, types, normalization | Data boundaries |
| `AMS-ARCH-DETERMINISM` | stable output or IDs | Determinism |
| `AMS-ARCH-STATE` | Zustand, Undo/Redo, invalidation | State and history |
| `AMS-ARCH-CACHE` | cache key or performance | Caching |
| `AMS-ARCH-ERROR` | error shape or UI message | Errors |

## Pipeline

```text
Raw input
→ normalize and validate
→ inspect assets
→ build scene blueprints
→ resolve layout
→ resolve motion
→ build absolute timeline
→ quality check
→ bounded fallback and re-check
→ Remotion render
→ FFmpeg encode
→ MP4
```

Each arrow is an explicit typed boundary. Do not skip stages from UI code.

## Module ownership

### Asset Engine

Owns metadata, dimensions, orientation, MIME validation, focal point, resolution warnings, preload state, logo variants, and normalized asset records.

### Template Engine

Owns scene selection, order, semantic bindings, preset IDs, default durations, and omission of scenes whose required content is absent. It does not calculate coordinates.

### Layout Engine

Owns final-canvas coordinates, safe areas, grid, image crop/contain decisions, text fit, logo bounds, collision resolution, optical offsets, and layout diagnostics.

### Motion Engine

Owns element tracks, camera tracks, easing, transitions, and readability limits. It consumes resolved layout and does not change geometry.

### Timeline Builder

Owns enabled-scene order, absolute start/end frames, transition overlap, and total duration.

### Quality Checker and Fallback Resolver

Quality Checker is read-only and returns structured issues. Fallback Resolver applies named deterministic transformations, then the affected stages run again. Fallback MUST be bounded and observable.

### Render Engine

Owns Remotion rendering, FFmpeg encoding, progress, cancellation-safe failure handling, and final file metadata. It does not repair layout during rendering.

## Layering rule

Allowed dependency direction:

```text
UI / Zustand
→ application orchestration
→ engine modules
→ shared types and config
```

```text
Remotion render components
→ resolved types and render utilities
```

Forbidden:

- engine → React, Zustand, Next.js UI, or DOM
- Remotion component → Zustand or raw project input
- UI component → layout/motion math
- quality rule → UI toast or modal

## Data boundaries

Use separate schemas/types for:

1. `RawProjectInput`
2. `ProjectInput`
3. `NormalizedAsset`
4. `SceneBlueprint`
5. `ResolvedScene`
6. `ResolvedTimeline`
7. `QualityReport`
8. `RenderOutput`

Do not reuse one permissive type through the whole pipeline.

Normalization MUST:

- trim strings and normalize empty optional values to `undefined`
- validate estimate range and currency pairing
- validate focal points within `0..1`
- derive image dimensions/orientation before layout
- convert blank title to `Untitled` and add a warning
- reject unsupported template/aspect/theme values
- require at least one lot and one hero image per rendered lot
- require a sale price for `auction-result`

## Determinism

For identical normalized input and engine version, blueprint, layout, motion, timeline, quality report, and rendered pixels MUST be stable.

Therefore:

- no `Math.random()`
- no current-time inputs
- no unpinned remote fonts
- no layout based on preview viewport
- no object iteration whose order affects output unless sorted
- no runtime asset dimension discovery after layout resolution

Stable IDs SHOULD be derived from project/lot/scene role, not render order alone.

## State and history

Zustand owns editable project state, blueprints, latest resolved output, report, and user history.

- Undo/Redo records semantic user operations only.
- Playback frame, render progress, hover, selection, and cached measurements are not history entries.
- A semantic input change invalidates only dependent cache layers.
- Scene reorder rebuilds timeline and motion frame mapping; it does not recompute per-scene layout unless content, canvas, theme, or asset geometry changed.

## Caching

Cache only pure results. Include an engine/config version in cache keys.

Recommended keys:

- asset inspection: asset content identity
- text measurement: font family, weight, size, letter spacing, line height, text
- layout: canvas, video theme, scene content, asset geometry, layout preset, engine version
- blueprint: normalized input, template ID, template version
- thumbnails: resolved scene identity and frame

Do not cache failures indefinitely. Asset load failures need retry and invalidation behavior.

## Errors

All errors use a shared discriminated union with:

- stage
- public code
- user-safe Chinese message
- optional scene, lot, element, or asset ID
- retryability
- internal cause/stack outside the user-facing payload

UI never displays raw stack traces.
