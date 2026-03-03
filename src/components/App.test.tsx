import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

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

  it('clears total calories when switching to per-serving mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/^total calories$/i), '500')
    await user.click(screen.getByLabelText(/^per serving$/i))

    expect(screen.getByLabelText(/^total calories$/i)).toHaveValue(null)
  })

  it('clears per-serving inputs when switching to total mode', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByLabelText(/^per serving$/i))
    await user.type(screen.getByLabelText(/^calories per serving$/i), '125')
    await user.type(screen.getByLabelText(/^servings$/i), '4')
    await user.click(screen.getByLabelText(/total calories mode/i))

    expect(screen.getByLabelText(/^calories per serving$/i)).toHaveValue(null)
    expect(screen.getByLabelText(/^servings$/i)).toHaveValue(null)
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
})
