import { archive } from './archive'
import { students } from './students'
import { subjects } from './subjects'

// 원본 데이터에서 계산되는 값. 여기 있는 숫자는 손으로 적지 않는다.

export const pad2 = (n: number) => String(n).padStart(2, '0')

export const studentsIn = (subjectId: string) => students.filter((s) => s.subjects.includes(subjectId))

export const subjectsWithCount = subjects.map((s) => ({ ...s, students: studentsIn(s.id).length }))

/** 올해의 관측 기록 번호: 지난 기록 다음 번호 */
export const recordNo = archive.reduce((n, y) => Math.max(n, y.record), 0) + 1
export const recordLabel = (n: number) => `No.${pad2(n)}`

/** 홈에 나오는 최근 다섯 해(가까운 해부터) */
export const recentYears = [...archive].sort((a, b) => b.year - a.year).slice(0, 5)

export const graduates = students.filter((s) => s.grade === 3).length
