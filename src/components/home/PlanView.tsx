import type { Ref } from "react";

/**
 * 평면도(위에서 본 궤도)의 자리. 그림은 홈 캔버스가 이 상자의 가운데에, 상자 폭에 맞춰 그린다.
 * 옮기려면 left/bottom을, 크기를 바꾸려면 w/h를 고치면 된다. 라벨은 상자 위에 붙어 함께 움직인다.
 */
export function PlanView({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="absolute bottom-10 left-14 size-55 max-tab:hidden">
      <p className="absolute bottom-full left-4 text-body-s whitespace-nowrap">평면 — 위에서 본 궤도</p>
    </div>
  );
}
