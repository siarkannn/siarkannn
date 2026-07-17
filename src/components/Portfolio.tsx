import { useState, useCallback, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { projects } from "@/data/projects";
import { useTransitionCtx } from "@/context/TransitionContext";
import { preloadImages } from "@/utils/preload";
import React from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

const categories = ["All", "Commercial", "Film & Episodic", "Music Video"];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function projectSrcs(p: (typeof projects)[number]) {
  return [p.image, ...p.frames.map((f) => f.image)];
}

/**
 * Hover zoom architecture — single source of truth for transform:
 *
 *  [motion.div]  — Framer Motion stagger reveal (y + opacity only).
 *
 *    └── [div.overflow-hidden]  — clips the zoom; onMouseEnter/Leave
 *                                  mutate the img transform directly via ref.
 *                                  No vertical lift, no CSS class conflict.
 *
 *         └── [img]  — inline transform + transition only.
 *                       NO Tailwind group-hover class — that would conflict
 *                       with the inline transform and cause jitter.
 */
const ProjectCard = memo(function ProjectCard({
  project,
  activeSlug,
  onClick,
  isMobile,
}: {
  project: (typeof projects)[0];
  activeSlug: string | null;
  onClick: (slug: string) => void;
  isMobile: boolean;
}) {
  const isAyub = project.title.toLowerCase().includes("ayubyayulestariofficial");
  const imgRef = useRef<HTMLImageElement>(null);

  // Zoom the image directly via ref — zero React re-render, zero CSS conflict.
  // Each handler sets its own transition so enter and exit can have distinct curves:
  //   enter: ease-in-out (slow→fast→slow) so the zoom grows gently and settles softly
  //   leave: slightly longer ease-in-out so the zoom fades out without a hard stop
  const handleEnter = useCallback(() => {
    // Skip zoom on touch devices (coarse pointer / no hover capability)
    if (window.matchMedia("(hover: none)").matches) return;
    if (imgRef.current) {
      imgRef.current.style.transition =
        "transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      // Keep perspective(1px) in sync with the initial inline style so the
      // compositing layer never changes format — prevents jitter on settle.
      imgRef.current.style.transform = "perspective(1px) translate3d(0,0,0) scale(1.05)";
    }
  }, []);
  const handleLeave = useCallback(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    if (imgRef.current) {
      imgRef.current.style.transition =
        "transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      imgRef.current.style.transform = "perspective(1px) translate3d(0,0,0) scale(1)";
    }
  }, []);

  return (
    // layout = FLIP position animation when grid reorders after filter change.
    // initial/animate/exit = fade+scale for enter and exit.
    // transition.layout uses a spring so the slide feels physical and premium.
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15, ease: "easeIn" } }}
      transition={{
        layout: { type: "spring", stiffness: 340, damping: 32, mass: 0.8 },
        opacity: { duration: 0.28, ease: EASE },
        scale:   { duration: 0.28, ease: EASE },
      }}
      className="cursor-pointer"
      onClick={() => onClick(project.slug)}
    >
      {/* Image container — clips zoom & owns hover events */}
      <div
        className="relative overflow-hidden aspect-video bg-neutral-900"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          // Promote container to its own GPU layer so overflow:hidden
          // clipping never triggers a repaint during child transform.
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <img
          ref={(el) => {
            (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = el;
            if (!el) return;
            // Set opacity imperatively — never via JSX style prop so React
            // reconciliation cannot reset it to 0 on subsequent re-renders.
            el.style.opacity = el.complete ? "1" : "0";
          }}
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover object-center"
          style={{
            willChange: "transform",
            // perspective forces the GPU to render this element in its own
            // compositing layer permanently — prevents the layer-promotion
            // flash (jitter + momentary blur) when the scale animation ends.
            transform: "perspective(1px) translate3d(0,0,0) scale(1)",
            transition: "transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // opacity is intentionally omitted here — managed imperatively
            // via ref so React reconciliation never resets it to 0.
          }}
          onLoad={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "1";
          }}
        />

          {/* Overlay — Framer Motion owns opacity only; CSS owns transform. No conflict. */}
          <AnimatePresence>
            {activeSlug !== project.slug && (
              <motion.div
                key="overlay"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className={`absolute bottom-0 left-0 right-0 p-2 md:p-2 z-10 flex flex-col justify-start text-left pointer-events-none space-y-[0.1px] ${
                  isAyub
                    ? "translate-x-[10px] md:translate-x-[9px]"
                    : "translate-x-[10px]"
                } ${
                  isAyub
                    ? "-translate-y-[5px] md:-translate-y-[3px]"
                    : "-translate-y-2"
                }`}
              >
                <div className="h-auto md:h-12 flex flex-col justify-end mb-1">
                  <h3 className="text-[14px] sm:text-[15px] md:text-[13px] font-gotham font-bold text-white tracking-wider leading-normal md:leading-normal drop-shadow-sm capitalize w-full break-words line-clamp-2">
                    {project.title}
                  </h3>
                </div>
                <p className="text-[12px] sm:text-[13px] md:text-[13px] font-['Gotham_Medium'] font-medium text-white/90 tracking-wide leading-none mt-0 md:mt-1 capitalize drop-shadow-sm truncate">
                  {project.subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </motion.div>
  );
});

