import type { CalculationResult } from '../../utils/calculator'

export type StepKey = 'step1' | 'step2' | 'step3'
export type StepVisualState = 'active' | 'complete' | 'incomplete' | 'untouched'

export type StepState = {
  state: StepVisualState
  isComplete: boolean
  missingPrerequisites: StepKey[]
}

export type StepStateMap = Record<StepKey, StepState>

type GetStepStatesInput = {
  result: Pick<
    CalculationResult,
    'totalCalories' | 'caloriesPerGram' | 'portionCalories'
  >
  activeStep?: StepKey
}

const STEP_ORDER: StepKey[] = ['step1', 'step2', 'step3']

const STEP_PREREQUISITES: Record<StepKey, StepKey[]> = {
  step1: [],
  step2: ['step1'],
  step3: ['step1', 'step2'],
}

function getStepCompletion(
  result: GetStepStatesInput['result'],
): Record<StepKey, boolean> {
  return {
    step1: result.totalCalories !== null,
    step2: result.caloriesPerGram !== null,
    step3: result.portionCalories !== null,
  }
}

export function getStepStates({ result, activeStep = 'step1' }: GetStepStatesInput): StepStateMap {
  const completion = getStepCompletion(result)
  const activeIndex = STEP_ORDER.indexOf(activeStep)

  const entries = STEP_ORDER.map((stepKey, index) => {
    const missingPrerequisites = STEP_PREREQUISITES[stepKey].filter(
      (prerequisiteStep) => !completion[prerequisiteStep],
    )

    let state: StepVisualState

    if (completion[stepKey]) {
      state = 'complete'
    } else if (
      missingPrerequisites.length === 0 ||
      (activeIndex >= 0 && index <= activeIndex)
    ) {
      state = 'incomplete'
    } else {
      state = 'untouched'
    }

    if (stepKey === activeStep) {
      state = 'active'
    }

    return [
      stepKey,
      {
        state,
        isComplete: completion[stepKey],
        missingPrerequisites,
      },
    ] as const
  })

  return Object.fromEntries(entries) as StepStateMap
}
