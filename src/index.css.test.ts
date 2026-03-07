/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readCss() {
  return readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')
}

describe('index.css', () => {
  it('defines the zone layout design tokens and font families', () => {
    const css = readCss()

    expect(css).toContain('--paper-bg')
    expect(css).toContain('--zone-bg')
    expect(css).toContain('--zone-3-bg')
    expect(css).toContain('--teal')
    expect(css).toContain('--field-bg')
    expect(css).toContain('DM Mono')
    expect(css).toContain('DM Serif Display')
    expect(css).toContain('DM Sans')
  })

  it('defines zone-layout selectors used by the migrated UI', () => {
    const css = readCss()

    expect(css).toContain('.zone-layout')
    expect(css).toContain('.masthead')
    expect(css).toContain('.zone')
    expect(css).toContain('.zone--package')
    expect(css).toContain('.zone--cooked')
    expect(css).toContain('.zone--portion')
    expect(css).toContain('.mode-group')
    expect(css).toContain('.field-with-unit')
    expect(css).toContain('.unit-toggle')
    expect(css).toContain('.derived')
    expect(css).toContain('.density-block')
    expect(css).toContain('.wc-callout')
    expect(css).toContain('.portion-inputs')
    expect(css).toContain('.portion-inputs--single')
    expect(css).toContain('.answers')
    expect(css).toContain('.hero-answer')
    expect(css).toContain('.zone-layout__actions')
  })

  it('styles diagnostics and saved-meal shelf/card surfaces', () => {
    const css = readCss()

    expect(css).toContain('.dev-panel')
    expect(css).toContain('.saved-meals-placeholder')
    expect(css).toContain('.saved-meals-grid')
    expect(css).toContain('.saved-meals-empty')
    expect(css).toContain('.meal-card')
    expect(css).toContain('.meal-card--prep')
    expect(css).toContain('.meal-card__header')
    expect(css).toContain('.meal-card__metrics')
    expect(css).toContain('.meal-card__actions')
  })

  it('keeps motion and reduced-motion support', () => {
    const css = readCss()

    expect(css).toContain('@keyframes rise-in')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('restores visible keyboard focus styles for field inputs', () => {
    const css = readCss()

    expect(css).toContain('.field__input:focus-visible')
    expect(css).toMatch(
      /\.field__input:focus-visible\s*\{[^}]*((outline:\s*[^;]+;)|(box-shadow:\s*[^;]+;))/s
    )
    expect(css).not.toMatch(/\.field__input:focus\s*\{[^}]*outline:\s*none\s*;/s)
  })
})
