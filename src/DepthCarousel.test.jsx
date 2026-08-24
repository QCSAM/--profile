import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import DepthCarousel from './DepthCarousel'

const items = [
  { image: '/one.jpg', alt: 'One' },
  { image: '/two.jpg', alt: 'Two' },
]

afterEach(() => {
  cleanup()
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
    vi.useRealTimers()
  })
})