export function Portfolio() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const { activeSlug, setActiveSlug } = useTransitionCtx();
  const isMobile = useIsMobile();

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
      // Preload in background — navigation is immediate so transition is clean
      preloadImages(projectSrcs(project));
      navigate(`/work/${encodeURIComponent(slug)}`);
    },
    [setActiveSlug, navigate]
  );

  return (
    <section id="work" className="bg-black select-none pb-2 md:pb-20">
      {/* Categories Filter — relative + z-20 so it always sits above Hero's z-10 content
          when the hero bottom edge overlaps this row at the scroll boundary */}
      <div className="pt-[14px] pb-[14px] md:py-[10px] mb-0 md:mb-0 mt-0 md:mt-0 w-full relative z-20">
        {/* Desktop */}
        <div className="hidden md:flex flex-row items-center justify-center w-full gap-x-5 px-6 transform -translate-x-[1px]">
          {categories.map((cat) => (
            <button
              key={`desktop-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`text-[18px] font-['Gotham_Regular'] cursor-pointer tracking-[-0.01em] relative transition-colors duration-300 py-[13px] flex-shrink-0 ${
                activeCategory === cat
                  ? "text-white"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.span
                  layoutId="desktopActiveCategoryUnderline"
                  className="absolute left-0 right-0 bottom-[17px] h-[1px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-wrap items-center justify-center gap-x-4 gap-y-0 w-full px-4">
          {categories.map((cat) => (
            <button
              key={`mobile-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`text-[15px] font-['Gotham_Regular'] cursor-pointer tracking-[-0.01em] relative transition-colors duration-300 flex-shrink-0 py-[2px] ${
                activeCategory === cat
                  ? "text-white"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.span
                  layoutId="mobileActiveCategoryUnderline"
                  className="absolute left-0 right-0 bottom-[4px] h-[1px] bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Work Grid
          ─ layout on the wrapper animates the grid's own height change when
            the number of cards changes (fewer cards → shorter grid).
          ─ AnimatePresence mode="popLayout" pops exiting cards out of the
            layout flow immediately so the remaining cards can FLIP-animate
            to their new positions without waiting for exit to complete.
          ─ initial={false} so cards already visible on first render don't
            play their enter animation; only newly-appearing cards do.
      */}
      <div className="relative min-h-[400px] px-2 md:px-[6px] mt-0 md:mt-[6px]">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-[8px]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                activeSlug={activeSlug}
                onClick={handleCardClick}
                isMobile={isMobile}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="w-full border-b border-white/20 mt-2 md:mt-2" />
    </section>
  );
}
