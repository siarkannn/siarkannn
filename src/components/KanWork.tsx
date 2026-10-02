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
  isActiveTouch = false,
  onActivateTouch,
}: {
  project: Project;
  onClick: (slug: string) => void;
  isPagePresent: boolean;
  index?: number;
  isActiveTouch?: boolean;
  onActivateTouch?: (slug: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isMouseHovered, setIsMouseHovered] = useState(false);
  const [isTouchHolding, setIsTouchHolding] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const isClickedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <a
      href={`/work/${encodeURIComponent(project.slug)}`}
      data-project-card={project.slug}
      className="block cursor-pointer select-none no-underline text-white touch-manipulation active:opacity-100 transition-none"
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
      }}
    >
      <div
        ref={containerRef}
        className="relative overflow-hidden aspect-video bg-neutral-900 select-none"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onContextMenu={handleContextMenu}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
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

          const transitionClass =
            !isExiting && isPagePresent
              ? "transition-opacity duration-500 ease-in-out"
              : "transition-none";

          return (
            <img
              key={src}
              src={src}
              alt=""
              loading={index < 3 && idx === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transform-gpu [backface-visibility:hidden] ${transitionClass} ${opacity} ${zIndex}`}
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
        className="px-7 min-[390px]:px-8 sm:px-9 md:px-12 pt-10 min-[390px]:pt-11 sm:pt-12 md:pt-15 lg:pt-16 pb-9 min-[390px]:pb-10 sm:pb-11 md:pb-13 lg:pb-14 max-w-6xl overflow-x-clip transition-[padding,max-width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <h2 
          className="text-[16px] min-[360px]:text-[16.5px] min-[375px]:text-[17.2px] min-[390px]:text-[18px] min-[412px]:text-[19px] min-[430px]:text-[20px] sm:text-[22px] md:text-[28px] lg:text-[30.5px] xl:text-[31.5px] font-['Gotham_Medium'] md:font-gotham font-normal md:font-medium leading-[1.32] min-[390px]:leading-[1.34] md:leading-[1.26] tracking-[-0.02em] text-white"
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
            <span className="tracking-[0.08em]">K</span><span className="tracking-[0.02em]">A</span>N is a Bandung-based independent post-production studio,<br className="hidden md:inline" />{" "}specializing in tailor-made Color Grading and finishing.
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
      <div className="relative px-2 overflow-hidden">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-2"
        >
          {kanProjects.map((project, idx) => (
            <KanProjectCard
              key={project.id}
              project={project}
              index={idx}
              onClick={handleCardClick}
              isPagePresent={isPagePresent}
              isActiveTouch={activeTouchSlug === project.slug}
              onActivateTouch={handleActivateTouch}
            />
          ))}
        </div>
      </div>

      <div className="w-full border-b border-white/20 mt-2" />
    </section>
  );
}
