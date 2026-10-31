// 해마다 바뀌지 않는 이름들. 연도나 전시명은 넣지 않는다.
export const site = {
  school: '경민IT고등학교',
  department: '의료디자인과',
  keywords: ['궤도', '끌림', '이탈'],
} as const

export const siteTitle = site.keywords.join(' · ')
