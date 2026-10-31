import { useEffectEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * 페이지 전체의 스크롤 진행도(0–1)를 onProgress로 넘긴다.
 * Lenis가 스크롤을 부드럽게 하고, ScrollTrigger가 진행도를 잰다.
 * 값은 React 상태가 아니라 콜백으로만 흘려보낸다(프레임마다 다시 그리지 않도록).
 */
export function useScrollProgress(onProgress: (p: number) => void) {
  const report = useEffectEvent(onProgress)

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = reduce ? null : new Lenis()
    const tick = (time: number) => lenis?.raf(time * 1000)
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }
    const trigger = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => report(self.progress) })
    report(trigger.progress)
    return () => {
      if (lenis) {
        gsap.ticker.remove(tick)
        lenis.destroy()
      }
    }
  })
}
