import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import DepthCarousel from './DepthCarousel'

const items = [
  { image: '/one.jpg', alt: 'One' },
  { image: '/two.jpg', alt: 'Two' },
]

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('DepthCarousel reduced motion', () => {
  it('keeps manual navigation available without autoplay or tween duration', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    const tween = vi.spyOn(gsap, 'to')

    render(<DepthCarousel items={items} ariaLabel="Reduced motion photos" autoplay autoplayDelay={1200} />)

    const carousel = screen.getByRole('group', { name: 'Reduced motion photos' })
    const next = within(carousel).getByRole('button', { name: '下一张照片' })
    expect(within(carousel).getByRole('button', { name: '查看第 1 张照片' })).toHaveAttribute('aria-current', 'true')

    vi.advanceTimersByTime(6000)
    expect(within(carousel).getByRole('button', { name: '查看第 1 张照片' })).toHaveAttribute('aria-current', 'true')

    fireEvent.click(next)
    expect(within(carousel).getByRole('button', { name: '查看第 2 张照片' })).toHaveAttribute('aria-current', 'true')
    expect(tween).toHaveBeenLastCalledWith(expect.any(Object), expect.objectContaining({ duration: 0 }))
  })

  it('provides a persistent accessible pause control for autoplay', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))

    render(<DepthCarousel items={items} ariaLabel="Autoplay photos" autoplay autoplayDelay={1200} />)

    const carousel = screen.getByRole('group', { name: 'Autoplay photos' })
    const pause = within(carousel).getByRole('button', { name: '暂停自动播放' })
    fireEvent.click(pause)
    expect(within(carousel).getByRole('button', { name: '继续自动播放' })).toHaveAttribute('aria-pressed', 'true')

    act(() => vi.advanceTimersByTime(3600))
    expect(within(carousel).getByRole('button', { name: '查看第 1 张照片' })).toHaveAttribute('aria-current', 'true')

    fireEvent.click(within(carousel).getByRole('button', { name: '继续自动播放' }))
    act(() => vi.advanceTimersByTime(1200))
    expect(within(carousel).getByRole('button', { name: '查看第 2 张照片' })).toHaveAttribute('aria-current', 'true')
  })

  it('marks carousel images for lazy loading and asynchronous decoding', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    render(<DepthCarousel items={items} ariaLabel="Deferred photos" />)

    screen.getAllByRole('img').forEach((image) => {
      expect(image).toHaveAttribute('loading', 'lazy')
      expect(image).toHaveAttribute('decoding', 'async')
    })
  })
})
