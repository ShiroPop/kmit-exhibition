import { NavLink } from 'react-router'

const items = [
  { to: '/', label: 'HOME', end: true },
  { to: '/intro', label: 'INTRO' },
  { to: '/works', label: 'WORKS' },
  { to: '/archive', label: 'ARCHIVE' },
]

/** 주 메뉴. 두 테마 모두 어두운 면(night) 위에 둔다. */
export function Nav() {
  return (
    <nav
      aria-label="주 메뉴"
      className="sticky top-0 z-30 flex h-nav-height items-center gap-10 border-b border-night-ink/25 bg-night px-page-x text-night-ink max-tab:gap-5"
    >
      <ul className="flex gap-9 max-tab:gap-4.5">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center text-nav no-underline ${isActive ? 'nav-arc text-nav-current' : ''}`
              }
            >
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <span
        // Todo: tracking-[0.06em] — README의 로고 KMIT 자간 0.06em, 토큰은 없음
        className="ml-auto text-nav tracking-[0.06em]"
      >
        KMIT
      </span>
    </nav>
  )
}
