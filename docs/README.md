# Auction Motion Studio Documentation

This directory converts the source SDS into a small, executable rule set for implementation.

## Fast route

Start with `docs/ROUTER.md`. It maps task keywords to exact headings and SDS sections. This README is for documentation structure and maintenance, not the default coding context.

## Source of truth

The original specification is:

`/Users/gaiyao/Downloads/Auction_Motion_Studio_Complete_SDS.md`

The SDS defines product intent and numerical requirements. The files in `docs/rules/` define how those requirements are interpreted during development. If they conflict:

1. Explicit decisions in `docs/DECISIONS.md` resolve known ambiguities.
2. Otherwise, the SDS wins.
3. If the SDS is internally inconsistent and no decision exists, stop the affected implementation, record the question, and avoid silently choosing a new product behavior.

## Rule index

| File | Use it for |
| --- | --- |
| `ROUTER.md` | minimum-context route IDs and exact section links |
| `00-source-of-truth.md` | requirement precedence, terminology, ambiguity handling |
| `01-product-scope.md` | MVP boundary, user journey, page responsibilities |
| `02-architecture-and-data.md` | modules, contracts, state, determinism, caching |
| `03-ui-design-system.md` | editor visual language, tokens, layout, interaction and accessibility |
| `04-video-engine.md` | layout, typography, image fit, motion, templates and export invariants |
| `05-quality-and-testing.md` | quality gates, test matrix and acceptance evidence |
| `06-development-workflow.md` | implementation phases, task completion and documentation updates |

## Minimum context by task

This table is a broad fallback. Prefer the narrower routes in `docs/ROUTER.md`.

| Task | Read these docs | SDS sections |
| --- | --- | --- |
| Project setup or types | `00`, `01`, `02`, `06` | 0–6, 31–32, 36–37 |
| Asset handling | `02`, `04`, `05` | 4, 6, 8, 28, 34 |
| Layout or typography | `02`, `04`, `05` | 7–14, 27–28, 33, 35 |
| Motion or timeline | `02`, `04`, `05` | 15–18, 25–27, 35 |
| Template generation | `01`, `02`, `04`, `05` | 19–23, 27–28 |
| Editor UI | `01`, `02`, `03`, `05` | 2–3, 29, 31, 33–35 |
| Export | `02`, `04`, `05` | 27, 30, 33–35 |
| Final acceptance | all rule files | 3, 33, 35, 39–40 |

## Documentation maintenance

- Keep rules concise and normative. Use `MUST`, `MUST NOT`, `SHOULD`, and `MAY` deliberately.
- Put resolved ambiguities in `docs/DECISIONS.md`, not in scattered code comments.
- Update this index when adding a rule file.
- Do not duplicate large SDS sections. Link to the section and state only the implementation consequence.
