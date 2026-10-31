import { rgba } from '../../math'
import { arrowHead, redArc } from '../../draw/canvas'
import type { HomeState } from './state'

// 도면: + 격자, 눈금자, 재단 표시, 보조선, 축, 빨간 화살표, 중심의 빛

const inkA = (st: HomeState, a: number) => rgba(st.TH.ink, a)

/** + 격자는 흐름(flow)만큼 흘러간다: 그것이 움직임이다 */
export function drawSheet(st: HomeState) {
  const { ctx, S, W, H, flow, cam, MOB } = st
  const gx = 80 * S, gy = 70 * S, off = ((flow - cam) % gy + gy) % gy
  ctx.strokeStyle = inkA(st, 0.22)
  ctx.lineWidth = 0.8
  ctx.beginPath()
  for (let x = 120 * S; x < W - 60; x += gx) for (let y = -gy + off; y < H; y += gy) {
    if (y < 30) continue
    ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4)
  }
  ctx.stroke()
  ctx.strokeStyle = inkA(st, 1)
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 120 * S, k = 0; x < W - 60; x += gx, k++) {
    const L = k % 4 === 0 ? 14 : 8
    ctx.moveTo(x, 40); ctx.lineTo(x, 40 + L); ctx.moveTo(x, H - 40); ctx.lineTo(x, H - 40 - L)
  }
  for (let y = -gy + off; y < H - 40; y += gy) {
    if (y < 60) continue
    ctx.moveTo(40, y); ctx.lineTo(48, y); ctx.moveTo(W - 40, y); ctx.lineTo(W - 48, y)
  }
  ctx.stroke()
  ctx.lineWidth = 1.6
  ctx.beginPath()
  const m = MOB ? 14 : 40, L = MOB ? 18 : 30
  ctx.moveTo(m, m + L); ctx.lineTo(m, m); ctx.lineTo(m + L, m)
  ctx.moveTo(W - m - L, m); ctx.lineTo(W - m, m); ctx.lineTo(W - m, m + L)
  ctx.moveTo(m, H - m - L); ctx.lineTo(m, H - m); ctx.lineTo(m + L, H - m)
  ctx.moveTo(W - m - L, H - m); ctx.lineTo(W - m, H - m); ctx.lineTo(W - m, H - m - L)
  ctx.stroke()
}

export function drawConstruction(st: HomeState) {
  const { ctx, S, CX, CY } = st
  ctx.save()
  ctx.globalAlpha = st.home
  ctx.strokeStyle = inkA(st, 0.45)
  ctx.lineWidth = 0.7
  ctx.setLineDash([1, 4])
  ctx.beginPath(); ctx.ellipse(CX + 10 * S, CY + 30 * S, 380 * S, 120 * S, -0.08, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(CX - 30 * S, CY + 230 * S, 300 * S, 90 * S, 0.12, 0, Math.PI * 2); ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = inkA(st, 0.35)
  ctx.lineWidth = 0.6
  ctx.beginPath(); ctx.moveTo(CX - 420 * S, CY - 60 * S); ctx.lineTo(CX + 380 * S, CY + 140 * S); ctx.stroke()
  ctx.setLineDash([4, 4])
  ctx.beginPath(); ctx.moveTo(CX - 300 * S, CY + 360 * S); ctx.lineTo(CX + 330 * S, CY - 120 * S); ctx.stroke()
  ctx.restore()
}

/** 축: 올해와 그 아래 모든 해를 지나는 시간선. 지나온 길은 실선, 갈 길은 점선 */
export function drawAxis(st: HomeState) {
  const { ctx, S, CX, CY, H, flow } = st
  ctx.strokeStyle = inkA(st, 1)
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(CX, Math.max(-10, CY)); ctx.lineTo(CX, H + 10); ctx.stroke()
  ctx.lineWidth = 1.2
  ctx.setLineDash([3, 6])
  ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX, 30); ctx.stroke()
  ctx.setLineDash([])
  ctx.lineWidth = 1
  ctx.beginPath()
  const tg = 40 * S, toff = flow % tg
  for (let y = CY + toff; y < H; y += tg) { ctx.moveTo(CX - 6, y); ctx.lineTo(CX + 6, y) }
  ctx.stroke()
}

