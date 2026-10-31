import { useSyncExternalStore } from 'react'

export type Theme = 'cream' | 'black'

const KEY = 'theme'
const root = () => document.documentElement
const read = (): Theme => (root().dataset.theme === 'black' ? 'black' : 'cream')

/** 첫 그리기 전에 부른다: ?theme=black > 지난번 고른 테마 > 크림 */
export function initTheme() {
  let t: string | null = new URLSearchParams(location.search).get('theme')
  if (t !== 'black' && t !== 'cream') {
    try { t = localStorage.getItem(KEY) } catch { t = null }
  }
  root().dataset.theme = t === 'black' ? 'black' : 'cream'
}

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(root(), { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'cream' as Theme)
  const setTheme = (t: Theme) => {
    root().dataset.theme = t
    try { localStorage.setItem(KEY, t) } catch { /* 저장이 막혀 있어도 테마는 바뀐다 */ }
  }
  return [theme, setTheme] as const
}
