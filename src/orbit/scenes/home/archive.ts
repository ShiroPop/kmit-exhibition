import { add, cross, mul, norm, rgba, rnd, sstep, type RGBA, type Vec2, type Vec3 } from '../../math'
import type { BandColors } from '../../palette'
import { ribbonChunks, type Chunk } from '../../ribbon'
import { drawChunks, trackBox } from '../../draw/canvas'
import { lightPos } from './sheet'
import { view } from './planets'
import { V, type HomeState, type HomeYear, type PastYearState } from './state'

// 지나온 해: 아래에서 떠오르는 중심 하나, 해마다 궤도 하나.
// 그 해의 별들이 날아와 행성 하나로 모이고, 그 행성이 돌며 궤도를 남긴다.

/** 해마다 다른 쪽으로 기운다: 서로 다른 갈래 */
const LEAN: Vec3[] = [[0.55, 1, 0.1], [-0.5, 1, 0.35], [0.1, 1, -0.6], [0.4, 1, 0.55], [-0.35, 1, -0.45]]

export function createPast(years: HomeYear[]): PastYearState[] {
  return years.map((year, n) => {
    const N = norm(LEAN[n % LEAN.length])
    const U = norm(cross(N, [0, 0, 1]))
    const R = 130 + n * 52 + rnd(n + 3) * 20
    const omega = (Math.PI * 2) / (2.6 * Math.pow(R / 120, 0.9))
    const line = n % 2 === 1 // 한 해 걸러 가는 선 하나: 올해의 궤도처럼 띠와 선이 번갈아
    return {
      year, line,
      orbit: { R, N, U, V: cross(N, U), omega, phase: rnd(n + 29) * 6.28, trail: (2 * Math.PI / omega) * (0.9 + n * 0.12), w: line ? 0.6 : 8 + rnd(n + 5) * 3, K: 160 },
      stars: Array.from({ length: year.count }, (_, k) => ({
        from: rnd(n * 131 + k) * Math.PI * 2, far: 0.9 + rnd(n * 151 + k) * 0.5,
        delay: rnd(n * 171 + k) * 0.5, jit: rnd(n * 181 + k) * Math.PI * 2, jr: 6 + rnd(n * 199 + k) * 22,
        r: 1.4 + rnd(n * 191 + k) * 1.2,
      })),
      head: [0, 0], An: 0, st: { f: [0, 0, 0, 1], b: [0, 0, 0, 1], s: [0, 0, 0, 1] },
    }
  })
}

const mix = (c: RGBA, to: RGBA, k: number): RGBA => [c[0] + (to[0] - c[0]) * k, c[1] + (to[1] - c[1]) * k, c[2] + (to[2] - c[2]) * k, c[3]]
const mixBand = (b: BandColors, to: RGBA, k: number): BandColors => ({ f: mix(b.f, to, k), b: mix(b.b, to, k), s: mix(b.s, to, k) })

/** 그 해의 띠 색: 따로 색을 두지 않고 띠 색을 오래된 해일수록 paper 쪽으로 섞는다 */
function yearColors(st: HomeState, y: PastYearState, n: number): BandColors {
  const { band, paper } = st.TH
  const base = y.line ? band.line : [band.warm, band.deep, mixBand(band.warm, paper, 0.3)][(n >> 1) % 3]
  return mixBand(base, paper, n * 0.08)
}

