import type { BandStyle } from '../content/types'
import type { RGBA } from './math'

// 캔버스가 쓰는 색은 모두 theme.css의 CSS 변수에서 읽는다. 여기에 색 값을 적지 않는다.

export interface BandColors {
  /** 앞면 */ f: RGBA
  /** 뒷면 */ b: RGBA
  /** 가장자리 */ s: RGBA
}

export interface Palette {
  theme: string
  paper: RGBA
  ink: RGBA
  signal: string
  planet: RGBA
  band: Record<BandStyle, BandColors>
  atmo: { peach: RGBA; orange: RGBA; core: RGBA; deep: RGBA; deep2: RGBA }
  halftone: { light: RGBA; dark: RGBA }
  /** 그레인 세기(토큰의 투명도) */
  grain: { dark: number; light: number }
  light: { core: RGBA; point: RGBA; halo: RGBA; fade: RGBA; glow: RGBA; flare: RGBA; ring: RGBA }
  ringDash: RGBA
  plan: RGBA
  fontSans: string
  fontMono: string
}

let probe: CanvasRenderingContext2D | null = null

/** 어떤 CSS 색 문자열이든 [r, g, b, a]로. 브라우저가 정규화한 값을 다시 읽는다. */
export function parseColor(css: string): RGBA {
  probe ??= document.createElement('canvas').getContext('2d')
  if (!probe || !css) return [0, 0, 0, 1]
  probe.fillStyle = '#000'
  probe.fillStyle = css.trim()
  const v = String(probe.fillStyle)
  if (v.startsWith('#')) return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16), 1]
  const m = v.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]
  return [m[0], m[1], m[2], m[3] ?? 1]
}

/** el이 놓인 자리의 테마(data-theme가 붙은 가장 가까운 조상)로 읽는다 */
export function readPalette(el: Element = document.documentElement): Palette {
  const cs = getComputedStyle(el)
  const v = (name: string) => cs.getPropertyValue('--' + name)
  const c = (name: string) => parseColor(v(name))
  const band = (name: string): BandColors => ({ f: c(`band-${name}`), b: c(`band-${name}-back`), s: c(`band-${name}-edge`) })
  return {
    theme: el.closest('[data-theme]')?.getAttribute('data-theme') ?? 'cream',
    paper: c('paper'),
    ink: c('ink'),
    signal: v('signal').trim(),
    planet: c('planet'),
    band: {
      warm: band('warm'),
      deep: band('deep'),
      line: { f: c('band-line'), b: c('band-line-back'), s: c('band-line') },
    },
    atmo: { peach: c('atmo-peach'), orange: c('atmo-orange'), core: c('atmo-core'), deep: c('atmo-deep'), deep2: c('atmo-deep-2') },
    halftone: { light: c('halftone-light'), dark: c('halftone-dark') },
    grain: { dark: c('grain-dark')[3], light: c('grain-light')[3] },
    light: {
      core: c('light-core'), point: c('light-point'), halo: c('light-halo'), fade: c('light-fade'),
      glow: c('light-glow'), flare: c('light-flare'), ring: c('light-ring'),
    },
    ringDash: c('ring-dash'),
    plan: c('plan-line'),
    fontSans: v('font-sans').trim() || '"Instrument Sans", Pretendard, sans-serif',
    fontMono: v('font-mono').trim() || '"IBM Plex Mono", monospace',
  }
}

/** 테마가 바뀌면(data-theme 속성) cb를 부른다. 해제 함수를 돌려준다. */
export function onThemeChange(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}
