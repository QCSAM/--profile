import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { createElement, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useEditorialMotion, { prefersReducedMotion, restoreMotionState } from './useEditorialMotion'

afterEach(() => {
  cleanup()
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function Harness({ pendingImage = false }) {
  const rootRef = useRef(null)
  useEditorialMotion(rootRef)
  const markImageIncomplete = (image) => {
    if (pendingImage && image) {
      Object.defineProperty(image, 'complete', { configurable: true, value: false })
    }
  }

  return createElement(
    'div',
    { ref: rootRef },
    createElement('div', { className: 'opening-curtain' }),
    pendingImage ? createElement('img', { alt: '', ref: markImageIncomplete }) : null,
  )
}

function ReducedMotionHarness() {
  const rootRef = useRef(null)
  useEditorialMotion(rootRef)

  return createElement(
    'div',
    { ref: rootRef },
    createElement('div', { className: 'opening-curtain' }),
    createElement('section', null,
      createElement('h2', { 'data-motion': 'section-heading' }, 'Visible section'),
      createElement('img', { alt: 'Static visual', 'data-motion': 'parallax-image' }),
    ),
  )
}

function matchMediaResult(matches) {
  return {
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }
}

describe('editorial motion safety', () => {
  it('treats a non-browser environment as no reduced-motion preference', () => {
    vi.stubGlobal('window', undefined)

    expect(prefersReducedMotion()).toBe(false)
  })

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

  it('bypasses GSAP, ScrollTrigger, and parallax setup for reduced motion while leaving content in its final visible state', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMediaResult(true)))
    const timeline = vi.spyOn(gsap, 'timeline')
    const matchMedia = vi.spyOn(gsap, 'matchMedia')
    const triggerCountBeforeRender = ScrollTrigger.getAll().length

    const { container } = render(createElement(ReducedMotionHarness))
    const root = container.firstChild
    const heading = root.querySelector('[data-motion="section-heading"]')
    const image = root.querySelector('[data-motion="parallax-image"]')

    expect(root).toHaveClass('motion-ready', 'motion-reduced')
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
    expect(heading.style.opacity).toBe('')
    expect(heading.style.transform).toBe('')
    expect(image.style.getPropertyValue('--parallax-y')).toBe('')
    expect(timeline).not.toHaveBeenCalled()
    expect(matchMedia).not.toHaveBeenCalled()
    expect(ScrollTrigger.getAll()).toHaveLength(triggerCountBeforeRender)
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

  it('restores scroll state when the motion root unmounts', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMediaResult(false)))
    const { container, unmount } = render(createElement(Harness))

    expect(container.firstChild).toHaveClass('motion-opening')
    expect(document.documentElement.style.overflow).toBe('hidden')

    unmount()

    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
  })

  it('refreshes scroll geometry when an incomplete root image loads', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMediaResult(false)))
    const refresh = vi.spyOn(ScrollTrigger, 'refresh')
    const { container } = render(createElement(Harness, { pendingImage: true }))
    const image = container.querySelector('img')

    refresh.mockClear()
    image.dispatchEvent(new Event('load'))

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('coalesces resize refreshes into the latest animation frame', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(matchMediaResult(false)))
    const refresh = vi.spyOn(ScrollTrigger, 'refresh')
    let latestFrame
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
      latestFrame = callback
      return 1
    }))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    render(createElement(Harness))

    refresh.mockClear()
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('resize'))

    expect(refresh).not.toHaveBeenCalled()
    latestFrame()
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
