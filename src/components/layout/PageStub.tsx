import { site } from '../../content/site'

/** 아직 만들지 않은 페이지 자리 */
export function PageStub({ title, label }: { title: string; label: string }) {
  return (
    <main className="grid-plus mx-auto min-h-[calc(100dvh-var(--spacing-nav-height))] max-w-page-max px-page-x py-section-y">
      <span className="crop-marks" />
      <p className="mb-10 flex items-baseline gap-3">
        <b className="text-label">{title}</b>
        <span className="font-mono text-mono-label text-ink-dim">{label}</span>
      </p>
      <p className="text-body text-ink-dim">
        {site.school} {site.department} · 이 페이지는 준비 중입니다.
      </p>
    </main>
  )
}
