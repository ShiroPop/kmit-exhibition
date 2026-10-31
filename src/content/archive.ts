import type { PastYear } from './types'

// 지난 해의 기록. 한 해가 끝나면 올해를 맨 위에 더한다.
// 홈에는 최근 다섯 해만 나오고, 그 이전은 아카이브 페이지에서 본다.
// [자리 표시] 졸업생 수는 실제 기록으로 바꾼다.
export const archive: PastYear[] = [
  { year: 2025, record: 5, graduates: 81 },
  { year: 2024, record: 4, graduates: 75 },
  { year: 2023, record: 3, graduates: 81 },
  { year: 2022, record: 2, graduates: 79 },
  { year: 2021, record: 1, graduates: 84 },
]
