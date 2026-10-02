import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";

export function ArtistScrollToTop() {
  const [isScrolledFar, setIsScrolledFar] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    return (
      typeof document !== "undefined" &&
      (document.documentElement.classList.contains("menu-open") ||
        document.body.classList.contains("menu-open"))
    );
  });

  useEffect(() => {
    const handleScroll = () => {
      // Appear once the user scrolls down into the portfolio/artist content
      const shouldShow = window.scrollY > 220;
      setIsScrolledFar(shouldShow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const isVisible = isScrolledFar && !isMenuOpen;

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Smooth scroll back to top using eased curve
    smoothScrollTo("top");
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          id="artist-back-to-top"
          onClick={handleClick}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          aria-label="Scroll to top"
          className="fixed right-5 min-[390px]:right-6 sm:right-7 bottom-6 min-[390px]:bottom-7 sm:bottom-8 z-30 md:hidden p-2 min-[390px]:p-2.5 flex items-center justify-center bg-transparent border-none cursor-pointer outline-none select-none touch-manipulation text-black active:opacity-70"
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
