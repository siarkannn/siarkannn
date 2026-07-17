import { useRef, useCallback, useEffect } from "react";

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeInOutQuart(t: number): number {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSmoothScroll() {
  const rafRef        = useRef<number | null>(null);
  const isScrollingRef = useRef(false);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (isScrollingRef.current) {
      document.body.style.willChange = "";
      isScrollingRef.current = false;
    }
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  useEffect(() => {
    const interrupt = () => { if (isScrollingRef.current) cancel(); };
    window.addEventListener("wheel",      interrupt, { passive: true });
    window.addEventListener("touchmove",  interrupt, { passive: true });
    return () => {
      window.removeEventListener("wheel",     interrupt);
      window.removeEventListener("touchmove", interrupt);
    };
  }, [cancel]);

  const scrollToY = useCallback((targetY: number, onComplete?: () => void) => {
    const startY  = window.scrollY;
    const distance = Math.abs(targetY - startY);
    if (distance < 1) {
      onComplete?.();
      return;
    }

    cancel();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
      onComplete?.();
      return;
    }

    const duration = Math.min(Math.max(distance / 900, 0.88), 2.0) * 1000;
    const startTime = performance.now();
    isScrollingRef.current = true;
    document.body.style.willChange = "scroll-position";

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawT    = Math.min(elapsed / duration, 1);
      const y = lerp(startY, targetY, easeInOutQuart(rawT));

      window.scrollTo(0, y);

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, targetY);
        document.body.style.willChange = "";
        isScrollingRef.current = false;
        rafRef.current = null;
        onComplete?.();
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [cancel]);

  const scrollTo = useCallback((id: string, onComplete?: () => void) => {
    if (id === "top") {
      scrollToY(0, onComplete);
      return;
    }

    const element = document.getElementById(id);
    if (!element) {
      onComplete?.();
      return;
    }

    const targetY = Math.round(
      element.getBoundingClientRect().top + window.scrollY
    );

    const wrappedComplete = () => {
      element.setAttribute("tabindex", "-1");
      element.focus({ preventScroll: true });
      onComplete?.();
    };

    scrollToY(targetY, wrappedComplete);
  }, [scrollToY]);

  return { scrollTo, scrollToY, cancel, isScrollingRef };
}
