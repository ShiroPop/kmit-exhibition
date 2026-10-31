import type { Vec3 } from './math'

/** 홈과 작품 히어로: 약간 위에서 내려다본 각도 */
export const ELEV_HOME = 0.3
/** 인트로 아이콘 */
export const ELEV_ICON = 0.32

/** 정사영: x는 그대로, y와 z를 고도각만큼 돌린다. 원근이 없어 3D 렌더처럼 보이지 않는다. */
export function makeView(elev: number) {
  const ce = Math.cos(elev), se = Math.sin(elev)
  return (p: Vec3): Vec3 => [p[0], p[1] * ce + p[2] * se, -p[1] * se + p[2] * ce]
}
