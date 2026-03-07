import type {
  MealInputs,
  MealMode,
  TotalCaloriesSource,
  WeightUnit,
} from '../hooks/useSavedMeals'
import type { CalculationResult } from '../utils/calculator'
import { DevPanel } from './DevPanel'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatCookedWeightValue,
  formatEquivalentPackageServings,
  formatPortionCalories,
  formatWeightChange,
  getWeightChangeCopy,
  formatRawPackageServings,
  formatTotalCalories,
} from '../utils/format'

const sourceLabels = {
  total: 'Source: total calories',
  per_serving: 'Source: calories per serving',
  insufficient: 'Source: insufficient data',
} as const

export type ZoneLayoutProps = {
  form: MealInputs
  result: CalculationResult
  hasConflictingCalories: boolean
  targetCalories: number | null
  cookedOutputUnit: WeightUnit
  onTextChange: (field: 'mealName', value: string) => void
  onNumberChange: (
    field:
      | 'manualTotalCalories'
      | 'caloriesPerServing'
      | 'yourServings'
      | 'cookedWeightGrams'
      | 'portionEaten'
      | 'rawTotalWeight'
      | 'packageServingWeight'
      | 'packageCaloriesPerServing',
    value: number | null,
  ) => void
  onUnitChange: (
    field:
      | 'rawTotalWeightUnit'
      | 'packageServingWeightUnit'
      | 'portionEatenUnit',
    value: WeightUnit,
  ) => void
  onModeChange: (mode: MealMode) => void
  onTotalSourceChange: (value: TotalCaloriesSource) => void
  onTargetCaloriesChange: (value: number | null) => void
  onCookedOutputUnitChange: (value: WeightUnit) => void
  onSave: () => void
  onClear: () => void
}

function toInputValue(value: number | null) {
  return value ?? ''
}

function DerivedValue({
  value,
  testId,
}: {
  value: string
  testId: string
}) {
  const isEmpty = value === '—'

  return (
    <span
      className={`derived__value${isEmpty ? ' derived__value--empty' : ''}`}
      data-testid={testId}
    >
      {value}
    </span>
  )
}

