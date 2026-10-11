import { useState, useCallback, memo, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useIsPresent } from "framer-motion";
import { useLocation } from "wouter";
import { projects } from "@/data/projects";
import { useTransitionCtx } from "@/context/TransitionContext";
import { preloadImages } from "@/utils/preload";
import React from "react";

const categories = ["All", "Commercial", "Film & Episodic", "Music Video"];
// Matches weareabove.space:
// 1. Text filter transition: all 0.2s ease-out
// 2. Masonry filter transition: all 0.5s ease (CSS cubic-bezier(0.25, 0.1, 0.25, 1))
const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
// Refined cubic-bezier curve matching the signature fluid ease (cubic-bezier(0.16, 1, 0.3, 1))
// used across the app, ensuring silky smooth deceleration on mobile slide transitions
const SMOOTH_EASE_MOBILE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function projectSrcs(p: (typeof projects)[number]) {
  return [p.image, ...p.frames.map((f) => f.image)];
}

const ProjectCard = memo(function ProjectCard({
  project,
  onClick,
  isPagePresent,
  index = 0,
  isNavigating = false,
  isMobile = false,
  isResizing = false,
  isActiveTouch = false,
  onActivateTouch,
  isFromMusicVideoToAll = false,
  isFromFilmToAll = false,
  isFromMusicVideoToFilm = false,
  isFromFilmToMusicVideo = false,
  isFromCommercialToAll = false,
  isFromCommercialToMusicVideo = false,
  isFromAllToMusicVideo = false,
  isFromAllToFilm = false,
  activeCategory = "All",
  prevCategory = "All",
}: {
  project: (typeof projects)[0];
  onClick: (slug: string) => void;
  isPagePresent: boolean;
  index?: number;
  isNavigating?: boolean;
  isMobile?: boolean;
  isResizing?: boolean;
  isActiveTouch?: boolean;
  onActivateTouch?: (slug: string) => void;
  isFromMusicVideoToAll?: boolean;
  isFromFilmToAll?: boolean;
  isFromMusicVideoToFilm?: boolean;
  isFromFilmToMusicVideo?: boolean;
  isFromCommercialToAll?: boolean;
  isFromCommercialToMusicVideo?: boolean;
  isFromAllToMusicVideo?: boolean;
  isFromAllToFilm?: boolean;
  activeCategory?: string;
  prevCategory?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isMouseHovered, setIsMouseHovered] = useState(false);
  const [isTouchHolding, setIsTouchHolding] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isClickedRef = useRef(false);

  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartTime = useRef<number>(0);
  const isTouchScrolling = useRef<boolean>(false);
  const lastTouchEndTime = useRef<number>(0);

  // Desktop hover or active mobile touch hold (only while finger is actually touching)
  const isHovered = isMouseHovered || isTouchHolding;

  // Extract all unique images (cover + frames) in sequence
  const projectImages = useMemo(() => {
    const list = [project.image, ...project.frames.map((f) => f.image)];
    return Array.from(new Set(list));
  }, [project]);

  // Slideshow animation: smooth fade in on hover/touch, and smooth fade out back to cover on unhover/release
  // When clicked or exiting, freeze on active photo without switching back to photo 1
  useEffect(() => {
    if (isClickedRef.current || isExiting) {
      return;
    }

    if (!isPagePresent) {
      return;
    }

    if (!isHovered || projectImages.length <= 1) {
      if (!isClickedRef.current && !isExiting) {
        setCurrentIndex((curr) => {
          if (curr !== 0) {
            setPrevIndex(curr);
            return 0;
          }
          return 0;
        });
      }
      return;
    }

    // Immediately advance to start responsive slideshow with smooth fade in
    setCurrentIndex((curr) => {
      setPrevIndex(curr);
      return (curr + 1) % projectImages.length;
    });

    const interval = setInterval(() => {
      setCurrentIndex((curr) => {
        setPrevIndex(curr);
        return (curr + 1) % projectImages.length;
      });
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [isHovered, isPagePresent, isExiting, projectImages.length]);

  // Instantly reset any preview or touch state synchronously when category filter changes
  const [prevCategoryProp, setPrevCategoryProp] = useState(activeCategory);
  if (prevCategoryProp !== activeCategory) {
    setPrevCategoryProp(activeCategory);
    setCurrentIndex(0);
    setPrevIndex(0);
    setIsMouseHovered(false);
    setIsTouchHolding(false);
  }

  useEffect(() => {
    setCurrentIndex(0);
    setPrevIndex(0);
    setIsMouseHovered(false);
    setIsTouchHolding(false);
  }, [activeCategory]);

  const handleEnter = useCallback(() => {
    if (!isPagePresent || isExiting || isClickedRef.current) return;
    // Ignore synthetic mouseenter events triggered by touch on mobile devices
    if (Date.now() - lastTouchEndTime.current < 800) return;
    if (typeof window !== "undefined" && window.matchMedia && !window.matchMedia("(hover: hover)").matches) {
      return;
    }
    setIsMouseHovered(true);
    preloadImages(projectImages);
  }, [isPagePresent, isExiting, projectImages]);

  const handleLeave = useCallback(() => {
    if (isClickedRef.current || isExiting) return;
    setIsMouseHovered(false);
    setIsTouchHolding(false);
  }, [isExiting]);

  // Mobile Touch handlers:
  // Holding previews frames.
  // When hold is released, slideshow stops immediately and resets to cover with zero subsequent animation.
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isPagePresent || isExiting || isClickedRef.current) return;
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      touchStartTime.current = Date.now();
      isTouchScrolling.current = false;
      setIsTouchHolding(true);
      preloadImages(projectImages);
    },
    [isPagePresent, isExiting, projectImages]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isClickedRef.current || isExiting) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);

      // If user is scrolling the page (dragged > 10px), cancel hold & fade out to cover
      if (dx > 10 || dy > 10) {
        isTouchScrolling.current = true;
        setIsTouchHolding(false);
        setCurrentIndex((curr) => {
          if (curr !== 0) {
            setPrevIndex(curr);
            return 0;
          }
          return 0;
        });
      }
    },
    [isExiting]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      lastTouchEndTime.current = Date.now();
      if (isClickedRef.current || isExiting) return;

      // When hold is released on mobile: smoothly fade out back to cover photo with zero further slideshow animation
      setIsTouchHolding(false);
      setCurrentIndex((curr) => {
        if (curr !== 0) {
          setPrevIndex(curr);
          return 0;
        }
        return 0;
      });

      if (isTouchScrolling.current) return;

      const touch = e.changedTouches ? e.changedTouches[0] : null;
      const dx = touch ? Math.abs(touch.clientX - touchStartPos.current.x) : 0;
      const dy = touch ? Math.abs(touch.clientY - touchStartPos.current.y) : 0;
      if (dx > 10 || dy > 10) return;

      const touchDuration = Date.now() - touchStartTime.current;

      // Quick tap (< 350ms): navigate directly
      if (touchDuration < 350) {
        isClickedRef.current = true;
        setIsExiting(true);
        onClick(project.slug);
      }
    },
    [isExiting, onClick, project.slug]
  );

  const handleTouchCancel = useCallback(() => {
    lastTouchEndTime.current = Date.now();
    if (isClickedRef.current || isExiting) return;
    setIsTouchHolding(false);
    isTouchScrolling.current = false;
    setCurrentIndex((curr) => {
      if (curr !== 0) {
        setPrevIndex(curr);
        return 0;
      }
      return 0;
    });
  }, [isExiting]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Disregard synthetic click events following touch
      if (Date.now() - lastTouchEndTime.current < 600) {
        e.preventDefault();
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
        e.preventDefault();
        if (isClickedRef.current) return;
        isClickedRef.current = true;
        setIsExiting(true);
        setIsTouchHolding(false);
        onClick(project.slug);
      }
    },
    [onClick, project.slug]
  );

  const isCardPresent = useIsPresent();
  const isMobileView = isMobile || (typeof window !== "undefined" && window.innerWidth < 768);

  const isCategoryChanging = prevCategory !== activeCategory;

  const isSlideCard = project.id === 5 || project.id === 6;

  // Desktop slide: when transitioning from Commercial to All (cards 5 and 6)
  // or from Music Video to All (card 6)
  // or from Music Video to Film & Episodic (card 5)
  const isDesktopCommercialSlide =
    !isMobile && isCategoryChanging && isFromCommercialToAll && isSlideCard;

  const isDesktopMusicVideoToFilmSlide =
    !isMobile && isCategoryChanging && isFromMusicVideoToFilm && project.id === 5;

  const shouldForceDesktopSlide =
    (!isMobile && isCategoryChanging && isFromMusicVideoToAll && project.id === 6) ||
    isDesktopCommercialSlide ||
    isDesktopMusicVideoToFilmSlide;

  // Mobile slide: when transitioning from Commercial to All, cards 5 and 6 start stacked
  // over card 4 in row 4 and slide down vertically to reveal each card (FINALIZED)
  const isMobileCommercialSlide =
    isMobile && isCategoryChanging && isFromCommercialToAll && isSlideCard;

  // Mobile slide down: when transitioning to All from Film & Episodic or Music Video,
  // cards smoothly cascade down by 1 slot each without colliding
  const isMobileToAllSlide =
    isMobile && (isFromFilmToAll || isFromMusicVideoToAll);

  // Mobile stacked slide down for Commercial, Film & Episodic, and Music Video:
  // Standardized stacked downward animation matching the system ("sama ratakan juga animasi kartu bertumpuknya")
  const isMobileCategorySlide =
    isMobile &&
    activeCategory !== "All";

  const fallbackHeight =
    typeof window !== "undefined"
      ? Math.round(((Math.min(window.innerWidth, 768) - 16) * 9) / 16)
      : 210;
  const mobileSlotDist = fallbackHeight + 8;
  const mobileCommercialStartY =
    project.id === 5 ? -mobileSlotDist : -2 * mobileSlotDist;
  const mobileToAllStartY = index === 0 ? 0 : -index * mobileSlotDist;

  // Mobile start Y position:
  // - Music Video: appears from bottom to top (muncul dari bawah ke atas)
  // - From All to Film & Episodic: appears from bottom to top compactly in unison (muncul dari bawah ke atas secara kompak)
  // - Commercial, Film & Episodic (other), and All: stacked cascading slide-down from top
  const isFromAllToFilmActive =
    activeCategory === "Film & Episodic" && (isFromAllToFilm || prevCategory === "All");

  const mobileCategoryStartY =
    activeCategory === "Music Video" || isFromAllToFilmActive
      ? mobileSlotDist
      : index === 0
      ? 0
      : -index * mobileSlotDist;

  const initialX =
    isMobileToAllSlide ||
    isMobileCommercialSlide ||
    isMobileCategorySlide
      ? 0
      : isSlideCard
      ? !isMobile
        ? project.id === 5
          ? "calc(-100% - 8px)"
          : "calc(-200% - 16px)"
        : "-100%"
      : 0;

  // Curvature & Duration matching weareabove.space:
  // 0.5s transition with CSS cubic-bezier(0.25, 0.1, 0.25, 1) ease
  const slideDuration = 0.5;
  const slideEase = EASE;

  const mobileZIndex = isFromCommercialToAll
    ? project.id === 5
      ? 20
      : project.id === 6
      ? 30
      : 10
    : 10 + index * 5;

  const cardZIndex = !isMobile
    ? project.id === 6
      ? 20
      : project.id === 5
      ? 10
      : 0
    : mobileZIndex;

  return (
    <motion.a
      href={`/work/${encodeURIComponent(project.slug)}`}
      layout={
        !isCategoryChanging || isResizing || isMobile || shouldForceDesktopSlide || isMobileToAllSlide || isMobileCommercialSlide || isMobileCategorySlide
          ? false
          : isPagePresent && !isNavigating && !isExiting
          ? "position"
          : false
      }
      initial={
        isResizing
          ? false
          : isMobileToAllSlide
          ? { x: 0, y: mobileToAllStartY }
          : isMobileCommercialSlide
          ? { x: 0, y: mobileCommercialStartY }
          : isMobileCategorySlide
          ? { x: 0, y: mobileCategoryStartY }
          : !isCategoryChanging
          ? false
          : shouldForceDesktopSlide
          ? { x: initialX, y: 0 }
          : false
      }
      animate={{ x: 0, y: 0 }}
      exit={
        isMobileView
          ? {
              opacity: 0,
              transition: { duration: 0 },
            }
          : isCategoryChanging && !isResizing && isFromFilmToMusicVideo && project.id === 5
          ? {
              x: "calc(-100% - 8px)",
              transition: {
                type: "tween",
                duration: slideDuration,
                ease: slideEase,
              },
            }
          : undefined
      }
      transition={
        isResizing
          ? { duration: 0 }
          : isMobileCategorySlide || isMobileToAllSlide || isMobileCommercialSlide
          ? {
              type: "tween",
              duration: slideDuration,
              ease: slideEase,
            }
          : !isCategoryChanging
          ? { duration: 0 }
          : {
              type: "tween",
              duration: slideDuration,
              ease: slideEase,
            }
      }
      className="relative block cursor-pointer select-none no-underline text-white touch-manipulation transform-gpu [backface-visibility:hidden]"
      data-project-card={project.slug}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      draggable={false}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased",
        zIndex: cardZIndex,
        willChange: isMobile ? "transform" : "auto",
        ...(isMobileView && !isCardPresent
          ? {
              display: "none",
              position: "absolute",
              visibility: "hidden",
              pointerEvents: "none",
              height: 0,
              width: 0,
              overflow: "hidden",
            }
          : {}),
      }}
    >
      {/* Image container — locked bounding box, zero jitter */}
      <div
        className="relative overflow-hidden aspect-video bg-black select-none transform-gpu [backface-visibility:hidden]"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onContextMenu={handleContextMenu}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* Render all project images: Cover (index 0) sits solid at base, secondary frames fade in and fade out smoothly on hover and touch */}
        {projectImages.map((src, idx) => {
          const isCover = idx === 0;
          const isCurrent = idx === currentIndex;
          const isPrev = idx === prevIndex && currentIndex !== prevIndex;

          let opacity = "opacity-0";
          let zIndex = "z-0";

          if (isCover) {
            opacity = "opacity-100";
            // If another frame is currently visible or fading out over cover, keep cover at z-[1] so the outgoing frame (z-[2]) smoothly fades out on top
            zIndex = (currentIndex === 0 && prevIndex === 0) ? "z-[2]" : "z-[1]";
          } else if (isCurrent) {
            opacity = "opacity-100";
            zIndex = "z-[3]";
          } else if (isPrev) {
            // When returning to cover (currentIndex === 0), outgoing frame fades out to opacity-0 on top at z-[2]
            opacity = currentIndex === 0 ? "opacity-0" : "opacity-100";
            zIndex = "z-[2]";
          } else {
            opacity = "opacity-0";
            zIndex = "z-0";
          }

          // Cover image (idx 0) is permanently solid opacity-100 with zero opacity transition.
          // Only secondary hover/touch preview frames (idx > 0) transition their opacity.
          const transitionClass =
            !isCover && !isExiting && isPagePresent
              ? "transition-opacity duration-500 ease-in-out"
              : "transition-none";

          return (
            <img
              key={src}
              src={src}
              alt=""
              loading={isCover ? "eager" : "lazy"}
              decoding={isCover ? "sync" : "async"}
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transform-gpu [backface-visibility:hidden] ${transitionClass} ${opacity} ${zIndex}`}
            />
          );
        })}

        {/* Overlay — title and subtitle text matching homepage exactly (desktop and mobile) */}
        <div
          className="absolute bottom-0 left-0 right-0 p-2 md:p-2 z-10 flex flex-col justify-start text-left pointer-events-none translate-x-[10px] -translate-y-2 [backface-visibility:hidden] opacity-100"
        >
          <h3
            className="text-[14px] min-[390px]:text-[14.5px] sm:text-[16px] md:text-[15px] lg:text-[15.5px] font-gotham font-bold text-white tracking-[-0.01em] leading-tight w-full whitespace-nowrap truncate antialiased mb-[0.5px] min-[390px]:mb-[1px] sm:mb-[3px] md:mb-[4px] lg:mb-[4.5px]"
          >
            {project.title}
          </h3>
          <p 
            className="text-[13px] min-[390px]:text-[13.5px] sm:text-[14px] md:text-[13px] lg:text-[13.5px] font-['Gotham_Regular'] font-normal text-white/95 tracking-[-0.01em] leading-tight truncate antialiased"
            style={{ WebkitTextStroke: "0.2px rgba(255, 255, 255, 0.85)" }}
          >
            {project.subtitle}
          </p>
        </div>
      </div>
    </motion.a>
  );
});

export function Portfolio() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [prevCategory, setPrevCategory] = useState("All");
  const [isNavigating, setIsNavigating] = useState(false);
  const { setActiveSlug } = useTransitionCtx();
  const isPagePresent = useIsPresent();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });
  const [activeTouchSlug, setActiveTouchSlug] = useState<string | null>(null);

  // When tapping anywhere outside the project cards, dismiss active card slideshow
  useEffect(() => {
    const handleDocumentTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-project-card]")) {
        setActiveTouchSlug(null);
      }
    };
    const handleScroll = () => {
      setActiveTouchSlug(null);
    };

    window.addEventListener("touchstart", handleDocumentTouch, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleDocumentTouch);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleActivateTouch = useCallback((slug: string) => {
    setActiveTouchSlug(slug);
  }, []);

  const [isResizing, setIsResizing] = useState(false);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsResizing(true);
      setIsMobile(window.innerWidth < 768);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(() => {
        setIsResizing(false);
      }, 350);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    // Preload all portfolio cover images so filter switching on mobile never drops frames
    preloadImages(projects.map((p) => p.image));
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    };
  }, []);

  const isFromMusicVideoToAll =
    prevCategory === "Music Video" && activeCategory === "All";
  const isFromFilmToAll =
    prevCategory === "Film & Episodic" && activeCategory === "All";
  const isFromMusicVideoToFilm =
    prevCategory === "Music Video" && activeCategory === "Film & Episodic";
  const isFromFilmToMusicVideo =
    prevCategory === "Film & Episodic" && activeCategory === "Music Video";
  const isFromCommercialToAll =
    prevCategory === "Commercial" && activeCategory === "All";
  const isFromCommercialToMusicVideo =
    prevCategory === "Commercial" && activeCategory === "Music Video";
  const isFromAllToMusicVideo =
    prevCategory === "All" && activeCategory === "Music Video";
  const isFromAllToFilm =
    prevCategory === "All" && activeCategory === "Film & Episodic";
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevCategory !== activeCategory) {
      setActiveTouchSlug(null);
      const durationMs = 500;
      const timer = setTimeout(() => {
        setPrevCategory(activeCategory);
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [prevCategory, activeCategory]);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      if (cat === activeCategory) return;
      setActiveTouchSlug(null);
      setPrevCategory(activeCategory);
      setActiveCategory(cat);
    },
    [activeCategory]
  );

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => {
          if (!p.category.includes(activeCategory)) return false;
          if (activeCategory === "Commercial" && p.id >= 4) return false;
          return true;
        });

  const handleCardClick = useCallback(
    (slug: string) => {
      const project = projects.find((p) => p.slug === slug);
      if (!project) return;
      setIsNavigating(true);
      setActiveSlug(slug);
      if (typeof document !== "undefined") {
        document.title = `${project.title} - KAN SPACE`;
      }
      // Preload in background without blocking the initial transition frame
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => preloadImages(projectSrcs(project)));
      } else {
        setTimeout(() => preloadImages(projectSrcs(project)), 120);
      }
      navigate(`/work/${encodeURIComponent(slug)}`);
    },
    [setActiveSlug, navigate]
  );

  return (
    <section
      id="work"
      className="bg-black select-none pb-0"
    >
      {/* Categories Filter — relative + z-20 so it always sits above Hero's z-10 content
          when the hero bottom edge overlaps this row at the scroll boundary */}
      <div
        className="pt-[15px] pb-[8px] min-[390px]:pt-[17px] min-[390px]:pb-[9px] md:py-[10px] mb-0 md:mb-0 mt-0 md:mt-0 w-full relative z-20 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-x-[17px] min-[390px]:gap-x-[20px] sm:gap-x-[25px] md:gap-x-[28px] gap-y-0 sm:gap-y-[3.5px] md:gap-y-0 w-full max-w-[390px] min-[390px]:max-w-[430px] md:max-w-none mx-auto px-4 md:px-6 transform -translate-x-[0.5px] transition-[padding,gap,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const isMusicVideo = cat === "Music Video";
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`text-[16.2px] min-[390px]:text-[17.2px] sm:text-[18px] md:text-[19px] font-['Gotham_Regular'] cursor-pointer tracking-[-0.015em] relative py-[2px] md:py-[13px] flex-shrink-0 outline-none select-none touch-manipulation transform-gpu transition-[color,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isMusicVideo ? "-mt-[2.8px] min-[390px]:-mt-[3.2px] sm:mt-0 md:mt-0" : ""
              } ${
                  isActive
                    ? "text-white underline decoration-[1.5px] md:decoration-1 decoration-white underline-offset-[1px]"
                    : "text-[#DDDDDD] no-underline hover:text-white hover:underline hover:decoration-[1.5px] md:hover:decoration-1 hover:decoration-white hover:underline-offset-[1px]"
                }`}
              >
                <span className="relative z-10 block transition-colors duration-200 ease-out">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Work Grid — unified continuous mount across desktop and mobile resize / maximize / restore down */}
      <div className="relative px-2 mt-2 overflow-hidden">
        <div
          ref={gridRef}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-2"
          id="work-grid"
        >
          <AnimatePresence initial={false}>
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={isMobile ? `${project.id}-${activeCategory}` : project.id}
                project={project}
                index={idx}
                onClick={handleCardClick}
                isPagePresent={isPagePresent}
                isNavigating={isNavigating}
                isMobile={isMobile}
                isResizing={isResizing}
                isActiveTouch={activeTouchSlug === project.slug}
                onActivateTouch={handleActivateTouch}
                isFromMusicVideoToAll={isFromMusicVideoToAll}
                isFromFilmToAll={isFromFilmToAll}
                isFromMusicVideoToFilm={isFromMusicVideoToFilm}
                isFromFilmToMusicVideo={isFromFilmToMusicVideo}
                isFromCommercialToAll={isFromCommercialToAll}
                isFromCommercialToMusicVideo={isFromCommercialToMusicVideo}
                isFromAllToMusicVideo={isFromAllToMusicVideo}
                isFromAllToFilm={isFromAllToFilm}
                activeCategory={activeCategory}
                prevCategory={prevCategory}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full border-b border-white/20 mt-2" />
    </section>
  );
}
