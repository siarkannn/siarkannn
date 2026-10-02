import { useRef, useCallback, useEffect } from "react";

// ─── Easing ──────────────────────────────────────────────────────────────────

// Exact expo.inOut curve matching GSAP easing from weareabove.space
export function easeInOutExpo(t: number): number {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

export function easeInOutQuart(t: number): number {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function getDocumentScrollHeight(): number {
  if (typeof document === "undefined") return 0;
  return Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    document.documentElement.offsetHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.body.clientHeight
  );
}

// ─── Module-level State (persists cleanly across page/route transitions) ──────

let activeRaf: number | null = null;
let isScrolling = false;
let animationStartTime = 0;

export function getIsScrolling(): boolean {
  return isScrolling;
}

export function cancelSmoothScroll() {
  if (activeRaf !== null) {
    cancelAnimationFrame(activeRaf);
    activeRaf = null;
  }
  if (isScrolling) {
    isScrolling = false;
  }
}

// Interrupt programmatic scroll immediately on user wheel, touch, or scroll key interaction
if (typeof window !== "undefined") {
  const interrupt = () => {
    if (isScrolling) {
      cancelSmoothScroll();
    }
  };
  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchmove", interrupt, { passive: true });
  window.addEventListener("pointerdown", interrupt, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space", "Home", "End"].includes(e.code)) {
      if (isScrolling) cancelSmoothScroll();
    }
  }, { passive: true });
}

export function smoothScrollToY(
  targetY: number,
  onComplete?: () => void,
  customDuration?: number,
  isDynamicBottom?: boolean,
  customEasing?: (t: number) => number
) {
  if (typeof window === "undefined") return;

  const startY = window.scrollY;
  const distance = Math.abs(targetY - startY);

  if (distance < 2 && !isDynamicBottom) {
    window.scrollTo(0, targetY);
    onComplete?.();
    return;
  }

  cancelSmoothScroll();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const finalY = isDynamicBottom
      ? Math.max(0, getDocumentScrollHeight() - window.innerHeight)
      : targetY;
    window.scrollTo({ top: finalY, behavior: "instant" as ScrollBehavior });
    onComplete?.();
    return;
  }

  // Calibrated scrolling duration ensuring silky smooth glide across mobile & desktop
  // Exactly matches weareabove.space (0.8s duration with GSAP expo.inOut easing)
  const duration = customDuration ?? 800;
  const startTime = performance.now();
  animationStartTime = startTime;
  isScrolling = true;

  function tick(now: number) {
    const elapsed = now - startTime;
    const rawT    = Math.min(elapsed / duration, 1);

    let currentTarget = targetY;
    if (isDynamicBottom) {
      currentTarget = Math.max(0, getDocumentScrollHeight() - window.innerHeight);
    }

    const easeFn = customEasing ?? easeInOutExpo;
    const y = lerp(startY, currentTarget, easeFn(rawT));

    window.scrollTo(0, y);

    if (rawT < 1) {
      activeRaf = requestAnimationFrame(tick);
    } else {
      const finalY = isDynamicBottom
        ? Math.max(0, getDocumentScrollHeight() - window.innerHeight)
        : currentTarget;
      window.scrollTo(0, finalY);
      isScrolling = false;
      activeRaf = null;
      onComplete?.();
    }
  }

  activeRaf = requestAnimationFrame(tick);
}

export function smoothScrollTo(
  id: string,
  onComplete?: () => void,
  customDuration?: number,
  customEasing?: (t: number) => number
) {
  if (typeof window === "undefined") return;

  if (id === "top" || id === "hero") {
    // Exactly matches weareabove.space scrollToTop (0.9s duration with expo.inOut easing)
    const duration = customDuration ?? 900;
    const easing = customEasing ?? easeInOutExpo;
    smoothScrollToY(0, onComplete, duration, false, easing);
    return;
  }

  if (
    id === "work" ||
    id === "kan-intro" ||
    id === "content" ||
    id === "portfolio" ||
    id === "work-grid" ||
    id === "artist-work"
  ) {
    // Exactly matches weareabove.space scrollToContent (1.0s duration with expo.inOut easing)
    const duration = customDuration ?? 1000;
    const easing = customEasing ?? easeInOutExpo;
    let attempts = 0;
    function findAndScrollHeroContent() {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const maxScroll = Math.max(0, getDocumentScrollHeight() - window.innerHeight);
        const targetY = Math.min(maxScroll, Math.max(0, Math.round(rect.top + window.scrollY)));
        smoothScrollToY(targetY, onComplete, duration, false, easing);
      } else if (attempts < 40) {
        attempts++;
        activeRaf = requestAnimationFrame(findAndScrollHeroContent);
      } else {
        onComplete?.();
      }
    }
    findAndScrollHeroContent();
    return;
  }

  if (id === "bottom") {
    let attempts = 0;
    const checkAndScrollBottom = () => {
      const docHeight = getDocumentScrollHeight();
      const maxScroll = Math.max(0, docHeight - window.innerHeight);
      if (maxScroll > 50 || attempts >= 50) {
        smoothScrollToY(maxScroll, onComplete, customDuration ?? 800, true, customEasing ?? easeInOutExpo);
      } else {
        attempts++;
        activeRaf = requestAnimationFrame(checkAndScrollBottom);
      }
    };
    checkAndScrollBottom();
    return;
  }

  if (id === "about-contact") {
    // Exactly matches weareabove.space scrollToHash / collaborate (0.8s duration with expo.inOut easing)
    const duration = customDuration ?? 800;
    const easing = customEasing ?? easeInOutExpo;
    const targetY = Math.max(0, getDocumentScrollHeight() - window.innerHeight);
    smoothScrollToY(targetY, onComplete, duration, true, easing);
    return;
  }

  let attempts = 0;
  function findAndScroll() {
    const element = document.getElementById(id);
    if (element) {
      const rect = element.getBoundingClientRect();
      const maxScroll = Math.max(0, getDocumentScrollHeight() - window.innerHeight);
      const targetY = Math.min(maxScroll, Math.max(0, Math.round(rect.top + window.scrollY)));
      smoothScrollToY(targetY, onComplete, customDuration ?? 800, false, customEasing ?? easeInOutExpo);
    } else if (attempts < 40) {
      attempts++;
      activeRaf = requestAnimationFrame(findAndScroll);
    } else {
      onComplete?.();
    }
  }

  findAndScroll();
}

// ─── React Hook wrapper ──────────────────────────────────────────────────────

export function useSmoothScroll() {
  const isScrollingRef = useRef(false);

  const scrollTo = useCallback((id: string, onComplete?: () => void) => {
    smoothScrollTo(id, onComplete);
  }, []);

  const scrollToY = useCallback((targetY: number, onComplete?: () => void) => {
    smoothScrollToY(targetY, onComplete);
  }, []);

  const cancel = useCallback(() => {
    cancelSmoothScroll();
  }, []);

  return { scrollTo, scrollToY, cancel, isScrollingRef };
}

