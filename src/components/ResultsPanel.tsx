import type { MealInputs, WeightUnit } from '../hooks/useSavedMeals'
import type { CalculationResult } from '../utils/calculator'
import { DevPanel } from './DevPanel'
import {
  formatCaloriesPer100Grams,
  formatCaloriesPerGram,
  formatCaloriesPerOunce,
  formatCaloriesPerServing,
  formatCookedWeightValue,
  formatEquivalentPackageServings,
  getWeightChangeCopy,
  formatPortionCalories,
  formatRawPackageServings,
  formatTotalCalories,
  formatWeightChange,
} from '../utils/format'

const sourceLabels = {
  total: 'Source: total calories',
  per_serving: 'Source: calories per serving',
  insufficient: 'Source: insufficient data',
} as const

type ResultsPanelProps = {
  result: CalculationResult
  hasConflictingCalories: boolean
  form: MealInputs
  portionEaten?: number | null
  portionEatenUnit?: WeightUnit
  onPortionEatenChange?: (value: number | null) => void
  onPortionEatenUnitChange?: (value: WeightUnit) => void
  targetCalories?: number | null
  onTargetCaloriesChange?: (value: number | null) => void
  cookedOutputUnit?: WeightUnit
  onCookedOutputUnitChange?: (value: WeightUnit) => void
}

function toInputValue(value: number | null | undefined) {
  return value ?? ''
}

