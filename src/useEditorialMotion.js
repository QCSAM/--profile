import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const motionQueries = {
  desktop: '(min-width: 901px)',
  narrow: '(max-width: 900px)',
}

const motionProfiles = {
  desktop: {
    heroTitleTravel: 115,
    heroSupportTravel: 42,
    heroNavTravel: -24,
    curtainRuleDuration: 0.45,
    curtainRevealDuration: 0.7,
    curtainRevealStart: 0.35,
    heroMediaDuration: 1.05,
    heroTitleDuration: 0.9,
    heroTitleStart: 0.75,
    heroSupportDuration: 0.72,
    heroSupportStagger: 0.13,
    heroSupportStart: 1.25,
    heroNavDuration: 0.7,
    heroNavStagger: 0.1,
    heroNavStart: 1.75,
    openingReleaseStart: 2.5,
    openingReleaseDuration: 0.3,
    openingEnd: 2.8,
    headingIndexTravel: -34,
    headingIndexDuration: 0.55,
    headingRuleDuration: 0.75,
    headingEyebrowTravel: 24,
    headingEyebrowDuration: 0.55,
    headingTitleTravel: 105,
    headingTitleDuration: 1.1,
    headingChoreographyDuration: 1.35,
    portraitTravel: 48,
    portraitDuration: 1.05,
    profileCopyTravel: 42,
    profileCopyDuration: 0.75,
    profileCopyStagger: 0.1,
    profileFactTravel: 34,
    profileFactDuration: 0.65,
    profileFactStagger: 0.1,
    strengthTravel: 62,
    strengthScale: 0.94,
    strengthDuration: 0.9,
    strengthStagger: 0.12,
    workScale: 1.045,
    workRevealDuration: 1.15,
    workCopyTravel: 48,
    workCopyDuration: 0.72,
    workCopyStagger: 0.085,
    workCopyStart: 0.38,
    contactEyebrowTravel: 28,
    contactEyebrowDuration: 0.55,
    contactTitleTravel: 120,
    contactTitleDuration: 1.1,
    contactTitleStart: 0.15,
    contactCopyTravel: 38,
    contactCopyDuration: 0.72,
    contactCopyStagger: 0.11,
    contactCopyStart: 0.58,
  },
  narrow: {
    heroTitleTravel: 72,
    heroSupportTravel: 28,
    heroNavTravel: -16,
    curtainRuleDuration: 0.35,
    curtainRevealDuration: 0.52,
    curtainRevealStart: 0.28,
    heroMediaDuration: 0.75,
    heroTitleDuration: 0.65,
    heroTitleStart: 0.58,
    heroSupportDuration: 0.5,
    heroSupportStagger: 0.07,
    heroSupportStart: 0.95,
    heroNavDuration: 0.5,
    heroNavStagger: 0.06,
    heroNavStart: 1.4,
    openingReleaseStart: 1.9,
    openingReleaseDuration: 0.2,
    openingEnd: 2.1,
    headingIndexTravel: -22,
    headingIndexDuration: 0.42,
    headingRuleDuration: 0.55,
    headingEyebrowTravel: 16,
    headingEyebrowDuration: 0.42,
    headingTitleTravel: 68,
    headingTitleDuration: 0.8,
    headingChoreographyDuration: 1,
    portraitTravel: 32,
    portraitDuration: 0.75,
    profileCopyTravel: 28,
    profileCopyDuration: 0.55,
    profileCopyStagger: 0.06,
    profileFactTravel: 24,
    profileFactDuration: 0.5,
    profileFactStagger: 0.06,
    strengthTravel: 38,
    strengthScale: 0.97,
    strengthDuration: 0.65,
    strengthStagger: 0.07,
    workScale: 1.025,
    workRevealDuration: 0.82,
    workCopyTravel: 32,
    workCopyDuration: 0.55,
    workCopyStagger: 0.055,
    workCopyStart: 0.28,
    contactEyebrowTravel: 18,
    contactEyebrowDuration: 0.4,
    contactTitleTravel: 78,
    contactTitleDuration: 0.8,
    contactTitleStart: 0.1,
    contactCopyTravel: 26,
    contactCopyDuration: 0.55,
    contactCopyStagger: 0.07,
    contactCopyStart: 0.4,
  },
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
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

    if (prefersReducedMotion()) {
      root.classList.add('motion-ready', 'motion-reduced')
      restoreMotionState(root)
      return () => root.classList.remove('motion-ready', 'motion-reduced')
    }

    const controllerAnimations = { timelines: [], triggers: [] }
    let context
    let media
    let pendingImages = []
    let resizeFrame = 0
    let listenersAttached = false

    const safely = (operation) => {
      try {
        operation()
      } catch {
        // Failure cleanup must always reach scroll restoration and class rollback.
      }
    }
    const refresh = () => ScrollTrigger.refresh()
    const onResize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(refresh)
    }
    const cleanupOwnedMotion = () => {
      pendingImages.forEach(image => image.removeEventListener('load', refresh))
      if (listenersAttached) window.removeEventListener('resize', onResize)
      cancelAnimationFrame(resizeFrame)
      controllerAnimations.timelines.forEach(timeline => safely(() => timeline.kill()))
      controllerAnimations.triggers.forEach(trigger => safely(() => trigger.kill()))
      if (media) safely(() => media.revert())
      if (context) safely(() => context.revert())
      restoreMotionState(root)
      root.classList.remove('motion-ready', 'motion-reduced')
    }

    try {
      root.classList.add('motion-opening')
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'

      media = gsap.matchMedia()
      context = gsap.context(() => {
        const trackAnimation = (animation) => {
          controllerAnimations.timelines.push(animation)
          if (animation.scrollTrigger) controllerAnimations.triggers.push(animation.scrollTrigger)
          return animation
        }

        media.add(motionQueries, ({ conditions }) => {
          const isNarrow = conditions?.narrow ?? false
          const profile = isNarrow ? motionProfiles.narrow : motionProfiles.desktop
          const opening = trackAnimation(gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: () => restoreMotionState(root),
          }))

          gsap.set('[data-motion="hero-title"]', {
            yPercent: profile.heroTitleTravel,
            scaleX: 0.82,
            transformOrigin: 'left center',
          })
          gsap.set('[data-motion="hero-kicker"], [data-motion="hero-secondary"], [data-motion="hero-copy"]', {
            y: profile.heroSupportTravel,
            opacity: 0,
          })
          gsap.set('.site-nav, [data-motion="hero-actions"], [data-motion="hero-folio"]', {
            y: profile.heroNavTravel,
            opacity: 0,
          })
          gsap.set('.hero__media', { scale: 1.08, scaleY: 0.92, filter: 'brightness(0.62)' })

          opening
            .fromTo('.opening-curtain__rule', { scaleX: 0 }, {
              scaleX: 1,
              duration: profile.curtainRuleDuration,
              ease: 'power4.inOut',
            }, 0)
            .to('.opening-curtain', {
              clipPath: 'inset(0 0 0 100%)',
              duration: profile.curtainRevealDuration,
              ease: 'power4.inOut',
            }, profile.curtainRevealStart)
            .to('.hero__media', {
              scale: 1,
              scaleY: 1,
              filter: 'brightness(1)',
              duration: profile.heroMediaDuration,
              ease: 'power4.inOut',
            }, profile.curtainRevealStart)
            .to('[data-motion="hero-title"]', {
              yPercent: 0,
              scaleX: 1,
              duration: profile.heroTitleDuration,
              ease: 'expo.out',
            }, profile.heroTitleStart)
            .to('[data-motion="hero-kicker"], [data-motion="hero-secondary"], [data-motion="hero-copy"]', {
              y: 0,
              opacity: 1,
              duration: profile.heroSupportDuration,
              stagger: profile.heroSupportStagger,
            }, profile.heroSupportStart)
            .to('.site-nav, [data-motion="hero-actions"], [data-motion="hero-folio"]', {
              y: 0,
              opacity: 1,
              duration: profile.heroNavDuration,
              stagger: profile.heroNavStagger,
            }, profile.heroNavStart)
            .to({}, { duration: profile.openingReleaseDuration }, profile.openingReleaseStart)
            .set('.opening-curtain', { display: 'none' }, profile.openingEnd)

          Array.from(root.querySelectorAll('[data-motion="section-heading"]')).forEach((heading) => {
            const index = heading.querySelector('.section-heading__index')
            const eyebrow = heading.querySelector('.eyebrow')
            const title = heading.querySelector('h2')
            const sectionEntranceStart = profile.headingChoreographyDuration * 0.35
            const headingTimeline = trackAnimation(gsap.timeline({
              scrollTrigger: { trigger: heading, start: 'top 72%', once: true },
            })
              .from(index, { x: profile.headingIndexTravel, opacity: 0, duration: profile.headingIndexDuration, ease: 'power3.out' })
              .from(heading, { '--heading-rule-scale': 0, duration: profile.headingRuleDuration, ease: 'power4.inOut' }, 0.05)
              .from(eyebrow, { y: profile.headingEyebrowTravel, opacity: 0, duration: profile.headingEyebrowDuration, ease: 'power3.out' }, 0.2)
              .from(title, {
                y: profile.headingTitleTravel,
                scaleX: 0.9,
                transformOrigin: 'left center',
                duration: profile.headingTitleDuration,
                ease: 'expo.out',
              }, 0.25))

            if (heading.closest('.profile')) {
              headingTimeline
                .from('[data-motion="portrait"]', {
                  clipPath: 'inset(100% 0 0)',
                  y: profile.portraitTravel,
                  duration: profile.portraitDuration,
                  ease: 'power4.inOut',
                }, sectionEntranceStart)
                .from('[data-motion="profile-copy"] > *', {
                  y: profile.profileCopyTravel,
                  opacity: 0,
                  duration: profile.profileCopyDuration,
                  stagger: profile.profileCopyStagger,
                  ease: 'power3.out',
                }, sectionEntranceStart + (isNarrow ? 0.25 : 0.35))
                .from('[data-motion="profile-fact"]', {
                  y: profile.profileFactTravel,
                  scaleX: isNarrow ? 0.97 : 0.94,
                  opacity: 0,
                  duration: profile.profileFactDuration,
                  stagger: profile.profileFactStagger,
                  ease: 'power3.out',
                }, sectionEntranceStart + (isNarrow ? 0.5 : 0.7))
            }

            if (heading.closest('.strengths')) {
              headingTimeline.from('[data-motion="strength-card"]', {
                y: profile.strengthTravel,
                scaleX: profile.strengthScale,
                opacity: 0,
                duration: profile.strengthDuration,
                stagger: profile.strengthStagger,
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
                scale: profile.workScale,
                duration: profile.workRevealDuration,
                ease: 'power4.inOut',
              })
              .from(copy, {
                y: profile.workCopyTravel,
                opacity: 0,
                duration: profile.workCopyDuration,
                stagger: profile.workCopyStagger,
                ease: 'power3.out',
              }, profile.workCopyStart))
          })

          if (!isNarrow) {
            Array.from(root.querySelectorAll('[data-motion="parallax-image"]')).forEach((image) => {
              trackAnimation(gsap.fromTo(image,
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
                }))
            })
          }

          trackAnimation(gsap.timeline({
            scrollTrigger: { trigger: '[data-motion="contact"]', start: 'top 75%', once: true },
          })
            .from('.contact__inner > .eyebrow', {
              y: profile.contactEyebrowTravel,
              opacity: 0,
              duration: profile.contactEyebrowDuration,
              ease: 'power3.out',
            })
            .from('.contact h2', {
              y: profile.contactTitleTravel,
              scaleX: isNarrow ? 0.93 : 0.88,
              transformOrigin: 'left center',
              duration: profile.contactTitleDuration,
              ease: 'expo.out',
            }, profile.contactTitleStart)
            .from('.contact__intro, [data-motion="contact-details"], [data-motion="contact-actions"], .contact__foot', {
              y: profile.contactCopyTravel,
              opacity: 0,
              duration: profile.contactCopyDuration,
              stagger: profile.contactCopyStagger,
              ease: 'power3.out',
            }, profile.contactCopyStart))
        })
      }, root)

      pendingImages = Array.from(root.querySelectorAll('img')).filter(image => !image.complete)
      pendingImages.forEach(image => image.addEventListener('load', refresh, { once: true }))
      window.addEventListener('resize', onResize, { passive: true })
      listenersAttached = true
      root.classList.add('motion-ready')
    } catch {
      cleanupOwnedMotion()
      return undefined
    }

    return cleanupOwnedMotion
  }, [rootRef])
}
