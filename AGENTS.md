# Auction Motion Studio Agent Rules

This file is the mandatory entry point for any coding agent working in this repository.

## Fast route

For most tasks, read only:

1. This file
2. `docs/ROUTER.md`
3. The exact routed section(s)

Do not read every rule document or the complete SDS. Expand context only when the routed section explicitly depends on another contract or the task exposes an unresolved conflict.

## Read order

Before changing code, read:

1. `docs/ROUTER.md`
2. The routed rule section(s)
3. The matching SDS section only when numerical detail or original intent is needed
4. `docs/README.md` only for documentation maintenance or broad cross-cutting work

Use route IDs in plans and handoffs so later work can reopen the same minimum context.

## Product priority

When requirements compete, use this fixed order:

```text
Publishable video quality
> deterministic automatic layout
> readable motion rhythm
> template completeness
> export reliability
> editor richness
> everything else
```

The product is a constrained motion-design engine, not a general video editor. Do not add free-canvas positioning, arbitrary keyframes, multi-track editing, AI content generation, accounts, cloud projects, collaboration, payments, or a template marketplace.

## Non-negotiable architecture

- TypeScript strict mode; no `any`.
- All external and persisted inputs pass through Zod.
- Engine modules are deterministic pure functions and do not import React, Zustand, browser globals, or Remotion UI components.
- Remotion components render resolved data only. They do not measure text, choose layouts, read Zustand, or invent motion.
- UI edits semantic input only. It never writes `x`, `y`, `width`, `height`, `fontSize`, crop transforms, keyframes, or transition types.
- Preview and export consume the same `ResolvedTimeline`; preview scales the final canvas and never recalculates layout for its viewport.
- Presets, thresholds, optical offsets, duration limits, issue codes, and tokens live in centralized configuration.
- No randomness, unstable network fonts, or time-dependent layout output.

## Change discipline

- Preserve MVP boundaries in `docs/rules/01-product-scope.md`.
- Update schemas, types, fixtures, and tests together when a contract changes.
- Add or update a decision in `docs/DECISIONS.md` when resolving an ambiguity or changing a product boundary.
- A code change is not complete until the matching checks in `docs/rules/05-quality-and-testing.md` pass.
- Do not weaken a quality rule merely to make a fixture or export pass. Fix the engine or apply an explicit fallback.

## UI direction

The editor chrome uses a Perplexity-inspired, quiet research-tool language: warm neutral canvas, strong typography, thin borders, restrained teal, generous whitespace, and one obvious primary action. This reference applies only to the web application shell. Video themes remain `Classic Light` and `Classic Dark`.

Never copy Perplexity trademarks, logo, product wording, proprietary icons, or page composition verbatim. Follow `docs/rules/03-ui-design-system.md`.

## Definition of done

The final acceptance question is:

> Can the exported MP4 be formally published without manual layout repair or secondary editing?

If the answer is no, the task is not done even when the UI flow works.
