import { rgba, rnd, sstep } from '../../math'
import { redArc, trackBox } from '../../draw/canvas'
import type { HomeState } from './state'

// 주석: 지시선 라벨, 목록까지의 지시선, 모바일 라벨, 왼쪽 아래 평면도

/** 모바일: 강조한 별의 이름을 오른쪽 위에 지시선과 함께. 데스크톱의 목록 대신. */
function mobileLabel(st: HomeState, hx: number, hy: number, title: string, sub: string, alpha: number) {
  if (alpha <= 0.01) return
  const { ctx, W, TH } = st
  const inkA = (a: number) => rgba(TH.ink, a)
  const rx = W - 20, ry = 132
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = inkA(0.85)
  ctx.lineWidth = 0.7
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(rx - 140, ry + 10); ctx.lineTo(rx, ry + 10); ctx.stroke()
  ctx.lineWidth = 1
  trackBox(ctx, hx, hy, 12)
  ctx.fillStyle = inkA(1)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 15px ${TH.fontSans}`
  ctx.fillText(title, rx, ry + 2)
  ctx.font = `400 10px ${TH.fontMono}`
  ctx.fillStyle = inkA(0.65)
  ctx.fillText(sub, rx, ry + 26)
  ctx.textAlign = 'left'
  ctx.restore()
}

export function drawAnnotations(st: HomeState) {
  const { ctx, S, W, H, CX, CY, TH, MOB, home, heads, P, opts } = st
  const inkA = (a: number) => rgba(TH.ink, a)
  const lab = (fromX: number, fromY: number, toY: number, text: string) => {
    const lx = W - 300 * S
    ctx.strokeStyle = inkA(0.55)
    ctx.lineWidth = 0.6
    ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(lx - 20, toY); ctx.lineTo(lx, toY); ctx.stroke()
    ctx.fillStyle = inkA(1)
    ctx.beginPath(); ctx.arc(fromX, fromY, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(lx + 6, toY, 1.6, 0, Math.PI * 2); ctx.fill()
    ctx.font = `400 ${10 * Math.max(1, S)}px ${TH.fontSans}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(text, lx + 14, toY + 3.5)
  }
  ctx.globalAlpha = MOB ? 0 : home
  lab(CX + 24 * S, CY - 6 * S, 120 * S + 40, opts.labels.center)
  lab(CX + 40 * S, CY - 120 * S, 150 * S + 40, opts.labels.ahead)
  lab(CX, CY + 520 * S, H - 170 * S, opts.labels.behind)

  // 강조한 교과: 행성에서 오른쪽 목록 항목까지
  const h = heads[st.active], el = opts.subjectAnchor(st.active)
  if (h && el && home > 0.02 && !MOB) {
    const br = el.getBoundingClientRect()
    const lx = br.left - st.left - 4, ly = br.top - st.top + br.height / 2
    ctx.strokeStyle = inkA(1)
    ctx.lineWidth = 0.7
    ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(lx - 30, ly); ctx.lineTo(lx, ly); ctx.stroke()
    ctx.lineWidth = 1
    trackBox(ctx, h[0], h[1], 13)
  }

  if (MOB && h) {
    const s = opts.subjects[st.active]
    mobileLabel(st, h[0], h[1], s.title, s.sub, home)
  }
  const ah = st.aHeads[st.yActive]
  if (MOB && ah && P > 0.7) {
    const y = st.past[st.yActive].year
    mobileLabel(st, ah[0], ah[1], y.title, y.sub, sstep(0.7, 0.8, P))
  }
  ctx.globalAlpha = 1
}

/** 평면도 전체 폭(십자선 끝에서 끝까지). 자리 요소의 폭이 이 값에 대응한다. */
const PLAN_SPAN = 280

/**
 * 평면도: 위에서 본 궤도.
 * 위치와 크기는 캔버스가 정하지 않고 opts.planAnchor() 요소(components/home/PlanView)를 따른다.
 */
export function drawPlanView(st: HomeState) {
  const { ctx, TH, MOB, home, t } = st
  const el = st.opts.planAnchor()
  if (MOB || !el) return
  const box = el.getBoundingClientRect()
  if (!box.width) return
  const S = box.width / PLAN_SPAN
  const px = box.left - st.left + box.width / 2, py = box.top - st.top + box.height / 2, ps = 0.33 * S
  ctx.globalAlpha = home
  ctx.strokeStyle = rgba(TH.plan, 0.6)
  ctx.lineWidth = 0.6
  ctx.beginPath(); ctx.moveTo(px - 140 * S, py); ctx.lineTo(px + 140 * S, py); ctx.moveTo(px, py - 130 * S); ctx.lineTo(px, py + 110 * S); ctx.stroke()
  st.planets.forEach((p, i) => {
    const r = p.R * ps
    const ox = (rnd(i + 41) - 0.5) * 14 * S, oy = (rnd(i + 43) - 0.5) * 10 * S
    const isA = i === st.active
    ctx.strokeStyle = isA ? rgba(TH.light.core, 1) : rgba(TH.plan, p.style === 'line' ? 0.45 : 0.8)
    ctx.lineWidth = isA ? 1.5 : p.style === 'deep' ? 1.4 : 0.7
    if (p.style === 'line' && !isA) ctx.setLineDash([1, 3])
    ctx.beginPath(); ctx.arc(px + ox, py + oy, r, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
    const a = p.omega * t + p.phase
    const qx = px + ox + r * Math.cos(a), qy = py + oy + r * Math.sin(a)
    if (i % 3 === 0 || isA) {
      ctx.strokeStyle = rgba(TH.plan, 0.55)
      ctx.lineWidth = 0.6
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke()
    }
    ctx.fillStyle = rgba(TH.planet, 1)
    ctx.beginPath(); ctx.arc(qx, qy, isA ? 3.4 : 2.2, 0, Math.PI * 2); ctx.fill()
  })
  ctx.fillStyle = rgba(TH.light.core, 1)
  ctx.beginPath(); ctx.arc(px, py, 5 * S, 0, Math.PI * 2); ctx.fill()
  redArc(ctx, TH.signal, px, py, 128 * S, 128 * S, Math.PI * 0.55, Math.PI * 0.95)
  redArc(ctx, TH.signal, px, py, 118 * S, 118 * S, -Math.PI * 0.2, Math.PI * 0.1)
  ctx.globalAlpha = 1
}
