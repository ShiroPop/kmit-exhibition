import type { Subject } from './types'

// [자리 표시] 학교에서 교과 목록을 받으면 이름과 소개를 바꾼다.
// band 순서는 띠와 선이 번갈아 나오도록 홈 시안의 순서를 따른다.
export const subjects: Subject[] = [
  { id: '01', name: '[교과명 1]', grade: 2, band: 'line', intro: '[교과 소개]' },
  { id: '02', name: '[교과명 2]', grade: 2, band: 'warm', intro: '[교과 소개]' },
  { id: '03', name: '[교과명 3]', grade: 2, band: 'line', intro: '[교과 소개]' },
  { id: '04', name: '[교과명 4]', grade: 2, band: 'deep', intro: '[교과 소개]' },
  { id: '05', name: '[교과명 5]', grade: 2, band: 'line', intro: '[교과 소개]' },
  { id: '06', name: '[교과명 6]', grade: 2, band: 'warm', intro: '[교과 소개]' },
  { id: '07', name: '[교과명 7]', grade: 3, band: 'line', intro: '[교과 소개]' },
  { id: '08', name: '[교과명 8]', grade: 3, band: 'warm', intro: '[교과 소개]' },
  { id: '09', name: '[교과명 9]', grade: 3, band: 'deep', intro: '[교과 소개]' },
  { id: '10', name: '[교과명 10]', grade: 3, band: 'line', intro: '[교과 소개]' },
  { id: '11', name: '[교과명 11]', grade: 3, band: 'warm', intro: '[교과 소개]' },
  { id: '12', name: '[교과명 12]', grade: 3, band: 'line', intro: '[교과 소개]' },
]
