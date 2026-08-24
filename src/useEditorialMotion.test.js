import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { createElement, useRef } from 'react'
import useEditorialMotion, { prefersReducedMotion, restoreMotionState } from './useEditorialMotion'

afterEach(() => {
  cleanup()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  vi.unstubAllGlobals()
})

function Harness() {
  const rootRef = useRef(null)
  useEditorialMotion(rootRef)
  return createElement('div', { ref: rootRef }, createElement('div', { className: 'opening-curtain' }))
}

describe('editorial motion safety', () => {
  it('detects the operating-system reduced-motion preference', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    expect(prefersReducedMotion()).toBe(true)
  })

  it('leaves scrolling unlocked and marks reduced motion as ready', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const { container } = render(createElement(Harness))
    expect(container.firstChild).toHaveClass('motion-ready', 'motion-reduced')
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('restores scrolling and removes transient motion state', () => {
    const root = document.createElement('div')
    root.className = 'motion-ready motion-opening'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    restoreMotionState(root)

    expect(root).not.toHaveClass('motion-opening')
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
  })
})
