import type { Chunk } from '../ribbon'

/** 띠 조각을 깊이 순서로 칠한다. 선 궤도는 한쪽 가장자리만 긋는다. */
export function drawChunks(ctx: CanvasRenderingContext2D, chunks: Chunk[]) {
  chunks.sort((a, b) => a.z - b.z)
  for (const c of chunks) {
    if (!c.line) {
      ctx.fillStyle = c.fill
      ctx.beginPath()
      ctx.moveTo(c.A[c.s0][0], c.A[c.s0][1])
      for (let q = c.s0 + 1; q <= c.k; q++) ctx.lineTo(c.A[q][0], c.A[q][1])
      for (let q = c.k; q >= c.s0; q--) ctx.lineTo(c.B[q][0], c.B[q][1])
      ctx.closePath()
      ctx.fill()
    }
    ctx.strokeStyle = c.stroke
    ctx.lineWidth = c.line ? 1 : 0.8
    ctx.beginPath()
    ctx.moveTo(c.A[c.s0][0], c.A[c.s0][1])
    for (let q = c.s0 + 1; q <= c.k; q++) ctx.lineTo(c.A[q][0], c.A[q][1])
    if (!c.line) {
      ctx.moveTo(c.B[c.s0][0], c.B[c.s0][1])
      for (let q = c.s0 + 1; q <= c.k; q++) ctx.lineTo(c.B[q][0], c.B[q][1])
    }
    ctx.stroke()
  }
}

export function arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, size = 9) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x - size * Math.cos(ang - 0.42), y - size * Math.sin(ang - 0.42))
  ctx.lineTo(x - size * Math.cos(ang + 0.42), y - size * Math.sin(ang + 0.42))
  ctx.closePath()
  ctx.fill()
}

/** 이탈: 궤도를 벗어나는 빨간 점선 호와 화살촉 */
export function redArc(ctx: CanvasRenderingContext2D, color: string, cx: number, cy: number, rx: number, ry: number, a0: number, a1: number) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 1.5
  ctx.setLineDash([2, 5])
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, a0, a1, a1 < a0)
  ctx.stroke()
  ctx.setLineDash([])
  const x = cx + rx * Math.cos(a1), y = cy + ry * Math.sin(a1)
  const dir = a1 > a0 ? 1 : -1
  arrowHead(ctx, x, y, Math.atan2(ry * Math.cos(a1) * dir, -rx * Math.sin(a1) * dir))
  ctx.restore()
}

/** 추적 괄호: 사각형과 대각선 하나 */
export function trackBox(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.strokeRect(x - r, y - r, r * 2, r * 2)
  ctx.beginPath()
  ctx.moveTo(x - r, y + r)
  ctx.lineTo(x + r, y - r)
  ctx.stroke()
}
