# Product Scope and User Journey

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-PRODUCT-FLOW` | understand the product promise | Product promise |
| `AMS-PRODUCT-PAGES` | Home, Editor, Export | MVP pages |
| `AMS-PRODUCT-TEMPLATES` | template choice or behavior | Supported templates |
| `AMS-PRODUCT-EDITING` | allowed controls | Supported user edits and Explicitly out of scope |
| `AMS-PRODUCT-INTEGRITY` | missing data or factual claims | Content integrity |
| `AMS-PRODUCT-ACCEPTANCE` | release criteria | Operational video criteria |

## Product promise

Auction Motion Studio turns catalog data, artwork images, and optional branding into a high-end auction marketing MP4. The system structures and presents supplied facts; it does not create new claims.

The user should finish this flow:

```text
Open local workbench
→ create project
→ choose template and add project cover
→ add artwork and catalog data
→ choose aspect ratio and video theme
→ Generate
→ review preview and quality report
→ Export MP4
```

The user MUST NOT need to repair element positions, font sizes, crops, transitions, or keyframes.

## MVP pages

### Home

- Opens the local workbench or starts the create-project flow.
- Explains required input and output in one screen.
- Uses demo data as a fast path.
- Does not become a marketing-heavy landing site.

### Workbench

- Lists local projects with cover, type, lot count, last edit time, and status.
- Filters projects by the three supported templates.
- Exposes one primary `Create video` action.
- Stores projects locally and does not imply accounts, cloud sync, or collaboration.

### Create project

- Chooses one of the three supported templates before entering the editor.
- Captures project-level cover and auction information separately from lot data.
- Creates a local draft and then enters its project-detail editor route.

### Editor

- Contains toolbar, assets panel, scaled final-canvas preview, inspector, and scene timeline.
- Lists project lots at left; selecting a lot shows that lot's images and semantic fields together in the inspector.
- Keeps project-level cover and auction information separate from lot-level images and facts.
- Lets the user replace the project cover inside Project Settings; the same validated asset updates the Workbench card, Opening, and Ending.
- Exposes semantic controls only.
- Keeps Generate, Preview, Export, Undo, Redo, and Aspect Ratio visible or easy to reach.
- Treats the project template chosen during creation as fixed project structure; the editor does not expose template switching.
- Shows unresolved quality issues near the affected lot or scene.

### Export

- Revalidates the exact project snapshot being exported.
- Shows stage, progress, failure reason, and retry.
- Provides the completed MP4 only after quality gates pass.

## Supported templates

- `artwork-showcase`: one primary lot with optional details, metadata, and estimate.
- `auction-preview`: up to five lots; order is user-controlled after initial generation.
- `auction-result`: up to five lots with supplied `salePrice`; otherwise generation/export is blocked with a corrective message.

## Supported user edits

- Artwork and logo upload, removal, and order
- Focal point
- Project, auction, and lot semantic fields
- Aspect ratio: `16:9`, `9:16`, `1:1`
- Video theme: `classic-light`, `classic-dark`
- Scene order, enabled state, and bounded duration
- Undo and redo for user-authored changes

## Explicitly out of scope

Do not add:

- authentication, accounts, database, cloud projects, render queues, collaboration, comments, billing, or admin
- AI copy, image, video, voice, or inferred factual content
- free positioning, element resizing, arbitrary text tools, stickers, filters, effects, keyframes, multi-track timelines, audio editing, or subtitle editing
- template marketplace, arbitrary video-theme colors, 4K export, or mobile-native apps

A convenience feature is still out of scope when it creates a new authoring model.

## Content integrity

- Never calculate or claim price appreciation unless a future product decision adds it.
- Never invent artist, year, medium, dimensions, estimate, sale price, date, or location.
- `Untitled` is a presentation fallback, not a factual title; it MUST emit a warning.
- Missing optional content collapses layout space or removes the scene. It never leaves placeholder text or empty visual blocks.
- Missing logo falls back to supplied `houseName`; if both are missing, omit branding.

## Operational video criteria

- Brand impression appears in the first second.
- Subject is clear within three seconds.
- Artwork remains the primary visual.
- Titles are readable within two seconds.
- Information scenes hold for at least two seconds.
- No title exceeds two lines.
- No meaningful empty scene is rendered.
- The export should be usable on Instagram, Facebook, YouTube Shorts, and Xiaohongshu in its selected aspect ratio.