/** 이탈: 궤도를 벗어나는 빨간 화살표. 빨강은 여기에만 쓴다. */
export function drawArrows(st: HomeState) {
  const { ctx, S, CX, CY, TH } = st
  ctx.globalAlpha = st.home
  redArc(ctx, TH.signal, CX - 10 * S, CY + 20 * S, 420 * S, 150 * S, Math.PI * 0.62, Math.PI * 0.92)
  redArc(ctx, TH.signal, CX + 20 * S, CY + 10 * S, 360 * S, 130 * S, -Math.PI * 0.32, -Math.PI * 0.05)
  redArc(ctx, TH.signal, CX, CY + 300 * S, 330 * S, 110 * S, Math.PI * 0.18, Math.PI * 0.45)
  ctx.save()
  ctx.strokeStyle = TH.signal
  ctx.fillStyle = TH.signal
  ctx.lineWidth = 1.5
  ctx.setLineDash([2, 5])
  ctx.beginPath(); ctx.moveTo(CX + 40 * S, CY - 30 * S); ctx.lineTo(CX + 40 * S, CY - 150 * S); ctx.stroke()
  ctx.setLineDash([])
  arrowHead(ctx, CX + 40 * S, CY - 154 * S, -Math.PI / 2)
  ctx.restore()
  ctx.globalAlpha = 1
}

/** 빛 하나: 심지, 번짐, 가로세로 빛줄기, 둘레의 원 */
export function lightAt(st: HomeState, x: number, y: number, core: number, glowAlpha: number) {
  const { ctx, S, TH } = st
  const L = TH.light
  ctx.globalCompositeOperation = 'lighter'
  const R = 70 * S
  let g = ctx.createRadialGradient(x, y, 0, x, y, R)
  g.addColorStop(0, rgba(L.glow, glowAlpha)); g.addColorStop(1, rgba(L.glow, 0))
  ctx.fillStyle = g
  ctx.fillRect(x - R, y - R, R * 2, R * 2)
  const r = core * S
  g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, rgba(L.point, L.point[3])); g.addColorStop(0.3, rgba(L.halo, L.halo[3])); g.addColorStop(1, rgba(L.fade, L.fade[3]))
  ctx.fillStyle = g
  ctx.fillRect(x - r, y - r, r * 2, r * 2)
  ctx.globalCompositeOperation = 'source-over'
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k

/**
 * 빛은 하나다. 스크롤하면 올해의 계를 떠나 아래로 내려가 아카이브의 중심이 된다.
 * y: 올해의 중심(위로 떠나는 CY)과 아카이브의 중심(아래에서 떠오르는 자리) 사이를 카메라와 같은 비율로 옮긴다.
 *    둘 다 화면 높이 CY0에서 만나므로, 화면에서는 빛이 제자리에 머물고 그 둘레의 궤도만 바뀌어 간다.
 * m: 0이면 올해의 빛, 1이면 아카이브의 빛. 모양도 이 값으로 함께 바뀐다.
 */
export function lightPos(st: HomeState) {
  const m = st.camF
  return { y: lerp(st.CY, st.CY0 + st.SP - st.cam, m), m }
}

export function drawCenterLight(st: HomeState) {
  const { ctx, S, CX, TH, t } = st
  const L = TH.light
  const { y, m } = lightPos(st)
  // 올해: 실선 원 70, 점선 원 96, 빛줄기 / 아카이브: 실선 원 64, 빛줄기 없음
  ctx.strokeStyle = rgba(L.ring, lerp(L.ring[3], 0.8, m))
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(CX, y, lerp(70, 64, m) * S, 0, Math.PI * 2); ctx.stroke()
  if (m < 0.99) {
    ctx.save()
    ctx.setLineDash([1, 4])
    ctx.strokeStyle = rgba(TH.ringDash, TH.ringDash[3] * (1 - m))
    ctx.beginPath(); ctx.arc(CX, y, lerp(96, 64, m) * S, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
  }
  lightAt(st, CX, y, lerp(18, 16, m), lerp(L.glow[3], 0.45, m))
  const flare = L.flare[3] * (0.85 + 0.15 * Math.sin(t * 3.1)) * (1 - m)
  if (flare > 0.005) {
    ctx.globalCompositeOperation = 'lighter'
    const fw = lerp(110, 64, m) * S, fh = lerp(50, 30, m) * S
    let g = ctx.createLinearGradient(CX - fw, 0, CX + fw, 0)
    g.addColorStop(0, rgba(L.flare, 0)); g.addColorStop(0.5, rgba(L.flare, flare)); g.addColorStop(1, rgba(L.flare, 0))
    ctx.fillStyle = g
    ctx.fillRect(CX - fw, y - 0.7, fw * 2, 1.4)
    g = ctx.createLinearGradient(0, y - fh, 0, y + fh)
    g.addColorStop(0, rgba(L.flare, 0)); g.addColorStop(0.5, rgba(L.flare, flare)); g.addColorStop(1, rgba(L.flare, 0))
    ctx.fillStyle = g
    ctx.fillRect(CX - 0.7, y - fh, 1.4, fh * 2)
    ctx.globalCompositeOperation = 'source-over'
  }
}
