import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import './DepthCarousel.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const prefersReducedMotion = () => typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function DepthCarousel({
  items,
  ariaLabel = '照片轮播',
  cardWidth = 760,
  cardHeight = 520,
  depth = 180,
  spread = 74,
  tilt = 16,
  perspective = 1500,
  autoplay = true,
  autoplayDelay = 3800,
}) {
  const slides = useMemo(
    () => (Array.isArray(items) ? items : []).map((item) => (typeof item === 'string' ? { image: item, alt: '' } : item)),
    [items],
  )
  const [active, setActive] = useState(0)
  const [autoplayPaused, setAutoplayPaused] = useState(false)
  const rootRef = useRef(null)
  const cardRefs = useRef([])
  const positionRef = useRef(0)
  const tweenRef = useRef(null)
  const dragRef = useRef(null)
  const pausedRef = useRef(false)

  const layout = useCallback((position) => {
    const count = slides.length
    if (!count) return

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      let distance = index - position
      distance = ((distance % count) + count) % count
      if (distance > count / 2) distance -= count

      const behind = Math.max(0, distance)
      const visible = Math.abs(distance) <= 2.5
      const scale = clamp((rootRef.current?.clientWidth || cardWidth) / (cardWidth + spread * 2), 0.48, 1)
      card.style.transform = `translate(-50%, -50%) scale(${scale}) translateX(${(spread * distance).toFixed(2)}px) translateZ(${(-depth * distance).toFixed(2)}px) rotateY(${(tilt * clamp(distance, 0, 1)).toFixed(2)}deg)`
      card.style.opacity = visible ? (distance < 0 ? Math.max(0, 1 + distance) : 1).toFixed(3) : '0'
      card.style.filter = `brightness(${Math.max(0.46, 1 - behind * 0.2).toFixed(2)}) blur(${Math.min(3, behind).toFixed(2)}px)`
      card.style.zIndex = String(Math.round(1000 - distance * 20))
      card.style.pointerEvents = visible ? 'auto' : 'none'
    })
  }, [cardWidth, depth, slides.length, spread, tilt])

  const focusSlide = useCallback((rawIndex, animate = true) => {
    const count = slides.length
    if (!count) return
    const index = ((rawIndex % count) + count) % count
    let delta = index - positionRef.current
    if (delta > count / 2) delta -= count
    if (delta < -count / 2) delta += count

    tweenRef.current?.kill()
    const proxy = { position: positionRef.current }
    tweenRef.current = gsap.to(proxy, {
      position: positionRef.current + delta,
      duration: animate && !prefersReducedMotion() ? 0.7 : 0,
      ease: 'power3.out',
      onUpdate: () => {
        positionRef.current = proxy.position
        layout(proxy.position)
      },
      onComplete: () => {
        positionRef.current = index
        layout(index)
      },
    })
    setActive(index)
  }, [layout, slides.length])

  useEffect(() => {
    layout(positionRef.current)
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return undefined
    const observer = new ResizeObserver(() => layout(positionRef.current))
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [layout])

  useEffect(() => {
    if (!autoplay || slides.length < 2 || prefersReducedMotion()) return undefined
    const timer = window.setInterval(() => {
      if (!pausedRef.current && !autoplayPaused) focusSlide(active + 1)
    }, Math.max(autoplayDelay, 1200))
    return () => window.clearInterval(timer)
  }, [active, autoplay, autoplayDelay, autoplayPaused, focusSlide, slides.length])

  useEffect(() => () => tweenRef.current?.kill(), [])

  const onPointerDown = (event) => {
    dragRef.current = { x: event.clientX, active }
  }

  const onPointerUp = (event) => {
    if (!dragRef.current) return
    const distance = event.clientX - dragRef.current.x
    if (Math.abs(distance) > 36) focusSlide(dragRef.current.active + (distance < 0 ? 1 : -1))
    dragRef.current = null
  }

  return (
    <div
      className="depth-carousel"
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      style={{ '--dc-perspective': `${perspective}px` }}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
      onFocus={() => { pausedRef.current = true }}
      onBlur={() => { pausedRef.current = false }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') focusSlide(active - 1)
        if (event.key === 'ArrowRight') focusSlide(active + 1)
      }}
    >
      <div className="depth-carousel__stage">
        {slides.map((slide, index) => (
          <div
            className="depth-carousel__card"
            key={slide.image}
            ref={(element) => { cardRefs.current[index] = element }}
            style={{ width: cardWidth, height: cardHeight }}
            aria-hidden={active !== index}
            onClick={() => focusSlide(index)}
          >
            <img
              className="depth-carousel__image"
              src={slide.image}
              alt={slide.alt}
              draggable="false"
              loading="lazy"
              decoding="async"
              style={{ objectPosition: slide.position || 'center' }}
            />
            <span className="depth-carousel__tint" aria-hidden="true" />
          </div>
        ))}
      </div>

      <button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev" aria-label="上一张照片" onClick={() => focusSlide(active - 1)}>←</button>
      <button type="button" className="depth-carousel__arrow depth-carousel__arrow--next" aria-label="下一张照片" onClick={() => focusSlide(active + 1)}>→</button>

      {autoplay && slides.length > 1 && !prefersReducedMotion() ? (
        <button
          type="button"
          className="depth-carousel__playback"
          aria-label={autoplayPaused ? '继续自动播放' : '暂停自动播放'}
          aria-pressed={autoplayPaused}
          onClick={() => setAutoplayPaused(paused => !paused)}
        >
          <span aria-hidden="true">{autoplayPaused ? '▶' : 'Ⅱ'}</span>
        </button>
      ) : null}

      <div className="depth-carousel__dots" aria-label="选择照片">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.image}
            className={`depth-carousel__dot${index === active ? ' is-active' : ''}`}
            aria-label={`查看第 ${index + 1} 张照片`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => focusSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default DepthCarousel
