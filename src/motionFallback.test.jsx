import { cleanup, fireEvent, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const styles = readFileSync('src/styles.css', 'utf8')

let stylesheet

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
})
