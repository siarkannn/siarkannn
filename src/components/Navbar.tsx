import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTransitionCtx } from "@/context/TransitionContext";
import { smoothScrollTo, smoothScrollToY } from "@/hooks/useSmoothScroll";
import { KanLogoK } from "@/components/KanLogoK";

function RubikNavText({
  text,
  color = "text-[#DDDDDD]",
  className = "",
  isActive = false,
}: {
  text: string;
  color?: string;
  className?: string;
  isActive?: boolean;
}) {
  const isWhite = color === "text-white";
  return (
    <span
      className={`relative inline-block overflow-hidden h-[1.2em] leading-[1.2em] select-none align-middle pointer-events-none ${className}`}
      style={{
        contain: "paint",
        isolation: "isolate",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "geometricPrecision",
      }}
    >
      <span
        className={`flex flex-col w-full text-left items-start transition-transform duration-[680ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isActive ? "-translate-y-1/2" : "translate-y-0"
        } group-hover:-translate-y-1/2`}
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transformOrigin: "top left",
          WebkitTransformOrigin: "top left",
        }}
      >
        <span
          className={`block w-full h-[1.2em] leading-[1.2em] text-left whitespace-nowrap ${color}`}
          style={{
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {text}
        </span>
        <span
          aria-hidden="true"
          className={`block w-full h-[1.2em] leading-[1.2em] text-left whitespace-nowrap ${
            isWhite ? "text-white/90" : "text-[#DDDDDD]/90"
          }`}
          style={{
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          }}
        >
          {text}
        </span>
      </span>
    </span>
  );
}

