# Design Lead Report

Run date: 20 June 2026
Scope: Priceplain frontend layout, visual hierarchy, responsive behaviour and state visibility.

## Design Diagnosis

The primary workflow is clear: the user sees `Priceplain`, action buttons, `Pricing Inputs`, cost metrics, the pricing-to-billing workflow and generated tiers without needing to hunt for the main task.

The main design issue found was in the desktop intake panel. Numeric assumption fields used a three-column grid inside a narrow fixed panel, which caused long labels such as `Units/customer/month` and `Fixed cost/month` to crowd into each other. This reduced scanability in the highest-use part of the product.

## Proposed Changes

- Change the numeric assumption grid from three columns to two columns in the intake panel.
- Add explicit `:focus-visible` styling for buttons and form controls.
- Add a readable report text fallback to the Submission Pack tab so the final artefact remains available when clipboard access is blocked.
- Preserve the existing visual system, spacing, cards, colours and information architecture.

## Files Affected

- `src/styles.css`

## Changes Made

- `.metric-inputs` now uses two equal columns by default.
- Buttons, inputs, selects and textareas now receive a teal focus-visible ring and border state.
- Submission Pack now includes a labelled, read-only report textarea.

## Before Verification

- Desktop 1440px check showed the intake panel at 470px wide.
- The three-column numeric grid made long field labels visually crowd together.
- No horizontal page overflow was present.

## After Verification

- `npm run build` passed.
- Desktop 1440px recheck:
  - Numeric grid columns are `210px 210px`.
  - Metric label overlap count is `0`.
  - No horizontal overflow.
  - Focus-visible CSS rule is present.
- Mobile 390px recheck:
  - Numeric grid is a single `324px` column.
  - Primary intake workflow remains visible.
  - No horizontal overflow.
  - Unlabelled control count is `0`.
- Submission Pack fallback recheck:
  - Desktop 1440px and mobile 390px both have no horizontal overflow.
  - Report textarea is labelled and stays within its container.

## Remaining Design Risks

- The app is dense by design because it is an operational pricing workspace; judges may need a guided demo path rather than exploring every panel unaided.
- The UI has no automated visual regression tests.
- Live provider success states still need verification with real keys if shown during judging.
