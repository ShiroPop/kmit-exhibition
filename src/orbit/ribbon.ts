import { add, cross, mul, rgba, sub, type Vec2, type Vec3 } from './math'
import type { BandColors } from './palette'

// 종이 띠 한 줄을 그릴 조각으로 나눈다. 그리기는 draw/에서 한다.
// 띠는 폭이 일정하다(가운데가 부풀지 않는다). 앞면과 뒷면이 바뀌는 자리에서 조각을 끊어 두 톤으로 칠한다.

export interface Chunk {
  /** 깊이: 작을수록 먼저(뒤에) 그린다 */
  z: number
  s0: number
  k: number
  A: Vec2[]
  B: Vec2[]
  line: boolean
  fill: string
  stroke: string
}

export interface RibbonInput {
  /** 투영된 중심선, 머리(0)부터 꼬리까지 */
  pts: Vec3[]
  /** 투영된 궤도면 법선 */
  Nv: Vec3
  /** 띠 반폭 */
  w: number
  toScreen: (q: Vec3, k: number) => Vec2
  colors: BandColors
  line: boolean
  /** 조각 최대 길이(점 수) */
  split: number
  /** 머리에서의 거리(0–1)에 따른 투명도 */
  alpha: (age: number) => number
}

export function ribbonChunks(o: RibbonInput, out: Chunk[]) {
  const { pts, Nv, w, toScreen, colors, line, split, alpha } = o
  const K = pts.length - 1
  const A: Vec2[] = [], B: Vec2[] = [], face: boolean[] = []
  const off = mul(Nv, w)
  for (let k = 0; k <= K; k++) {
    A.push(toScreen(add(pts[k], off), k))
    B.push(toScreen(sub(pts[k], off), k))
    if (k < K) face.push(cross(sub(pts[k], pts[k + 1]), Nv)[2] >= 0)
  }
  let s0 = 0
  for (let k = 1; k <= K; k++) {
    if (k === K || face[k] !== face[s0] || k - s0 >= split) {
      const al = alpha(((s0 + k) / 2) / K)
      let z = 0
      for (let q = s0; q <= k; q++) z += pts[q][2]
      z /= k - s0 + 1
      out.push({ z, s0, k, A, B, line, fill: rgba(face[s0] ? colors.f : colors.b, al * 0.88), stroke: rgba(colors.s, al * 0.9) })
      s0 = k
    }
  }
}
