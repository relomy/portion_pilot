import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { STORAGE_KEY } from '../hooks/useSavedMeals'

beforeEach(() => {
  if (typeof window.localStorage?.removeItem === 'function') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
})

describe('App mode switching', () => {
  it('renders the worksheet, nutrition label, and saved meals regions', () => {
    render(<App />)

    expect(screen.getByTestId('calculator-layout')).toHaveClass(
      'calculator-layout--asymmetric',
    )
    expect(screen.getByTestId('input-worksheet')).toBeInTheDocument()
    expect(screen.getByTestId('nutrition-label')).toBeInTheDocument()
    expect(screen.getByTestId('saved-meals-region')).toBeInTheDocument()
  })

  it('defaults total mode to package label inputs', () => {
    render(<App />)

    expect(screen.getByLabelText(/^package label$/i)).toBeChecked()
    expect(screen.getByText(/^package label inputs$/i)).toBeInTheDocument()
    expect(screen.getByText(/^cooked batch inputs$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^raw total weight$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^portion eaten \(cooked weight\)$/i)).toBeInTheDocument()
  })

  it('preserves manual total calories when switching to per-serving mode and back', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.type(screen.getByLabelText(/^total calories$/i), '500')
    await user.click(screen.getByLabelText(/^per serving$/i))
    await user.click(screen.getByLabelText(/total calories mode/i))
    await user.click(screen.getByLabelText(/^manual total$/i))

    expect(screen.getByLabelText(/^total calories$/i)).toHaveValue(500)
  })

  it('preserves the last-used total sub-mode when returning from per-serving mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.click(screen.getByLabelText(/^per serving$/i))
    await user.click(screen.getByLabelText(/total calories mode/i))

    expect(screen.getByLabelText(/^manual total$/i)).toBeChecked()
  })

  it('clears per-serving inputs when switching to total mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^per serving$/i))
    await user.type(screen.getByLabelText(/^calories per serving$/i), '125')
    await user.type(screen.getByLabelText(/^servings \(optional\)$/i), '4')
    await user.click(screen.getByLabelText(/total calories mode/i))

    expect(
      screen.queryByLabelText(/^calories per serving$/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText(/^servings \(optional\)$/i),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^portion eaten \(cooked weight\)$/i)).toHaveValue(
      null,
    )
  })

  it('clearing the form resets total mode to package label', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.click(screen.getByRole('button', { name: /^clear$/i }))

    expect(screen.getByLabelText(/^package label$/i)).toBeChecked()
  })

  it('preserves package-label values when toggling to manual total and back', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^raw total weight$/i), '458')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '130')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )
    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.type(screen.getByLabelText(/^total calories$/i), '900')
    await user.click(screen.getByLabelText(/^package label$/i))

    expect(screen.getByLabelText(/^raw total weight$/i)).toHaveValue(458)
    expect(screen.getByLabelText(/^package serving weight$/i)).toHaveValue(130)
    expect(
      screen.getByLabelText(/^package calories per serving$/i),
    ).toHaveValue(370)
    await user.click(screen.getByLabelText(/^manual total$/i))
    expect(screen.getByLabelText(/^total calories$/i)).toHaveValue(900)
  })

  it('keeps total-source controls outside the package-labeled section in manual total mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^manual total$/i))

    expect(screen.getByLabelText(/^total source$/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/^package label inputs$/i),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^total calories$/i)).toBeInTheDocument()
  })

  it('flags real competing calorie entries in dev details', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.type(screen.getByLabelText(/^total calories$/i), '500')
    await user.click(screen.getByLabelText(/^per serving$/i))
    await user.type(screen.getByLabelText(/^calories per serving$/i), '125')
    await user.click(screen.getByRole('button', { name: /show debug details/i }))

    expect(screen.getByText(/"hasConflictingCalories": true/i)).toBeInTheDocument()
  })

  it('does not flag preserved inactive total-submode values as conflicting', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^raw total weight$/i), '458')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '130')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )
    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.type(screen.getByLabelText(/^total calories$/i), '900')
    await user.click(screen.getByRole('button', { name: /show debug details/i }))

    expect(
      screen.getByText(/"hasConflictingCalories": false/i),
    ).toBeInTheDocument()
  })

  it('renders the live results panel metrics and assumption note', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^per serving$/i))
    await user.type(screen.getByLabelText(/^calories per serving$/i), '125')

    expect(screen.getByTestId('results-metrics').tagName).toBe('DL')
    expect(
      screen.getByText(/assumed 1 serving because none was provided/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/source: calories per serving/i),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/need cooked weight/i)).toHaveLength(3)
  })

  it('saves meals, reloads them into the form, and deletes them from the shelf', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^meal name$/i), 'Chicken Bowl')
    await user.type(screen.getByLabelText(/^cooked weight \(g\)$/i), '250')
    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.type(screen.getByLabelText(/^total calories$/i), '500')
    await user.type(
      screen.getByLabelText(/^portion eaten \(cooked weight\)$/i),
      '100',
    )
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    const mealName = screen.getByText(/chicken bowl/i)
    expect(mealName.closest('.meal-card--prep')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(screen.getByLabelText(/^meal name$/i)).toHaveValue('')

    await user.click(screen.getByRole('button', { name: /^load$/i }))
    expect(screen.getByLabelText(/^meal name$/i)).toHaveValue('Chicken Bowl')
    expect(screen.getByLabelText(/^manual total$/i)).toBeChecked()
    expect(screen.getByLabelText(/^total calories$/i)).toHaveValue(500)
    expect(screen.getByLabelText(/^portion eaten \(cooked weight\)$/i)).toHaveValue(
      100,
    )
    expect(screen.getByText(/source: total calories/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.queryByText(/chicken bowl/i)).not.toBeInTheDocument()
  })

  it('keeps the per-serving servings field and does not show portion eaten in perServing mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^per serving$/i))

    expect(screen.getByLabelText(/^servings \(optional\)$/i)).toBeInTheDocument()
    expect(
      screen.queryByLabelText(/^portion eaten \(cooked weight\)$/i),
    ).not.toBeInTheDocument()
  })

  it('derives package-label totals for the ravioli workflow', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^raw total weight$/i), '458')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '130')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )

    expect(screen.getAllByText(/^1303.5$/i)).toHaveLength(2)
    expect(screen.getByText(/^3.523$/i)).toBeInTheDocument()
  })

  it('preserves total-mode portion value and unit when toggling sub-modes', async () => {
    const user = userEvent.setup()
    render(<App />)

    const portionInput = screen.getByLabelText(/^portion eaten \(cooked weight\)$/i)
    const portionField = portionInput.closest('.field') as HTMLElement | null

    expect(portionField).not.toBeNull()

    await user.type(portionInput, '5')
    await user.click(within(portionField!).getByRole('radio', { name: /^oz$/i }))
    await user.click(screen.getByLabelText(/^manual total$/i))
    await user.click(screen.getByLabelText(/^package label$/i))

    expect(screen.getByLabelText(/^portion eaten \(cooked weight\)$/i)).toHaveValue(5)
    expect(
      within(
        screen
          .getByLabelText(/^portion eaten \(cooked weight\)$/i)
          .closest('.field') as HTMLElement,
      ).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
  })

  it('shows batch calorie stats and cooked batch stats in total mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^raw total weight$/i), '458')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '130')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )
    await user.type(screen.getByLabelText(/^cooked weight \(g\)$/i), '300')
    await user.type(
      screen.getByLabelText(/^portion eaten \(cooked weight\)$/i),
      '150',
    )

    expect(screen.getByText(/^batch calorie stats$/i)).toBeInTheDocument()
    expect(screen.getByText(/^cooked batch stats$/i)).toBeInTheDocument()
    expect(
      screen.getByText(/^based on raw package weight and label serving size$/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/^portion calories$/i)).toBeInTheDocument()
    expect(screen.queryByText(/^calories per serving$/i)).not.toBeInTheDocument()
  })

  it('keeps target calories ephemeral and resets it on clear', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^raw total weight$/i), '560')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '134')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )
    await user.type(screen.getByLabelText(/^cooked weight \(g\)$/i), '744')
    await user.type(screen.getByLabelText(/^target calories$/i), '400')
    await user.click(screen.getByRole('button', { name: /^clear$/i }))

    expect(screen.getByLabelText(/^target calories$/i)).toHaveValue(null)
  })

  it('does not persist target calories when a saved meal is reloaded', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^meal name$/i), 'Ravioli')
    await user.type(screen.getByLabelText(/^raw total weight$/i), '560')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '134')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )
    await user.type(screen.getByLabelText(/^cooked weight \(g\)$/i), '744')
    await user.type(screen.getByLabelText(/^target calories$/i), '400')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))
    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    await user.click(screen.getByRole('button', { name: /^load$/i }))

    expect(screen.getByLabelText(/^target calories$/i)).toHaveValue(null)
  })

  it('saves and reloads an ounce-based package-label meal with units intact', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      within(screen.getByLabelText(/^raw total weight$/i).closest('.field')!).getByRole(
        'radio',
        { name: /^oz$/i },
      ),
    )
    await user.click(
      within(
        screen.getByLabelText(/^package serving weight$/i).closest('.field')!,
      ).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(screen.getByLabelText(/^raw total weight$/i), '16.155')
    await user.type(screen.getByLabelText(/^package serving weight$/i), '4.586')
    await user.type(
      screen.getByLabelText(/^package calories per serving$/i),
      '370',
    )
    await user.type(screen.getByLabelText(/^meal name$/i), 'Ravioli')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))
    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    await user.click(screen.getByRole('button', { name: /^load$/i }))

    expect(
      within(screen.getByLabelText(/^raw total weight$/i).closest('.field')!).getByRole(
        'radio',
        { name: /^oz$/i },
      ),
    ).toBeChecked()
    expect(
      within(
        screen.getByLabelText(/^package serving weight$/i).closest('.field')!,
      ).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
    expect(screen.getByLabelText(/^raw total weight$/i)).toHaveValue(16.155)
    expect(screen.getAllByText(/^1303.4$/i)).toHaveLength(2)
  })
})
