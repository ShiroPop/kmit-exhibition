import { add, cross, mul, norm, rgba, rnd, type Vec2, type Vec3 } from '../../math'
import { ELEV_HOME, makeView } from '../../projection'
import { ribbonChunks, type Chunk } from '../../ribbon'
import { drawChunks } from '../../draw/canvas'
import { ease, V, type HomeState, type HomeSubject, type Planet, type Star } from './state'

// 올해의 궤도: 교과 하나에 띠 하나. 띠 끝의 행성은 그 교과 학생들이 모인 것.

export const view = makeView(ELEV_HOME)
const N0 = norm([0.3, 1, 0.1])

export function createPlanets(subjects: HomeSubject[]): Planet[] {
  const last = Math.max(1, subjects.length - 1)
  return subjects.map((s, i) => {
    const R = 46 + 270 * Math.pow(i / last, 1.15) + (rnd(i + 3) - 0.5) * 24
    const N = norm(add(N0, [(rnd(i + 7) - 0.5) * 0.5, 0, (rnd(i + 11) - 0.5) * 0.4]))
    const U = norm(cross(N, [0, 0, 1]))
    const period = 2.1 * Math.pow(R / 46, 0.95)
    return {
      i, R, N, U, V: cross(N, U), n: s.n, style: s.band,
      w: s.band === 'line' ? 0.45 : 4.5 + (s.n - 10) * 0.8,
      omega: (Math.PI * 2) / period,
      phase: rnd(i + 29) * Math.PI * 2,
      trail: Math.min(22, Math.max(4, period * (1.0 + rnd(i + 31) * 0.7))),
      K: 170,
      off: [0, 0], tg: [0, 0], hist: [],
    }
  })
}

/** 학생 한 명에 별 하나. 스크롤하면 행성에서 흩어진다. */
export function createStars(planets: Planet[]): Star[] {
  const stars: Star[] = []
  for (const p of planets) {
    for (let j = 0; j < p.n; j++) {
      const id = p.i * 31 + j * 7
      stars.push({ i: p.i, kick: rnd(id + 911) * Math.PI * 2, kd: 0.5 + rnd(id + 433) * 0.8, r: 1.4 + rnd(id + 619) * 1.6 })
    }
  }
  return stars
}

/** 끌림: 행성만 커서 쪽으로 끌려가고, 뒤따르는 띠는 그 기록이라 끌린 자국이 띠에 남는다 */
function pullRecord(st: HomeState, p: Planet, head: Vec2, dtau: number) {
  const { S, t, still, gStr, gpx, gpy } = st
  let tx = 0, ty = 0
  if (gStr > 0.01) {
    const GR = 250 * S, d = Math.hypot(head[0] - gpx, head[1] - gpy)
    if (d < GR) {
      const q = 1 - d / GR, f = q * q * (3 - 2 * q) * gStr // smoothstep: 갑자기 시작되는 경계가 없게
      tx = (gpx - head[0]) * 0.6 * f; ty = (gpy - head[1]) * 0.6 * f
      const l = Math.hypot(tx, ty), lim = 64 * S
      if (l > lim) { tx *= lim / l; ty *= lim / l }
    }
  }
  if (!still) {
    // 두 단계의 부드러운 저역 통과, 스프링 없음: 넘치지 않고 끌려갔다 돌아온다
    const pulling = Math.hypot(tx, ty) > Math.hypot(p.off[0], p.off[1])
    const kIn = ease(st, pulling ? 0.22 : 0.5), kOff = ease(st, pulling ? 0.3 : 0.9) // 빨리 끌리고 천천히 놓인다
    p.tg[0] += (tx - p.tg[0]) * kIn; p.tg[1] += (ty - p.tg[1]) * kIn
    p.off[0] += (p.tg[0] - p.off[0]) * kOff; p.off[1] += (p.tg[1] - p.off[1]) * kOff
    p.hist.push([t, p.off[0], p.off[1]])
    while (p.hist.length > 2 && p.hist[1][0] < t - p.trail - 0.5) p.hist.shift()
  }
  // 띠의 각 지점에서 행성이 실제로 있던 자리
  let rec: Vec2[] = new Array(p.K + 1)
  let j = p.hist.length - 1
  for (let k = 0; k <= p.K; k++) {
    const tk = t - k * dtau
    while (j > 0 && p.hist[j][0] > tk) j--
    const h0 = p.hist[j], h1 = p.hist[j + 1]
    if (!h0 || h0[0] > tk) { rec[k] = [0, 0]; continue }
    if (!h1) { rec[k] = [h0[1], h0[2]]; continue }
    const u = (tk - h0[0]) / ((h1[0] - h0[0]) || 1)
    rec[k] = [h0[1] + (h1[1] - h0[1]) * u, h0[2] + (h1[2] - h0[2]) * u]
  }
  // 기록을 띠를 따라 고르게 펴서, 한 번의 부드러운 휨으로 읽히게
  for (let pass = 0; pass < 2; pass++) {
    const sm: Vec2[] = new Array(p.K + 1), R = 6
    for (let k = 0; k <= p.K; k++) {
      let sx = 0, sy = 0, n = 0
      for (let q = Math.max(0, k - R); q <= Math.min(p.K, k + R); q++) { sx += rec[q][0]; sy += rec[q][1]; n++ }
      sm[k] = [sx / n, sy / n]
    }
    sm[0] = rec[0]
    rec = sm
  }
  return rec
}

