import { useEffect } from "react";
import { KanHero } from "@/components/KanHero";
import { KanWork } from "@/components/KanWork";
import { KanFooter } from "@/components/KanFooter";
import { useTransitionCtx } from "@/context/TransitionContext";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";
import {
  getIsInitialAppLoad,
  restoreScrollForPath,
  resetScrollForPath,
} from "@/utils/scrollRestoration";

export function KanPage() {
  const { consumeScrollTarget } = useTransitionCtx();

  useEffect(() => {
    const isInitial = getIsInitialAppLoad();
    const target = consumeScrollTarget();
    if (target) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      const timer = setTimeout(() => {
        smoothScrollTo(target);
      }, 1010);
      return () => clearTimeout(timer);
    } else if (isInitial) {
      restoreScrollForPath("/");
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      resetScrollForPath("/");
    }
  }, [consumeScrollTarget]);

  return (
    <>
      <KanHero />
      <KanWork />
      <KanFooter />
    </>
  );
}

export default KanPage;
