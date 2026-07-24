# Development Workflow

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-DEV-PHASES` | plan project order | Phase order and matching phase exit criteria only |
| `AMS-DEV-TASK` | implement one task | Task workflow |
| `AMS-DEV-REVIEW` | review or handoff | Review checklist |
| `AMS-DEV-SLICE` | split commits/tasks | Commit/task slicing |
| `AMS-DEV-SCOPE` | request expands MVP | Scope expansion |

## Phase order

Follow the SDS sequence:

1. foundation and static Remotion scene
2. layout engine
3. motion engine
4. template engine
5. quality checker and fallback
6. editor
7. export

Do not build a polished editor around unresolved layout or motion contracts.

## Phase exit criteria

### Foundation

- strict TypeScript, schemas, types, configs, demo fixture
- Remotion renders one deterministic static scene

### Layout

- all required image orientations and text fixtures resolve
- no readable node leaves safe area
- title max two lines
- no image distortion
- collision/fallback diagnostics are testable

### Motion

- scene-local tracks are deterministic
- transitions are continuous
- camera and readability limits pass

### Templates

- all three templates produce valid blueprints
- missing optional data removes blocks/scenes
- Auction Result rejects missing sale price

### Quality

- blocking and warning semantics are enforced
- named fallbacks fix recoverable fixtures
- invalid projects cannot formally export

### Editor

- main user journey works without geometry controls
- semantic edits, scene controls, Undo/Redo, and quality navigation work
- UI follows `03-ui-design-system.md`

### Export

- all aspect ratios produce probe-valid MP4
- progress and retry are accurate
- output consumes the same resolved data as preview

## Task workflow

For each change:

1. Identify the owning stage and contract.
2. Read the minimum rule/SDS sections from `docs/README.md`.
3. Add or update a failing test/fixture for the behavior.
4. Implement inside the owning module.
5. Run focused checks, then affected integration checks.
6. Inspect visual output when pixels can change.
7. Update docs/decision log when the public behavior or interpretation changed.

## Review checklist

- Does this preserve the product boundary?
- Is the logic in the owning layer?
- Is output deterministic?
- Do preview and export share resolved data?
- Are missing fields handled without invented facts or empty blocks?
- Are thresholds centralized?
- Can the quality checker observe and explain failure?
- Are cache invalidation and Undo/Redo effects correct?
- Does the change protect final video quality before editor convenience?

## Commit/task slicing

Prefer vertical, verifiable slices within one engine stage. Avoid mixing:

- broad UI restyling with engine math
- schema migrations with unrelated component cleanup
- visual baseline regeneration with behavior changes lacking assertions
- new features with quality-rule weakening

## Scope expansion

When a request introduces an out-of-scope feature:

1. State which current boundary it changes.
2. Identify affected contracts, quality rules, and tests.
3. Record an approved decision before implementation.

Do not hide product expansion under “small UX improvement.”
