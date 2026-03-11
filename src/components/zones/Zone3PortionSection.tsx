import type { MealInputs, WeightUnit } from '../../hooks/useSavedMeals'
import { UnitToggle } from './UnitToggle'

type Zone3PortionSectionProps = {
  form: MealInputs
  targetCalories: number | null
  activeOutputUnit: WeightUnit
  referenceServingText: string
  targetPortionText: string
  servingsEatenText: string
  rawEquivalentEatenText: string
  portionCaloriesText: string
  onUnitChange: (
    field:
      | 'rawTotalWeightUnit'
      | 'packageServingWeightUnit'
      | 'portionEatenUnit',
    value: WeightUnit,
  ) => void
  onCookedOutputUnitChange: (value: WeightUnit) => void
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
  onTargetCaloriesChange: (value: number | null) => void
}

function toInputValue(value: number | null) {
  return value ?? ''
}

export function Zone3PortionSection({
  form,
  targetCalories,
  activeOutputUnit,
  referenceServingText,
  targetPortionText,
  servingsEatenText,
  rawEquivalentEatenText,
  portionCaloriesText,
  onUnitChange,
  onCookedOutputUnitChange,
  onNumberChange,
  onTargetCaloriesChange,
}: Zone3PortionSectionProps) {
  return (
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
                <UnitToggle
                  name="portion-unit"
                  ariaLabel="Portion unit"
                  value={form.portionEatenUnit}
                  onChange={(value) => onUnitChange('portionEatenUnit', value)}
                />
              </div>
              <input
                id="portion-eaten"
                aria-label="Portion eaten"
                className="field__input"
                type="number"
                inputMode="decimal"
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
                <UnitToggle
                  name="display-unit"
                  ariaLabel="Display unit"
                  value={activeOutputUnit}
                  onChange={onCookedOutputUnitChange}
                />
              </div>
              <input
                id="target-calories"
                aria-label="Target cal"
                className="field__input"
                type="number"
                inputMode="decimal"
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
            <div className="answer-row answer-row--reference" data-testid="ref-pkg-serving">
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

            <div className="answer-row" data-testid="answer-raw-equivalent-eaten">
              <span className="answer-row__label">Raw equivalent eaten</span>
              <span
                className={`answer-row__value${rawEquivalentEatenText === '—' ? ' answer-row__value--empty' : ''}`}
              >
                {rawEquivalentEatenText}
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
  )
}
