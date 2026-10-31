import { rgba } from '../../math'
import type { Blob, HomeState } from './state'

// 종이, 색 번짐, 하프톤, 그레인

function tile(ctx: CanvasRenderingContext2D, fn: (d: Uint8ClampedArray, i: number, r: number) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  const img = g.createImageData(256, 256)
  for (let i = 0; i < img.data.length; i += 4) fn(img.data, i, Math.random())
  g.putImageData(img, 0, 0)
  return ctx.createPattern(c, 'repeat')
}

export function createGrain(ctx: CanvasRenderingContext2D) {
  return {
    dark: tile(ctx, (d, i, r) => { const v = 255 - Math.pow(r, 2.2) * 200; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255 }),
    light: tile(ctx, (d, i, r) => { d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.pow(r, 6) * 255 }),
  }
}

export function drawPaper(st: HomeState) {
  const { ctx, TH, W, H } = st
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.fillStyle = rgba(TH.paper, 1)
  ctx.fillRect(0, 0, W, H)
}

/** 따뜻한 빛은 머리 쪽에, 짙은 보라는 궤도가 지나온 아래쪽에 */
export function drawAtmosphere(st: HomeState): Blob[] {
  const { ctx, TH, CX, CY, S, H, W, t } = st
  const A = TH.atmo
  const blobs: Blob[] = [
    { c: A.peach, x: CX + 140 * S, y: CY + 360 * S, r: 330 * S, cx: 0, cy: 0, a: 0 },
    { c: A.orange, x: CX + 30 * S, y: CY + 130 * S, r: 360 * S, cx: 0, cy: 0, a: 0 },
    { c: A.core, x: CX, y: CY, r: 210 * S, cx: 0, cy: 0, a: 0 },
    { c: A.deep2, x: CX + 60 * S, y: H + 40 * S, r: 320 * S, dark: true, cx: 0, cy: 0, a: 0 },
    { c: A.deep, x: CX - 330 * S, y: H - 120 * S, r: 400 * S, dark: true, cx: 0, cy: 0, a: 0 },
  ]
  blobs.forEach((b, k) => {
    const x = b.x + Math.sin(t * 0.18 + k * 1.7) * 18 * S, y = b.y + Math.cos(t * 0.15 + k) * 14 * S
    b.cx = x; b.cy = y; b.a = b.c[3]
    const g = ctx.createRadialGradient(x, y, 0, x, y, b.r)
    g.addColorStop(0, rgba(b.c, b.a)); g.addColorStop(0.45, rgba(b.c, b.a * 0.55)); g.addColorStop(1, rgba(b.c, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  })
  return blobs
}

/** 지나온 길을 따라서만 까는 망점 */
export function drawHalftone(st: HomeState, blobs: Blob[]) {
  const { ctx, TH, CX, CY, S, H, t } = st
  const gs = 10 * S, mxc = CX - 80 * S, myc = CY + 360 * S, ca = Math.cos(-0.7), sa = Math.sin(-0.7)
  const lightPath = new Path2D(), darkPath = new Path2D()
  const darks = blobs.filter((b) => b.dark)
  for (let x = mxc - 520 * S; x < mxc + 520 * S; x += gs) {
    for (let y = myc - 420 * S; y < Math.min(H, myc + 420 * S); y += gs) {
      const du = (x - mxc) / S, dv = (y - myc) / S
      const ru = du * ca - dv * sa, rv = du * sa + dv * ca
      const m = Math.exp(-(ru * ru / 90000 + rv * rv / 36000) * 1.4)
      if (m < 0.05) continue
      let pw = 0
      for (const d of darks) { const ex = x - d.cx, ey = y - d.cy; pw += d.a * Math.exp(-(ex * ex + ey * ey) / (d.r * d.r) * 2.2) }
      const wave = 0.85 + 0.15 * Math.sin(x * 0.02 + y * 0.012 - t * 1.2)
      const r = gs * 0.5 * Math.pow(m, 0.8) * (0.5 + 0.5 * Math.min(1, pw * 1.6)) * wave
      if (r < 0.35) continue
      const path = pw > 0.32 ? lightPath : darkPath
      path.moveTo(x + r, y)
      path.arc(x, y, r, 0, Math.PI * 2)
    }
  }
  ctx.fillStyle = rgba(TH.halftone.light, TH.halftone.light[3]); ctx.fill(lightPath)
  ctx.fillStyle = rgba(TH.halftone.dark, TH.halftone.dark[3]); ctx.fill(darkPath)
}

export function drawGrain(st: HomeState) {
  const { ctx, TH, W, H, grain } = st
  ctx.save()
  const jitter = st.reduce || st.still ? 0 : 1
  ctx.translate(-Math.random() * 256 * jitter, -Math.random() * 256 * jitter)
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = TH.grain.dark
  if (grain.dark) { ctx.fillStyle = grain.dark; ctx.fillRect(0, 0, W + 512, H + 512) }
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = TH.grain.light
  if (grain.light) { ctx.fillStyle = grain.light; ctx.fillRect(0, 0, W + 512, H + 512) }
  ctx.restore()
}
