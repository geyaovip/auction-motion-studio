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
| local project routing and cover boundary | D-010 |
| multi-lot result reels and elongated artwork motion | D-011 |
| fixed project template and direct focal-point editing | D-012 |
| elongated artwork detail scan | D-013 |
| workbench navigation threshold | D-014 |

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

## D-010 — Local project routing separates project and lot context

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** Opening the workbench directly into a demo editor made project cover, auction information, lot images, and lot facts appear to belong to the same level. Users could not tell which image and fields belonged to which lot.
- **Decision:** Add local-only Workbench, Create Project, and Project Detail routes. Project cover and auction information belong to `ProjectInput`; lot images and catalog facts remain on `LotInput`. The editor shows a lot master list and keeps the selected lot's images and information on one inspector surface. Persisted local records pass through Zod and do not introduce accounts or cloud projects.
- **Consequence:** Users can return to projects, understand image-to-lot ownership, and create videos without expanding the MVP into a cloud project system.

## D-011 — Result reels support multiple lots and elongated art uses directed camera motion

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** A single-lot default could not demonstrate an auction preview or sale recap, while very wide handscrolls and very tall hanging scrolls looked too small when fully contained or lost their subject when naively covered.
- **Decision:** Auction Preview and Auction Result default projects contain several lots. Auction Result renders up to five stable-order hero/result pairs for lots that have a supplied `salePrice`. Panorama and ultra-portrait hero scenes keep text outside the artwork and use a deterministic focal-point crop with at most 80px total horizontal or vertical travel.
- **Consequence:** Default projects demonstrate real multi-lot rhythm, and elongated artwork remains legible and visually active without stretching, unbounded cropping, or text collision.

## D-012 — Project template is fixed after creation and focal point is edited on the image

- **Date:** 2026-07-24
- **Status:** Accepted
- **Context:** Exposing template switching inside the editor implied that an existing project's scene structure could be changed casually, while separate horizontal and vertical sliders did not show which part of an artwork would survive a crop. Full-canvas `cover` also reduced extreme-ratio opening images to an unrecognizable edge.
- **Decision:** The project template is chosen in Create Project and is not switchable in the editor. A lot image's focal point is edited by selecting the subject directly on an uncropped thumbnail; it influences only layouts that crop that lot image. Opening and ending artwork use deterministic `contain` placement over a blurred extension so the full subject remains recognizable.
- **Consequence:** Project structure has one clear owner, focal editing communicates its real effect, and opening/ending scenes no longer sacrifice the artwork to fill a mismatched canvas.

## D-013 — Elongated Hero scenes use an enlarged detail window and long-axis scan

- **Date:** 2026-07-24
- **Status:** Accepted; supersedes the 80px elongated-artwork travel limit in D-011.
- **Context:** Fitting most of a handscroll or hanging scroll into one Hero frame made the artwork technically complete but visually too small to inspect. An 80px camera drift looked decorative rather than revealing additional detail.
- **Decision:** Opening and Ending may still preserve the complete project cover. In a lot Hero scene, panorama and ultra-portrait artwork is enlarged beyond minimum cover scale so only a detail window is visible, then scanned along its long axis. Horizontal handscrolls move left-to-right or right-to-left; vertical hanging scrolls move top-to-bottom or bottom-to-top. Travel is deterministic, respects focal point and crop overflow, and is capped at 32% of the image viewport per direction.
- **Composition refinement:** In `9:16`, both elongated orientations use a wide upper detail window with the information block below; ultra-portrait artwork no longer competes with copy in a narrow side-by-side split. In `16:9`, ultra-portrait artwork uses a wider gallery window while preserving a separate information column.
- **Consequence:** The viewer can read material and brushwork details while motion reveals another part of the same work, without stretching, exposing empty edges, or placing text over the artwork.

## D-014 — Workbench does not expose placeholder global navigation

- **Date:** 2026-07-24
- **Status:** Accepted.
- **Context:** The Workbench sidebar repeated the current page, linked to sections already represented by type filters, and exposed an unavailable Recycle Bin. It occupied persistent space while suggesting product areas that did not exist.
- **Decision:** Replace the Workbench sidebar with a lightweight top brand bar. Keep project-type filtering in the page content and expose only implemented routes and actions. Add persistent global navigation only when at least two independent, working destinations require it.
- **Consequence:** The Workbench gives project content more horizontal space, removes misleading affordances, and keeps the information architecture proportional to the actual MVP.
