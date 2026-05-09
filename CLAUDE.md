# portion_pilot — Project Context

## What this app does

portion_pilot is a kitchen calculator for home cooks who track calories. The user enters package nutrition data, records the cooked batch weight, then logs how much of the cooked batch they ate. The app derives calorie density, portion calories, and target portion size.

## Domain vocabulary

| Term | Definition |
|---|---|
| **Package** | The raw/uncooked ingredient as sold, with its nutrition label |
| **Cooked batch** | The total quantity produced after cooking, weighed in grams or ounces |
| **Calorie density** | Calories per gram (or ounce) of cooked food — the bridge between batch and portion |
| **Portion** | The amount eaten from a cooked batch in a single meal |
| **Package serving** | The serving size defined on the nutrition label (raw weight and cal/serving) |
| **Raw-per-cooked multiplier** | `rawTotalWeight / cookedWeightGrams` — how many grams of raw food equal 1 g of cooked |
| **Total mode** | User enters total calories for the whole batch (manually or from the package label) |
| **Per-serving mode** | User enters calories per serving and number of servings |
| **Calorie source** | Which input path produced `totalCalories`: `manualTotal`, `packageLabel`, or `perServing` |
| **Weight change** | Difference between raw batch weight and cooked batch weight (loss from evaporation, etc.) |
| **Target portion** | `targetCalories / caloriesPerGram` — how many grams to eat to hit a calorie goal |
| **Draft** | The active, unsaved form state persisted across page reloads |
| **Saved meal** | A snapshot of `MealInputs` + `CalculationResult`, stored permanently in localStorage |

## Key types

- `MealInputs` (`src/hooks/useSavedMeals.ts:12`) — raw form state, 16 fields
- `CalculationInput` (`src/utils/calculator.ts:1`) — normalized input for the calculation engine, 11 fields
- `CalculationResult` (`src/utils/calculator.ts:15`) — all computed metrics
- `AppDraft` (`src/utils/activeDraftStorage.ts:11`) — persisted UI state (form + unit prefs)
- `SavedMeal` (`src/hooks/useSavedMeals.ts:31`) — archived meal with cached result

## Architecture layers

```
App.tsx              — React state root; orchestrates form, draft, saved meals
  toCalculationInput — MealInputs → CalculationInput adapter (unit conversion + field projection)
  calculator.ts      — Pure calculation engine; the domain's only source of truth for math
  ZoneLayout.tsx     — Layout shell; formats all display values; routes props to zone sections
    format.ts        — Pure display-formatting functions (no business logic)
    Zone1/2/3        — Thin input forms; no internal logic
    stepState.ts     — Derives step completion state from CalculationResult
  useSavedMeals      — Saved-meal CRUD with localStorage persistence and schema migration
  activeDraftStorage — Auto-save/restore of active form draft in localStorage
```

## Architecture candidates for improvement

See [`docs/architecture-candidates.md`](docs/architecture-candidates.md).
