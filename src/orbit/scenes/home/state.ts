import type { BandStyle } from '../../../content/types'
import type { Vec2, Vec3 } from '../../math'
import type { BandColors, Palette } from '../../palette'

// 홈 장면이 프레임마다 주고받는 상태. 각 파일(background, sheet, planets …)은 이 객체를 읽고 쓴다.

export interface HomeSubject {
  /** 학생 수: 띠의 굵기, 흩어지는 별의 수 */
  n: number
  band: BandStyle
  title: string
  sub: string
}

export interface HomeYear {
  title: string
  sub: string
  /** 그 해 별의 수(졸업생) */
  count: number
}

export interface HomeOptions {
  subjects: HomeSubject[]
  years: HomeYear[]
  labels: { center: string; ahead: string; behind: string }
  /** 지시선이 닿을 DOM 목록 항목 */
  subjectAnchor: (i: number) => Element | null | undefined
  yearAnchor: (n: number) => Element | null | undefined
  /** 평면도를 그릴 자리. 이 요소의 가운데에, 폭에 맞춰 그린다. */
  planAnchor: () => Element | null | undefined
  /** 스크롤에 따라 투명도를 바꿀 두 무대 */
  stages: () => { home: HTMLElement | null; archive: HTMLElement | null }
  onActiveSubject: (i: number) => void
  onActiveYear: (n: number) => void
  onSelectSubject: (i: number) => void
  onSelectYear: (n: number) => void
}

export interface Planet {
  i: number
  R: number
  N: Vec3
  U: Vec3
  V: Vec3
  n: number
  style: BandStyle
  w: number
  omega: number
  phase: number
  trail: number
  K: number
  /** 끌림: 행성이 끌려간 정도와 그 기록 */
  off: Vec2
  tg: Vec2
  hist: [number, number, number][]
}

export interface Star {
  i: number
  kick: number
  kd: number
  r: number
}

export interface PastOrbit {
  R: number
  N: Vec3
  U: Vec3
  V: Vec3
  omega: number
  phase: number
  trail: number
  w: number
  K: number
}

export interface PastYearState {
  year: HomeYear
  orbit: PastOrbit
  line: boolean
  stars: { from: number; far: number; delay: number; jit: number; jr: number; r: number }[]
  head: Vec2
  An: number
  st: BandColors
}

export interface Blob {
  c: number[]
  x: number
  y: number
  r: number
  dark?: boolean
  cx: number
  cy: number
  a: number
}

export interface HomeState {
  opts: HomeOptions
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  TH: Palette
  grain: { dark: CanvasPattern | null; light: CanvasPattern | null }

  W: number
  H: number
  DPR: number
  S: number
  CX: number
  CY: number
  CY0: number
  MOB: boolean
  /** 캔버스의 화면상 위치(DOM 좌표를 캔버스 좌표로 옮길 때) */
  left: number
  top: number

  reduce: boolean
  T0: number
  lastRT: number | null
  t: number
  dt: number
  now: number
  still: boolean

  // 스크롤
  scrollP: number
  spTarget: number
  P: number
  kB: number
  home: number
  camF: number
  SP: number
  cam: number
  flowT: number
  flow: number

  // 포인터와 끌림
  mx: number
  my: number
  gpx: number
  gpy: number
  gStr: number
  lastMove: number

  // 교과 선택
  planets: Planet[]
  stars: Star[]
  heads: Vec2[]
  active: number
  userPick: number | null
  lastUser: number
  hov: number | null

  // 지난 해
  past: PastYearState[]
  aHeads: (Vec2 | null)[]
  yActive: number
  yPick: number | null
  yLast: number
  yHov: number | null
}

export const V = 34
export const ease = (st: HomeState, tau: number) => 1 - Math.exp(-st.dt / tau)
