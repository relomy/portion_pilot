/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('index.css', () => {
  it('defines zone layout design tokens', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('--paper-bg')
    expect(css).toContain('--zone-bg')
    expect(css).toContain('--zone-3-bg')
    expect(css).toContain('--teal')
    expect(css).toContain('--field-bg')
    expect(css).toContain('DM Mono')
    expect(css).toContain('DM Serif Display')
    expect(css).toContain('DM Sans')
  })

  it('styles the live results panel selector', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.results-panel')
    expect(css).toContain('.worksheet-panel,\n.results-panel,\n.saved-meals-placeholder')
    expect(css).toContain('.results-panel {\n  background: var(--label);')
    expect(css).toContain('.app-header h1,\n.panel-heading h2,\n.results-panel h2,')
  })

  it('styles the saved meals shelf and prep cards', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.saved-meals-grid')
    expect(css).toContain('.saved-meals-empty')
    expect(css).toContain('.meal-card')
    expect(css).toContain('.meal-card--prep')
    expect(css).toContain('.meal-card__header')
    expect(css).toContain('.meal-card__metrics')
    expect(css).toContain('.meal-card__actions')
  })

  it('defines motion with a reduced-motion escape hatch and row-based result styling', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('@keyframes rise-in')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('.results-metrics')
    expect(css).toContain('.results-metrics div')
    expect(css).toContain('.dev-panel')
    expect(css).toContain('.assumption-note')
  })

  it('styles the segmented controls and joined input-with-unit rows', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.segmented-control')
    expect(css).toContain('.segmented-control__option')
    expect(css).toContain('.input-with-unit')
    expect(css).toContain('.unit-segmented')
  })

  it('styles the worksheet and results subsections for raw vs cooked grouping', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.worksheet-section')
    expect(css).toContain('.results-section')
    expect(css).toContain('.results-section--batch')
    expect(css).toContain('.results-section--cooked')
    expect(css).toContain('.results-section__eyebrow')
    expect(css).toContain('.results-section--portion-guide')
    expect(css).toContain('.portion-guide-header')
    expect(css).toContain(
      '.portion-guide-header__row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;',
    )
    expect(css).toContain('.portion-guide-controls')
    expect(css).toContain('.density-secondary')
    expect(css).toContain('.density-secondary__item')
    expect(css).toContain('.weight-change-callout')
    expect(css).toContain('.weight-change-callout__value')
    expect(css).toContain('.weight-change-callout__copy')
    expect(css).toContain('.results-unavailable')
  })

  it('keeps the header compact so the calculator starts near the top of the page', () => {
    const cssPath = resolve(process.cwd(), 'src/index.css')
    const css = readFileSync(cssPath, 'utf8')

    expect(css).toContain('.app-shell {\n  max-width: 1120px;\n  margin: 0 auto;\n  padding: 1.5rem 1.25rem 3rem;')
    expect(css).toContain('.app-header {\n  margin-bottom: 1rem;')
    expect(css).toContain('.app-header h1 {\n  max-width: 14ch;')
    expect(css).toContain("font-size: clamp(2rem, 3.6vw, 3.25rem);")
    expect(css).toContain('.app-subtitle {\n  max-width: 34rem;\n  margin: 0.5rem 0 0;')
  })
})