export function drawArchive(st: HomeState) {
  const { ctx, S, W, H, CX, CY0, SP, cam, P, t, TH, MOB, now } = st
  const acy = CY0 + SP - cam
  if (acy >= H + SP * 0.6) return
  const inkA = (a: number) => rgba(TH.ink, a)
  const A0 = sstep(0.28, 0.86, P) // 해들이 얼마나 모였나

  // 강조할 해: 커서 근처 행성 > 목록에 올린 손 > 천천히 돌아가며
  let yh: number | null = null
  if (st.mx >= 0 && A0 > 0.9) {
    let best = 26
    st.aHeads.forEach((hh, n) => { if (!hh) return; const d = Math.hypot(hh[0] - st.mx, hh[1] - st.my); if (d < best) { best = d; yh = n } })
  }
  st.yHov = yh
  const prev = st.yActive
  if (yh !== null) { st.yActive = yh; st.yLast = now }
  else if (st.yPick !== null) st.yActive = st.yPick
  else if (now - st.yLast > 3200) st.yActive = Math.floor(t / 4) % st.past.length
  if (st.yActive !== prev) st.opts.onActiveYear(st.yActive)

  // 빛의 넓은 번짐: 내려오는 빛을 따라가며, 아카이브에 가까워질수록 짙어진다
  const light = lightPos(st)
  if (light.m > 0.01) {
    const ly = light.y, k = light.m
    const gw = ctx.createRadialGradient(CX, ly, 0, CX, ly, 380 * S)
    gw.addColorStop(0, rgba(TH.atmo.core, 0.55 * k)); gw.addColorStop(0.5, rgba(TH.atmo.orange, 0.14 * k)); gw.addColorStop(1, rgba(TH.atmo.orange, 0))
    ctx.fillStyle = gw
    ctx.fillRect(0, ly - 400 * S, W, 800 * S)
  }

  const lscr = (q: Vec3): Vec2 => [CX + q[0] * S, acy - q[1] * S]
  const chunks: Chunk[] = []
  st.aHeads = []
  st.past.forEach((y, n) => {
    const o = y.orbit
    const An = sstep(n * 0.12, 0.7 + n * 0.1, A0) // 가까운 해가 먼저 모인다
    const grow = sstep(0.55, 1, An) // 행성이 생기고 나서야 궤도가 뒤로 길어진다
    const Nv = view(o.N), pts: Vec3[] = [], dtau = (o.trail * Math.max(0.02, grow)) / o.K
    for (let k = 0; k <= o.K; k++) {
      const ang = o.omega * (t - k * dtau) + o.phase, R = o.R * (1 + 0.15 * (k / o.K) * grow)
      pts.push(view(add([0, -V * 0.5 * k * dtau, 0], add(mul(o.U, R * Math.cos(ang)), mul(o.V, R * Math.sin(ang))))))
    }
    const head = lscr(pts[0])
    st.aHeads.push(An > 0.5 ? head : null)
    y.st = yearColors(st, y, n)
    const hl = n === st.yActive ? 1 : 0.62
    if (grow > 0.01) {
      ribbonChunks({
        pts, Nv, w: o.w, toScreen: (q) => lscr(q), colors: y.st, line: y.line,
        split: 12, alpha: (ag) => (1 - Math.pow(ag, 1.5)) * hl * Math.min(1, grow * 1.5),
      }, chunks)
    }
    y.head = head
    y.An = An
  })
  drawChunks(ctx, chunks)
  // 아카이브의 중심에는 따로 빛을 두지 않는다: 위에서 내려온 빛 하나가 그 자리에 온다(sheet.ts drawCenterLight)

  // 학생들이 바깥에서 날아와 그 해의 행성으로 뭉친다
  st.past.forEach((y, n) => {
    const { head, An } = y
    if (An <= 0) return
    const formed = sstep(0.5, 0.75, An)
    if (formed < 1) {
      for (const sd of y.stars) {
        const a = sstep(sd.delay * 0.6, sd.delay * 0.6 + 0.45, An)
        if (a <= 0) continue
        const e = 1 - Math.pow(1 - a, 3)
        const tx = head[0] + Math.cos(sd.jit + t) * sd.jr * S * (1 - e), ty = head[1] + Math.sin(sd.jit + t) * sd.jr * S * (1 - e)
        const ox = CX + Math.cos(sd.from) * W * 0.75 * sd.far, oy = acy + Math.sin(sd.from) * H * 0.75 * sd.far
        const bend = Math.sin(Math.PI * e) * 80 * S
        const nx = -(ty - oy), ny = tx - ox, nl = Math.hypot(nx, ny) || 1
        ctx.globalAlpha = (1 - formed) * Math.min(1, a * 4)
        ctx.fillStyle = rgba(y.st.s, 0.95)
        ctx.beginPath(); ctx.arc(ox + (tx - ox) * e + nx / nl * bend, oy + (ty - oy) * e + ny / nl * bend, sd.r * S * 1.5, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    // 행성: 그 해가 가득했던 만큼 크게
    if (formed > 0) {
      const pr = (3 + y.year.count / 28) * S * formed
      ctx.fillStyle = rgba(TH.planet, 1)
      ctx.strokeStyle = inkA(1)
      ctx.lineWidth = n === st.yActive ? 1.3 : 0.8
      ctx.beginPath(); ctx.arc(head[0], head[1], pr, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    }
  })

  // 강조한 해: 추적 괄호와 목록 항목까지 지시선
  const ah = st.aHeads[st.yActive], el = st.opts.yearAnchor(st.yActive)
  if (ah && el && P > 0.7 && !MOB) {
    const br = el.getBoundingClientRect()
    const lx = br.left - st.left - 6, ly = br.top - st.top + br.height / 2
    ctx.strokeStyle = inkA(1)
    ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(ah[0], ah[1]); ctx.lineTo(lx - 30, ly); ctx.lineTo(lx, ly); ctx.stroke()
    ctx.lineWidth = 1
    trackBox(ctx, ah[0], ah[1], 14)
    ctx.font = `400 ${10 * Math.max(1, S)}px ${TH.fontMono}`
    ctx.fillStyle = inkA(0.7)
    ctx.textAlign = 'center'
    ctx.fillText(`trk.${st.past[st.yActive].year.title}`, ah[0], ah[1] - 22)
    ctx.textAlign = 'left'
  }
}
