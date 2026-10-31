import { useEffect, useEffectEvent, useRef, type RefObject } from 'react'

interface Scene {
  destroy(): void
}

interface Props<T extends Scene> {
  /** 캔버스를 받아 장면을 만든다. 마운트될 때 한 번만 부른다. */
  create: (canvas: HTMLCanvasElement) => T
  /** 만든 장면을 바깥에서 부를 수 있게 */
  sceneRef?: RefObject<T | null>
  className?: string
}

/** 궤도 장면을 React 밖에서 돌린다. 프레임은 장면이 직접 그리고, React는 붙였다 떼기만 한다. */
export function OrbitCanvas<T extends Scene>({ create, sceneRef, className }: Props<T>) {
  const ref = useRef<HTMLCanvasElement>(null)
  const make = useEffectEvent(create)

  useEffect(() => {
    const scene = make(ref.current!)
    if (sceneRef) sceneRef.current = scene
    return () => {
      scene.destroy()
      if (sceneRef) sceneRef.current = null
    }
  }, [sceneRef])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
