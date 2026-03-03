import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultsPanel } from './ResultsPanel'

describe('ResultsPanel', () => {
  it('shows raw package servings and fractional package totals', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 1303.5384,
          caloriesPerServing: null,
          caloriesPerGram: null,
          caloriesPerOunce: null,
          caloriesPer100Grams: null,
          rawPackageServings: 3.5230769,
          portionCalories: null,
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
          cookedWeightGrams: null,
          portionEaten: null,
          portionEatenUnit: 'g',
          rawTotalWeight: 458,
          rawTotalWeightUnit: 'g',
          packageServingWeight: 130,
          packageServingWeightUnit: 'g',
          packageCaloriesPerServing: 370,
        }}
      />,
    )

    expect(screen.getByText(/^1303.5$/i)).toBeInTheDocument()
    expect(screen.getByText(/^raw package servings$/i)).toBeInTheDocument()
    expect(screen.getByText(/^3.523$/i)).toBeInTheDocument()
  })

  it('shows source used and need cooked weight warnings', () => {
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

    expect(screen.getByText(/source: total calories/i)).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(screen.getAllByText(/need cooked weight/i)).toHaveLength(3)
    expect(screen.getByTestId('results-metrics').tagName).toBe('DL')
  })

  it('renders the dev diagnostics drawer for conflicting inputs in development', () => {
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
    expect(
      screen.queryByText(/multiple calorie sources entered/i),
    ).not.toBeInTheDocument()
  })
})