function TotalModeResults({
  form,
  result,
  portionEaten,
  portionEatenUnit,
  onPortionEatenChange,
  onPortionEatenUnitChange,
  targetCalories,
  onTargetCaloriesChange,
  cookedOutputUnit,
  onCookedOutputUnitChange,
}: Pick<
  ResultsPanelProps,
  | 'form'
  | 'result'
  | 'portionEaten'
  | 'portionEatenUnit'
  | 'onPortionEatenChange'
  | 'onPortionEatenUnitChange'
  | 'targetCalories'
  | 'onTargetCaloriesChange'
  | 'cookedOutputUnit'
  | 'onCookedOutputUnitChange'
>) {
  const batchHelper =
    form.totalCaloriesSource === 'packageLabel'
      ? 'Based on raw package weight and label serving size'
      : 'Based on entered batch calories'
  const activeOutputUnit = cookedOutputUnit ?? 'g'
  const densityPrimaryLabel =
    activeOutputUnit === 'oz' ? 'Calories per ounce' : 'Calories per gram'
  const densityPrimaryValue =
    activeOutputUnit === 'oz'
      ? formatCaloriesPerOunce(result.caloriesPerOunce)
      : formatCaloriesPerGram(result.caloriesPerGram)
  const normalizedTargetCalories = targetCalories ?? null
  const targetPortionGrams =
    normalizedTargetCalories !== null && result.caloriesPerGram !== null
      ? normalizedTargetCalories / result.caloriesPerGram
      : null

  return (
    <>
      <section className="results-section results-section--batch">
        <header data-testid="results-section-batch">
          <p className="results-section__eyebrow">Batch facts</p>
          <h3>Batch calorie stats</h3>
          <p>{batchHelper}</p>
        </header>

        <dl className="results-metrics">
          <div>
            <dt>Total calories</dt>
            <dd>
              {formatTotalCalories(
                result.totalCalories,
                result.totalCaloriesDisplaySource,
              )}
            </dd>
          </div>
          {form.totalCaloriesSource === 'packageLabel' ? (
            <>
              <div>
                <dt>Raw package servings</dt>
                <dd>{formatRawPackageServings(result.rawPackageServings)}</dd>
              </div>
              <div>
                <dt>Package calories per serving</dt>
                <dd>{formatCaloriesPerServing(form.packageCaloriesPerServing)}</dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      <section className="results-section results-section--cooked">
        <header data-testid="results-section-cooked">
          <p className="results-section__eyebrow">Cooked facts</p>
          <h3>Cooked batch stats</h3>
          <p>Based on cooked batch weight and portion eaten</p>
        </header>

        {form.cookedWeightGrams === null || form.cookedWeightGrams <= 0 ? (
          <p className="results-unavailable">Needs cooked batch weight</p>
        ) : null}

        <dl className="results-metrics">
          <div data-testid="density-primary">
            <dt>{densityPrimaryLabel}</dt>
            <dd>{densityPrimaryValue}</dd>
          </div>
          <div className="density-reference">
            <dt>{activeOutputUnit === 'oz' ? 'Calories per gram' : 'Calories per ounce'}</dt>
            <dd>
              {activeOutputUnit === 'oz'
                ? formatCaloriesPerGram(result.caloriesPerGram)
                : formatCaloriesPerOunce(result.caloriesPerOunce)}
            </dd>
          </div>
          <div className="density-reference">
            <dt>Calories per 100g</dt>
            <dd>{formatCaloriesPer100Grams(result.caloriesPer100Grams)}</dd>
          </div>
          {form.totalCaloriesSource === 'packageLabel' ? (
            <>
              <div>
                <dt>Cooked weight per package serving</dt>
                <dd>
                  {formatCookedWeightValue(
                    result.cookedWeightPerPackageServingGrams,
                    activeOutputUnit,
                  )}
                </dd>
              </div>
            </>
          ) : null}
        </dl>

        {form.totalCaloriesSource === 'packageLabel' ? (
          <div
            className="weight-change-callout"
            data-testid="weight-change-callout"
          >
            <p className="weight-change-callout__label">Weight change</p>
            <p className="weight-change-callout__value">
              {formatWeightChange(
                result.weightChangeGrams,
                result.weightChangePercent,
                activeOutputUnit,
              )}
            </p>
            <p className="weight-change-callout__copy">
              {getWeightChangeCopy(result.weightChangeDirection)}
            </p>
          </div>
        ) : null}
      </section>

      {form.mode === 'total' ? (
        <section
          className="results-section results-section--portion-guide"
          data-testid="results-section-portion-guide"
        >
          <header className="portion-guide-header">
            <div
              className="portion-guide-header__row"
              data-testid="portion-guide-header-row"
            >
              <p className="results-section__eyebrow">Portion planning</p>
              <div
                className="portion-guide-controls"
                data-testid="portion-guide-controls"
              >
                <fieldset
                  className="unit-segmented"
                  aria-label="Display unit"
                  role="radiogroup"
                >
                  <label>
                    <input
                      checked={activeOutputUnit === 'g'}
                      name="display-unit"
                      type="radio"
                      value="g"
                      onChange={() => onCookedOutputUnitChange?.('g')}
                    />
                    <span>g</span>
                  </label>
                  <label>
                    <input
                      checked={activeOutputUnit === 'oz'}
                      name="display-unit"
                      type="radio"
                      value="oz"
                      onChange={() => onCookedOutputUnitChange?.('oz')}
                    />
                    <span>oz</span>
                  </label>
                </fieldset>

                <label className="field portion-guide-target">
                  <span>Target calories</span>
                  <input
                    aria-label="Target calories"
                    type="number"
                    value={normalizedTargetCalories ?? ''}
                    onChange={(event) =>
                      onTargetCaloriesChange?.(
                        event.target.value === '' ? null : Number(event.target.value),
                      )
                    }
                  />
                </label>
              </div>
            </div>
            <h3 data-testid="portion-guide-title">Portion guide</h3>
          </header>

          <label className="field">
            <span>Portion eaten</span>
            <div className="input-with-unit">
              <input
                aria-label="Portion eaten (cooked weight)"
                type="number"
                value={toInputValue(portionEaten)}
                onChange={(event) =>
                  onPortionEatenChange?.(
                    event.target.value === '' ? null : Number(event.target.value),
                  )
                }
              />
              <fieldset
                className="unit-segmented"
                aria-label="Portion eaten (cooked weight) unit"
              >
                <label>
                  <input
                    checked={portionEatenUnit !== 'oz'}
                    name="portion-eaten-unit"
                    type="radio"
                    value="g"
                    onChange={() => onPortionEatenUnitChange?.('g')}
                  />
                  <span>g</span>
                </label>
                <label>
                  <input
                    checked={portionEatenUnit === 'oz'}
                    name="portion-eaten-unit"
                    type="radio"
                    value="oz"
                    onChange={() => onPortionEatenUnitChange?.('oz')}
                  />
                  <span>oz</span>
                </label>
              </fieldset>
            </div>
          </label>

          <dl className="results-metrics">
            <div>
              <dt>Target portion</dt>
              <dd>{formatCookedWeightValue(targetPortionGrams, activeOutputUnit)}</dd>
            </div>
            <div>
              <dt>Package servings eaten</dt>
              <dd>
                {formatEquivalentPackageServings(
                  result.equivalentPackageServingsEaten,
                )}
              </dd>
            </div>
            <div>
              <dt>Portion calories</dt>
              <dd>{formatPortionCalories(result.portionCalories)}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </>
  )
}

function PerServingResults({
  result,
}: Pick<ResultsPanelProps, 'result'>) {
  return (
    <>
      {result.assumptions.servings_assumed ? (
        <p className="assumption-note">Assumed 1 serving because none was provided.</p>
      ) : null}

      <dl className="results-metrics" data-testid="results-metrics">
        <div>
          <dt>Raw package servings</dt>
          <dd>{formatRawPackageServings(result.rawPackageServings)}</dd>
        </div>
        <div>
          <dt>Calories per serving</dt>
          <dd>{formatCaloriesPerServing(result.caloriesPerServing)}</dd>
        </div>
        <div>
          <dt>Calories per gram</dt>
          <dd>{formatCaloriesPerGram(result.caloriesPerGram)}</dd>
        </div>
        <div>
          <dt>Calories per ounce</dt>
          <dd>{formatCaloriesPerOunce(result.caloriesPerOunce)}</dd>
        </div>
        <div>
          <dt>Calories per 100g</dt>
          <dd>{formatCaloriesPer100Grams(result.caloriesPer100Grams)}</dd>
        </div>
      </dl>
    </>
  )
}

export function ResultsPanel({
  result,
  hasConflictingCalories,
  form,
  portionEaten,
  portionEatenUnit,
  onPortionEatenChange,
  onPortionEatenUnitChange,
  targetCalories,
  onTargetCaloriesChange,
  cookedOutputUnit,
  onCookedOutputUnitChange,
}: ResultsPanelProps) {
  return (
    <section className="results-panel" data-testid="nutrition-label">
      <p className="eyebrow">Nutrition label</p>
      <h2>Live results</h2>
      <p className="placeholder-value">
        {formatTotalCalories(
          result.totalCalories,
          result.totalCaloriesDisplaySource,
        )}
      </p>
      <p className="placeholder-copy">
        {sourceLabels[result.calorie_source_used]}
      </p>

      <DevPanel
        hasConflictingCalories={hasConflictingCalories}
        form={form}
        result={result}
      />

      {form.mode === 'total' ? (
        <TotalModeResults
          form={form}
          result={result}
          portionEaten={portionEaten}
          portionEatenUnit={portionEatenUnit}
          onPortionEatenChange={onPortionEatenChange}
          onPortionEatenUnitChange={onPortionEatenUnitChange}
          targetCalories={targetCalories}
          onTargetCaloriesChange={onTargetCaloriesChange}
          cookedOutputUnit={cookedOutputUnit}
          onCookedOutputUnitChange={onCookedOutputUnitChange}
        />
      ) : (
        <PerServingResults result={result} />
      )}
    </section>
  )
}
