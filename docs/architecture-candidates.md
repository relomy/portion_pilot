# Architecture Improvement Candidates

Identified via an architectural survey using the `improve-codebase-architecture` skill (Ousterhout depth/seam vocabulary). Candidates are ordered by estimated impact.

**Vocabulary:** see [AGENTS.md](../AGENTS.md) and [LANGUAGE.md](LANGUAGE.md) (if present).  
- **Module** — anything with an interface and an implementation  
- **Depth** — how much behavior callers get relative to interface complexity they must learn  
- **Seam** — a place where behaviour can be altered without editing at that place  
- **Adapter** — a concrete implementation satisfying a seam  
- **Deletion test** — if removing a module concentrates complexity across callers, it was earning its keep  

---

## Candidate 1 — ZoneLayout has no presentation layer beneath it

**Status:** open  
**Files involved:**
- `src/components/ZoneLayout.tsx` (423 lines)
- `src/utils/format.ts`

**Friction:**  
`ZoneLayout` calls 12+ `formatX()` functions directly on every render and assembles all display-ready strings itself (`totalCaloriesText`, `primaryDensityValue`, `weightChangeText`, `targetPortionText`, etc., lines 124–184). The display-value computation and the layout structure live in the same 423-line file. Adding or changing any displayed metric means touching both `format.ts` (the function) and `ZoneLayout.tsx` (the call site, variable, and prop). The deletion test confirms `format.ts` earns its keep — but there is no interface hiding the orchestration from `ZoneLayout`.

**Dependency category:** In-process (pure computation, no I/O).

**Proposed change:**  
Introduce a `useDisplayMetrics(result, units)` hook that returns a single `DisplayMetrics` object containing all pre-formatted strings. `ZoneLayout` consumes the object rather than calling individual format functions. The hook is in-process and fully testable without rendering any component.

**Benefits:**
- Display logic concentrates in one testable location
- `ZoneLayout` shrinks to a layout concern only
- New display values require touching one file, not two
- `DisplayMetrics` can be snapshot-tested independently

---

## Candidate 2 — Unit conversion is scattered across four files

**Status:** open  
**Files involved:**
- `src/utils/calculator.ts` (lines 41–50 — constants + `ouncesToGrams`, `gramsToOunces`)
- `src/utils/toCalculationInput.ts` (lines 4–10 — local `toGrams`)
- `src/hooks/useSavedMeals.ts` (lines 69–75 — duplicate `toGrams` that re-imports `ouncesToGrams`)
- `src/components/zones/cookedWeightInputMapping.ts` (separate unit path for cooked weight only)

**Friction:**  
`toGrams(value, unit)` is implemented twice (once in `toCalculationInput.ts`, once in `useSavedMeals.ts`). Both import `ouncesToGrams` from `calculator.ts` — so the conversion factor is in the calculator but the helper is duplicated. `cookedWeightInputMapping.ts` handles a third unit-conversion path in isolation. Adding a new unit (e.g. kg) or fixing a conversion factor requires touching all four files. The deletion test: removing `toCalculationInput.ts`'s `toGrams` forces the burden onto callers — the duplicate in `useSavedMeals.ts` already shows this spreading.

**Dependency category:** In-process.

**Proposed change:**  
Extract a `src/utils/units.ts` module exporting:
- Constants (`GRAMS_PER_OUNCE`, `OUNCES_PER_GRAM`)
- `toGrams(value: number | null, unit: WeightUnit): number | null`
- `fromGrams(value: number | null, unit: WeightUnit): number | null`

All four files import from `units.ts`. `calculator.ts` re-exports or drops its own copies.

**Benefits:**
- One change location for all unit conversion
- Adding a new unit is a one-file change
- Eliminates silent divergence risk between the two `toGrams` copies

---

## Candidate 3 — `computeHasConflictingCalories` is a business rule hiding in App.tsx

**Status:** open  
**Files involved:**
- `src/App.tsx` (lines 56–79 — `hasEnteredPackageLabelSource`, `computeHasConflictingCalories`)
- `src/utils/calculator.ts`