export function Navbar({
  currentPath,
  isPagePresent = true,
}: {
  currentPath?: string;
  isPagePresent?: boolean;
} = {}) {
  const [liveLocation, navigate] = useLocation();
  // Freeze route on initial mount so exiting navbar never morphs or jumps mid-transition
  const [frozenRoute] = useState(() => currentPath || liveLocation);
  const currentRoute = currentPath || frozenRoute;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => {
    return typeof window !== "undefined" ? window.scrollY > 80 : false;
  });
  const [visible, setVisible] = useState(true);
  const [isTransitionPaused, setIsTransitionPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeTouchNav, setActiveTouchNav] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const rafRef = useRef<number | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchNavTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollTarget } = useTransitionCtx();

  // Close mobile menu whenever active route transitions
  useEffect(() => {
    if (!isPagePresent) return;
    setMenuOpen(false);
  }, [liveLocation, isPagePresent]);

  // Keep navbar visible and locked during page transitions
  useEffect(() => {
    if (!isPagePresent) return;
    setIsTransitionPaused(true);
    setVisible(true);
    if (typeof window !== "undefined") {
      lastScrollY.current = window.scrollY;
    }
    const timer = setTimeout(() => {
      setIsTransitionPaused(false);
      if (typeof window !== "undefined") {
        lastScrollY.current = window.scrollY;
      }
    }, 850);
    return () => clearTimeout(timer);
  }, [currentRoute, scrollTarget, isPagePresent]);

  const activeRoute = currentRoute;
  const isKan = activeRoute === "/" || activeRoute === "/kan";
  const isWorkDetail =
    activeRoute.startsWith("/work/") && activeRoute.length > 6;
  const isWorkActive =
    activeRoute === "/work" ||
    activeRoute === "/works" ||
    isWorkDetail;
  const isArtistActive = activeRoute === "/artist";
  const isAboutActive = activeRoute === "/about";

  const handleWork = () => {
    setMenuOpen(false);
    if (!isWorkActive) {
      try {
        sessionStorage.setItem("kan_active_route", "/work");
      } catch (e) {}
      navigate("/work");
    } else {
      smoothScrollToY(0);
    }
  };

  const handleKan = () => {
    setMenuOpen(false);
    if (!isKan) {
      try {
        sessionStorage.setItem("kan_active_route", "/");
      } catch (e) {}
      navigate("/");
    } else {
      smoothScrollToY(0);
    }
  };

  const handleArtist = () => {
    setMenuOpen(false);
    if (!isArtistActive) {
      try {
        sessionStorage.setItem("kan_active_route", "/artist");
      } catch (e) {}
      navigate("/artist");
    } else {
      smoothScrollToY(0);
    }
  };

  const handleAbout = () => {
    setMenuOpen(false);
    if (!isAboutActive) {
      try {
        sessionStorage.setItem("kan_active_route", "/about");
      } catch (e) {}
      navigate("/about");
    } else {
      smoothScrollToY(0);
    }
  };

  const handleMobileNavClick = (target: "work" | "kan" | "artist" | "about") => {
    setSelectedItem(target);
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      if (target === "work") handleWork();
      else if (target === "kan") handleKan();
      else if (target === "artist") handleArtist();
      else if (target === "about") handleAbout();

      setTimeout(() => {
        setSelectedItem(null);
      }, 300);
    }, 120);
  };

  // Reset selected state when menu closes
  useEffect(() => {
    if (!menuOpen) {
      setSelectedItem(null);
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  // ─── RAF-throttled scroll listener ───────────────────────────────────────
  useEffect(() => {
    if (!isPagePresent) return;
    const onScroll = () => {
      if (menuOpen || isTransitionPaused) return; // ignore scroll while menu is open or transitioning
      if (rafRef.current !== null) return; // already queued
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (isTransitionPaused) return;
        const currentY = window.scrollY;
        setScrolled(currentY > 80);

        if (currentY <= 2) {
          setVisible(true);
        } else if (currentY > lastScrollY.current + 4) {
          // require 4px threshold to suppress micro-jitter
          setVisible(false);
        }
        lastScrollY.current = currentY;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [menuOpen, isTransitionPaused, isPagePresent]);

  // ─── Touch interaction handlers for Mobile Homepage Navigation ────────────
  const handleNavTouchStart = (item: string) => {
    if (touchNavTimeoutRef.current) clearTimeout(touchNavTimeoutRef.current);
    setActiveTouchNav(item);
  };

  const handleNavTouchEnd = (item: string) => {
    if (touchNavTimeoutRef.current) clearTimeout(touchNavTimeoutRef.current);
    touchNavTimeoutRef.current = setTimeout(() => {
      setActiveTouchNav((current) => (current === item ? null : current));
    }, 680);
  };

  const handleNavTouchCancel = () => {
    if (touchNavTimeoutRef.current) clearTimeout(touchNavTimeoutRef.current);
    setActiveTouchNav(null);
  };

  const handleKanNavClick = (target: "work" | "artist" | "about") => {
    if (touchNavTimeoutRef.current) clearTimeout(touchNavTimeoutRef.current);
    setActiveTouchNav(target);

    if (target === "work") {
      handleWork();
      touchNavTimeoutRef.current = setTimeout(() => {
        setActiveTouchNav((current) => (current === "work" ? null : current));
      }, 500);
    } else if (target === "artist") {
      handleArtist();
      touchNavTimeoutRef.current = setTimeout(() => {
        setActiveTouchNav((current) => (current === "artist" ? null : current));
      }, 500);
    } else if (target === "about") {
      handleAbout();
      touchNavTimeoutRef.current = setTimeout(() => {
        setActiveTouchNav((current) => (current === "about" ? null : current));
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (touchNavTimeoutRef.current) clearTimeout(touchNavTimeoutRef.current);
    };
  }, []);

  // Lock scroll and hide grey scrollbar indicator/thumb when mobile menu is open (matching Artist page)
  useEffect(() => {
    if (menuOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyTouchAction = document.body.style.touchAction;
      const originalHtmlTouchAction = document.documentElement.style.touchAction;
      const lockedScrollY = window.scrollY;

      // Add menu-open class to html and body
      document.documentElement.classList.add("menu-open");
      document.body.classList.add("menu-open");

      // Inject scoped style tag to preserve black scrollbar track while hiding grey thumb
      let styleTag = document.getElementById("menu-open-scrollbar-lock") as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "menu-open-scrollbar-lock";
        styleTag.innerHTML = `
          html.menu-open, body.menu-open {
            scrollbar-color: transparent #000000 !important;
          }
          html.menu-open::-webkit-scrollbar,
          body.menu-open::-webkit-scrollbar {
            background-color: #000000 !important;
          }
          html.menu-open::-webkit-scrollbar-track,
          body.menu-open::-webkit-scrollbar-track {
            background-color: #000000 !important;
          }
          html.menu-open::-webkit-scrollbar-thumb,
          body.menu-open::-webkit-scrollbar-thumb,
          ::-webkit-scrollbar-thumb {
            display: none !important;
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            visibility: hidden !important;
          }
        `;
        document.head.appendChild(styleTag);
      }

      // Keep html overflow-y: scroll so the black container track remains without layout shift
      document.documentElement.style.overflowY = "scroll";
      
      // Allow multi-touch gestures like pinch-to-zoom on html and body matching the rest of the app
      document.body.style.touchAction = "manipulation";
      document.documentElement.style.touchAction = "manipulation";

      let isPinching = false;

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 1) {
          isPinching = true;
        }
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (!e.touches || e.touches.length <= 1) {
          setTimeout(() => {
            if (!e.touches || e.touches.length <= 1) {
              isPinching = false;
            }
          }, 150);
        }
      };

      const onGestureStart = () => {
        isPinching = true;
      };

      const onGestureEnd = () => {
        setTimeout(() => {
          isPinching = false;
        }, 150);
      };

      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchEnd, { passive: true });
      window.addEventListener("gesturestart", onGestureStart, { passive: true });
      window.addEventListener("gesturechange", onGestureStart, { passive: true });
      window.addEventListener("gestureend", onGestureEnd, { passive: true });

      const preventDefaultScroll = (e: TouchEvent | WheelEvent) => {
        if (isPinching) return;
        if ("touches" in e && e.touches.length > 1) {
          isPinching = true;
          return;
        }
        // Allow natural panning when visual viewport is zoomed
        if (window.visualViewport && window.visualViewport.scale > 1.01) {
          return;
        }
        if ("ctrlKey" in e && (e.ctrlKey || e.metaKey)) {
          return; // Trackpad pinch-to-zoom (ctrl+wheel)
        }
        // Prevent background vertical page scroll on 1-finger swipe when not zoomed
        e.preventDefault();
      };
      window.addEventListener("touchmove", preventDefaultScroll, { passive: false });
      window.addEventListener("wheel", preventDefaultScroll, { passive: false });

      const scrollKeys = new Set([
        "Space",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ]);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMenuOpen(false);
          return;
        }
        if (scrollKeys.has(e.code) || scrollKeys.has(e.key)) {
          e.preventDefault();
        }
      };
      window.addEventListener("keydown", handleKeyDown, { passive: false });

      const handleScrollLock = () => {
        if (isPinching) return;
        if (window.visualViewport && window.visualViewport.scale > 1.01) {
          return; // Allow natural navigation during and after pinch-to-zoom
        }
        if (window.scrollY !== lockedScrollY) {
          window.scrollTo({ top: lockedScrollY, behavior: "instant" });
        }
      };
      window.addEventListener("scroll", handleScrollLock, { passive: true });

      return () => {
        document.documentElement.classList.remove("menu-open");
        document.body.classList.remove("menu-open");
        const existingTag = document.getElementById("menu-open-scrollbar-lock");
        if (existingTag) {
          existingTag.remove();
        }

        document.body.style.overflow = originalBodyOverflow;
        document.body.style.touchAction = originalBodyTouchAction;
        document.documentElement.style.touchAction = originalHtmlTouchAction;
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
        window.removeEventListener("gesturestart", onGestureStart);
        window.removeEventListener("gesturechange", onGestureStart);
        window.removeEventListener("gestureend", onGestureEnd);
        window.removeEventListener("touchmove", preventDefaultScroll);
        window.removeEventListener("wheel", preventDefaultScroll);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("scroll", handleScrollLock);
      };
    }
  }, [menuOpen]);

  return (
    <>
      <header
        style={{
          pointerEvents: !isPagePresent ? "none" : (menuOpen || visible ? "auto" : "none"),
          transform: menuOpen || visible || isTransitionPaused ? "translate3d(0, 0, 0)" : "translate3d(0, -100%, 0)",
          WebkitTransform: menuOpen || visible || isTransitionPaused ? "translate3d(0, 0, 0)" : "translate3d(0, -100%, 0)",
          transition: isTransitionPaused || !isPagePresent ? "none" : "transform 300ms cubic-bezier(0, 0, 0.2, 1)",
          WebkitTransition: isTransitionPaused || !isPagePresent ? "none" : "-webkit-transform 300ms cubic-bezier(0, 0, 0.2, 1)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform",
        }}
        className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? "bg-transparent py-4" : "bg-transparent py-0"}`}
      >
        <nav
          className={`relative z-10 max-w-full transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isKan
              ? "w-full grid grid-cols-3 items-center px-9 min-[390px]:px-12 min-[430px]:px-16 sm:px-20 md:px-12 pt-5 pb-3 md:py-7"
              : isAboutActive || isArtistActive
              ? "flex items-center justify-between px-8 min-[390px]:px-9 sm:px-10 md:px-12 py-7"
              : "flex items-center justify-between px-7 min-[390px]:px-8 sm:px-9 md:px-12 py-7"
          }`}
          aria-label="Main navigation"
        >
          {isKan ? (
            /* Layout for KAN homepage: Work (left), Artist (center), About (right) evenly distributed */
            <>
              <div className="flex items-center justify-start">
                <button
                  onClick={() => handleKanNavClick("work")}
                  onTouchStart={() => handleNavTouchStart("work")}
                  onTouchEnd={() => handleNavTouchEnd("work")}
                  onTouchCancel={handleNavTouchCancel}
                  aria-label="Open Work page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm select-none transition-colors duration-200"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RubikNavText text="Work" color="text-[#DDDDDD]" isActive={activeTouchNav === "work"} />
                </button>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => handleKanNavClick("artist")}
                  onTouchStart={() => handleNavTouchStart("artist")}
                  onTouchEnd={() => handleNavTouchEnd("artist")}
                  onTouchCancel={handleNavTouchCancel}
                  aria-label="Open Artist page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm select-none transition-colors duration-200"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RubikNavText text="Artist" color="text-[#DDDDDD]" isActive={activeTouchNav === "artist"} />
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => handleKanNavClick("about")}
                  onTouchStart={() => handleNavTouchStart("about")}
                  onTouchEnd={() => handleNavTouchEnd("about")}
                  onTouchCancel={handleNavTouchCancel}
                  aria-label="Open About page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm select-none transition-colors duration-200"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RubikNavText text="About" color="text-[#DDDDDD]" isActive={activeTouchNav === "about"} />
                </button>
              </div>
            </>
          ) : (
            /* Default Layout for other pages (Work, Artist, About, WorkDetail): KAN (left), Work Artist About grouped (right on desktop), hamburger on mobile */
            <>
              {/* Left corner: Brand Logo (mobile + desktop) */}
              <div className="flex items-center pl-0">
                <button
                  onClick={handleKan}
                  aria-label="Open KAN page"
                  className="group text-white cursor-pointer bg-transparent border-none p-0 outline-none flex items-center justify-center focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm"
                >
                  <KanLogoK className="h-[27px] min-[390px]:h-[29px] sm:h-[32px] md:h-[36px] lg:h-[38px] w-auto text-white transition-opacity duration-200 group-hover:opacity-80" />
                </button>
              </div>

              {/* Right corner (Desktop): Work, Artist, About with fluid responsive scaling */}
              <div className="hidden md:flex items-center gap-8 lg:gap-9 xl:gap-10 ml-auto">
                <button
                  onClick={handleWork}
                  aria-label="Open Work page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[20px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm transition-colors duration-200"
                >
                  <RubikNavText text="Work" color={isWorkActive ? "text-white" : "text-[#DDDDDD]"} />
                </button>
                <button
                  onClick={handleArtist}
                  aria-label="Open Artist page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[20px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm transition-colors duration-200"
                >
                  <RubikNavText text="Artist" color={isArtistActive ? "text-white" : "text-[#DDDDDD]"} />
                </button>
                <button
                  onClick={handleAbout}
                  aria-label="Open About page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[20px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm transition-colors duration-200"
                >
                  <RubikNavText text="About" color={isAboutActive ? "text-white" : "text-[#DDDDDD]"} />
                </button>
              </div>

              {/* Mobile menu trigger with morphing Hamburger-to-X */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                className="group/burger md:hidden relative z-50 text-white bg-transparent border-none w-10 h-10 p-0 outline-none focus:outline-none select-none cursor-pointer touch-manipulation flex items-center justify-end shrink-0"
                style={{
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div className="relative w-[24px] h-[14px] pointer-events-none">
                  {/* Top Line */}
                  <span
                    className={`absolute left-0 top-[6px] w-full h-[2px] bg-white transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center will-change-transform transform-gpu ${
                      menuOpen
                        ? "translate-y-0 rotate-45"
                        : "-translate-y-[6px] group-hover/burger:-translate-y-[8px]"
                    }`}
                    style={{
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    }}
                  />
                  {/* Middle Line */}
                  <span
                    className={`absolute left-0 top-[6px] w-full h-[2px] bg-white transition-opacity duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                      menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                    style={{
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    }}
                  />
                  {/* Bottom Line */}
                  <span
                    className={`absolute left-0 top-[6px] w-full h-[2px] bg-white transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center will-change-transform transform-gpu ${
                      menuOpen
                        ? "translate-y-0 -rotate-45"
                        : "translate-y-[6px] group-hover/burger:translate-y-[8px]"
                    }`}
                    style={{
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    }}
                  />
                </div>
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Mobile Menu Overlay - high-performance blur, ultra-smooth exit without layout contention */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-nav-overlay"
            className="fixed inset-0 z-40 md:hidden flex flex-col justify-center select-none"
            style={{
              touchAction: "manipulation",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(36px)",
              WebkitBackdropFilter: "blur(36px)",
              isolation: "isolate",
            }}
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                return; // Allow trackpad pinch-to-zoom (ctrl+wheel)
              }
              e.preventDefault();
              e.stopPropagation();
            }}
            initial={{
              x: "8%",
              opacity: 0,
            }}
            animate={{
              x: "0%",
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.18,
                ease: "easeOut",
              },
            }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1], // Expo.easeOut matching weareabove.space
            }}
          >
            {/* Subtle Clean Translucent Gradient Atmosphere */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 90% 70% at 95% 50%, rgba(255, 255, 255, 0.06) 0%, transparent 65%)",
              }}
            />

            {/* Center-Vertically & Right-Aligned Menu Items - shifted close to right edge with balanced scale */}
            <div
              className="relative z-10 w-full pl-6 pr-3.5 min-[390px]:pr-4 sm:pr-6 flex flex-col items-end gap-4 sm:gap-5"
              style={{
                touchAction: "manipulation",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              <button
                onClick={() => handleMobileNavClick("work")}
                onTouchStart={() => setSelectedItem("work")}
                onPointerDown={() => setSelectedItem("work")}
                aria-label="Open Work page"
                className={`relative group bg-transparent border-none p-0 font-gotham font-medium text-[30px] min-[390px]:text-[32px] sm:text-[36px] leading-none tracking-[-0.03em] text-right cursor-pointer flex flex-col items-end touch-manipulation outline-none ${
                  isWorkActive ? "text-white" : "text-[#DDDDDD]"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span className="block">Work</span>
                <span
                  className={`block w-full h-[2px] ${
                    isWorkActive ? "bg-white" : "bg-[#DDDDDD]"
                  } transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] mt-[2px] sm:mt-[2.5px] ${
                    selectedItem === "work"
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-active:origin-left group-active:scale-x-100"
                  }`}
                />
              </button>

              <button
                onClick={() => handleMobileNavClick("artist")}
                onTouchStart={() => setSelectedItem("artist")}
                onPointerDown={() => setSelectedItem("artist")}
                aria-label="Open Artist page"
                className={`relative group bg-transparent border-none p-0 font-gotham font-medium text-[30px] min-[390px]:text-[32px] sm:text-[36px] leading-none tracking-[-0.03em] text-right cursor-pointer flex flex-col items-end touch-manipulation outline-none ${
                  isArtistActive ? "text-white" : "text-[#DDDDDD]"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span className="block">Artist</span>
                <span
                  className={`block w-full h-[2px] ${
                    isArtistActive ? "bg-white" : "bg-[#DDDDDD]"
                  } transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] mt-[2px] sm:mt-[2.5px] ${
                    selectedItem === "artist"
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-active:origin-left group-active:scale-x-100"
                  }`}
                />
              </button>

              <button
                onClick={() => handleMobileNavClick("about")}
                onTouchStart={() => setSelectedItem("about")}
                onPointerDown={() => setSelectedItem("about")}
                aria-label="Open About page"
                className={`relative group bg-transparent border-none p-0 font-gotham font-medium text-[30px] min-[390px]:text-[32px] sm:text-[36px] leading-none tracking-[-0.03em] text-right cursor-pointer flex flex-col items-end touch-manipulation outline-none ${
                  isAboutActive ? "text-white" : "text-[#DDDDDD]"
                }`}
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span className="block">About</span>
                <span
                  className={`block w-full h-[2px] ${
                    isAboutActive ? "bg-white" : "bg-[#DDDDDD]"
                  } transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] mt-[2px] sm:mt-[2.5px] ${
                    selectedItem === "about"
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-active:origin-left group-active:scale-x-100"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
