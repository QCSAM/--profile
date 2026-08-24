import { cleanup, fireEvent, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const styles = readFileSync('src/styles.css', 'utf8')

let stylesheet

function mediaConditionMatches(condition, width) {
  const maxWidth = condition.match(/max-width:\s*(\d+)px/)
  const minWidth = condition.match(/min-width:\s*(\d+)px/)
  return (!maxWidth || width <= Number(maxWidth[1]))
    && (!minWidth || width >= Number(minWidth[1]))
}

function styleAtWidth(rules, selector, property, width) {
  let value = ''

  Array.from(rules).forEach((rule) => {
    if (rule.selectorText === selector && rule.style.getPropertyValue(property)) {
      value = rule.style.getPropertyValue(property)
    }
    if (rule.cssRules && (!rule.conditionText || mediaConditionMatches(rule.conditionText, width))) {
      const nestedValue = styleAtWidth(rule.cssRules, selector, property, width)
      if (nestedValue) value = nestedValue
    }
  })

  return value
}

function relativeLuminance(hex) {
  const channels = hex.startsWith('#')
    ? hex.match(/[\da-f]{2}/gi).map(channel => parseInt(channel, 16) / 255)
    : hex.match(/[\d.]+/g).slice(0, 3).map(channel => Number(channel) / 255)
  const linear = channels.map(channel => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

beforeEach(() => {
  stylesheet = document.createElement('style')
  stylesheet.textContent = styles
  document.head.append(stylesheet)
})

afterEach(() => {
  cleanup()
  stylesheet.remove()
})

describe('motion-controller fallback', () => {
  it('keeps the curtain out of the way and the hero content visible when the motion hook is absent', () => {
    const { container } = render(
      <div className="site">
        <div className="opening-curtain" aria-hidden="true"><span className="opening-curtain__rule" /></div>
        <header className="hero">
          <h1><span data-motion="hero-title">崔琪</span></h1>
          <p data-motion="hero-copy">Visible without the controller</p>
        </header>
      </div>,
    )

    const curtain = container.querySelector('.opening-curtain')
    const title = container.querySelector('[data-motion="hero-title"]')
    const copy = container.querySelector('[data-motion="hero-copy"]')

    expect(container.firstChild).not.toHaveClass('motion-ready')
    expect(getComputedStyle(curtain).display).toBe('none')
    expect(getComputedStyle(title).opacity).toBe('1')
    expect(getComputedStyle(copy).opacity).toBe('1')
    expect(getComputedStyle(title).transform).toBe('none')
  })

  it('keeps a parsed focus-visible ring for the keyboard-focusable navigation link', () => {
    const { getByRole } = render(
      <div className="site">
        <a href="#about">About</a>
      </div>,
    )
    const link = getByRole('link', { name: 'About' })

    fireEvent.keyDown(document, { key: 'Tab' })
    link.focus()

    const focusVisibleRule = Array.from(stylesheet.sheet.cssRules).find(
      (rule) => rule.selectorText === 'a:focus-visible',
    )

    expect(document.activeElement).toBe(link)
    expect(focusVisibleRule.style.outline).toBe('2px solid currentColor')
    expect(focusVisibleRule.style.outlineOffset).toBe('5px')
  })

  it('gives the masked hero title a full line box at the actual 796px breakpoint without changing desktop geometry', () => {
    const heroMaskRule = Array.from(stylesheet.sheet.cssRules).find(
      (rule) => rule.selectorText === '.hero h1,\n.section-heading > div,\n.contact h2',
    )

    expect(heroMaskRule.style.overflow).toBe('hidden')
    expect(styleAtWidth(stylesheet.sheet.cssRules, '.hero h1', 'line-height', 796)).toBe('1')
    expect(styleAtWidth(stylesheet.sheet.cssRules, '.hero h1', 'line-height', 1700)).toBe('0.76')
  })

  it('keeps muted and contact-footer small text above the WCAG AA contrast threshold', () => {
    const rootRule = Array.from(stylesheet.sheet.cssRules).find((rule) => rule.selectorText === ':root')
    const contactFootRule = Array.from(stylesheet.sheet.cssRules).find(
      (rule) => rule.selectorText === '.contact__foot',
    )
    const muted = rootRule.style.getPropertyValue('--muted').trim()
    const paper = rootRule.style.getPropertyValue('--paper').trim()
    const espresso = rootRule.style.getPropertyValue('--espresso').trim()
    const contactFoot = contactFootRule.style.color

    expect(contrastRatio(muted, paper)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(contactFoot, espresso)).toBeGreaterThanOrEqual(4.5)
  })
})
