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
              mealName: 'Chicken Bowl',
              mode: 'total',
              totalCalories: 500,
              caloriesPerServing: null,
              servings: null,
              cookedWeightGrams: 250,
            },
            cachedResult: {
              totalCalories: 500,
              caloriesPerServing: null,
              caloriesPerGram: 2,
              caloriesPerOunce: 56.7,
              caloriesPer100Grams: 200,
              rawPackageServings: null,
              totalCaloriesDisplaySource: 'manualTotal',
              calorie_source_used: 'total',
              assumptions: { servings_assumed: false },
            },
          },
        ]}
        onLoad={onLoad}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByTestId('saved-meal-card-1')).toHaveClass('meal-card--prep')

    await user.click(screen.getByRole('button', { name: /load/i }))
    expect(onLoad).toHaveBeenCalledWith('1')

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
