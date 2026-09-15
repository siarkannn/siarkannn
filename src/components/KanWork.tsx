import { useState, useCallback, memo, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useIsPresent } from "framer-motion";
import { useLocation } from "wouter";
import { kanProjects, Project } from "@/data/projects";
import { useTransitionCtx } from "@/context/TransitionContext";
import { preloadImages } from "@/utils/preload";
import { smoothScrollTo } from "@/hooks/useSmoothScroll";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function projectSrcs(p: Project) {
  return [p.image, ...p.frames.map((f) => f.image)];
}

const KanProjectCard = memo(function KanProjectCard({
  project,
  onClick,
  isPagePresent,
  index = 0,
}: {
  project: Project;
  onClick: (slug: string) => void;
  isPagePresent: boolean;
  index?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isTouchHolding, setIsTouchHolding] = useState(false);

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
    if (holdDuration > 250) {
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

  return (
    <a
      href={isTouchHolding ? undefined : `/work/${encodeURIComponent(project.slug)}`}
      className="block cursor-pointer select-none no-underline text-white touch-manipulation"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      draggable={false}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
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
    </a>
  );
});

export function KanWork() {
  const [location, navigate] = useLocation();
  const { setActiveSlug } = useTransitionCtx();
  const isPagePresent = useIsPresent();

  const handleCardClick = useCallback(
    (slug: string) => {
      const project = kanProjects.find((p) => p.slug === slug);
      if (!project) return;
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

  const handleMoreWork = useCallback(() => {
    if (location === "/work" || location === "/works") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/work");
    }
  }, [location, navigate]);

  return (
    <section id="kan-work" className="bg-black select-none text-white">
      {/* Studio Statement / Tagline matching Reference Screenshot 1005 & 1294 */}
      <div
        id="kan-intro"
        className="px-7 min-[390px]:px-8 sm:px-9 md:px-12 pt-10 min-[390px]:pt-11 sm:pt-12 md:pt-15 lg:pt-16 pb-9 min-[390px]:pb-10 sm:pb-11 md:pb-13 lg:pb-14 max-w-5xl overflow-x-clip transition-[padding,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <h2 
          className="text-[16px] min-[360px]:text-[16.5px] min-[375px]:text-[17.2px] min-[390px]:text-[18px] min-[412px]:text-[19px] min-[430px]:text-[20px] sm:text-[22px] md:text-[27px] lg:text-[29px] font-['Gotham_Medium'] md:font-gotham font-normal md:font-medium leading-[1.32] min-[390px]:leading-[1.34] md:leading-[1.26] tracking-[-0.02em] text-white"
        >
          <span className="md:hidden">
            <span className="block whitespace-nowrap">
              <span className="tracking-[0.08em]">K</span><span className="tracking-[0.02em]">A</span>N is a Bandung-based independent
            </span>
            <span className="block whitespace-nowrap">
              post-production studio, specializing
            </span>
            <span className="block whitespace-nowrap">
              in tailor-made Color Grading and
            </span>
            <span className="block whitespace-nowrap">
              finishing.
            </span>
          </span>
          <span className="hidden md:inline">
            <span className="tracking-[0.08em]">K</span><span className="tracking-[0.02em]">A</span>N is a Bandung-based independent post-production studio, specializing in tailor-made Color Grading and finishing.
          </span>
        </h2>
      </div>

      {/* Latest Work & More Work Navigation Bar */}
      <div
        className="px-7 min-[390px]:px-8 sm:px-9 md:px-12 py-3 mb-2 flex items-center justify-between border-t border-white/20 pt-[26px] min-[390px]:pt-[27px] sm:pt-[28px] md:pt-[30px] transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <span
          className="kan-latest-work-text text-[13.5px] sm:text-[14.5px] md:text-[18px] font-['Gotham_Regular'] font-normal tracking-[-0.01em] text-[#DDDDDD] transform-gpu translate-y-[0.5px] md:-translate-y-[1px]"
        >
          Latest Work
        </span>
        <button
          id="more-work-btn"
          type="button"
          onClick={handleMoreWork}
          className="kan-latest-work-text text-[13.5px] sm:text-[14.5px] md:text-[18px] font-['Gotham_Regular'] font-normal tracking-[-0.01em] text-[#DDDDDD] hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none py-2 px-0 -my-2 inline-flex items-center outline-none transform-gpu translate-y-[0.5px] md:-translate-y-[1px]"
        >
          More Work
        </button>
      </div>

      {/* 6 Projects Grid */}
      <div className="relative px-2 md:px-[6px] overflow-hidden transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-[8px] transition-[gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          {kanProjects.map((project, idx) => (
            <KanProjectCard
              key={project.id}
              project={project}
              index={idx}
              onClick={handleCardClick}
              isPagePresent={isPagePresent}
            />
          ))}
        </div>
      </div>

      <div className="w-full border-b border-white/20 mt-2 md:mt-[6px]" />
    </section>
  );
}
