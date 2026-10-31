import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { OrbitCanvas } from '../components/orbit/OrbitCanvas'
import { HomeHead, HomeMarginalia } from '../components/home/HomeHead'
import { SubjectList } from '../components/home/SubjectList'
import { ArchiveChapter } from '../components/home/ArchiveChapter'
import { PlanView } from '../components/home/PlanView'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useTheme } from '../hooks/useTheme'
import { createHomeScene, type HomeScene } from '../orbit/scenes/home'
import { recentYears, recordLabel, subjectsWithCount } from '../content/derived'
import { site } from '../content/site'

const subjectItems = subjectsWithCount.map((s) => ({ id: s.id, name: s.name, students: s.students }))
const yearItems = recentYears.map((y) => ({ year: y.year, record: recordLabel(y.record) }))

// Todo: text-[12px] font-medium — 맞는 글자 토큰 없음 (가까운 것: nav 12px/500/0.04em, caption 12px/400)
const btn = 'min-h-8 border border-ink px-3 text-[12px] font-medium text-ink aria-pressed:bg-ink aria-pressed:text-paper'

export default function Home() {
  const scene = useRef<HomeScene | null>(null)
  const homeStage = useRef<HTMLDivElement>(null)
  const archiveStage = useRef<HTMLElement>(null)
  const subjectEls = useRef<(HTMLElement | null)[]>([])
  const yearEls = useRef<(HTMLElement | null)[]>([])
  const planEl = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(3)
  const [yActive, setYActive] = useState(0)
  const [theme, setTheme] = useTheme()
  const navigate = useNavigate()

  useScrollProgress((p) => scene.current?.setProgress(p))

  const create = (canvas: HTMLCanvasElement) =>
    createHomeScene(canvas, {
      subjects: subjectsWithCount.map((s) => ({ n: s.students, band: s.band, title: s.name, sub: `교과 ${s.id} · 행성 ${s.students}` })),
      years: recentYears.map((y) => ({ title: String(y.year), sub: `관측 기록 ${recordLabel(y.record)} · 전시 보기`, count: y.graduates })),
      labels: { center: `중심 · ${site.school}`, ahead: '나아가는 방향', behind: '지나온 길' },
      subjectAnchor: (i) => subjectEls.current[i],
      yearAnchor: (n) => yearEls.current[n],
      planAnchor: () => planEl.current,
      stages: () => ({ home: homeStage.current, archive: archiveStage.current }),
      onActiveSubject: setActive,
      onActiveYear: setYActive,
      onSelectSubject: (i) => navigate(`/works#s${subjectsWithCount[i].id}`),
      onSelectYear: (n) => navigate(`/archive#y${recentYears[n].year}`),
    })

  return (
    <div className="overflow-x-clip">
      <div className="fixed inset-x-0 top-nav-height bottom-0">
        <OrbitCanvas create={create} sceneRef={scene} className="block size-full" />
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-nav-height bottom-0">
        <div ref={homeStage} className="absolute inset-0">
          <HomeHead />

          <div className="pointer-events-auto absolute top-13 right-24 flex gap-1.5 max-tab:hidden">
            <button type="button" className={btn} aria-pressed={theme === 'cream'} onClick={() => setTheme('cream')}>크림</button>
            <button type="button" className={btn} aria-pressed={theme === 'black'} onClick={() => setTheme('black')}>블랙</button>
          </div>

          <HomeMarginalia />
          <PlanView ref={planEl} />
          <SubjectList items={subjectItems} active={active} anchors={subjectEls} onPick={(i) => scene.current?.pickSubject(i)} />
          <p
            // Todo: tracking-[0.06em] — mono-micro 토큰 자간은 0.04em
            className="absolute bottom-5.5 left-1/2 -translate-x-1/2 font-mono text-mono-micro whitespace-nowrap tracking-[0.06em] text-ink-dim max-tab:bottom-6.5"
          >
            아래로 내려가면 지나온 해로 거슬러 갑니다 ↓
          </p>
        </div>

        <section ref={archiveStage} aria-labelledby="h-archive" className="invisible absolute inset-0 opacity-0">
          <ArchiveChapter years={yearItems} active={yActive} anchors={yearEls} onPick={(n) => scene.current?.pickYear(n)} />
        </section>
      </div>

      <div aria-hidden="true" className="h-[300vh]" />
    </div>
  )
}
