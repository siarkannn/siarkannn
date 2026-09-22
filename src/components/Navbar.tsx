import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTransitionCtx } from "@/context/TransitionContext";
import { smoothScrollTo, smoothScrollToY } from "@/hooks/useSmoothScroll";
import { KanLogoK } from "@/components/KanLogoK";

let globalDesktopNavClicked: string | null = null;
let globalDesktopNavClickedTime = 0;

function setGlobalDesktopNavClicked(target: string) {
  globalDesktopNavClicked = target;
  globalDesktopNavClickedTime = Date.now();
  try {
    sessionStorage.setItem("kan_desktop_clicked_nav", target);
    sessionStorage.setItem("kan_desktop_clicked_time", Date.now().toString());
  } catch (e) {}
}

function getGlobalDesktopNavClicked(): string | null {
  if (globalDesktopNavClicked && Date.now() - globalDesktopNavClickedTime < 1500) {
    return globalDesktopNavClicked;
  }
  try {
    const item = sessionStorage.getItem("kan_desktop_clicked_nav");
    const time = Number(sessionStorage.getItem("kan_desktop_clicked_time") || "0");
    if (item && Date.now() - time < 1500) {
      return item;
    }
  } catch (e) {}
  return null;
}

function clearGlobalDesktopNavClicked() {
  globalDesktopNavClicked = null;
  globalDesktopNavClickedTime = 0;
  try {
    sessionStorage.removeItem("kan_desktop_clicked_nav");
    sessionStorage.removeItem("kan_desktop_clicked_time");
  } catch (e) {}
}

