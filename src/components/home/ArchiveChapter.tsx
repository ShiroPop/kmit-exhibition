import type { RefObject } from 'react'
import { Link } from 'react-router'

export interface YearItem {
  year: number
  record: string
}

interface Props {
  years: YearItem[]
  active: number
  /** 캔버스가 지시선을 그을 자리 */
  anchors: RefObject<(HTMLElement | null)[]>
  onPick: (n: number | null) => void
}

/** 스크롤 끝의 "지나온 궤도" 블록과 최근 다섯 해 목록 */
export function ArchiveChapter({ years, active, anchors, onPick }: Props) {
  return (
    <>
      <div className="absolute bottom-24 left-page-x grid max-w-115 grid-cols-[10px_auto] gap-x-4 max-tab:right-page-x max-tab:bottom-16 max-tab:max-w-none max-tab:grid-cols-[6px_auto] max-tab:gap-x-2.5">
        <div className="row-span-5 mt-1 h-15.5 bg-ink max-tab:h-11.5" />
        <h2
          // Todo: leading-[1.1] — display-section 토큰 행간은 1.35
          id="h-archive"
          className="col-start-2 mb-3 text-display-section leading-[1.1]"
        >
          지나온 궤도
        </h2>
        <p
          // Todo: leading-[1.55] — body-s 토큰 행간은 1.8
          className="col-start-2 text-body-s leading-[1.55]"
        >
          SECTION 2 · 아카이브 — 지난 해의 항성들
        </p>
        <p
          // Todo: leading-[1.55] — body-s 토큰 행간은 1.8
          className="col-start-2 text-body-s leading-[1.55]"
        >
          최근 다섯 해 · 그 이전은 아카이브에
        </p>
        <p
          // Todo: leading-[1.8] — caption 토큰 행간은 1.7 / max-tab:text-[11px] — 모바일 caption 크기는 디자인 시스템에 없음
          className="col-start-2 mt-4.5 text-caption leading-[1.8] max-tab:mt-3 max-tab:text-[11px]"
        >
          올해의 항성이 앞으로 나아가면, 그 아래에서 지나온 해들이 떠오른다.
          <br />
          한 해의 별들이 모여 행성 하나가 되고, 그 행성이 돌며 궤도를 남긴다.
          <br />
          궤도 하나가 한 해. 해를 고르면 그 해의 전시로 갑니다.
        </p>
        <Link
          to="/archive"
          className="pointer-events-auto col-start-2 mt-6 inline-flex min-h-11 items-center justify-self-start border border-ink px-4.5 text-body-s text-ink no-underline hover:bg-ink hover:text-paper max-tab:mt-3.5 max-tab:min-h-10"
        >
          아카이브 전체 보기
        </Link>
      </div>

      <ol
        aria-label="지난 전시"
        className="pointer-events-auto absolute top-1/2 right-24 grid -translate-y-1/2 grid-cols-[10px_64px_auto] gap-x-2.5 gap-y-1 max-tab:hidden"
      >
        {years.map((y, n) => (
          <li key={y.year} className="col-span-full grid grid-cols-subgrid">
            <Link
              ref={(el) => { anchors.current[n] = el }}
              to={`/archive#y${y.year}`}
              data-active={n === active ? '' : undefined}
              onMouseEnter={() => onPick(n)}
              onFocus={() => onPick(n)}
              onMouseLeave={() => onPick(null)}
              onBlur={() => onPick(null)}
              className="group col-span-full grid min-h-11 grid-cols-subgrid items-baseline py-1.5 text-ink-dim no-underline data-active:text-ink"
            >
              <span className="size-1.25 self-center rounded-round bg-current" />
              <b
                // Todo: tracking-[-0.01em] — heading 토큰에는 자간 없음
                className="text-heading tracking-[-0.01em] group-data-active:font-semibold"
              >
                {y.year}
              </b>
              <span className="font-mono text-mono-micro">
                관측 기록 {y.record}
                <br />
                전시 보기
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
