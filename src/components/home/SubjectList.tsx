import type { RefObject } from 'react'
import { Link } from 'react-router'

export interface SubjectItem {
  id: string
  name: string
  students: number
}

interface Props {
  items: SubjectItem[]
  active: number
  /** 캔버스가 지시선을 그을 자리 */
  anchors: RefObject<(HTMLElement | null)[]>
  onPick: (i: number | null) => void
}

/**
 * 오른쪽 교과 목록(데스크톱). 손을 올리면 그 궤도가 강조되고, 고르면 그 교과의 작품으로 간다.
 * 교과명 칸은 subgrid라 가장 긴 이름에 맞춰 넓어진다(글자를 줄이지 않는다).
 */
export function SubjectList({ items, active, anchors, onPick }: Props) {
  return (
    <ol
      aria-label="교과 궤도"
      className="pointer-events-auto absolute top-1/2 right-24 grid -translate-y-1/2 grid-cols-[10px_26px_max-content_60px] gap-x-1.5 max-tab:hidden"
    >
      {items.map((s, i) => (
        <li key={s.id} className="col-span-full grid grid-cols-subgrid">
          <Link
            ref={(el) => { anchors.current[i] = el }}
            to={`/works#s${s.id}`}
            data-active={i === active ? '' : undefined}
            onMouseEnter={() => onPick(i)}
            onFocus={() => onPick(i)}
            onMouseLeave={() => onPick(null)}
            onBlur={() => onPick(null)}
            className="group col-span-full grid min-h-7 grid-cols-subgrid items-center text-caption text-ink-dim no-underline data-active:font-semibold data-active:text-ink"
          >
            <span className="size-1 rounded-round bg-current" />
            <span className="font-mono text-mono-micro">{s.id}</span>
            <span>{s.name}</span>
            <span className="invisible text-right font-mono text-mono-micro text-ink-dim group-data-active:visible">행성 {s.students}</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
