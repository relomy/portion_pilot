import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DerivedMetricRow } from './DerivedMetricRow'

describe('DerivedMetricRow', () => {
  it('renders label/value and empty modifier when value is dash', () => {
    render(<DerivedMetricRow label="Total cal" value="—" testId="metric-value" />)

    expect(screen.getByText(/total cal/i)).toBeInTheDocument()
    expect(screen.getByTestId('metric-value')).toHaveTextContent('—')
    expect(screen.getByTestId('metric-value')).toHaveClass('derived__value--empty')
  })
})
