/**
 * Lenis smooth scroll composable
 * Mandatory for every project — NOT optional
 */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function useLenis() {
  const isLocked = ref(false)

  function init() {
    if (lenis) return lenis

    lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return lenis
  }

  function lock() {
    lenis?.stop()
    isLocked.value = true
  }

  function unlock() {
    lenis?.start()
    isLocked.value = false
  }

  function scrollTo(target, options = {}) {
    lenis?.scrollTo(target, {
      offset: 0,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    })
  }

  function destroy() {
    lenis?.destroy()
    lenis = null
  }

  return { init, lock, unlock, scrollTo, destroy, isLocked, getInstance: () => lenis }
}
