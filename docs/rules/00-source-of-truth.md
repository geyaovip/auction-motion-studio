# Source of Truth and Requirement Language

## Document routes

| Route ID | Trigger | Read |
| --- | --- | --- |
| `AMS-SOURCE-LEVELS` | interpret MUST/SHOULD/example | Requirement levels |
| `AMS-SOURCE-PRECEDENCE` | conflicting requirements | Precedence and Known interpretation rules |
| `AMS-SOURCE-TERMS` | name a type or stage | Canonical terminology |
| `AMS-SOURCE-AMBIGUITY` | SDS unclear | Ambiguity protocol |

## Requirement levels

- **MUST / MUST NOT**: release-blocking contract.
- **SHOULD / SHOULD NOT**: default behavior; deviation needs a documented reason and test.
- **MAY**: optional behavior inside the current MVP boundary.

Examples and pseudocode in the SDS express intent. Exact interfaces may evolve only when they preserve that intent and the change is recorded in `docs/DECISIONS.md`.

## Precedence

Use this order:

1. Current user instruction for the active task
2. `docs/DECISIONS.md`
3. Source SDS
4. Rule documents in this directory
5. Existing implementation

Existing code is never proof that a requirement changed.

## Canonical terminology

- **Raw Project Input**: editable form state; may be incomplete.
- **Project Input**: normalized, schema-valid semantic input.
- **Scene Blueprint**: template output without final coordinates.
- **Resolved Scene**: blueprint plus final layout and motion tracks.
- **Resolved Timeline**: enabled resolved scenes with absolute frame ranges.
- **Editor theme**: web application chrome.
- **Video theme**: pixels rendered into the MP4.
- **Blocking issue**: issue that forbids formal export.
- **Warning**: non-blocking issue shown to the user and included in the report.

Use these names consistently in code and docs.

## Known interpretation rules

- The editor may temporarily hold incomplete raw fields. Generate and Export operate only on normalized `ProjectInput`.
- Blank lot titles are normalized to `Untitled` with `LONG_TITLE_TRUNCATED` excluded and a dedicated missing-title warning. The canonical project remains non-empty after normalization.
- A blocking issue blocks export regardless of numeric quality score.
- A score below 80 blocks export even if no named blocking issue remains.
- Background and intentional full-bleed hero images may exceed the safe area; readable text and logos may not.
- UI theme choices do not modify video theme pixels unless the user explicitly changes `themeId`.

## Ambiguity protocol

When a rule is unclear:

1. Identify the smallest affected behavior.
2. Search the SDS and `docs/DECISIONS.md`.
3. Prefer the behavior that protects publishable video quality, determinism, and factual integrity.
4. Record a decision before introducing a new public contract.
5. Add a regression test that makes the chosen behavior explicit.

Never resolve ambiguity by adding a hidden feature or weakening validation.
