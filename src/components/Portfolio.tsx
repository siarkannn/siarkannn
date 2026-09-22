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
  isFromMusicVideoToAll = false,
  isFromMusicVideoToFilm = false,
  isFromFilmToMusicVideo = false,
  isFromCommercialToAll = false,
  isFromCommercialToMusicVideo = false,
  isFromAllToMusicVideo = false,
  activeCategory = "All",
}: {
  project: (typeof projects)[0];
  onClick: (slug: string) => void;
  isPagePresent: boolean;
  index?: number;
  isNavigating?: boolean;
  isMobile?: boolean;
  isFromMusicVideoToAll?: boolean;
  isFromMusicVideoToFilm?: boolean;
  isFromFilmToMusicVideo?: boolean;
  isFromCommercialToAll?: boolean;
  isFromCommercialToMusicVideo?: boolean;
  isFromAllToMusicVideo?: boolean;
  activeCategory?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isTouchHolding, setIsTouchHolding] = useState(false);

  // Extract all unique images (cover + frames) in sequence
  const projectImages = useMemo(() => {
    const list = [project.image, ...project.frames.map((f) => f.image)];
    return Array.from(new Set(list));
  }, [project]);

  // Slideshow animation: when hovered or touched/held, immediately start advancing frames and cycle smoothly
  useEffect(() => {
    if (!isHovered || !isPagePresent || isExiting || projectImages.length <= 1) {
      setCurrentIndex(0);
      return;
    }

    // Advance immediately without any initial delay
    setCurrentIndex((prev) => (prev + 1) % projectImages.length);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projectImages.length);
    }, 1500);

    return () => {
      clearInterval(interval);
    };
  }, [isHovered, isPagePresent, isExiting, projectImages]);

  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartTime = useRef<number>(0);
  const isHeldLongRef = useRef<boolean>(false);

  const handleEnter = useCallback(() => {
    if (!isPagePresent || isExiting) return;
    setIsHovered(true);
    preloadImages(projectImages);
  }, [isPagePresent, isExiting, projectImages]);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
    setIsTouchHolding(false);
    setCurrentIndex(0);
  }, []);

  // Mobile Touch handlers: Touching/holding triggers instant crossfade slideshow
  // while keeping title and subtitle visible and suppressing link callouts on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isPagePresent || isExiting) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();
    isHeldLongRef.current = false;
    preloadImages(projectImages);
    setIsHovered(true);
    setIsTouchHolding(true);
  }, [isPagePresent, isExiting, projectImages]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    // If user is scrolling the page (dragged > 10px), cancel hold & reset
    if (dx > 10 || dy > 10) {
      if (isHovered || isTouchHolding) {
        setIsHovered(false);
        setIsTouchHolding(false);
        setCurrentIndex(0);
        isHeldLongRef.current = false;
      }
    }
  }, [isHovered, isTouchHolding]);

  const handleTouchEnd = useCallback(() => {
    const holdDuration = Date.now() - touchStartTime.current;
    if (holdDuration >= 500) {
      isHeldLongRef.current = true;
      setTimeout(() => {
        isHeldLongRef.current = false;
      }, 400);
    }
    // Releasing finger resets the hold and slideshow
    setIsTouchHolding(false);
    setIsHovered(false);
    setCurrentIndex(0);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // If the user held the cover to watch the slideshow, suppress navigation on release
      if (isHeldLongRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isHeldLongRef.current = false;
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
        e.preventDefault();
        setIsExiting(true);
        setIsHovered(false);
        setIsTouchHolding(false);
        setCurrentIndex(0);
        onClick(project.slug);
      }
    },
    [onClick, project.slug]
  );

  const isSlideCard = project.id === 5 || project.id === 6;

  const isMobileSlideUp =
    isMobile &&
    ((project.id === 5 &&
      (isFromMusicVideoToFilm ||
        activeCategory === "Film & Episodic" ||
        isFromCommercialToMusicVideo)) ||
      (project.id === 6 &&
        (isFromFilmToMusicVideo ||
          isFromCommercialToMusicVideo ||
          isFromAllToMusicVideo ||
          activeCategory === "Music Video")));

  const isMobileAllToMusicVideo =
    isMobile && isFromAllToMusicVideo && project.id === 6;

  // Desktop slide: when transitioning from Commercial to All (cards 5 and 6)
  // or from Music Video to All (card 6)
  // or from Music Video to Film & Episodic (card 5)
  const isDesktopCommercialSlide =
    !isMobile && isFromCommercialToAll && isSlideCard;

  const isDesktopMusicVideoToFilmSlide =
    !isMobile && isFromMusicVideoToFilm && project.id === 5;

  const shouldForceDesktopSlide =
    (!isMobile && isFromMusicVideoToAll && project.id === 6) ||
    isDesktopCommercialSlide ||
    isDesktopMusicVideoToFilmSlide;

  // Mobile slide: when transitioning from Commercial to All, cards 5 and 6 start stacked
  // over card 4 in row 4 and slide down vertically to reveal each card ("tertutup dan terbuka")
  const isMobileCommercialSlide =
    isMobile && isFromCommercialToAll && isSlideCard;

  const fallbackHeight =
    typeof window !== "undefined"
      ? ((Math.min(window.innerWidth, 768) - 16) * 9) / 16
      : 210;
  const mobileSlotDist = fallbackHeight + 8;
  const mobileCommercialStartY =
    project.id === 5 ? -mobileSlotDist : -2 * mobileSlotDist;

  const initialX =
    isMobileSlideUp ||
    isMobileAllToMusicVideo ||
    (isMobile && isFromMusicVideoToAll) ||
    isMobileCommercialSlide
      ? 0
      : isSlideCard
      ? !isMobile
        ? project.id === 5
          ? "calc(-100% - 8px)"
          : "calc(-200% - 16px)"
        : "-100%"
      : 0;

  // Calibrated duration paired with fluid easing for silky smooth slide deceleration
  // On both mobile and desktop, matches weareabove.space (Semplice masonry filter: 0.5s cubic-bezier(0.25, 0.1, 0.25, 1))
  const slideDuration = 0.5;
  const slideEase = EASE;

  return (
    <motion.a
      href={`/work/${encodeURIComponent(project.slug)}`}
      layout={
        shouldForceDesktopSlide ||
        isMobileSlideUp ||
        isMobileAllToMusicVideo ||
        (isMobile && isFromMusicVideoToAll) ||
        isMobileCommercialSlide
          ? false
          : isPagePresent && !isNavigating && !isExiting
          ? "position"
          : false
      }
      initial={
        isMobileSlideUp || isMobileAllToMusicVideo
          ? { x: 0, y: "100%" }
          : isMobile && isFromMusicVideoToAll
          ? false
          : isMobileCommercialSlide
          ? { x: 0, y: mobileCommercialStartY }
          : shouldForceDesktopSlide
          ? { x: initialX, y: 0 }
          : isSlideCard
          ? { x: initialX }
          : false
      }
      animate={
        shouldForceDesktopSlide
          ? { x: [initialX, 0], y: 0 }
          : isMobileCommercialSlide
          ? { x: 0, y: [mobileCommercialStartY, 0] }
          : isMobileAllToMusicVideo
          ? { x: 0, y: ["100%", 0] }
          : isMobileSlideUp
          ? { x: 0, y: 0 }
          : { x: 0 }
      }
      exit={
        !isMobile && isFromFilmToMusicVideo && project.id === 5
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
      transition={{
        type: "tween",
        duration: slideDuration,
        ease: slideEase,
        x: { type: "tween", duration: slideDuration, ease: slideEase },
        y: { type: "tween", duration: slideDuration, ease: slideEase },
        layout: { type: "tween", duration: slideDuration, ease: slideEase },
      }}
      className={`relative block cursor-pointer select-none no-underline text-white touch-manipulation ${
        project.id === 6 ? "z-20" : project.id === 5 ? "z-10" : "z-0"
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      draggable={false}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      {/* Image container — locked bounding box, zero jitter */}
      <div
        className="relative overflow-hidden aspect-video bg-neutral-900 select-none"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={handleContextMenu}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        {/* Base cover image: always solid at base layer to prevent any transparent ghosting */}
        <img
          src={projectImages[0]}
          alt={`${project.title} cover`}
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
        />

        {/* Slideshow frame overlays */}
        {projectImages.slice(1).map((src, idx) => {
          const frameIdx = idx + 1;
          const isActive = !isExiting && isPagePresent && isHovered && frameIdx === currentIndex;
          return (
            <img
              key={src}
              src={src}
              alt={`${project.title} frame ${frameIdx + 1}`}
              loading="lazy"
              decoding="async"
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none ${
                !isExiting && isPagePresent ? "transition-opacity duration-500 ease-in-out" : "transition-none"
              } ${isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"}`}
            />
          );
        })}

        {/* Overlay — text overlay stays visible on mobile and desktop */}
        <div
          className="absolute bottom-0 left-0 right-0 p-2 md:p-2 z-10 flex flex-col justify-start text-left pointer-events-none translate-x-[10px] -translate-y-2 [backface-visibility:hidden] opacity-100"
        >
          <h3 className="text-[14px] min-[390px]:text-[14.5px] sm:text-[16px] md:text-[15px] lg:text-[15.5px] font-gotham font-bold text-white tracking-[-0.01em] leading-tight w-full whitespace-nowrap truncate antialiased mb-[0.5px] min-[390px]:mb-[1px] sm:mb-[3px] md:mb-[4px] lg:mb-[4.5px]">
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    // Preload all portfolio cover images so filter switching on mobile never drops frames
    preloadImages(projects.map((p) => p.image));
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isFromMusicVideoToAll =
    prevCategory === "Music Video" && activeCategory === "All";
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
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isMobile && isFromMusicVideoToAll && gridRef.current) {
      const grid = gridRef.current;
      const children = grid.children;
      let dist = 0;
      if (children.length >= 6) {
        const card0 = children[0] as HTMLElement;
        const card5 = children[5] as HTMLElement;
        dist = card5.offsetTop - card0.offsetTop;
      }
      if (!dist || dist <= 0) {
        const width =
          grid.clientWidth ||
          (typeof window !== "undefined" ? window.innerWidth - 16 : 374);
        const cardH = (width * 9) / 16;
        dist = 5 * (cardH + 8);
      }
      grid.style.setProperty("--slide-dist", `-${dist}px`);
    }
  }, [isMobile, isFromMusicVideoToAll]);

  useEffect(() => {
    if (
      isFromMusicVideoToAll ||
      isFromMusicVideoToFilm ||
      isFromFilmToMusicVideo ||
      isFromCommercialToAll ||
      isFromCommercialToMusicVideo ||
      isFromAllToMusicVideo
    ) {
      const timer = setTimeout(() => {
        setPrevCategory(activeCategory);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [
    isFromMusicVideoToAll,
    isFromMusicVideoToFilm,
    isFromFilmToMusicVideo,
    isFromCommercialToAll,
    isFromCommercialToMusicVideo,
    isFromAllToMusicVideo,
    activeCategory,
  ]);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      if (cat === activeCategory) return;
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
        document.title = `${project.title} - KAN`;
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
        className="py-[16px] min-[390px]:py-[20px] md:py-[10px] mb-0 md:mb-0 mt-0 md:mt-0 w-full relative z-20"
      >
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-x-[17px] min-[390px]:gap-x-[20px] sm:gap-x-[25px] md:gap-x-[28px] gap-y-0 sm:gap-y-[3.5px] md:gap-y-0 w-full max-w-[390px] min-[390px]:max-w-[430px] md:max-w-none mx-auto px-4 md:px-6 transform -translate-x-[0.5px]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const isMusicVideo = cat === "Music Video";
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`text-[16.2px] min-[390px]:text-[17.2px] sm:text-[18px] md:text-[19px] font-['Gotham_Regular'] cursor-pointer tracking-[-0.015em] relative py-[2px] md:py-[13px] flex-shrink-0 outline-none select-none touch-manipulation transform-gpu transition-colors duration-200 ease-out ${
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

      {/* Work Grid */}
      <div className="relative px-2 md:px-[6px] mt-0 md:mt-[6px] overflow-hidden transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div
          ref={gridRef}
          className={`relative grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-[8px] transition-[gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMobile && isFromMusicVideoToAll ? "mobile-work-grid-sliding" : ""
          }`}
          style={{
            ...(isMobile && isFromMusicVideoToAll
              ? ({
                  "--slide-dist": `-${
                    5 *
                    ((((typeof window !== "undefined"
                      ? Math.min(window.innerWidth, 768)
                      : 390) -
                      16) *
                      9) /
                      16 +
                      8)
                  }px`,
                } as React.CSSProperties)
              : {}),
          }}
          id="work-grid"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                onClick={handleCardClick}
                isPagePresent={isPagePresent}
                isNavigating={isNavigating}
                isMobile={isMobile}
                isFromMusicVideoToAll={isFromMusicVideoToAll}
                isFromMusicVideoToFilm={isFromMusicVideoToFilm}
                isFromFilmToMusicVideo={isFromFilmToMusicVideo}
                isFromCommercialToAll={isFromCommercialToAll}
                isFromCommercialToMusicVideo={isFromCommercialToMusicVideo}
                isFromAllToMusicVideo={isFromAllToMusicVideo}
                activeCategory={activeCategory}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full border-b border-white/20 mt-2 md:mt-2" />
    </section>
  );
}
