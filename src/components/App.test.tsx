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

function getPackageZone() {
  return screen.getByTestId('zone-package')
}

function getCookedZone() {
  return screen.getByTestId('zone-cooked')
}

function getPortionZone() {
  return screen.getByTestId('zone-portion')
}

describe('App zone layout migration', () => {
  it('renders the new zone layout markers and saved meals region', () => {
    render(<App />)

    expect(screen.getByTestId('zone-package')).toBeInTheDocument()
    expect(screen.getByTestId('zone-cooked')).toBeInTheDocument()
    expect(screen.getByTestId('zone-portion')).toBeInTheDocument()
    expect(screen.getByTestId('saved-meals-region')).toBeInTheDocument()
    expect(screen.queryByTestId('input-worksheet')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nutrition-label')).not.toBeInTheDocument()
  })

  it('defaults to total mode with package label source and portion eaten input', () => {
    render(<App />)

    const packageZone = getPackageZone()
    const portionZone = getPortionZone()

    expect(
      within(packageZone).getByRole('radio', { name: /^total calories$/i }),
    ).toBeChecked()
    expect(
      within(packageZone).getByRole('radio', { name: /^package label$/i }),
    ).toBeChecked()
    expect(within(packageZone).getByLabelText(/^raw total weight$/i)).toBeInTheDocument()
    expect(within(portionZone).getByLabelText(/^portion eaten$/i)).toBeInTheDocument()
  })

  it('preserves manual total calories when switching to per-serving mode and back', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '500',
    )
    await user.click(
      within(packageZone).getByRole('radio', { name: /^per serving$/i }),
    )
    await user.click(
      within(packageZone).getByRole('radio', { name: /^total calories$/i }),
    )
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )

    expect(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).toHaveValue(500)
  })

  it('preserves package-label and manual-total values when toggling total submodes', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '458')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '130')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')

    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '900',
    )

    await user.click(
      within(packageZone).getByRole('radio', { name: /^package label$/i }),
    )
    expect(within(packageZone).getByLabelText(/^raw total weight$/i)).toHaveValue(458)
    expect(within(packageZone).getByLabelText(/^serving weight$/i)).toHaveValue(130)
    expect(within(packageZone).getByLabelText(/^calories \/ serving$/i)).toHaveValue(370)

    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    expect(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).toHaveValue(900)
  })

  it('does not leak per-serving servings into total manual calculations', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

    await user.click(
      within(packageZone).getByRole('radio', { name: /^per serving$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^calories per serving$/i),
      '250',
    )
    await user.type(
      within(packageZone).getByLabelText(/^servings \(optional\)$/i),
      '2',
    )

    await user.click(
      within(packageZone).getByRole('radio', { name: /^total calories$/i }),
    )
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '600',
    )

    expect(within(packageZone).getByTestId('derived-total-cal')).toHaveTextContent(
      /^600$/,
    )
    expect(within(packageZone).getByTestId('derived-cal-serving')).toHaveTextContent(
      '—',
    )
  })

  it('shows conflict diagnostics for real competing calorie entries only', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '500',
    )
    await user.click(
      within(packageZone).getByRole('radio', { name: /^per serving$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^calories per serving$/i),
      '125',
    )
    await user.click(screen.getByRole('button', { name: /show debug details/i }))

    expect(screen.getByText(/"hasConflictingCalories": true/i)).toBeInTheDocument()
  })

  it('does not flag preserved inactive total-submode values as conflicting', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '458')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '130')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '900',
    )
    await user.click(screen.getByRole('button', { name: /show debug details/i }))

    expect(screen.getByText(/"hasConflictingCalories": false/i)).toBeInTheDocument()
  })

  it('gates Zone 3 on mode: perServing hides servings and portion eaten controls', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const portionZone = getPortionZone()

    await user.click(
      within(packageZone).getByRole('radio', { name: /^per serving$/i }),
    )

    expect(
      within(portionZone).queryByLabelText(/^servings \(optional\)$/i),
    ).not.toBeInTheDocument()
    expect(
      within(portionZone).queryByLabelText(/^portion eaten$/i),
    ).not.toBeInTheDocument()
  })

  it('shows portion eaten and target controls in Zone 3 for total mode', () => {
    render(<App />)

    const portionZone = getPortionZone()

    expect(within(portionZone).getByLabelText(/^portion eaten$/i)).toBeInTheDocument()
    expect(within(portionZone).getByLabelText(/^target cal$/i)).toBeInTheDocument()
    expect(within(portionZone).queryByLabelText(/^servings \(optional\)$/i)).not.toBeInTheDocument()
  })

  it('derives package-label totals for ravioli workflow', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '458')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '130')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')

    expect(within(packageZone).getByTestId('derived-total-cal')).toHaveTextContent(
      /^1303\.5$/,
    )
    expect(within(packageZone).getByTestId('derived-raw-servings')).toHaveTextContent(
      /^3\.523$/,
    )
  })

  it('lets users enter cooked weight in ounces and still computes cooked outputs', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const cookedZone = getCookedZone()

    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '560')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '134')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')
    await user.click(
      within(cookedZone).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '26.244')

    expect(within(cookedZone).getByTestId('density-primary')).toHaveTextContent(
      /2\.078/,
    )
  })

  it('keeps ounce-mode cooked input display stable for decimal entry', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cookedZone = getCookedZone()
    const cookedInput = within(cookedZone).getByLabelText(/^cooked weight$/i)

    await user.click(
      within(cookedZone).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(cookedInput, '0.1')

    expect((cookedInput as HTMLInputElement).value).toBe('0.1')
  })

  it('resets form and ephemeral target calories on clear', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const cookedZone = getCookedZone()
    const portionZone = getPortionZone()

    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Prep Bowl')
    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '560')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '134')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '744')
    await user.type(within(portionZone).getByLabelText(/^target cal$/i), '400')

    await user.click(screen.getByRole('button', { name: /^clear$/i }))

    expect(within(packageZone).getByLabelText(/^meal name$/i)).toHaveValue('')
    expect(within(portionZone).getByLabelText(/^target cal$/i)).toHaveValue(null)
    expect(
      within(packageZone).getByRole('radio', { name: /^package label$/i }),
    ).toBeChecked()
  })

  it('saves, reloads, and deletes a meal from the shelf', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const cookedZone = getCookedZone()
    const portionZone = getPortionZone()

    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Chicken Bowl')
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '500',
    )
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '250')
    await user.type(within(portionZone).getByLabelText(/^portion eaten$/i), '100')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    expect(screen.getByText(/chicken bowl/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(within(packageZone).getByLabelText(/^meal name$/i)).toHaveValue('')

    await user.click(screen.getByRole('button', { name: /^load$/i }))
    expect(within(packageZone).getByLabelText(/^meal name$/i)).toHaveValue('Chicken Bowl')
    expect(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    ).toBeChecked()
    expect(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).toHaveValue(500)
    expect(within(portionZone).getByLabelText(/^portion eaten$/i)).toHaveValue(100)

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(screen.queryByText(/chicken bowl/i)).not.toBeInTheDocument()
  })

  it('does not persist target calories when loading a saved meal', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const cookedZone = getCookedZone()
    const portionZone = getPortionZone()

    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Loaded Meal')
    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '560')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '134')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '744')
    await user.type(within(portionZone).getByLabelText(/^target cal$/i), '400')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    await user.click(screen.getByRole('button', { name: /^load$/i }))

    expect(within(portionZone).getByLabelText(/^target cal$/i)).toHaveValue(null)
  })

  it('saves and reloads ounce units for package-label fields', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const cookedZone = getCookedZone()
    const rawWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /raw total weight unit/i,
    })
    const servingWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /serving weight unit/i,
    })

    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Ravioli')
    await user.click(
      within(rawWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '19.8')
    await user.click(
      within(servingWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '4.7')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '744')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    await user.click(screen.getByRole('button', { name: /^load$/i }))

    expect(
      within(rawWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
    expect(
      within(servingWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    ).toBeChecked()
    expect(within(packageZone).getByLabelText(/^raw total weight$/i)).toHaveValue(19.8)
    expect(within(packageZone).getByLabelText(/^serving weight$/i)).toHaveValue(4.7)
  })
})
