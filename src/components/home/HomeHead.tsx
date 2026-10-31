import { recordLabel, recordNo } from '../../content/derived'
import { site, siteTitle } from '../../content/site'

/** 왼쪽 위 제목 블록 */
export function HomeHead() {
  return (
    <div className="absolute top-13 left-page-x grid grid-cols-[10px_auto] gap-x-4 max-tab:top-5.5 max-tab:grid-cols-[6px_auto] max-tab:gap-x-2.5">
      <div className="row-span-4 mt-7 h-15.5 bg-ink max-tab:mt-6 max-tab:h-11.5" />
      <h1
        // Todo: leading-none — display-section 토큰 행간은 1.35
        className="col-start-2 mb-2.5 text-display-section leading-none max-tab:mb-2"
      >
        {siteTitle}
      </h1>
      <p
        // Todo: leading-[1.55] — body-s 토큰 행간은 1.8 / max-tab:text-[11px] — 모바일 body-s 크기는 디자인 시스템에 없음
        className="col-start-2 text-body-s leading-[1.55] max-tab:text-[11px]"
      >
        SECTION 1 · 궤도 — 열두 개의 교과
      </p>
      <p
        // Todo: leading-[1.55] — body-s 토큰 행간은 1.8 / max-tab:text-[11px] — 모바일 body-s 크기는 디자인 시스템에 없음
        className="col-start-2 text-body-s leading-[1.55] max-tab:text-[11px]"
      >
        {site.school} {site.department} · 관측 기록 {recordLabel(recordNo)}
      </p>
      <p
        // Todo: leading-[1.55] — body-s 토큰 행간은 1.8 / max-tab:text-[11px] — 모바일 body-s 크기는 디자인 시스템에 없음
        className="col-start-2 text-body-s leading-[1.55] max-tab:text-[11px]"
      >
        model: orbit — 중심이 나아가는 동안, 그 둘레를 도는 궤도
      </p>
    </div>
  )
}

/** 축척, 세로 글, 쪽 번호 등 데스크톱에만 있는 도면 주석 */
export function HomeMarginalia() {
  return (
    <div className="max-tab:hidden">
      <p
        // Todo: text-[11px] leading-[1.8] — 맞는 글자 토큰 없음 (가까운 것: caption 12px/1.7)
        className="absolute top-[54%] left-page-x text-[11px] leading-[1.8]"
      >
        중심은 한 방향으로 나아가고, 궤도는 그 둘레를 돌며 뒤로 감긴다.
        <br />
        같은 자리를 도는 것 같아도, 실은 이미 한 칸 위에 있다.
        <br />
        궤도를 벗어난 선은 점선이 되어, 그대로 자기 길로 이어진다.
      </p>
      <p
        // Todo: text-[14px] tracking-[0.04em] — 맞는 글자 토큰 없음 (가까운 것: body 14px/2)
        className="absolute right-16 bottom-30 text-[14px] tracking-[0.04em] [text-orientation:sideways] [writing-mode:vertical-rl]"
      >
        PROJECT · {siteTitle} — {site.school} {site.department}
      </p>
      <div className="absolute right-24 bottom-16.5 flex flex-col items-end gap-2.5 font-mono text-mono-micro text-ink-dim">
        <div className="flex items-end" aria-hidden="true">
          {[0, 1, 2, 3].map((k) => (
            <i key={k} className="block h-1 w-6.5 bg-ink even:-translate-y-1" />
          ))}
        </div>
        <span className="flex w-26 justify-between">
          <span>0</span>
          <span>1년</span>
          <span>3년</span>
        </span>
      </div>
      <p className="absolute right-24 bottom-3 text-body-s">01</p>
    </div>
  )
}
