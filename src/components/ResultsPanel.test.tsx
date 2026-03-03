import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultsPanel } from './ResultsPanel'

describe('ResultsPanel', () => {
  it('shows source used and need cooked weight warnings', () => {
    render(
      <ResultsPanel
        result={{
          totalCalories: 500,
          caloriesPerServing: 500,
          caloriesPerGram: null,
          caloriesPerOunce: null,
          caloriesPer100Grams: null,
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories={false}
        form={{
          mealName: 'Roasted chicken',
          mode: 'total',
          totalCalories: 500,
          caloriesPerServing: null,
          servings: null,
          cookedWeightGrams: null,
        }}
      />,
    )

    expect(screen.getByText(/source: total calories/i)).toBeInTheDocument()
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
          calorie_source_used: 'total',
          assumptions: { servings_assumed: false },
        }}
        hasConflictingCalories
        form={{
          mealName: 'Roasted chicken',
          mode: 'total',
          totalCalories: 500,
          caloriesPerServing: 125,
          servings: 4,
          cookedWeightGrams: null,
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
