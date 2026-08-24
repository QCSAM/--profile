import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function restoreMotionState(root) {
  root?.classList.remove('motion-opening')
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
}

export default function useEditorialMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    root.classList.add('motion-ready')

    if (prefersReducedMotion()) {
      root.classList.add('motion-reduced')
      restoreMotionState(root)
      return () => root.classList.remove('motion-ready', 'motion-reduced')
    }

    root.classList.add('motion-opening')
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const controllerAnimations = {
      timelines: [],
      triggers: [],
    }

    const context = gsap.context(() => {
      const opening = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => restoreMotionState(root),
      })
      controllerAnimations.timelines.push(opening)

      gsap.set('[data-motion="hero-title"]', { yPercent: 115, scaleX: 0.82, transformOrigin: 'left center' })
      gsap.set('[data-motion="hero-kicker"], [data-motion="hero-secondary"], [data-motion="hero-copy"]', {
        y: 42,
        opacity: 0,
      })
      gsap.set('.site-nav, [data-motion="hero-actions"], [data-motion="hero-folio"]', { y: -24, opacity: 0 })
      gsap.set('.hero__video', { scale: 1.08, scaleY: 0.92, filter: 'brightness(0.62)' })

      opening
        .fromTo('.opening-curtain__rule', { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power4.inOut' }, 0)
        .to('.opening-curtain', { clipPath: 'inset(0 0 0 100%)', duration: 0.7, ease: 'power4.inOut' }, 0.35)
        .to('.hero__video', { scale: 1, scaleY: 1, filter: 'brightness(1)', duration: 1.05, ease: 'power4.inOut' }, 0.35)
        .to('[data-motion="hero-title"]', { yPercent: 0, scaleX: 1, duration: 0.9, ease: 'expo.out' }, 0.75)
        .to('[data-motion="hero-kicker"], [data-motion="hero-secondary"], [data-motion="hero-copy"]', {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.13,
        }, 1.25)
        .to('.site-nav, [data-motion="hero-actions"], [data-motion="hero-folio"]', {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
        }, 1.75)
        .to({}, { duration: 0.3 }, 2.5)
        .set('.opening-curtain', { display: 'none' }, 2.8)
    }, root)

    return () => {
      controllerAnimations.timelines.forEach(timeline => timeline.kill())
      controllerAnimations.triggers.forEach(trigger => trigger.kill())
      context.revert()
      restoreMotionState(root)
      root.classList.remove('motion-ready')
    }
  }, [rootRef])
}