function RubikNavText({
  text,
  color = "text-[#DDDDDD]",
  className = "",
  isActive = false,
  suppressClickAnimation = false,
}: {
  text: string;
  color?: string;
  className?: string;
  isActive?: boolean;
  suppressClickAnimation?: boolean;
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
        className={`flex flex-col w-full text-left items-start ${
          suppressClickAnimation
            ? "!transition-none"
            : "transition-transform duration-[680ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        } ${
          isActive ? "-translate-y-1/2" : "translate-y-0"
        } [@media(hover:hover)]:group-hover:-translate-y-1/2`}
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transformOrigin: "top left",
          WebkitTransformOrigin: "top left",
          willChange: "transform",
          ...(suppressClickAnimation ? { transition: "none" } : {}),
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
  const [visible, setVisible] = useState(true);
  const [isTransitionPaused, setIsTransitionPaused] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeTouchNav, setActiveTouchNav] = useState<string | null>(null);
  const [suppressedNav, setSuppressedNav] = useState<string | null>(() => {
    return getGlobalDesktopNavClicked();
  });
  const lastScrollY = useRef(0);
  const rafRef = useRef<number | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchNavTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollTarget } = useTransitionCtx();

  // Auto-clear suppressed desktop nav click animation state after settlement
  useEffect(() => {
    if (!suppressedNav) return;
    const timer = setTimeout(() => {
      setSuppressedNav(null);
      clearGlobalDesktopNavClicked();
    }, 1200);
    return () => clearTimeout(timer);
  }, [suppressedNav]);

  const handleDesktopNavPointerDown = (
    target: "work" | "artist" | "about",
    e?: React.PointerEvent
  ) => {
    if (e && e.pointerType === "touch") return;
    setSuppressedNav(target);
    setGlobalDesktopNavClicked(target);
  };

  const handleDesktopNavLeave = (target: "work" | "artist" | "about") => {
    if (suppressedNav === target) {
      setSuppressedNav(null);
      clearGlobalDesktopNavClicked();
    }
  };

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
    setSuppressedNav("work");
    setGlobalDesktopNavClicked("work");
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
    setSuppressedNav("artist");
    setGlobalDesktopNavClicked("artist");
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
    setSuppressedNav("about");
    setGlobalDesktopNavClicked("about");
    if (!isAboutActive) {
      try {
        sessionStorage.setItem("kan_active_route", "/about");
      } catch (e) {}
      navigate("/about");
    } else {
      smoothScrollToY(0);
    }
  };

  // ─── Touch interaction handlers for Mobile Menu Overlay Navigation ──────
  const overlayTouchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const isOverlayTouchHandledRef = useRef(false);
  const isOverlayNavigatingRef = useRef(false);
  const overlayRollDownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOverlayPointerDown = (target: "work" | "artist" | "about", e: React.PointerEvent) => {
    if (isOverlayNavigatingRef.current) return;
    if (overlayRollDownTimeoutRef.current) {
      clearTimeout(overlayRollDownTimeoutRef.current);
      overlayRollDownTimeoutRef.current = null;
    }
    overlayTouchStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    // Instantly show responsive underline animation on tap/press with zero delay
    setSelectedItem(target);
  };

  const handleOverlayTouchStart = (target: "work" | "artist" | "about", e: React.TouchEvent) => {
    if (isOverlayNavigatingRef.current) return;
    if (overlayRollDownTimeoutRef.current) {
      clearTimeout(overlayRollDownTimeoutRef.current);
      overlayRollDownTimeoutRef.current = null;
    }
    const touch = e.touches[0];
    overlayTouchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    // Immediately show responsive underline animation on touch
    setSelectedItem(target);
  };

  const handleOverlayTouchMove = (e: React.TouchEvent) => {
    if (!overlayTouchStartPos.current || isOverlayNavigatingRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - overlayTouchStartPos.current.x);
    const dy = Math.abs(touch.clientY - overlayTouchStartPos.current.y);
    if (dx > 7 || dy > 7) {
      overlayTouchStartPos.current = null;
      setSelectedItem(null);
    }
  };

  const handleOverlayTouchEnd = (target: "work" | "artist" | "about") => {
    if (isOverlayNavigatingRef.current) {
      isOverlayTouchHandledRef.current = true;
      return;
    }

    if (!overlayTouchStartPos.current) {
      setSelectedItem(null);
      return;
    }

    const elapsed = Date.now() - overlayTouchStartPos.current.time;
    overlayTouchStartPos.current = null;
    isOverlayTouchHandledRef.current = true;

    // Normal quick tap (< 250ms): "tap satu kali Pindah Halaman secara normal"
    if (elapsed < 250) {
      isOverlayNavigatingRef.current = true;
      setSelectedItem(target);

      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = setTimeout(() => {
        if (target === "work") handleWork();
        else if (target === "artist") handleArtist();
        else if (target === "about") handleAbout();

        setTimeout(() => {
          setSelectedItem(null);
          isOverlayNavigatingRef.current = false;
        }, 300);
      }, 250);
      return;
    }

    // Touch-and-hold preview (>= 250ms): "saat di tap dan ingin lepas sentuhan beberapa kali tetap muncul responsif"
    // Smoothly retract the underline when released without navigating, allowing repeated preview taps
    const delayBeforeRetract = Math.max(0, 250 - elapsed);
    if (delayBeforeRetract > 0) {
      overlayRollDownTimeoutRef.current = setTimeout(() => {
        if (!isOverlayNavigatingRef.current) {
          setSelectedItem(null);
        }
      }, delayBeforeRetract);
    } else {
      setSelectedItem(null);
    }
  };

  const handleOverlayTouchCancel = () => {
    if (isOverlayNavigatingRef.current) return;
    overlayTouchStartPos.current = null;
    if (overlayRollDownTimeoutRef.current) {
      clearTimeout(overlayRollDownTimeoutRef.current);
      overlayRollDownTimeoutRef.current = null;
    }
    setSelectedItem(null);
  };

  const handleMobileNavClick = (target: "work" | "kan" | "artist" | "about") => {
    if (isOverlayTouchHandledRef.current) {
      isOverlayTouchHandledRef.current = false;
      return;
    }
    if (isOverlayNavigatingRef.current) return;
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
    }, 250);
  };

  // Reset selected state and overlay interaction state when menu closes
  useEffect(() => {
    if (!menuOpen) {
      setSelectedItem(null);
      isOverlayNavigatingRef.current = false;
      isOverlayTouchHandledRef.current = false;
      overlayTouchStartPos.current = null;
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
      if (overlayRollDownTimeoutRef.current) clearTimeout(overlayRollDownTimeoutRef.current);
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

  // ─── Auto-hide scroll listener matching weareabove.space (Headroom.js tolerance: 5) ──────
  useEffect(() => {
    if (!isPagePresent) return;

    const TOLERANCE = 5;

    const onScroll = () => {
      if (menuOpen || isTransitionPaused) return; // ignore scroll while menu is open or transitioning
      if (rafRef.current !== null) return; // already queued in RAF

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (isTransitionPaused) return;

        const currentY = Math.round(window.scrollY);
        const prevY = lastScrollY.current;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

        // Ignore out-of-bounds overscroll bouncing (iOS Safari elastic bounce)
        if (currentY < 0) {
          setVisible(true);
          lastScrollY.current = 0;
          return;
        }
        if (currentY > maxScrollY && maxScrollY > 0) {
          return;
        }

        const distance = Math.abs(currentY - prevY);

        if (currentY <= TOLERANCE) {
          // At top of page: always pinned (visible)
          setVisible(true);
          lastScrollY.current = currentY;
        } else if (distance > TOLERANCE) {
          if (currentY > prevY) {
            // Scrolling down past tolerance: unpin (hide)
            setVisible(false);
          } else {
            // Scrolling up past tolerance: pin (show)
            setVisible(true);
          }
          lastScrollY.current = currentY;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [menuOpen, isTransitionPaused, isPagePresent]);

  // ─── Touch interaction handlers for Mobile Homepage Navigation ────────────
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const isTouchHandledRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const kanNavTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollDownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear pending timeouts and reset state when route changes
  useEffect(() => {
    isNavigatingRef.current = false;
    isTouchHandledRef.current = false;
    if (activeRoute === "/" || activeRoute === "") {
      setActiveTouchNav(null);
    }
    if (kanNavTimeoutRef.current) {
      clearTimeout(kanNavTimeoutRef.current);
      kanNavTimeoutRef.current = null;
    }
    if (rollDownTimeoutRef.current) {
      clearTimeout(rollDownTimeoutRef.current);
      rollDownTimeoutRef.current = null;
    }
  }, [liveLocation, currentPath, activeRoute]);

  useEffect(() => {
    return () => {
      if (kanNavTimeoutRef.current) clearTimeout(kanNavTimeoutRef.current);
      if (rollDownTimeoutRef.current) clearTimeout(rollDownTimeoutRef.current);
    };
  }, []);

  // Clear active touch nav if user taps elsewhere outside the KAN mobile navigation buttons
  useEffect(() => {
    const handleGlobalTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-kan-nav]")) {
        if (!isNavigatingRef.current) {
          setActiveTouchNav(null);
        }
      }
    };
    window.addEventListener("touchstart", handleGlobalTouch, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleGlobalTouch);
    };
  }, []);

  const executeKanNavigation = (target: "work" | "artist" | "about") => {
    if (target === "work") {
      handleWork();
    } else if (target === "artist") {
      handleArtist();
    } else if (target === "about") {
      handleAbout();
    }
  };

  const handleKanTouchStart = (target: "work" | "artist" | "about", e: React.TouchEvent) => {
    if (isNavigatingRef.current) return;
    if (rollDownTimeoutRef.current) {
      clearTimeout(rollDownTimeoutRef.current);
      rollDownTimeoutRef.current = null;
    }
    const touch = e.touches[0];
    const now = Date.now();
    touchStartPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now,
    };

    // Immediately trigger the smooth roll-up animation on smartphone touch
    setActiveTouchNav(target);
  };

  const handleKanTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || isNavigatingRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    // If finger moves more than 7px, it is a scroll gesture, not a tap
    if (dx > 7 || dy > 7) {
      touchStartPos.current = null;
      setActiveTouchNav(null);
    }
  };

  const handleKanTouchEnd = (target: "work" | "artist" | "about", _e?: React.TouchEvent) => {
    if (isNavigatingRef.current) {
      isTouchHandledRef.current = true;
      return;
    }

    if (!touchStartPos.current) {
      // Was cancelled by scrolling gesture
      setActiveTouchNav(null);
      return;
    }

    const now = Date.now();
    const elapsed = now - touchStartPos.current.time;
    touchStartPos.current = null;
    isTouchHandledRef.current = true;

    // Normal tap (< 250ms): "tap satu kali Pindah Halaman secara normal"
    // Trigger smooth page navigation directly
    if (elapsed < 250) {
      isNavigatingRef.current = true;
      setActiveTouchNav(target);

      kanNavTimeoutRef.current = setTimeout(() => {
        executeKanNavigation(target);
      }, 280);
      return;
    }

    // Touch-and-hold preview (>= 250ms): "saat di tap dan ingin lepas sentuhan beberapa kali tetap pertahankan"
    // When released, smoothly roll back down without navigating so user can preview repeatedly
    const delayBeforeRollDown = Math.max(0, 160 - elapsed);
    if (delayBeforeRollDown > 0) {
      rollDownTimeoutRef.current = setTimeout(() => {
        if (!isNavigatingRef.current) {
          setActiveTouchNav(null);
        }
      }, delayBeforeRollDown);
    } else {
      setActiveTouchNav(null);
    }
  };

  const handleKanTouchCancel = () => {
    if (isNavigatingRef.current) return;
    touchStartPos.current = null;
    if (rollDownTimeoutRef.current) {
      clearTimeout(rollDownTimeoutRef.current);
      rollDownTimeoutRef.current = null;
    }
    setActiveTouchNav(null);
  };

  const handleKanNavClick = (target: "work" | "artist" | "about") => {
    if (isTouchHandledRef.current) {
      // Already handled by mobile touch tap
      isTouchHandledRef.current = false;
      return;
    }
    if (isNavigatingRef.current) return;

    // Desktop mouse click: remove/suppress any text animation upon click
    setSuppressedNav(target);
    setGlobalDesktopNavClicked(target);

    // Desktop mouse click: navigate directly
    executeKanNavigation(target);
  };

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
        id="navbar-top"
        style={{
          pointerEvents: !isPagePresent ? "none" : (menuOpen || visible ? "auto" : "none"),
          transform: menuOpen || visible || isTransitionPaused ? "translate3d(0, 0, 0)" : "translate3d(0, -100%, 0)",
          WebkitTransform: menuOpen || visible || isTransitionPaused ? "translate3d(0, 0, 0)" : "translate3d(0, -100%, 0)",
          transition: isTransitionPaused || !isPagePresent ? "none" : "all 0.2s ease-out",
          WebkitTransition: isTransitionPaused || !isPagePresent ? "none" : "all 0.2s ease-out",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform",
        }}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent py-0"
      >
        <nav
          className={`relative z-10 max-w-full transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isKan
              ? "w-full grid grid-cols-3 items-center px-9 min-[390px]:px-12 min-[430px]:px-16 sm:px-20 md:px-12 pt-5 pb-3 md:py-7"
              : "flex items-center justify-between px-8 min-[390px]:px-9 sm:px-10 md:px-12 py-[22px] min-[390px]:py-[23px] md:py-7"
          }`}
          aria-label="Main navigation"
        >
          {isKan ? (
            /* Layout for KAN homepage: Work (left), Artist (center), About (right) evenly distributed */
            <>
              <div className="flex items-center justify-start">
                <button
                  data-kan-nav="true"
                  onClick={() => handleKanNavClick("work")}
                  onTouchStart={(e) => handleKanTouchStart("work", e)}
                  onTouchMove={handleKanTouchMove}
                  onTouchEnd={(e) => handleKanTouchEnd("work", e)}
                  onTouchCancel={handleKanTouchCancel}
                  onPointerDown={(e) => handleDesktopNavPointerDown("work", e)}
                  onMouseLeave={() => handleDesktopNavLeave("work")}
                  aria-label="Open Work page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm select-none transition-colors duration-200 py-2 -my-2"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RubikNavText
                    text="Work"
                    color="text-[#DDDDDD]"
                    isActive={activeTouchNav === "work"}
                    suppressClickAnimation={suppressedNav === "work"}
                  />
                </button>
              </div>

              <div className="flex items-center justify-center">
                <button
                  data-kan-nav="true"
                  onClick={() => handleKanNavClick("artist")}
                  onTouchStart={(e) => handleKanTouchStart("artist", e)}
                  onTouchMove={handleKanTouchMove}
                  onTouchEnd={(e) => handleKanTouchEnd("artist", e)}
                  onTouchCancel={handleKanTouchCancel}
                  onPointerDown={(e) => handleDesktopNavPointerDown("artist", e)}
                  onMouseLeave={() => handleDesktopNavLeave("artist")}
                  aria-label="Open Artist page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm select-none transition-colors duration-200 py-2 -my-2"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RubikNavText
                    text="Artist"
                    color="text-[#DDDDDD]"
                    isActive={activeTouchNav === "artist"}
                    suppressClickAnimation={suppressedNav === "artist"}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  data-kan-nav="true"
                  onClick={() => handleKanNavClick("about")}
                  onTouchStart={(e) => handleKanTouchStart("about", e)}
                  onTouchMove={handleKanTouchMove}
                  onTouchEnd={(e) => handleKanTouchEnd("about", e)}
                  onTouchCancel={handleKanTouchCancel}
                  onPointerDown={(e) => handleDesktopNavPointerDown("about", e)}
                  onMouseLeave={() => handleDesktopNavLeave("about")}
                  aria-label="Open About page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[19px] min-[390px]:text-[20.5px] sm:text-[22px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm select-none transition-colors duration-200 py-2 -my-2"
                  style={{
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <RubikNavText
                    text="About"
                    color="text-[#DDDDDD]"
                    isActive={activeTouchNav === "about"}
                    suppressClickAnimation={suppressedNav === "about"}
                  />
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
                  className="group text-white cursor-pointer bg-transparent border-none p-0 ml-[9px] min-[390px]:ml-[5px] sm:ml-[1px] md:ml-0 outline-none flex items-center justify-center focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm"
                >
                  <KanLogoK className="h-[27px] min-[390px]:h-[29px] sm:h-[32px] md:h-[36px] lg:h-[38px] w-auto text-white transition-opacity duration-200 group-hover:opacity-80" />
                </button>
              </div>

              {/* Right corner (Desktop): Work, Artist, About with fluid responsive scaling */}
              <div className="hidden md:flex items-center gap-8 lg:gap-9 xl:gap-10 ml-auto">
                <button
                  onClick={handleWork}
                  onPointerDown={(e) => handleDesktopNavPointerDown("work", e)}
                  onMouseLeave={() => handleDesktopNavLeave("work")}
                  aria-label="Open Work page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[20px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm transition-colors duration-200"
                >
                  <RubikNavText
                    text="Work"
                    color={isWorkActive ? "text-white" : "text-[#DDDDDD]"}
                    suppressClickAnimation={suppressedNav === "work"}
                  />
                </button>
                <button
                  onClick={handleArtist}
                  onPointerDown={(e) => handleDesktopNavPointerDown("artist", e)}
                  onMouseLeave={() => handleDesktopNavLeave("artist")}
                  aria-label="Open Artist page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[20px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm transition-colors duration-200"
                >
                  <RubikNavText
                    text="Artist"
                    color={isArtistActive ? "text-white" : "text-[#DDDDDD]"}
                    suppressClickAnimation={suppressedNav === "artist"}
                  />
                </button>
                <button
                  onClick={handleAbout}
                  onPointerDown={(e) => handleDesktopNavPointerDown("about", e)}
                  onMouseLeave={() => handleDesktopNavLeave("about")}
                  aria-label="Open About page"
                  className="group text-[#DDDDDD] cursor-pointer bg-transparent border-none p-0 outline-none font-gotham font-medium tracking-[-0.025em] text-[20px] md:text-[24px] focus-visible:ring-1 focus-visible:ring-white/60 rounded-sm transition-colors duration-200"
                >
                  <RubikNavText
                    text="About"
                    color={isAboutActive ? "text-white" : "text-[#DDDDDD]"}
                    suppressClickAnimation={suppressedNav === "about"}
                  />
                </button>
              </div>

              {/* Mobile menu trigger with morphing Hamburger-to-X */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={menuOpen}
                className="group/burger md:hidden relative z-50 text-white bg-transparent border-none w-10 h-10 p-0 mr-[9px] min-[390px]:mr-[5px] sm:mr-[1px] outline-none focus:outline-none select-none cursor-pointer touch-manipulation flex items-center justify-end shrink-0"
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
            className="fixed inset-0 z-40 md:hidden flex flex-col justify-center items-center select-none"
            style={{
              height: "100%",
              minHeight: "100dvh",
              touchAction: "manipulation",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              WebkitFontSmoothing: "antialiased",
              backgroundColor: "transparent",
              backdropFilter: "blur(55px)",
              WebkitBackdropFilter: "blur(55px)",
              isolation: "isolate",
              willChange: "transform, opacity",
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
              x: "8%",
              opacity: 0,
              transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1], // Expo.easeOut matching weareabove.space (duration: 0.7s)
            }}
          >
            {/* Center-Vertically & Right-Aligned Menu Items - shifted close to right edge with balanced scale */}
            <div
              className="relative z-10 w-full pl-6 pr-3.5 min-[390px]:pr-4 sm:pr-6 flex flex-col items-end gap-2.5 sm:gap-3.5"
              style={{
                touchAction: "manipulation",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              <button
                onClick={() => handleMobileNavClick("work")}
                onPointerDown={(e) => handleOverlayPointerDown("work", e)}
                onTouchStart={(e) => handleOverlayTouchStart("work", e)}
                onTouchMove={handleOverlayTouchMove}
                onTouchEnd={() => handleOverlayTouchEnd("work")}
                onTouchCancel={handleOverlayTouchCancel}
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
                  } transition-transform duration-[250ms] ease-out will-change-transform transform-gpu mt-[2px] sm:mt-[2.5px] ${
                    selectedItem === "work"
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-active:origin-left group-active:scale-x-100"
                  }`}
                  style={{
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                  }}
                />
              </button>

              <button
                onClick={() => handleMobileNavClick("artist")}
                onPointerDown={(e) => handleOverlayPointerDown("artist", e)}
                onTouchStart={(e) => handleOverlayTouchStart("artist", e)}
                onTouchMove={handleOverlayTouchMove}
                onTouchEnd={() => handleOverlayTouchEnd("artist")}
                onTouchCancel={handleOverlayTouchCancel}
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
                  } transition-transform duration-[250ms] ease-out will-change-transform transform-gpu mt-[2px] sm:mt-[2.5px] ${
                    selectedItem === "artist"
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-active:origin-left group-active:scale-x-100"
                  }`}
                  style={{
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                  }}
                />
              </button>

              <button
                onClick={() => handleMobileNavClick("about")}
                onPointerDown={(e) => handleOverlayPointerDown("about", e)}
                onTouchStart={(e) => handleOverlayTouchStart("about", e)}
                onTouchMove={handleOverlayTouchMove}
                onTouchEnd={() => handleOverlayTouchEnd("about")}
                onTouchCancel={handleOverlayTouchCancel}
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
                  } transition-transform duration-[250ms] ease-out will-change-transform transform-gpu mt-[2px] sm:mt-[2.5px] ${
                    selectedItem === "about"
                      ? "origin-left scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-active:origin-left group-active:scale-x-100"
                  }`}
                  style={{
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                  }}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
