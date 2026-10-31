/** 궤도 띠의 모양: 따뜻한 띠, 보라 띠, 선 하나 */
export type BandStyle = 'warm' | 'deep' | 'line'

export type Grade = 2 | 3

export interface Subject {
  /** 두 자리 번호. 주소와 앵커에 쓴다(/works#s01). */
  id: string
  name: string
  grade: Grade
  band: BandStyle
  /** 이 수업에서 무엇을 배우고 어떤 작업을 했는지, 두 줄 정도 */
  intro: string
}

export interface Student {
  id: string
  name: string
  grade: Grade
  /** 들은 교과의 id. 한 학생이 여러 교과에 들어갈 수 있다. */
  subjects: string[]
}

export interface Work {
  id: string
  title: string
  subject: string
  /** 팀 작품이면 여러 명 */
  students: string[]
  images: string[]
}

/** 지난 해 한 번의 기록 */
export interface PastYear {
  year: number
  /** 관측 기록 번호(No.01부터) */
  record: number
  graduates: number
}