export function ZoneLayout({
  form,
  result,
  hasConflictingCalories,
  targetCalories,
  cookedOutputUnit,
  onTextChange,
  onNumberChange,
  onModeChange,
  onTotalSourceChange,
  onTargetCaloriesChange,
  onCookedOutputUnitChange,
  onUnitChange,
  onSave,
  onClear,
}: ZoneLayoutProps) {
  const totalCaloriesText = formatTotalCalories(
    result.totalCalories,
    result.totalCaloriesDisplaySource,
  )
  const rawServingsText = formatRawPackageServings(result.rawPackageServings)
  const caloriesPerServingText = formatCaloriesPerServing(
    form.mode === 'total' && form.totalCaloriesSource === 'packageLabel'
      ? form.packageCaloriesPerServing
      : result.caloriesPerServing,
  )
  const sourceLabel = sourceLabels[result.calorie_source_used]
  const activeOutputUnit = cookedOutputUnit
  const primaryDensityLabel =
    activeOutputUnit === 'oz' ? 'Calories per ounce' : 'Calories per gram'
  const primaryDensityValue =
    activeOutputUnit === 'oz'
      ? formatCaloriesPerOunce(result.caloriesPerOunce)
      : formatCaloriesPerGram(result.caloriesPerGram)
  const secondaryDensityValue =
    activeOutputUnit === 'oz'
      ? formatCaloriesPerGram(result.caloriesPerGram)
      : formatCaloriesPerOunce(result.caloriesPerOunce)
  const weightChangeText = formatWeightChange(
    result.weightChangeGrams,
    result.weightChangePercent,
    activeOutputUnit,
  )
  const weightChangeCopy = getWeightChangeCopy(result.weightChangeDirection)
  const hasWeightChange = weightChangeText !== '—'
  const targetPortionGrams =
    targetCalories !== null && result.caloriesPerGram !== null
      ? targetCalories / result.caloriesPerGram
      : null
  const referenceServingText = formatCookedWeightValue(
    result.cookedWeightPerPackageServingGrams,
    activeOutputUnit,
  )
  const targetPortionText = formatCookedWeightValue(
    targetPortionGrams,
    activeOutputUnit,
  )
  const servingsEatenText = formatEquivalentPackageServings(
    result.equivalentPackageServingsEaten,
  )
  const portionCaloriesText = formatPortionCalories(result.portionCalories)
  const isPrimaryDensityMuted =
    primaryDensityValue === '—' || primaryDensityValue === 'Need cooked weight'

  return (
    <div className="zone-layout">
      <header className="masthead">
        <p className="masthead__kicker">Meal calorie calculator</p>
        <h1 className="masthead__title">Cook once, keep the numbers straight.</h1>
        <p className="masthead__sub">
          A kitchen worksheet for home cooks who still want disciplined calorie
          math.
        </p>
      </header>

      <div className="zone-layout__diagnostics">
        <p>{sourceLabel}</p>
        <DevPanel
          hasConflictingCalories={hasConflictingCalories}
          form={form}
          result={result}
        />
      </div>

      <section className="zone zone--package" data-testid="zone-package">
        <p className="zone__eyebrow">Zone 1 · Before cooking</p>
        <h2 className="zone__title">Package</h2>

        <div className="field">
          <label className="field__label" htmlFor="meal-name">
            Meal name
          </label>
          <input
            id="meal-name"
            aria-label="Meal name"
            className="field__input"
            type="text"
            value={form.mealName}
            onChange={(event) => onTextChange('mealName', event.target.value)}
          />
        </div>

        <fieldset className="mode-group" aria-label="Calorie mode">
          <legend className="mode-group__label">Calorie mode</legend>
          <label className="mode-group__option">
            <input
              type="radio"
              name="calorie-mode"
              checked={form.mode === 'total'}
              onChange={() => onModeChange('total')}
            />
            Total calories
          </label>
          <label className="mode-group__option">
            <input
              type="radio"
              name="calorie-mode"
              checked={form.mode === 'perServing'}
              onChange={() => onModeChange('perServing')}
            />
            Per serving
          </label>
        </fieldset>

        {form.mode === 'total' ? (
          <fieldset className="mode-group" aria-label="Total source">
            <legend className="mode-group__label">Total source</legend>
            <label className="mode-group__option">
              <input
                type="radio"
                name="total-source"
                checked={form.totalCaloriesSource === 'packageLabel'}
                onChange={() => onTotalSourceChange('packageLabel')}
              />
              Package label
            </label>
            <label className="mode-group__option">
              <input
                type="radio"
                name="total-source"
                checked={form.totalCaloriesSource === 'manualTotal'}
                onChange={() => onTotalSourceChange('manualTotal')}
              />
              Manual total
            </label>
          </fieldset>
        ) : null}

        {form.mode === 'total' && form.totalCaloriesSource === 'packageLabel' ? (
          <>
            <div className="field-pair">
              <div className="field">
                <label className="field__label" htmlFor="package-serving-weight">
                  Serving weight
                </label>
                <div className="field-with-unit">
                  <input
                    id="package-serving-weight"
                    aria-label="Serving weight"
                    className="field__input"
                    type="number"
                    value={toInputValue(form.packageServingWeight)}
                    onChange={(event) =>
                      onNumberChange(
                        'packageServingWeight',
                        event.target.value === '' ? null : Number(event.target.value),
                      )
                    }
                  />
                  <fieldset className="unit-toggle" aria-label="Serving weight unit">
                    <label className="unit-toggle__option">
                      <input
                        type="radio"
                        name="serving-weight-unit"
                        checked={form.packageServingWeightUnit === 'g'}
                        onChange={() => onUnitChange('packageServingWeightUnit', 'g')}
                      />
                      <span>g</span>
                    </label>
                    <label className="unit-toggle__option">
                      <input
                        type="radio"
                        name="serving-weight-unit"
                        checked={form.packageServingWeightUnit === 'oz'}
                        onChange={() => onUnitChange('packageServingWeightUnit', 'oz')}
                      />
                      <span>oz</span>
                    </label>
                  </fieldset>
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="package-cal-serving">
                  Calories / serving
                </label>
                <input
                  id="package-cal-serving"
                  aria-label="Calories / serving"
                  className="field__input"
                  type="number"
                  value={toInputValue(form.packageCaloriesPerServing)}
                  onChange={(event) =>
                    onNumberChange(
                      'packageCaloriesPerServing',
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="raw-total-weight">
                Raw total weight
              </label>
              <div className="field-with-unit">
                <input
                  id="raw-total-weight"
                  aria-label="Raw total weight"
                  className="field__input"
                  type="number"
                  value={toInputValue(form.rawTotalWeight)}
                  onChange={(event) =>
                    onNumberChange(
                      'rawTotalWeight',
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
                <fieldset className="unit-toggle" aria-label="Raw total weight unit">
                  <label className="unit-toggle__option">
                    <input
                      type="radio"
                      name="raw-total-weight-unit"
                      checked={form.rawTotalWeightUnit === 'g'}
                      onChange={() => onUnitChange('rawTotalWeightUnit', 'g')}
                    />
                    <span>g</span>
                  </label>
                  <label className="unit-toggle__option">
                    <input
                      type="radio"
                      name="raw-total-weight-unit"
                      checked={form.rawTotalWeightUnit === 'oz'}
                      onChange={() => onUnitChange('rawTotalWeightUnit', 'oz')}
                    />
                    <span>oz</span>
                  </label>
                </fieldset>
              </div>
            </div>
          </>
        ) : null}

        {form.mode === 'total' && form.totalCaloriesSource === 'manualTotal' ? (
          <div className="field">
            <label className="field__label" htmlFor="manual-total-calories">
              Total calories
            </label>
            <input
              id="manual-total-calories"
              aria-label="Total calories"
              className="field__input"
              type="number"
              value={toInputValue(form.manualTotalCalories)}
              onChange={(event) =>
                onNumberChange(
                  'manualTotalCalories',
                  event.target.value === '' ? null : Number(event.target.value),
                )
              }
            />
          </div>
        ) : null}

        {form.mode === 'perServing' ? (
          <>
            <div className="field-pair">
              <div className="field">
                <label className="field__label" htmlFor="calories-per-serving">
                  Calories per serving
                </label>
                <input
                  id="calories-per-serving"
                  aria-label="Calories per serving"
                  className="field__input"
                  type="number"
                  value={toInputValue(form.caloriesPerServing)}
                  onChange={(event) =>
                    onNumberChange(
                      'caloriesPerServing',
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="servings-optional">
                  Servings (optional)
                </label>
                <input
                  id="servings-optional"
                  aria-label="Servings (optional)"
                  className="field__input"
                  type="number"
                  value={toInputValue(form.yourServings)}
                  onChange={(event) =>
                    onNumberChange(
                      'yourServings',
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
              </div>
            </div>
            {result.assumptions.servings_assumed ? (
              <p className="assumption-note">Assumed 1 serving because none was provided.</p>
            ) : null}
          </>
        ) : null}

        <div className="derived">
          <div className="derived__item">
            <span className="derived__label">Total cal</span>
            <DerivedValue value={totalCaloriesText} testId="derived-total-cal" />
          </div>
          <div className="derived__item">
            <span className="derived__label">Raw servings</span>
            <DerivedValue value={rawServingsText} testId="derived-raw-servings" />
          </div>
          <div className="derived__item">
            <span className="derived__label">Cal / serving</span>
            <DerivedValue
              value={caloriesPerServingText}
              testId="derived-cal-serving"
            />
          </div>
        </div>
      </section>

      <section className="zone zone--cooked" data-testid="zone-cooked">
        <p className="zone__eyebrow">Zone 2 · After cooking</p>
        <h2 className="zone__title">Cooked batch</h2>

        <div className="field">
          <label className="field__label" htmlFor="cooked-weight">
            Cooked weight
          </label>
          <input
            id="cooked-weight"
            aria-label="Cooked weight"
            className="field__input"
            type="number"
            value={toInputValue(form.cookedWeightGrams)}
            onChange={(event) =>
              onNumberChange(
                'cookedWeightGrams',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </div>

        <div className="density-block">
          <div className="density-primary" data-testid="density-primary">
            <span className="density-primary__label">{primaryDensityLabel}</span>
            <span
              className={`density-primary__value${isPrimaryDensityMuted ? ' density-primary__value--empty' : ''}`}
            >
              {primaryDensityValue}
            </span>
          </div>

          <div className="density-secondary" data-testid="density-secondary">
            <div className="density-secondary__item">
              <span className="density-secondary__label">
                {activeOutputUnit === 'oz'
                  ? 'Calories per gram'
                  : 'Calories per ounce'}
              </span>
              <span className="density-secondary__value">{secondaryDensityValue}</span>
            </div>
            <div className="density-secondary__item">
              <span className="density-secondary__label">Calories per 100g</span>
              <span className="density-secondary__value">
                {formatCaloriesPer100Grams(result.caloriesPer100Grams)}
              </span>
            </div>
          </div>
        </div>

        <div className="wc-callout" data-testid="weight-change-callout">
          <p className="wc-callout__label">Weight change</p>
          <p
            className={`wc-callout__value${hasWeightChange ? '' : ' wc-callout__value--empty'}`}
          >
            {weightChangeText}
          </p>
          {hasWeightChange ? <p className="wc-callout__copy">{weightChangeCopy}</p> : null}
        </div>
      </section>

      <section className="zone zone--portion" data-testid="zone-portion">
        <p className="zone__eyebrow">Zone 3 · At the plate</p>
        <h2 className="zone__title">Portion guide</h2>

        {form.mode === 'total' ? (
          <>
            <div className="portion-inputs">
              <div className="field">
                <div className="field__label-row">
                  <label className="field__label" htmlFor="portion-eaten">
                    Portion eaten
                  </label>
                  <fieldset className="unit-toggle" aria-label="Portion unit">
                    <label className="unit-toggle__option">
                      <input
                        type="radio"
                        name="portion-unit"
                        checked={form.portionEatenUnit === 'g'}
                        onChange={() => onUnitChange('portionEatenUnit', 'g')}
                      />
                      <span>g</span>
                    </label>
                    <label className="unit-toggle__option">
                      <input
                        type="radio"
                        name="portion-unit"
                        checked={form.portionEatenUnit === 'oz'}
                        onChange={() => onUnitChange('portionEatenUnit', 'oz')}
                      />
                      <span>oz</span>
                    </label>
                  </fieldset>
                </div>
                <input
                  id="portion-eaten"
                  aria-label="Portion eaten"
                  className="field__input"
                  type="number"
                  value={toInputValue(form.portionEaten)}
                  onChange={(event) =>
                    onNumberChange(
                      'portionEaten',
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
              </div>

              <div className="field">
                <div className="field__label-row">
                  <label className="field__label" htmlFor="target-calories">
                    Target cal
                  </label>
                  <fieldset className="unit-toggle" aria-label="Display unit">
                    <label className="unit-toggle__option">
                      <input
                        type="radio"
                        name="display-unit"
                        checked={activeOutputUnit === 'g'}
                        onChange={() => onCookedOutputUnitChange('g')}
                      />
                      <span>g</span>
                    </label>
                    <label className="unit-toggle__option">
                      <input
                        type="radio"
                        name="display-unit"
                        checked={activeOutputUnit === 'oz'}
                        onChange={() => onCookedOutputUnitChange('oz')}
                      />
                      <span>oz</span>
                    </label>
                  </fieldset>
                </div>
                <input
                  id="target-calories"
                  aria-label="Target cal"
                  className="field__input"
                  type="number"
                  value={toInputValue(targetCalories)}
                  onChange={(event) =>
                    onTargetCaloriesChange(
                      event.target.value === '' ? null : Number(event.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="answers">
              <div
                className="answer-row answer-row--reference"
                data-testid="ref-pkg-serving"
              >
                <span className="answer-row__label answer-row__label--italic">
                  1 pkg serving cooked
                </span>
                <span
                  className={`answer-row__value${referenceServingText === '—' ? ' answer-row__value--empty' : ''}`}
                >
                  {referenceServingText}
                </span>
              </div>

              <div className="answer-row" data-testid="answer-target-portion">
                <span className="answer-row__label">Target portion</span>
                <span
                  className={`answer-row__value${targetPortionText === '—' ? ' answer-row__value--empty' : ''}`}
                >
                  {targetPortionText}
                </span>
              </div>

              <div className="answer-row" data-testid="answer-pkg-servings-eaten">
                <span className="answer-row__label">Pkg servings eaten</span>
                <span
                  className={`answer-row__value${servingsEatenText === '—' ? ' answer-row__value--empty' : ''}`}
                >
                  {servingsEatenText}
                </span>
              </div>
            </div>

            <div className="hero-answer">
              <span className="hero-answer__label">Portion calories</span>
              <div>
                <span
                  className={`hero-answer__value${portionCaloriesText === '—' ? ' hero-answer__value--empty' : ''}`}
                  data-testid="hero-portion-cal"
                >
                  {portionCaloriesText}
                </span>
                <span className="hero-answer__unit">cal</span>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <footer className="action-row zone-layout__actions">
        <button type="button" onClick={onSave}>
          Save meal
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </footer>
    </div>
  )
}
