import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultsPanel } from './ResultsPanel'

describe('ResultsPanel', () => {
  it('shows source-neutral batch calorie stats and cooked batch stats in total mode', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: 2,
          caloriesPerOunce: 56.7,
          caloriesPer100Grams: 200,
          rawPackageServings: 3.5230769,
          portionCalories: 300,
          cookedWeightPerPackageServingGrams: null,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: null,
          weightChangePercent: null,
          weightChangeDirection: null,
          totalCaloriesDisplaySource: 'packageLabel',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Ravioli',
          mode: 'total',
          totalCaloriesSource: 'packageLabel',
          manualTotalCalories: null,
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: 300,
          portionEaten: 150,
          portionEatenUnit: 'g',
          rawTotalWeight: 458,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 130,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
      />,
    )

    expect(screen.getByText(/^batch calorie stats$/i)).toBeInTheDocument()
    expect(
      screen.getByText(/^based on raw package weight and label serving size$/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/^cooked batch stats$/i)).toBeInTheDocument()
    expect(screen.getByText(/^portion calories$/i)).toBeInTheDocument()
    expect(screen.getByText(/^3.523$/i)).toBeInTheDocument()
    expect(screen.getByText(/^300$/i)).toBeInTheDocument()
  })

  it('shows cooked batch stats as unavailable when cooked batch weight is missing', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 500,
          caloriesPerServing: null,
          caloriesPerGram: null,
          caloriesPerOunce: null,
          caloriesPer100Grams: null,
          rawPackageServings: null,
          portionCalories: null,
          cookedWeightPerPackageServingGrams: null,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: null,
          weightChangePercent: null,
          weightChangeDirection: null,
          totalCaloriesDisplaySource: 'manualTotal',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Roasted chicken',
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
          manualTotalCalories: 500,
          totalCalories: 500,
          caloriesPerServing: null,
          yourServings: null,
          servings: null,
          cookedWeightGrams: null,
          portionEaten: 150,
          portionEatenUnit: 'g',
          rawTotalWeight: null,
          rawTotalWeightUnit: 'g',
          packageServingWeight: null,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: null,
        }}
      />,
    )

    expect(screen.getByText(/source: total calories/i)).toBeInTheDocument()
    expect(screen.getByText(/^batch calorie stats$/i)).toBeInTheDocument()
    expect(screen.getByText(/^cooked batch stats$/i)).toBeInTheDocument()
    expect(screen.getByText(/^based on entered batch calories$/i)).toBeInTheDocument()
    expect(screen.getByText(/^needs cooked batch weight$/i)).toBeInTheDocument()
  })

  it('keeps the dev diagnostics drawer for conflicting inputs in development', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 500,
          caloriesPerServing: null,
          caloriesPerGram: null,
          caloriesPerOunce: null,
          caloriesPer100Grams: null,
          rawPackageServings: null,
          portionCalories: null,
          cookedWeightPerPackageServingGrams: null,
          equivalentPackageServingsEaten: null,
          weightChangeGrams: null,
          weightChangePercent: null,
          weightChangeDirection: null,
          totalCaloriesDisplaySource: 'manualTotal',
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories
        form={{
          mealName: 'Roasted chicken',
          mode: 'total',
          totalCaloriesSource: 'manualTotal',
          manualTotalCalories: 500,
          totalCalories: 500,
          caloriesPerServing: 125,
          yourServings: 4,
          servings: 4,
          cookedWeightGrams: null,
          portionEaten: null,
          portionEatenUnit: 'g',
          rawTotalWeight: null,
          rawTotalWeightUnit: 'g',
          packageServingWeight: null,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: null,
        }}
      />,
    )

    expect(
      screen.getByRole('button', { name: /show debug details/i }),
    ).toBeInTheDocument()
  })
})
