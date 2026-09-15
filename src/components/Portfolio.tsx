import { useState, useCallback, memo, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useIsPresent } from "framer-motion";
import { useLocation } from "wouter";
import { projects } from "@/data/projects";
import { useTransitionCtx } from "@/context/TransitionContext";
import { preloadImages } from "@/utils/preload";
import React from "react";

const categories = ["All", "Commercial", "Film & Episodic", "Music Video"];

const CARD_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];

function projectSrcs(p: (typeof projects)[number]) {
  return [p.image, ...p.frames.map((f) => f.image)];
}

const ProjectCard = memo(function ProjectCard({
  project,
  onClick,
  isPagePresent,
  index = 0,
}: {
  project: (typeof projects)[0];
  onClick: (slug: string) => void;
  isPagePresent: boolean;
  index?: number;
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
    <motion.a
      href={isTouchHolding ? undefined : `/work/${encodeURIComponent(project.slug)}`}
      layout="position"
      transition={{
        layout: {
          duration: 0.65,
          ease: CARD_EASE,
        },
      }}
      className="block cursor-pointer select-none no-underline text-white touch-manipulation transform-gpu"
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
  const { setActiveSlug } = useTransitionCtx();
  const isPagePresent = useIsPresent();

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
        className="py-[16px] min-[390px]:py-[20px] md:py-[10px] mb-0 md:mb-0 mt-0 md:mt-0 w-full relative z-20 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-x-[22px] min-[390px]:gap-x-[26px] sm:gap-x-[28px] md:gap-x-[29px] gap-y-0 sm:gap-y-[3.5px] md:gap-y-0 w-full max-w-[390px] min-[390px]:max-w-[430px] md:max-w-none mx-auto px-4 md:px-6 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] transform -translate-x-[0.5px]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const isMusicVideo = cat === "Music Video";
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-[17px] min-[390px]:text-[18px] sm:text-[18.5px] md:text-[19px] font-['Gotham_Regular'] cursor-pointer tracking-[-0.015em] relative transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] py-[2px] md:py-[13px] flex-shrink-0 outline-none select-none touch-manipulation transform-gpu ${
                isMusicVideo ? "-mt-[3px] min-[390px]:-mt-[3.5px] sm:mt-0 md:mt-0" : ""
              } ${
                  isActive
                    ? "text-white"
                    : "text-[#DDDDDD] hover:text-white"
                }`}
              >
                <span className="relative z-10 block transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {cat}
                </span>
                {isActive && (
                  <span
                    className="absolute left-0 right-0 bottom-[7px] min-[390px]:bottom-[7.5px] sm:bottom-[8px] md:bottom-[18.8px] h-[1px] bg-white pointer-events-none transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Work Grid */}
      <div className="relative px-2 md:px-[6px] mt-0 md:mt-[6px] overflow-hidden transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-[8px] transition-[gap] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
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
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full border-b border-white/20 mt-2 md:mt-2" />
    </section>
  );
}
