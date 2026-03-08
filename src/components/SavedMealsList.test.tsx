import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SavedMealsList } from './SavedMealsList'

describe('SavedMealsList', () => {
  it('renders saved meals and forwards load/delete actions', async () => {
    const user = userEvent.setup()
    const onLoad = vi.fn()
    const onDelete = vi.fn()

    render(
      <SavedMealsList
        meals={[
          {
            id: '1',
            createdAt: '2026-03-03T12:00:00.000Z',
            inputs: {
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
            },
            cachedResult: {
              totalCalories: 1303.5384,
              caloriesPerServing: null,
              caloriesPerGram: null,
              caloriesPerOunce: null,
              caloriesPer100Grams: null,
              rawPackageServings: 3.5230769,
              portionCalories: null,
              cookedWeightPerPackageServingGrams: null,
              equivalentPackageServingsEaten: null,
              weightChangeGrams: null,
              weightChangePercent: null,
              weightChangeDirection: null,
              totalCaloriesDisplaySource: 'packageLabel',
              calorie_source_used: 'total',
              assumptions: { servings_assumed: false },
            },
          },
        ]}
        onLoad={onLoad}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByTestId('saved-meals-region')).toBeInTheDocument()
    expect(screen.getByText(/^zone 4 · your shelf$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /^meal prep shelf$/i }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('saved-meal-card-1')).toHaveClass('meal-card--prep')
    expect(screen.getByText(/^1303.5 cal$/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /load/i }))
    expect(onLoad).toHaveBeenCalledWith('1')

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
