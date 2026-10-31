import { sstep } from '../../math'
import { onThemeChange, readPalette } from '../../palette'
import { createGrain, drawAtmosphere, drawGrain, drawHalftone, drawPaper } from './background'
import { drawArrows, drawAxis, drawCenterLight, drawConstruction, drawSheet } from './sheet'
import { createPlanets, createStars, drawOrbits, drawPlanetHeads } from './planets'
import { createPast, drawArchive } from './archive'
import { drawScatter } from './scatter'
import { drawAnnotations, drawPlanView } from './overlay'
import { ease, V, type HomeOptions, type HomeState } from './state'

export type { HomeOptions, HomeSubject, HomeYear } from './state'

// 홈: 중심이 나아가는 동안 그 둘레를 도는 열두 궤도.
// 스크롤하면 행성이 학생 별로 흩어져 떠나고, 아래에서 지나온 해들이 떠오른다.

export interface HomeScene {
  /** 스크롤 진행도 0–1 */
  setProgress(p: number): void
  /** 목록에 손을 올리거나 포커스했을 때. 놓으면 null. */
  pickSubject(i: number | null): void
  pickYear(n: number | null): void
  destroy(): void
}

export function createHomeScene(canvas: HTMLCanvasElement, opts: HomeOptions): HomeScene {
  const ctx = canvas.getContext('2d')!
  const planets = createPlanets(opts.subjects)
  const st: HomeState = {
    opts, canvas, ctx, TH: readPalette(canvas), grain: createGrain(ctx),
    W: 0, H: 0, DPR: 1, S: 1, CX: 0, CY: 0, CY0: 0, MOB: false, left: 0, top: 0,
    reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    T0: performance.now(), lastRT: null, t: 30, dt: 0.016, now: 0, still: false,
    scrollP: 0, spTarget: 0, P: 0, kB: 0, home: 1, camF: 0, SP: 0, cam: 0, flowT: 30, flow: 0,
    mx: -1, my: -1, gpx: -1e4, gpy: -1e4, gStr: 0, lastMove: -1e9,
    planets, stars: createStars(planets), heads: [], active: Math.min(3, planets.length - 1), userPick: null, lastUser: -1e9, hov: null,
    past: createPast(opts.years), aHeads: [], yActive: 0, yPick: null, yLast: -1e9, yHov: null,
  }

  function resize() {
    const r = canvas.getBoundingClientRect()
    st.left = r.left
    st.top = r.top
    st.DPR = Math.min(2, window.devicePixelRatio || 1)
    st.W = r.width
    st.H = r.height
    canvas.width = Math.round(st.W * st.DPR)
    canvas.height = Math.round(st.H * st.DPR)
    ctx.setTransform(st.DPR, 0, 0, st.DPR, 0, 0)
    st.MOB = st.W < 700
    st.S = st.MOB ? st.W / 430 * 0.62 : Math.min(st.W / 1440, st.H / 900) * 0.95
    st.CX = st.MOB ? st.W * 0.5 : st.W * 0.47
    st.CY = st.MOB ? st.H * 0.42 : st.H * 0.37
  }

  function setStage(el: HTMLElement | null, a: number) {
    if (!el) return
    el.style.opacity = a.toFixed(3)
    el.style.visibility = a < 0.02 ? 'hidden' : 'visible'
  }

  function render(now: number, still: boolean) {
    const t = st.reduce ? 30 : 30 + (now - st.T0) / 1000
    st.dt = st.lastRT == null ? 0.016 : Math.min(0.05, Math.max(0, t - st.lastRT))
    if (!still) st.lastRT = t
    st.t = t
    st.now = now
    st.still = still

    st.scrollP += (st.spTarget - st.scrollP) * (st.reduce || still ? 1 : ease(st, 0.12))
    const P = (st.P = st.scrollP)
    st.kB = sstep(0.05, 0.22, P) // 행성이 학생 별로 갈라진다
    st.home = 1 - st.kB
    st.camF = sstep(0.08, 0.62, P) // 0: 올해, 1: 아카이브
    st.SP = st.H * 1.05
    st.cam = st.camF * st.SP
    if (!still) st.flowT += st.dt * (1 - 0.7 * st.kB)
    st.flow = V * st.flowT * st.S
    st.CY0 = st.CY
    st.CY = st.CY0 - st.cam // 올해의 계는 위로 떠난다
    const stages = opts.stages()
    setStage(stages.home, sstep(0.08, 0.0, P))
    setStage(stages.archive, sstep(0.6, 0.8, P))

    // 끌림의 세기: 커서가 움직이는 동안만
    if (st.mx >= 0) { st.gpx += (st.mx - st.gpx) * 0.12; st.gpy += (st.my - st.gpy) * 0.12 }
    const gTarget = !still && st.kB < 0.05 && st.mx >= 0 && now - st.lastMove < 2500 ? 1 : 0
    st.gStr += (gTarget - st.gStr) * (gTarget ? 0.05 : 0.025)
    if (still) st.gStr = 0

    // 강조할 교과: 커서 근처 행성 > 목록에 올린 손 > 천천히 돌아가며
    let hov: number | null = null
    if (st.mx >= 0 && st.kB <= 0.05) {
      let best = 22
      st.heads.forEach((h, i) => { const d = Math.hypot(h[0] - st.mx, h[1] - st.my); if (d < best) { best = d; hov = i } })
    }
    st.hov = hov
    const prev = st.active
    if (hov !== null) { st.active = hov; st.lastUser = now }
    else if (st.userPick !== null) st.active = st.userPick
    else if (now - st.lastUser > 3000) st.active = Math.floor(t / 5) % st.planets.length
    if (st.active !== prev) opts.onActiveSubject(st.active)

    drawPaper(st)
    const blobs = drawAtmosphere(st)
    drawHalftone(st, blobs)
    drawSheet(st)
    drawConstruction(st)
    drawOrbits(st)
    drawAxis(st)
    drawPlanetHeads(st)
    drawArrows(st)
    st.yHov = null
    drawArchive(st)
    drawCenterLight(st)
    drawScatter(st)
    drawAnnotations(st)
    drawPlanView(st)
    drawGrain(st)

    canvas.style.cursor = st.hov !== null || st.yHov !== null ? 'pointer' : ''
    st.CY = st.CY0
  }

  let raf = 0
  function loop(now: number) {
    render(now, false)
    raf = requestAnimationFrame(loop)
  }
  const renderStill = () => render(performance.now(), true)

  // ---------- 입력 ----------
  const onMove = (e: MouseEvent) => {
    const x = e.clientX - st.left, y = e.clientY - st.top
    if (y < 0) { st.mx = st.my = -1; return } // 내비 위
    st.mx = x
    st.my = y
    st.lastMove = performance.now()
    if (st.gpx < -1000) { st.gpx = x; st.gpy = y }
  }
  const onLeave = () => { st.mx = st.my = -1 }
  const onClick = () => {
    if (st.hov !== null) opts.onSelectSubject(st.hov)
    else if (st.yHov !== null) opts.onSelectYear(st.yHov)
  }
  window.addEventListener('mousemove', onMove)
  document.documentElement.addEventListener('mouseleave', onLeave)
  canvas.addEventListener('click', onClick)

  // ResizeObserver는 그 프레임의 그리기(rAF)가 끝난 뒤에 불린다. 캔버스 크기를 다시 넣으면 그림이 지워지므로,
  // 여기서 바로 다시 그려야 빈 캔버스가 화면에 나가지 않는다(깜박임).
  const ro = new ResizeObserver(() => {
    resize()
    render(performance.now(), st.reduce)
  })
  ro.observe(canvas)
  const offTheme = onThemeChange(() => { st.TH = readPalette(canvas); if (st.reduce) renderStill() })

  resize()
  if (st.reduce) renderStill()
  else raf = requestAnimationFrame(loop)

  return {
    setProgress(p) {
      st.spTarget = Math.min(1, Math.max(0, p))
      if (st.reduce) renderStill()
    },
    pickSubject(i) {
      st.userPick = i
      st.lastUser = performance.now()
      if (st.reduce) renderStill()
    },
    pickYear(n) {
      st.yPick = n
      st.yLast = performance.now()
      if (st.reduce) renderStill()
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
      ro.disconnect()
      offTheme()
    },
  }
}
