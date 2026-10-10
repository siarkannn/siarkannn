import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";

export function ArtistScrollToTop() {
  const [location] = useLocation();
  const [isScrolledFar, setIsScrolledFar] = useState(() => {
    if (typeof window === "undefined") return false;
    return (window.scrollY || document.documentElement.scrollTop || 0) > 200;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastTriggerTime = useRef(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Sync scroll detection on window scroll
  useEffect(() => {
    const handleScroll = () => {
      const curY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolledFar(curY > 200);

      // If user is actively scrolling the page, the mobile menu cannot be open
      const isMenuActuallyOpen =
        typeof document !== "undefined" &&
        (document.documentElement.classList.contains("menu-open") ||
          document.body.classList.contains("menu-open"));
      if (!isMenuActuallyOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // When location changes (e.g. switching between Artist and More Work multiple times),
  // immediately ensure isMenuOpen is reset to false and check scroll position
  useEffect(() => {
    setIsMenuOpen(false);
    const checkScroll = () => {
      const curY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolledFar(curY > 200);
    };
    checkScroll();
    const timer = setTimeout(checkScroll, 250);
    return () => clearTimeout(timer);
  }, [location]);

  // Listen to mobile menu open/close events to smoothly hide and show
  useEffect(() => {
    const handleMenuChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ open: boolean }>;
      setIsMenuOpen(Boolean(customEvent.detail?.open));
    };

    window.addEventListener("kan-mobile-menu-change", handleMenuChange);
    return () => {
      window.removeEventListener("kan-mobile-menu-change", handleMenuChange);
    };
  }, []);

  const isMenuActuallyOpen =
    isMenuOpen &&
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("menu-open") ||
      document.body.classList.contains("menu-open"));

  const isVisible = isScrolledFar && !isMenuActuallyOpen;

  const handleScrollToTop = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = Date.now();
    if (now - lastTriggerTime.current < 400) return;
    lastTriggerTime.current = now;

    smoothScrollTo("top");
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (e.touches && e.touches[0]) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (touchStartPos.current && e.changedTouches && e.changedTouches[0]) {
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartPos.current.x);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartPos.current.y);
      touchStartPos.current = null;
      if (dx > 20 || dy > 20) {
        return; // User was performing a scroll swipe, not a tap
      }
    }
    e.preventDefault();
    handleScrollToTop(e);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          id="artist-back-to-top"
          onClick={handleScrollToTop}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          aria-label="Scroll to top"
          className="fixed right-5 min-[390px]:right-6 sm:right-7 bottom-6 min-[390px]:bottom-7 sm:bottom-8 z-[38] md:hidden p-2 min-[390px]:p-2.5 flex items-center justify-center bg-transparent border-none cursor-pointer outline-none select-none touch-manipulation text-black active:opacity-70"
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Exact polygon geometry matching weareabove.space back-to-top chevron - Pure Black */}
          <svg
            version="1.1"
            id="artist-scroll-arrow-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 53 20"
            className="w-[42px] min-[360px]:w-[46px] min-[390px]:w-[50px] h-auto pointer-events-none"
          >
            <polygon
              points="43.886,16.221 42.697,17.687 26.5,4.731 10.303,17.688 9.114,16.221 26.5,2.312"
              fill="#000000"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