**Friction:**  
`computeHasConflictingCalories` is a domain rule — it determines whether the user has provided contradictory calorie sources. It lives in the React root component, where it cannot be tested without mounting `App`. The calculator already knows all the facts needed to make this determination (it receives `CalculationInput` which encodes mode, source, and which fields are populated). The business rule is split from the business logic module for no structural reason.

**Dependency category:** In-process.

**Proposed change:**  
Move the conflict detection into `calculator.ts` (or a `src/utils/validate.ts` sibling). Expose the result as a field on `CalculationResult` (e.g. `hasConflictingCalories: boolean`) or as a standalone pure function `detectCalorieConflict(input: CalculationInput): boolean`. `App.tsx` reads the value rather than computing it.

**Benefits:**
- Business logic concentrates in the calculator layer
- Testable as a pure function with no component mounting
- `App.tsx` loses a responsibility (thinner component)
- Rule stays co-located with the rest of calorie-source logic

---

## Candidate 4 — Two storage modules share no abstraction

**Status:** open  
**Files involved:**
- `src/hooks/useSavedMeals.ts` (182 lines)
- `src/utils/activeDraftStorage.ts` (161 lines)

**Friction:**  
Both modules implement safe localStorage access with an in-memory fallback for test/SSR environments — but the fallback patterns are different. `activeDraftStorage.ts` uses a `StorageAdapter` type and a `Map`-backed fallback (lines 9, 18–53). `useSavedMeals.ts` uses a simpler `getStorage()` that returns `null` and null-checks at every call site (lines 40–50). The safe-access pattern is duplicated but inconsistent. If a third persistent data type is added, a third variant of the pattern appears. There is currently only one production adapter (real `localStorage`) and one test adapter (in-memory) per module — meeting the "two adapters means a real seam" criterion but only within each module, not across them.

**Dependency category:** Local-substitutable (in-memory fallback already exists).

**Proposed change:**  
Extract a `src/utils/storage.ts` base exporting a single `getStorageAdapter(): StorageAdapter` function with the `Map`-backed fallback. Both `useSavedMeals.ts` and `activeDraftStorage.ts` import this and own only their schema and migration logic.

**Benefits:**
- Fallback implementation lives once
- Consistent safe-access pattern across all persistence modules
- Third persistent data type requires zero new fallback code

---

## Candidate 5 — `toCalculationInput` is a thin adapter with two unrelated responsibilities

**Status:** open  
**Files involved:**
- `src/utils/toCalculationInput.ts` (42 lines)
- `src/App.tsx` (line 96 — sole call site)
- `src/utils/calculator.ts`

**Friction:**  
`toCalculationInput` does two distinct things: (1) unit conversion (`oz → g` via `toGrams`) and (2) field selection/nullification based on `mode` and `totalCaloriesSource`. These are separate concerns sharing a 42-line file. The unit conversion responsibility overlaps with Candidate 2's scattered conversion. Meanwhile, `useSavedMeals.ts` has its own `calculateFromInputs` (lines 102–127) that duplicates the field-selection logic from `toCalculationInput` — so the bridge is already spread across two locations. Per the seam discipline rule: a seam with only one adapter (`toCalculationInput`) is just indirection.

**Dependency category:** In-process.

**Proposed change:**  
After resolving Candidate 2 (units extracted), the unit conversion leaves this file. What remains is a field-projection function that can either: (a) move inline into `App.tsx` (it's only 20 lines of `mode`-based nullification), or (b) be absorbed into `calculator.ts` as an overloaded entry point that accepts `MealInputs` directly. Consolidating `calculateFromInputs` in `useSavedMeals.ts` with this adapter eliminates the duplicate field-selection logic.

**Benefits:**
- Removes an intermediate module that adds coupling without adding leverage
- Eliminates the duplicate field-selection in `useSavedMeals.ts`
- Form-to-calculator path becomes a single call with no hidden adapter

---

## Decision log

| Date | Candidate | Decision |
|---|---|---|
| — | — | — |