export function drawOrbits(st: HomeState) {
  const { ctx, S, CX, CY, t, TH } = st
  const scr = (q: Vec3): Vec2 => [CX + q[0] * S, CY - q[1] * S]
  const chunks: Chunk[] = []
  st.heads = []
  for (const p of st.planets) {
    const Nv = view(p.N)
    const pts: Vec3[] = []
    const dtau = p.trail / p.K
    for (let k = 0; k <= p.K; k++) {
      const a = p.omega * (t - k * dtau) + p.phase
      const R = p.R * (1 + 0.2 * (k / p.K))
      pts.push(view(add([0, -V * k * dtau, 0], add(mul(p.U, R * Math.cos(a)), mul(p.V, R * Math.sin(a))))))
    }
    const head = scr(pts[0])
    const rec = pullRecord(st, p, head, dtau)
    const shift = (q: Vec2, k: number): Vec2 => [q[0] + rec[k][0], q[1] + rec[k][1]]
    st.heads.push(shift(head, 0))
    const quiet = p.i === st.active ? 1 : 0.55
    ribbonChunks({
      pts, Nv, w: p.w, toScreen: (q, k) => shift(scr(q), k), colors: TH.band[p.style], line: p.style === 'line',
      split: 14, alpha: (age) => (1 - Math.pow(age, 1.5)) * quiet,
    }, chunks)
  }
  ctx.globalAlpha = 1 - 0.45 * st.kB // 올해의 궤도는 별이 떠나도 그 자리에 남는다
  drawChunks(ctx, chunks)
  ctx.globalAlpha = 1
}

export function drawPlanetHeads(st: HomeState) {
  const { ctx, S, TH, heads, gStr, gpx, gpy } = st
  const inkA = (a: number) => rgba(TH.ink, a)
  ctx.globalAlpha = st.home
  heads.forEach((h, i) => {
    const isA = i === st.active
    ctx.fillStyle = rgba(TH.planet, isA ? 1 : 0.8)
    ctx.strokeStyle = inkA(1)
    ctx.lineWidth = isA ? 1.2 : 0.8
    ctx.beginPath(); ctx.arc(h[0], h[1], (isA ? 5 : 3.4) * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  })
  // 끌림: 끌려간 행성마다 커서까지 점선 한 가닥
  if (!st.still) {
    ctx.save()
    ctx.lineWidth = 0.7
    ctx.setLineDash([2, 4])
    st.planets.forEach((p, i) => {
      const l = Math.hypot(p.off[0], p.off[1])
      if (l < 3) return
      const hh = heads[i]
      const a = Math.min(0.8, l / (24 * S))
      if (gStr > 0.02) {
        ctx.strokeStyle = inkA(a * gStr)
        ctx.beginPath(); ctx.moveTo(hh[0], hh[1]); ctx.lineTo(gpx, gpy); ctx.stroke()
      }
      ctx.setLineDash([])
      ctx.strokeStyle = inkA(a)
      ctx.beginPath(); ctx.arc(hh[0], hh[1], 9 * S, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([2, 4])
    })
    ctx.setLineDash([])
    if (gStr > 0.02) {
      ctx.strokeStyle = inkA(0.7 * gStr)
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(gpx - 6, gpy); ctx.lineTo(gpx + 6, gpy); ctx.moveTo(gpx, gpy - 6); ctx.lineTo(gpx, gpy + 6); ctx.stroke()
    }
    ctx.restore()
  }
  ctx.globalAlpha = 1
}
