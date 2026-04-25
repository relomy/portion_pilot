import type { StepKey, StepVisualState } from './stepState'

export type StepNavigationItem = {
  key: StepKey
  label: string
  state: StepVisualState
}

export type StepNavigationProps = {
  steps: StepNavigationItem[]
  activeStep: StepKey
  onStepChange: (step: StepKey) => void
}

function getStatusText(state: StepVisualState): string {
  switch (state) {
    case 'complete':
      return 'Complete'
    case 'incomplete':
      return 'Missing data'
    case 'untouched':
      return 'Not started'
    case 'active':
    default:
      return 'In progress'
  }
}

export function StepNavigation({
  steps,
  activeStep,
  onStepChange,
}: StepNavigationProps) {
  return (
    <nav className="step-navigation" aria-label="Step navigation">
      <ol className="step-navigation__list">
        {steps.map((step) => {
          const isActive = step.key === activeStep
          const statusText = getStatusText(step.state)

          return (
            <li className="step-navigation__item" key={step.key}>
              <button
                type="button"
                className="step-navigation__button"
                data-state={step.state}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onStepChange(step.key)}
              >
                <span className="step-navigation__label">{step.label}</span>
                <span className="step-navigation__status">{statusText}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
