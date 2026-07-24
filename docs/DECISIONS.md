# Decision Log

Decisions here resolve ambiguity in the source SDS. New entries are append-only; supersede an earlier entry explicitly rather than rewriting history.

## Decision routes

| Topic | Read only |
| --- | --- |
| raw/canonical input | D-001 |
| quality blocking | D-002 |
| safe areas | D-003 and D-008 |
| editor/video theme separation | D-004 and D-009 |
| preview/export identity | D-005 |
| minimum text size | D-006 |
| logo size | D-007 |

## D-001 — Separate raw editing state from canonical project input

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The SDS allows a missing title to fall back to `Untitled`, while the example Zod schema requires a non-empty title.
- **Decision:** The editor holds permissive `RawProjectInput`. Generate/Export normalization converts a blank lot title to `Untitled`, emits `TITLE_MISSING_USING_UNTITLED`, and then validates a non-empty canonical `ProjectInput`.
- **Consequence:** The user can complete a draft form, while engine contracts remain strict and deterministic.

## D-002 — Blocking errors and quality score are independent gates

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The SDS defines both named blocking errors and score thresholds.
- **Decision:** Any blocking issue forbids export regardless of score. A score below 80 also forbids export even without a named blocking issue. Scores 80–89 export with visible warnings; 90+ is recommended.
- **Consequence:** Score weighting can never mask a critical defect.

## D-003 — Safe-area exceptions are limited to visual media

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The SDS says all nodes are in the safe area, but also allows full-bleed backgrounds and hero images.
- **Decision:** Background and eligible full-bleed image nodes may exceed safe area. Readable text, prices, captions, CTA, and logos may not.
- **Consequence:** Full-bleed art remains possible without weakening readability checks.

## D-004 — Perplexity reference applies only to editor chrome

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The requested UI reference is Perplexity, while the SDS defines separate Classic Light/Dark video themes.
- **Decision:** Perplexity-inspired visual principles guide the web editor only. Rendered videos continue using the SDS video themes. No Perplexity trademark, wording, logo, proprietary artwork, or exact layout is copied.
- **Consequence:** The product gains a calm, content-first workspace without contaminating auction video branding.

## D-005 — Preview and export share one resolved timeline

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The SDS forbids preview-size layout calculation and requires export stability.
- **Decision:** Preview scales the exact final-canvas `ResolvedTimeline` later used by export. Any semantic edit invalidates affected resolution and export preparation.
- **Consequence:** What the user approves is what the renderer encodes.

## D-006 — Global readable-text floor overrides lower role minimums

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The operational standard says font size cannot be smaller than 2.2% of the canvas short edge, while later examples allow 18px captions and 20px body text on a 1080px short edge.
- **Decision:** Effective minimum size is `max(role minimum, ceil(short edge × 2.2%))`. The 28px title minimum therefore remains stronger, while 18px/20px role minimums become 24px on a 1080px short edge.
- **Consequence:** The stricter readability standard controls formal output.

## D-007 — Aspect-specific logo sizing overrides the general guideline

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The SDS first gives a general 8–12% logo-width range, then specifies 10% for landscape, 18% for portrait, and 14% for square.
- **Decision:** Use the aspect-specific ratios and clamp to 120–260px. The opening-scene 18% maximum, height limit, safe area, and collision limits still apply.
- **Consequence:** Portrait and square videos retain a legible logo without making it the first visual.

## D-008 — Platform safe-area overlays combine by maximum inset

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** The SDS defines a base `9:16` safe area and additional platform overlay regions but does not state whether their values are additive.
- **Decision:** For each edge, use the larger base or overlay inset. Do not add them.
- **Consequence:** Core content avoids platform UI without unnecessarily shrinking the usable canvas twice.

## D-009 — Logged-in Perplexity UI recalibrates the editor theme

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** A logged-in inspection showed the current product is more monochrome than public brand material: warm-white content, a 200px softly tinted navigation rail, near-black primary buttons, subtle brown-black alpha borders, 8px utility-control radii, and larger 16px composer radii.
- **Decision:** Auction Motion Studio adopts neutral-first editor chrome. Near-black becomes the primary-action color; teal is limited to focus, progress, links, and selected semantic status. The editor keeps wider domain panels than Perplexity because artwork thumbnails and catalog fields need more space.
- **Consequence:** The reference feels current without sacrificing the auction editor's preview area or copying the source layout.
