/**
 * Magnetic button composable
 * Mandatory for all CTAs — NOT optional
 */
import { gsap } from 'gsap'
import { onMounted, onBeforeUnmount } from 'vue'

export function useMagnetic(elRef, options = {}) {
  const {
    strength = 0.35,
    radius = 100,
    ease = 'power2.out',
    springBack = 'elastic.out(1, 0.4)'
  } = options

  let bounds = null

  function onMove(e) {
    if (!bounds) return
    const dx = e.clientX - bounds.cx
    const dy = e.clientY - bounds.cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius) {
      gsap.to(elRef.value, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.3,
        ease
      })
    }
  }

  function onLeave() {
    gsap.to(elRef.value, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: springBack
    })
  }

  function updateBounds() {
    if (!elRef.value) return
    const rect = elRef.value.getBoundingClientRect()
    bounds = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2
    }
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!elRef.value) return

    updateBounds()
    elRef.value.addEventListener('mousemove', onMove)
    elRef.value.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', updateBounds, { passive: true })
  })

  onBeforeUnmount(() => {
    elRef.value?.removeEventListener('mousemove', onMove)
    elRef.value?.removeEventListener('mouseleave', onLeave)
    window.removeEventListener('scroll', updateBounds)
  })
}
