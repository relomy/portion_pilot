import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import {
  ACTIVE_DRAFT_STORAGE_KEY,
  resetActiveDraftStorageForTests,
} from '../utils/activeDraftStorage'
import { STORAGE_KEY } from '../hooks/useSavedMeals'

beforeEach(() => {
  resetActiveDraftStorageForTests()
  if (typeof window.localStorage?.removeItem === 'function') {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY)
  }
})

function getPackageZone() {
  selectDesktopStep('step1')
  return screen.getByTestId('zone-package')
}

function selectDesktopStep(step: 'step1' | 'step2' | 'step3') {
  const stepLabels = {
    step1: /step 1 .* package/i,
    step2: /step 2 .* cooked batch/i,
    step3: /step 3 .* portion/i,
  } as const
  const rail = screen.getByTestId('desktop-stepflow-rail')
  fireEvent.click(within(rail).getByRole('button', { name: stepLabels[step] }))
}

function getCookedZone() {
  selectDesktopStep('step2')
  return screen.getByTestId('zone-cooked')
}

function getPortionZone() {
  selectDesktopStep('step3')
  return screen.getByTestId('zone-portion')
}

function getDesktopUtilityButton(utility: 'calculator' | 'saved') {
  return within(screen.getByTestId('desktop-stepflow-rail')).getByRole('button', {
    name: new RegExp(`^${utility}$`, 'i'),
  })
}

