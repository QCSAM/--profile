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
    const media = gsap.matchMedia()

    const context = gsap.context(() => {
      const trackAnimation = (animation) => {
        controllerAnimations.timelines.push(animation)
        if (animation.scrollTrigger) controllerAnimations.triggers.push(animation.scrollTrigger)
        return animation
      }

      const opening = trackAnimation(gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => restoreMotionState(root),
      }))

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

      gsap.utils.toArray('[data-motion="section-heading"]').forEach((heading) => {
        const index = heading.querySelector('.section-heading__index')
        const eyebrow = heading.querySelector('.eyebrow')
        const title = heading.querySelector('h2')
        const headingChoreographyDuration = 1.35
        const sectionEntranceStart = headingChoreographyDuration * 0.35

        const headingTimeline = trackAnimation(gsap.timeline({
          scrollTrigger: { trigger: heading, start: 'top 72%', once: true },
        })
          .from(index, { x: -34, opacity: 0, duration: 0.55, ease: 'power3.out' })
          .from(heading, { '--heading-rule-scale': 0, duration: 0.75, ease: 'power4.inOut' }, 0.05)
          .from(eyebrow, { y: 24, opacity: 0, duration: 0.55, ease: 'power3.out' }, 0.2)
          .from(title, { y: 105, scaleX: 0.9, transformOrigin: 'left center', duration: 1.1, ease: 'expo.out' }, 0.25))

        if (heading.closest('.profile')) {
          headingTimeline
            .from('[data-motion="portrait"]', { clipPath: 'inset(100% 0 0)', y: 48, duration: 1.05, ease: 'power4.inOut' }, sectionEntranceStart)
            .from('[data-motion="profile-copy"] > *', { y: 42, opacity: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' }, sectionEntranceStart + 0.35)
            .from('[data-motion="profile-fact"]', { y: 34, scaleX: 0.94, opacity: 0, duration: 0.65, stagger: 0.1, ease: 'power3.out' }, sectionEntranceStart + 0.7)
        }

        if (heading.closest('.strengths')) {
          headingTimeline.from('[data-motion="strength-card"]', {
            y: 62,
            scaleX: 0.94,
            opacity: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
          }, sectionEntranceStart)
        }
      })

      Array.from(root.querySelectorAll('[data-motion="work-card"]')).forEach((card, index) => {
        const imageWrap = card.querySelector('.work-card__image-wrap')
        const copy = card.querySelectorAll('.work-card__meta, h3, .work-card__role, .work-card__summary, .work-card__metrics, .work-card__tags')
        const fromLeft = index % 2 === 0

        trackAnimation(gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 72%', once: true },
        })
          .from(imageWrap, {
            clipPath: fromLeft ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
            scale: 1.045,
            duration: 1.15,
            ease: 'power4.inOut',
          })
          .from(copy, {
            y: 48,
            opacity: 0,
            duration: 0.72,
            stagger: 0.085,
            ease: 'power3.out',
          }, 0.38))
      })

      media.add('(min-width: 901px)', () => {
        Array.from(root.querySelectorAll('[data-motion="parallax-image"]')).forEach((image) => {
          gsap.fromTo(image,
            { '--parallax-y': '-3.5%', '--parallax-scale': 1.055 },
            {
              '--parallax-y': '3.5%',
              '--parallax-scale': 1.055,
              ease: 'none',
              scrollTrigger: {
                trigger: image.closest('.work-card__image-wrap, .portrait-frame'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            })
        })
      })

      trackAnimation(gsap.timeline({
        scrollTrigger: { trigger: '[data-motion="contact"]', start: 'top 75%', once: true },
      })
        .from('.contact__inner > .eyebrow', { y: 28, opacity: 0, duration: 0.55, ease: 'power3.out' })
        .from('.contact h2', { y: 120, scaleX: 0.88, transformOrigin: 'left center', duration: 1.1, ease: 'expo.out' }, 0.15)
        .from('.contact__intro, [data-motion="contact-details"], [data-motion="contact-actions"], .contact__foot', {
          y: 38,
          opacity: 0,
          duration: 0.72,
          stagger: 0.11,
          ease: 'power3.out',
        }, 0.58))
    }, root)

    return () => {
      controllerAnimations.timelines.forEach(timeline => timeline.kill())
      controllerAnimations.triggers.forEach(trigger => trigger.kill())
      media.revert()
      context.revert()
      restoreMotionState(root)
      root.classList.remove('motion-ready')
    }
  }, [rootRef])
}
