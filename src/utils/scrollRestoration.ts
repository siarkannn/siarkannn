/**
 * scrollRestoration.ts
 *
 * Robust, flicker-free scroll position & route preservation across browser refreshes
 * for desktop and mobile devices.
 */

let isInitialAppLoad = true;
let isRestoringScroll = false;
let userHasInteracted = false;
let isInitialized = false;

export function getIsInitialAppLoad(): boolean {
  return isInitialAppLoad;
}

export function markAppInitialLoadComplete(): void {
  isInitialAppLoad = false;
}

export function getIsRestoringScroll(): boolean {
  return isRestoringScroll;
}

/**
 * Initializes global scroll listeners and ensures history.scrollRestoration is manual
 * to prevent the browser from clobbering scroll position prematurely.
 */
export function initScrollRestoration(): void {
  if (typeof window === "undefined" || isInitialized) return;
  isInitialized = true;

  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch (e) {}

  const saveCurrentScroll = () => {
    // If we are currently restoring scroll on refresh, do NOT overwrite with 0 or intermediate values!
    if (isRestoringScroll) return;

    try {
      const loc = window.location.pathname.replace(/\/+$/, "") || "/";
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // If initial load is still in progress and scrollY is 0, never wipe existing saved scroll
      if (isInitialAppLoad && scrollY <= 0) {
        return;
      }

      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );
      const winHeight = window.innerHeight || 0;
      const maxScroll = Math.max(0, docHeight - winHeight);
      const isAtBottom = maxScroll > 80 && scrollY >= maxScroll - 40;

      sessionStorage.setItem(`kan_scroll_${loc}`, String(scrollY));
      sessionStorage.setItem(`kan_at_bottom_${loc}`, isAtBottom ? "true" : "false");
      sessionStorage.setItem("kan_active_route", loc);
      sessionStorage.setItem("kan_session_active", "true");
    } catch (e) {}
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          saveCurrentScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  // Desktop & mobile lifecycle hooks
  window.addEventListener("beforeunload", saveCurrentScroll);
  window.addEventListener("pagehide", saveCurrentScroll);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveCurrentScroll();
    }
  });

  // Synchronize active route on browser history traversal (back/forward)
  window.addEventListener("popstate", () => {
    try {
      const loc = window.location.pathname.replace(/\/+$/, "") || "/";
      sessionStorage.setItem("kan_active_route", loc);
    } catch (e) {}
  });

  // Track if user genuinely initiates a scroll gesture (wheel, touch swipe, or scroll keys)
  let startTouchY = 0;
  window.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches[0]) {
        startTouchY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) {
        const delta = Math.abs(e.touches[0].clientY - startTouchY);
        if (delta > 8) {
          userHasInteracted = true;
          isRestoringScroll = false;
        }
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) > 2) {
        userHasInteracted = true;
        isRestoringScroll = false;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "keydown",
    (e) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space", "Home", "End"].includes(e.key)) {
        userHasInteracted = true;
        isRestoringScroll = false;
      }
    },
    { passive: true }
  );

  // Attempt early synchronous restoration for current path as soon as script runs
  const currentLoc = window.location.pathname.replace(/\/+$/, "") || "/";
  restoreScrollForPath(currentLoc);
}

/**
 * Restores the saved scroll position for the current path if this was an initial load / refresh.
 * Preserves exact bottom position if the user was at the bottom of the page.
 */
export function restoreScrollForPath(path: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const loc = path.replace(/\/+$/, "") || "/";
    const saved = sessionStorage.getItem(`kan_scroll_${loc}`);
    const wasAtBottom = sessionStorage.getItem(`kan_at_bottom_${loc}`) === "true";

    if (saved !== null) {
      const targetY = parseFloat(saved);
      if (!isNaN(targetY) && (targetY > 0 || wasAtBottom)) {
        isRestoringScroll = true;

        const getTargetPosition = () => {
          const docHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
            document.documentElement.offsetHeight,
            document.body.offsetHeight
          );
          const winHeight = window.innerHeight || 0;
          const maxScroll = Math.max(0, docHeight - winHeight);

          if (wasAtBottom) {
            return maxScroll;
          }
          return Math.min(targetY, maxScroll);
        };

        const performScroll = () => {
          if (userHasInteracted) return;
          const desired = getTargetPosition();
          window.scrollTo({ top: desired, left: 0, behavior: "instant" as ScrollBehavior });
          if (document.documentElement) document.documentElement.scrollTop = desired;
          if (document.body) document.body.scrollTop = desired;
        };

        // 1. Instant execution
        performScroll();

        // 2. High-frequency RAF loop for layout settling (1.5 seconds)
        // As asynchronous web fonts, images, and video planes calculate height,
        // this keeps the scroll locked exactly at the bottom or target position.
        const startTime = Date.now();
        const duration = 1500;

        const loop = () => {
          if (userHasInteracted) {
            isRestoringScroll = false;
            return;
          }

          performScroll();

          if (Date.now() - startTime < duration) {
            requestAnimationFrame(loop);
          } else {
            isRestoringScroll = false;
          }
        };

        requestAnimationFrame(loop);

        // 3. Asset and font load triggers
        if (typeof document !== "undefined" && "fonts" in document) {
          document.fonts.ready
            .then(() => {
              if (!userHasInteracted) performScroll();
            })
            .catch(() => {});
        }

        window.addEventListener(
          "load",
          () => {
            if (!userHasInteracted) performScroll();
          },
          { once: true }
        );

        // Backup intervals
        setTimeout(performScroll, 40);
        setTimeout(performScroll, 100);
        setTimeout(performScroll, 220);
        setTimeout(performScroll, 450);
        setTimeout(performScroll, 800);
        setTimeout(performScroll, 1200);

        return true;
      }
    }
  } catch (e) {}

  return false;
}

/**
 * Resets saved scroll for a path when freshly navigated to.
 */
export function resetScrollForPath(path: string): void {
  try {
    const loc = path.replace(/\/+$/, "") || "/";
    sessionStorage.setItem(`kan_scroll_${loc}`, "0");
    sessionStorage.setItem(`kan_at_bottom_${loc}`, "false");
  } catch (e) {}
}

/**
 * Retrieves the saved route from sessionStorage if this was a refresh/reload,
 * preventing unexpected bounce back to homepage inside iframes or on page reloads.
 */
export function resolveSavedRoute(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const current = window.location.pathname.replace(/\/+$/, "") || "/";
    const saved = sessionStorage.getItem("kan_active_route");

    // Only restore if current path is root ('/' or '/kan') and saved path is a valid sub-route
    if ((current === "/" || current === "/kan") && saved && saved !== "/" && saved !== "/kan") {
      let isReload = false;
      try {
        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        if (nav && nav.type === "reload") isReload = true;
        if ((window.performance as any)?.navigation?.type === 1) isReload = true;
      } catch (e) {}

      const inIframe = window.self !== window.top;

      if (isReload || inIframe) {
        return saved;
      }
    }
  } catch (e) {}

  return null;
}