describe('App zone layout migration', () => {
  it('renders the new zone layout markers and saved meals region', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('zone-package')).toBeInTheDocument()
    expect(screen.queryByTestId('zone-cooked')).not.toBeInTheDocument()
    expect(screen.queryByTestId('zone-portion')).not.toBeInTheDocument()
    expect(getCookedZone()).toBeInTheDocument()
    expect(getPortionZone()).toBeInTheDocument()
    expect(screen.queryByTestId('saved-meals-region')).not.toBeInTheDocument()
    expect(screen.queryByTestId('input-worksheet')).not.toBeInTheDocument()
    expect(screen.queryByTestId('nutrition-label')).not.toBeInTheDocument()

    await user.click(getDesktopUtilityButton('saved'))
    expect(screen.getByTestId('saved-meals-region')).toBeInTheDocument()
  })

  it('renders saved meals region inside the zone layout root', async () => {
    const user = userEvent.setup()
    render(<App />)

    const layoutRoot = screen.getByTestId('zone-layout-root')
    await user.click(getDesktopUtilityButton('saved'))
    expect(within(layoutRoot).getByTestId('saved-meals-region')).toBeInTheDocument()
  })

  it('renders saved meals region after zone 3 in layout flow', async () => {
    const user = userEvent.setup()
    render(<App />)

    const zone3 = getPortionZone()
    await user.click(getDesktopUtilityButton('saved'))
    const shelf = screen.getByTestId('saved-meals-region')
    expect(
      zone3.compareDocumentPosition(shelf) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0)
  })

  it('defaults to total mode with package label source and portion eaten input', () => {
    render(<App />)

    const packageZone = getPackageZone()

    expect(
      within(packageZone).getByRole('radio', { name: /^total calories$/i }),
    ).toBeChecked()
    expect(
      within(packageZone).getByRole('radio', { name: /^package label$/i }),
    ).toBeChecked()
    expect(within(packageZone).getByLabelText(/^raw total weight$/i)).toBeInTheDocument()

    const portionZone = getPortionZone()
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

    await user.click(
      within(packageZone).getByRole('radio', { name: /^per serving$/i }),
    )

    const portionZone = getPortionZone()
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

  it('uses decimal inputMode for representative numeric inputs', () => {
    render(<App />)

    expect(within(getPackageZone()).getByLabelText(/^raw total weight$/i)).toHaveAttribute(
      'inputmode',
      'decimal',
    )
    expect(within(getCookedZone()).getByLabelText(/^cooked weight$/i)).toHaveAttribute(
      'inputmode',
      'decimal',
    )
    expect(within(getPortionZone()).getByLabelText(/^portion eaten$/i)).toHaveAttribute(
      'inputmode',
      'decimal',
    )
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
    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '560')
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '134')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '370')

    const cookedZone = getCookedZone()
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

  it('restores active worksheet draft after reload', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    const packageZone = getPackageZone()

    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Draft Bowl')
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '640',
    )
    const cookedZone = getCookedZone()
    const cookedInputUnitGroup = within(cookedZone).getByRole('group', {
      name: /cooked weight unit/i,
    })
    await user.click(
      within(cookedInputUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '12')
    const portionZone = getPortionZone()
    const cookedOutputUnitGroup = within(portionZone).getByRole('group', {
      name: /display unit/i,
    })
    await user.click(
      within(cookedOutputUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(portionZone).getByLabelText(/^portion eaten$/i), '4')
    await user.type(within(portionZone).getByLabelText(/^target cal$/i), '350')

    firstRender.unmount()
    render(<App />)

    const packageZoneAfter = getPackageZone()
    expect(within(packageZoneAfter).getByLabelText(/^meal name$/i)).toHaveValue('Draft Bowl')
    expect(
      within(packageZoneAfter).getByRole('radio', { name: /^manual total$/i }),
    ).toBeChecked()
    expect(
      within(packageZoneAfter).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).toHaveValue(640)
    const cookedZoneAfter = getCookedZone()
    const cookedInputUnitGroupAfter = within(cookedZoneAfter).getByRole('group', {
      name: /cooked weight unit/i,
    })
    expect(
      (cookedInputUnitGroupAfter.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement),
    ).toBeChecked()
    expect(within(cookedZoneAfter).getByLabelText(/^cooked weight$/i)).toHaveValue(12)
    const portionZoneAfter = getPortionZone()
    const cookedOutputUnitGroupAfter = within(portionZoneAfter).getByRole('group', {
      name: /display unit/i,
    })
    expect(
      (cookedOutputUnitGroupAfter.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement),
    ).toBeChecked()
    expect(within(portionZoneAfter).getByLabelText(/^portion eaten$/i)).toHaveValue(4)
    expect(within(portionZoneAfter).getByLabelText(/^target cal$/i)).toHaveValue(350)
  })

  it('clear all clears persisted draft so reload stays reset', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    const packageZone = getPackageZone()
    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Reset Bowl')
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '700',
    )
    const cookedZone = getCookedZone()
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '300')
    const portionZone = getPortionZone()
    await user.type(within(portionZone).getByLabelText(/^target cal$/i), '450')

    await user.click(screen.getByRole('button', { name: /^clear$/i }))

    firstRender.unmount()
    render(<App />)

    const packageZoneAfter = getPackageZone()
    expect(within(packageZoneAfter).getByLabelText(/^meal name$/i)).toHaveValue('')
    expect(
      within(packageZoneAfter).getByRole('radio', { name: /^package label$/i }),
    ).toBeChecked()
    expect(
      within(packageZoneAfter).queryByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).not.toBeInTheDocument()
    const cookedZoneAfter = getCookedZone()
    expect(within(cookedZoneAfter).getByLabelText(/^cooked weight$/i)).toHaveValue(null)
    const portionZoneAfter = getPortionZone()
    expect(within(portionZoneAfter).getByLabelText(/^target cal$/i)).toHaveValue(null)
  })

  it('preserves stable mode/source/units while clearing variable fields', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const rawWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /raw total weight unit/i,
    })
    const servingWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /serving weight unit/i,
    })
    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Prep Bowl')
    await user.click(
      within(rawWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(packageZone).getByLabelText(/^raw total weight$/i), '16')
    await user.click(
      within(servingWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(packageZone).getByLabelText(/^serving weight$/i), '4')
    await user.type(within(packageZone).getByLabelText(/^calories \/ serving$/i), '200')
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '900',
    )

    const cookedZone = getCookedZone()
    const cookedInputUnitGroup = within(cookedZone).getByRole('group', {
      name: /cooked weight unit/i,
    })
    await user.click(
      within(cookedInputUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '20')

    const portionZone = getPortionZone()
    const portionUnitGroup = within(portionZone).getByRole('group', {
      name: /portion unit/i,
    })
    const cookedOutputUnitGroup = within(portionZone).getByRole('group', {
      name: /display unit/i,
    })
    await user.click(
      within(portionUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(portionZone).getByLabelText(/^portion eaten$/i), '5')
    await user.click(
      within(cookedOutputUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.type(within(portionZone).getByLabelText(/^target cal$/i), '400')

    await user.click(
      screen.getByRole('button', { name: /^clear variable fields$/i }),
    )

    const packageZoneAfterClear = getPackageZone()
    expect(within(packageZoneAfterClear).getByLabelText(/^meal name$/i)).toHaveValue('')
    expect(within(packageZoneAfterClear).getByLabelText(/^total calories$/i, {
      selector: 'input[type="number"]',
    })).toHaveValue(null)
    const cookedZoneAfterClear = getCookedZone()
    expect(within(cookedZoneAfterClear).getByLabelText(/^cooked weight$/i)).toHaveValue(
      null,
    )
    const portionZoneAfterClear = getPortionZone()
    expect(within(portionZoneAfterClear).getByLabelText(/^portion eaten$/i)).toHaveValue(
      null,
    )
    expect(within(portionZoneAfterClear).getByLabelText(/^target cal$/i)).toHaveValue(
      null,
    )

    const calorieModeRadios = packageZoneAfterClear.querySelectorAll(
      'input[name="calorie-mode"]',
    )
    const totalSourceRadios = packageZoneAfterClear.querySelectorAll(
      'input[name="total-source"]',
    )
    expect(calorieModeRadios[0] as HTMLInputElement).toBeChecked()
    expect(totalSourceRadios[1] as HTMLInputElement).toBeChecked()
    const portionUnitGroupAfterClear = within(portionZoneAfterClear).getByRole('group', {
      name: /portion unit/i,
    })
    expect(
      (portionUnitGroupAfterClear.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement),
    ).toBeChecked()
    const cookedInputUnitGroupAfterClear = within(cookedZoneAfterClear).getByRole('group', {
      name: /cooked weight unit/i,
    })
    expect(
      (cookedInputUnitGroupAfterClear.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement),
    ).toBeChecked()
    const cookedOutputUnitGroupAfterClear = within(portionZoneAfterClear).getByRole('group', {
      name: /display unit/i,
    })
    expect(
      (cookedOutputUnitGroupAfterClear.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement),
    ).toBeChecked()

  })

  it('keeps full-reset clear behavior unchanged', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const rawWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /raw total weight unit/i,
    })
    const cookedZone = getCookedZone()
    const cookedInputUnitGroup = within(cookedZone).getByRole('group', {
      name: /cooked weight unit/i,
    })
    const portionZone = getPortionZone()
    const cookedOutputUnitGroup = within(portionZone).getByRole('group', {
      name: /display unit/i,
    })

    await user.click(
      within(rawWeightUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.click(
      within(cookedInputUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.click(
      within(cookedOutputUnitGroup).getByRole('radio', { name: /^oz$/i }),
    )
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )

    await user.click(screen.getByRole('button', { name: /^clear$/i }))

    const packageZoneAfter = getPackageZone()
    const rawWeightUnitGroupAfter = within(packageZoneAfter).getByRole('group', {
      name: /raw total weight unit/i,
    })
    const cookedZoneAfter = getCookedZone()
    const cookedInputUnitGroupAfter = within(cookedZoneAfter).getByRole('group', {
      name: /cooked weight unit/i,
    })
    const portionZoneAfter = getPortionZone()
    const cookedOutputUnitGroupAfter = within(portionZoneAfter).getByRole('group', {
      name: /display unit/i,
    })

    expect(
      within(packageZoneAfter).getByRole('radio', { name: /^package label$/i }),
    ).toBeChecked()
    expect(
      (rawWeightUnitGroupAfter.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement),
    ).toBeChecked()
    expect(
      (cookedInputUnitGroupAfter.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement),
    ).toBeChecked()
    expect(
      (cookedOutputUnitGroupAfter.querySelectorAll('input[type="radio"]')[0] as HTMLInputElement),
    ).toBeChecked()
  })

  it('reloads exact saved inputs after clear variable fields', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
    const rawWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /raw total weight unit/i,
    })
    const servingWeightUnitGroup = within(packageZone).getByRole('group', {
      name: /serving weight unit/i,
    })

    await user.type(within(packageZone).getByLabelText(/^meal name$/i), 'Exact Load')
    await user.click(
      within(packageZone).getByRole('radio', { name: /^manual total$/i }),
    )
    await user.type(
      within(packageZone).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
      '725',
    )
    await user.click(
      rawWeightUnitGroup.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement,
    )
    await user.click(
      servingWeightUnitGroup.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement,
    )
    const cookedZone = getCookedZone()
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '18')
    const portionZone = getPortionZone()
    const portionUnitGroup = within(portionZone).getByRole('group', {
      name: /portion unit/i,
    })
    await user.click(
      portionUnitGroup.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement,
    )
    await user.type(within(portionZone).getByLabelText(/^portion eaten$/i), '4')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    await user.click(
      screen.getByRole('button', { name: /^clear variable fields$/i }),
    )
    await user.click(getDesktopUtilityButton('saved'))
    await user.click(screen.getByRole('button', { name: /^load$/i }))
    await user.click(getDesktopUtilityButton('calculator'))
    const packageZoneAfterLoad = getPackageZone()
    const cookedZoneAfterLoad = getCookedZone()
    const portionZoneAfterLoad = getPortionZone()
    const portionUnitGroupAfterLoad = within(portionZoneAfterLoad).getByRole('group', {
      name: /portion unit/i,
    })

    await waitFor(() =>
      expect(within(packageZoneAfterLoad).getByLabelText(/^meal name$/i)).toHaveValue(
        'Exact Load',
      ),
    )
    expect(
      within(packageZoneAfterLoad).getByRole('radio', { name: /^manual total$/i }),
    ).toBeChecked()
    expect(
      within(packageZoneAfterLoad).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).toHaveValue(725)
    expect(
      (portionUnitGroupAfterLoad.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement),
    ).toBeChecked()
    expect(within(cookedZoneAfterLoad).getByLabelText(/^cooked weight$/i)).toHaveValue(18)
    expect(within(portionZoneAfterLoad).getByLabelText(/^portion eaten$/i)).toHaveValue(4)
  })

  it('saves, reloads, and deletes a meal from the shelf', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()

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
    const cookedZone = getCookedZone()
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '250')
    const portionZone = getPortionZone()
    await user.type(within(portionZone).getByLabelText(/^portion eaten$/i), '100')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    await user.click(getDesktopUtilityButton('saved'))
    expect(screen.getByText(/chicken bowl/i)).toBeInTheDocument()

    await user.click(getDesktopUtilityButton('calculator'))
    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    expect(within(getPackageZone()).getByLabelText(/^meal name$/i)).toHaveValue('')

    await user.click(getDesktopUtilityButton('saved'))
    await user.click(screen.getByRole('button', { name: /^load$/i }))
    await user.click(getDesktopUtilityButton('calculator'))
    const packageZoneAfterLoad = getPackageZone()
    const portionZoneAfterLoad = getPortionZone()
    await waitFor(() =>
      expect(within(packageZoneAfterLoad).getByLabelText(/^meal name$/i)).toHaveValue(
        'Chicken Bowl',
      ),
    )
    expect(
      within(packageZoneAfterLoad).getByRole('radio', { name: /^manual total$/i }),
    ).toBeChecked()
    expect(
      within(packageZoneAfterLoad).getByLabelText(/^total calories$/i, {
        selector: 'input[type="number"]',
      }),
    ).toHaveValue(500)
    expect(within(portionZoneAfterLoad).getByLabelText(/^portion eaten$/i)).toHaveValue(
      100,
    )

    await user.click(getDesktopUtilityButton('saved'))
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
    await user.click(getDesktopUtilityButton('saved'))
    await user.click(screen.getByRole('button', { name: /^load$/i }))
    await user.click(getDesktopUtilityButton('calculator'))

    expect(within(getPortionZone()).getByLabelText(/^target cal$/i)).toHaveValue(null)
  })

  it('saves and reloads ounce units for package-label fields', async () => {
    const user = userEvent.setup()
    render(<App />)

    const packageZone = getPackageZone()
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
    const cookedZone = getCookedZone()
    await user.type(within(cookedZone).getByLabelText(/^cooked weight$/i), '744')
    await user.click(screen.getByRole('button', { name: /^save meal$/i }))

    await user.click(screen.getByRole('button', { name: /^clear$/i }))
    await user.click(getDesktopUtilityButton('saved'))
    await user.click(screen.getByRole('button', { name: /^load$/i }))
    await user.click(getDesktopUtilityButton('calculator'))
    const packageZoneAfterLoad = getPackageZone()
    const rawWeightUnitGroupAfterLoad = within(packageZoneAfterLoad).getByRole('group', {
      name: /raw total weight unit/i,
    })
    const servingWeightUnitGroupAfterLoad = within(packageZoneAfterLoad).getByRole('group', {
      name: /serving weight unit/i,
    })

    expect(
      rawWeightUnitGroupAfterLoad.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement,
    ).toBeChecked()
    expect(
      servingWeightUnitGroupAfterLoad.querySelectorAll(
        'input[type="radio"]'
      )[1] as HTMLInputElement,
    ).toBeChecked()
    expect(within(packageZoneAfterLoad).getByLabelText(/^raw total weight$/i)).toHaveValue(
      19.8,
    )
    expect(within(packageZoneAfterLoad).getByLabelText(/^serving weight$/i)).toHaveValue(
      4.7,
    )
  })
})
