# Video Engine Rules

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-VIDEO-CANVAS` | dimensions, safe areas | Final-canvas invariant and Safe areas |
| `AMS-VIDEO-IMAGE` | crop, focal point, resolution | Image rules |
| `AMS-VIDEO-TYPE` | title, wrap, price | Typography rules |
| `AMS-VIDEO-FALLBACK` | collision or logo | Collision and fallback and Logo sizing |
| `AMS-VIDEO-MOTION` | animation and transition | Motion language |
| `AMS-VIDEO-TEMPLATE` | scene composition | Template invariants |
| `AMS-VIDEO-TIMELINE` | duration and overlap | Timeline |
| `AMS-VIDEO-RENDER` | Remotion or MP4 | Remotion rendering, Video themes, and Export |

## Final-canvas invariant

All geometry is resolved in export pixels for one of:

- `16:9`: 1920×1080
- `9:16`: 1080×1920
- `1:1`: 1080×1080

Preview uniformly scales this result. It never runs an alternate responsive layout.

All layout values snap to the 8px grid unless a documented optical offset is applied.

## Safe areas

Use the SDS safe-area constants as centralized configuration. In `9:16`, core text also avoids short-video platform overlays. For each edge, the effective inset is the larger of the base safe-area inset and the platform-overlay inset; do not add them together.

- Backgrounds may bleed.
- A full-bleed hero image may bleed when its preset allows it.
- Titles, artist, metadata, prices, captions, CTA, and logos remain inside the applicable safe area.
- Optical offsets never justify crossing a safe boundary.

## Image rules

Classify images using the SDS thresholds:

- panorama `>= 2.2`
- landscape `>= 1.2`
- square `>= 0.85`
- portrait `>= 0.58`
- ultra portrait `< 0.58`

Required behavior:

- Preserve intrinsic aspect ratio; never stretch.
- Use explicit crop math around the normalized focal point.
- Prefer `contain` or blur extension when crop limits would be exceeded.
- Panorama and ultra-portrait assets do not use naive full-screen cover.
- Low-resolution assets warn, use conservative scale, and prefer contained foreground over aggressive zoom.
- A missing hero image blocks export; missing detail images remove their detail scenes.

Crop and visible-ratio diagnostics are part of `ResolvedScene`, not inferred later from CSS.

## Typography rules

- The effective minimum for every readable text role is `max(role minimum, ceil(canvas short edge × 2.2%))`.
- Titles: maximum two lines, with a role minimum of 28px.
- Body: role minimum 20px.
- Captions: role minimum 18px and one line in detail scenes.
- Estimate and sale price never wrap.
- Preserve currency/value, person names where possible, years, and hyphenated terms as tokens.
- Use cached real measurements for Latin text and deterministic CJK/token rules.
- Use binary search within configured min/max bounds.
- Fallback order: size → line break → letter spacing → wider text region → alternate preset → ellipsis.
- Never solve collision by crossing the minimum font size or adding a third title line.

Use `en dash` between estimate values and tabular numerals for financial figures.

## Collision and fallback

Collision is computed from resolved bounding boxes and semantic minimum gaps.

Resolve lower-priority elements first, following the SDS order. Maximum layout iterations are 12 per attempt. If conflicts remain:

1. Apply a named alternate layout preset.
2. Re-run layout and quality checks.
3. Remove only explicitly optional low-priority content.
4. Emit a blocking issue if no valid result exists.

Every fallback action SHOULD appear in diagnostics for tests and debugging.

## Logo sizing

- The aspect-specific sizing function overrides the general 8–12% guideline.
- Use width ratios of 10% for `16:9`, 18% for `9:16`, and 14% for `1:1`, then clamp to 120–260px.
- Opening-scene logo width still MUST NOT exceed 18% of canvas width.
- Preserve aspect ratio and apply the height, edge, and collision limits from the SDS.
- A text `houseName` fallback follows readable-text safe-area and contrast rules rather than image-logo sizing.

## Motion language

Allowed:

- fade and cross dissolve
- slow push/pull
- slow horizontal/vertical pan
- opacity, small translate, restrained blur
- very light vertical drift

Forbidden:

- bounce, spring overshoot, shake, rotate, flip, glitch, particles
- flash, zoom burst, scale punch, high-frequency cutting
- motion that reduces reading time or changes layout geometry

Limits:

- element entry `>= 9f`
- non-camera displacement `<= 32px`
- camera scale `<= 1.08`, reduced for low-resolution assets
- pan `<= 80px`
- transition `>= 9f`
- readable hold `>= 45f`

Motion tracks use explicit keyframes and configured easing. No component-local animation choices.

## Template invariants

### Artwork Showcase

Opening → Hero → available Details → available Metadata → optional Estimate → Ending.

Typical 16–22s, short mode 12–15s, hard maximum 30s.

### Auction Preview

Opening → up to five Lot Heroes → Auction Info → Ending.

Each lot receives 3.0–4.2s. Initial selection is deterministic; user reorder becomes authoritative.

### Auction Result

Opening → Artwork Hero → Estimate → Sale Result → Ending.

`salePrice` is mandatory. Do not compute a gain or percentage.

## Timeline

- FPS is fixed at 30.
- Scene durations respect type-specific bounds in the SDS.
- UI converts seconds to integer frames at the boundary.
- Transition overlap subtracts from total duration.
- Disabled scenes are omitted before absolute frame resolution.
- Reordering preserves scene-local animation shape and remaps absolute frames.
- No negative start frame is allowed for the first enabled scene.

## Remotion rendering

Components accept resolved layout and motion only.

- Sort by stable `zIndex` plus stable ID tie-breaker.
- Never re-wrap title text.
- Never inspect DOM size.
- Never fetch layout-affecting data during frame render.
- Never generate random IDs or values per frame.
- Assets and fonts are ready before render begins.

## Video themes

MVP video themes:

- `classic-light`: warm ivory, black/charcoal text, muted gold accent
- `classic-dark`: near-black, warm ivory text, muted gold accent

Accent is sparse. No high-saturation gradient or editor teal is introduced into rendered themes unless a future decision changes the video brand system.

## Export

Formal output:

- MP4
- H.264
- 30fps
- `yuv420p`
- target video bitrate `12M`
- no empty audio track when audio is absent

Export uses an immutable project snapshot and its passing `ResolvedTimeline`. Any user edit after validation invalidates that export preparation and requires revalidation.
