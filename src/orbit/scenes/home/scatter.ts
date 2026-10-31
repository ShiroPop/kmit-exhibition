import { rgba, sstep } from '../../math'
import type { HomeState } from './state'

/** 올해의 학생들: 행성에서 툭 터져 나와 화면 밖으로 각자 떠난다 */
export function drawScatter(st: HomeState) {
  const { ctx, S, W, H, CX, CY, P, TH, heads, planets } = st
  const kOut = sstep(0.05, 0.45, P)
  if (kOut <= 0.001 || kOut >= 0.999) return
  for (const s of st.stars) {
    const h0 = heads[s.i] ?? [CX, CY]
    const pop = Math.min(1, kOut * 6) // 터짐
    const fly = Math.pow(Math.max(0, kOut - 0.08) / 0.92, 1.6) // 그리고 계속 나아감
    const d = (30 + 50 * s.kd) * S * pop + W * 0.9 * (0.6 + s.kd) * fly
    const x = h0[0] + Math.cos(s.kick) * d, y = h0[1] + Math.sin(s.kick) * d
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue
    const style = planets[s.i].style
    const col = style === 'line' ? TH.ink : TH.band[style].f
    // 가장자리에서 사라지지 않고, 가는 길에 옅어진다
    const edge = Math.min(x, W - x, y, H - y) / (160 * S)
    ctx.globalAlpha = Math.max(0, Math.min(1, 1 - Math.pow(fly, 0.7), edge))
    ctx.fillStyle = rgba(col, 0.92)
    ctx.beginPath(); ctx.arc(x, y, s.r * S * (1 + 0.6 * (1 - Math.abs(pop * 2 - 1))), 0, Math.PI * 2); ctx.fill()
    // 빠른 별 뒤의 짧은 꼬리
    if (fly > 0.02) {
      const bx = h0[0] + Math.cos(s.kick) * d * 0.9, by = h0[1] + Math.sin(s.kick) * d * 0.9
      ctx.strokeStyle = rgba(col, 0.35)
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}
